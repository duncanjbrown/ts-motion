import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import ws from 'ws';
import Service from './../common/service';
import World from './../common/world';

const app = express();
const config = require('./../../webpack.config.js');
const compiler = webpack(config);

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  })
);

app.use(express.static('dist'))

const wss = new ws.WebSocketServer({port: 8181})

function getWorld(): World {
  const find: Service = {
    timeframe: 60 * 10,
    name: 'find',
    displayName: 'Find',
    host: 'www.find-postgraduate-teacher-training.service.gov.uk',
    theme: 'govuk',
    outbound: {
      'apply': {
        'rate': Math.floor(Math.random() * 2) + 1
      }
    },
    events: {},
    inbound: {
      'internet': {
        'rate': Math.floor(Math.random() * 2) + 1
      }
    }
  };

  const apply: Service = {
    timeframe: 60 * 10,
    name: 'apply',
    displayName: 'Apply',
    host: 'www.apply-for-teacher-training.service.gov.uk',
    theme: 'govuk',
    outbound: {
      'find': {
        'rate': Math.floor(Math.random() * 2) + 1
      }
    },
    events: {
      'submission': {
        rate: 6
      }
    },
    inbound: {
      'internet': {
        'rate': Math.floor(Math.random() * 2) + 1
      }
    }
  };

  const world:World = {
    services: [find, apply]
  };

  return world;
}

wss.on('connection', function connection(sock) {
  sock.on('message', function message(data) {
    console.log('received: %s', data)
  })

  setInterval(() => {
    sock.send(JSON.stringify(getWorld()));
  }, 5000);
});

// Serve the files on port 3000.
app.listen(3000, function () {});
