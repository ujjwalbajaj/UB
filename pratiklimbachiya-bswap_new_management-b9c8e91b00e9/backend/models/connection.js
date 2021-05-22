'use strict';

// const initConfigs = require('../configs/initConfigs');
var environment = require('../configs').initConfigs.isPROD;
var dbName = require('../configs').initConfigs.dbName;
var dbUserName = require('../configs').initConfigs.dbUserName;
var dbPassword = require('../configs').initConfigs.dbPassword;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
require('mongoose-uuid2')(mongoose);



const connectionUrl = environment ? `mongodb://${dbUserName}:${encodeURIComponent(dbPassword)}@localhost:27017/${dbName}?authSource=admin` : `mongodb://localhost:27017/${dbName}`
console.log(connectionUrl)
var db = mongoose.connect(connectionUrl, {
  useUnifiedTopology: true,
  useCreateIndex: true,
  useNewUrlParser: true
}, (err) => {
  console.log(err)
  // mongoose.set('debug', true);
});
module.exports = db;