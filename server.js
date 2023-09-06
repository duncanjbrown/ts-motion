const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const ws = require('ws');

const app = express();
const config = require('./webpack.config.js');
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

wss.on('connection', function connection(sock) {
  sock.on('message', function message(data) {
    console.log('received: %s', data)
  })

  setInterval(() => {
    sock.send('something');
  }, 1000);
});

// Serve the files on port 3000.
app.listen(3000, function () {
  console.log('Example app listening on port 3000!\n');
});
