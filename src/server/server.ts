import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import ws from 'ws';
import WorldUpdate from './../common/worldUpdate';
import ServiceUpdate from './../common/serviceUpdate';
import Dotenv from 'dotenv';
import { BigQuery } from '@google-cloud/bigquery';
import FS from 'fs';

Dotenv.config();

const app = express();
const config = require('./../../webpack.config.js');
const compiler = webpack(config);

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  })
);

app.use(express.static('dist'))

const wss = new ws.WebSocketServer({port: 8181})

type Row = {
    count: number,
    event_type: string,
    origin: string | null,
    destination: string | null,
    rate: number
}

function newService(serviceName: string):ServiceUpdate {
    return {
        name: serviceName,
        outbound: {},
        inbound: {},
        events: {},
    };
}

function loadMetrics(sql: string): Promise<Row[]> {
  const bigquery = new BigQuery();

  async function query() {
    const options = {
      query: sql,
    };

    const [job] = await bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();

    return rows;
  }

  return query();
}

async function getWorldUpdate(metricsSql:string): Promise<WorldUpdate> {
  const rows: Row[] = await loadMetrics(metricsSql);
  const servicesMap: { [key: string]: ServiceUpdate } = {};

  rows.forEach(row => {
    if (row.event_type === 'referral') {
      const destService = row.destination!;

      if (!servicesMap[destService]) {
        servicesMap[destService] = newService(destService);
      }

      if (row.origin === null) {
        servicesMap[destService].inbound['internet'] = { rate: row.rate };
      } else {
        if (!servicesMap[row.origin]) {
          servicesMap[row.origin] = newService(row.origin);
        }
        servicesMap[row.origin].outbound[destService] = { rate: row.rate };
      }
    } else {
      const originService = row.origin!;
      if (!servicesMap[originService]) {
        servicesMap[originService] = newService(originService);
      }
      servicesMap[originService].events[row.event_type] = { rate: row.rate };
    }
  });

  // servicesMap['apply']['events']['submission'] = {rate: 3};
  // servicesMap['apply']['events']['recruitment'] = {rate: 3};
  // servicesMap['register']['events']['qts'] = {rate: 3};

  const worldUpdate:WorldUpdate = { services: Object.values(servicesMap) };
  return worldUpdate;
}

const metricsSql = FS.readFileSync('./src/sql/metrics.sql').toString();

wss.on('connection', function connection(sock) {
  console.log('Connected!');
  getWorldUpdate(metricsSql).then(update => {
    sock.send(JSON.stringify(update));
  });

  setInterval(() => {
    console.log('Sending update...');
    getWorldUpdate(metricsSql).then(update => {
      sock.send(JSON.stringify(update));
    });
  }, 60 * 1000);
});

app.listen(3000, function () {});
