const express = require("express");
var fs = require('fs');
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const cron = require('../cron/cron');
const { initConfigs } = require('../configs');

const app = express();

/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

function exitHandler(options) {
  mongoose.connection.close();
  process.exit();
}
process.on("SIGINT", exitHandler.bind(null, { cleanup: true }));

// if (initConfigs.isPROD) {
//   privateKey = fs.readFileSync('/etc/httpd/SSL/jointerKey.pem', 'utf8');
//   certificate = fs.readFileSync('/etc/httpd/SSL/jointer.pem', 'utf8');
//   ca = fs.readFileSync('/etc/httpd/SSL/cloudflare_origin_ecc.pem', 'utf8');
//   credentials = { key: privateKey, cert: certificate, ca: ca };
// }

// if (initConfigs.isPROD) {
//   privateKey = fs.readFileSync('/etc/letsencrypt/live/elementzero.network/privkey.pem');
//   certificate = fs.readFileSync('/etc/letsencrypt/live/elementzero.network/cert.pem');
//   // ca = fs.readFileSync('/etc/httpd/SSL/cloudflare_origin_ecc.pem', 'utf8');
//   credentials = { key: privateKey, cert: certificate };
// }

if (initConfigs.isPROD) {
  privateKey = fs.readFileSync('/etc/letsencrypt/live/www.elementzero.network/privkey.pem', 'utf8');
  certificate = fs.readFileSync('/etc/letsencrypt/live/www.elementzero.network/cert.pem', 'utf8');
  ca = fs.readFileSync('/etc/letsencrypt/live/www.elementzero.network/chain.pem', 'utf8');
  credentials = { key: privateKey, cert: certificate, ca: ca };
}



app.set("port", process.env.PORT);
app.use(bodyParser.json({ limit: "1gb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "1gb" }));
app.use(cors());
app.use(require("../routes.js"));

app.all("/*", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Request-Headers", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Headers, x-auth-token, Cache-Control, timeout"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

module.exports = app;
