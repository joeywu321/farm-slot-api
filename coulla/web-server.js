'use strict';

const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
// require("body-parser-xml")(bodyParser);
const useragent = require('express-useragent');
const consolidate = require("consolidate");
const morgan = require('morgan');
const helmet = require('helmet');

const createServer = function (opts) {
  opts = (opts) ? opts : {};

  var app = express();

  app.use(helmet());

  app.use(cookieParser());
  app.use(bodyParser.urlencoded({
      extended: true
  }));
  app.use(bodyParser.json());
  // app.use(bodyParser.xml());
  // app.use(useragent.express());

  app.engine("mustache", consolidate.hogan);
  app.set("view engine", "mustache");
  app.set('trust proxy', ['loopback', '127.0.0.1']); //for Nginx proxy

  // app.use(morgan('combined'));
  app.use(morgan('common'));

  return app;
};

module.exports = exports = {
  createServer: createServer
};
