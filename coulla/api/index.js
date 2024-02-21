'use strict';

var cors = require('cors');
const http = require('http');
const path = require('path');
const util = require('util');
const config = require('config');
const express = require("express");
// const session = require('express-session');
// const MySQLStore = require('express-mysql-session')(session);
const WebServer = require('../web-server');
const configure = require('../configure');

var env = config.util.getEnv('NODE_ENV');
var port = process.env.PORT;
var mountPoint = '/' + config.get('API.MOUNT');
port = (port) ? port : config.get('API.PORT');

const startWebServer = function () {
  var app = WebServer.createServer();

  // app.use(session({
  //   store: new MySQLStore({
  //     host: config.get('DB.master.host'),
  //     user: config.get('DB.master.user'),
  //     password: config.get('DB.master.password'),
  //     database: config.get('DB.master.database')
  //   }),
  //   secret: config.get('API.SESSION_SECRET'),
  //   resave: false,
  //   saveUninitialized: true
  // }));

  var router = require('./route').getRouter();
  app.use(cors());
  
  app.use(mountPoint, router);

  app.use(function (req, res) {
    res.sendStatus(404);
  });

  app.use(function (err, req, res, next) {
    console.error(err);
    next();
  });

  app.use(function(req, res) {
    res.sendStatus(500);
  });

  http.createServer()
    .on("request", app)
    .listen(port, function() {
      console.info("listening on port %s!", port);
    });
};

module.exports = exports = {
  start: function () {
    configure.initLogger();
    // configure.initDatabase();
    startWebServer();
  }
};
