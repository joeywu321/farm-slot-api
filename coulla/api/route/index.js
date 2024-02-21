'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const express = require('express');

const getRouter = function() {
  var router = new express.Router();

  var files = fs.readdirSync(__dirname);
  _.each(files, (file) => {
    let fileObj = path.parse(file);
    if (fileObj.ext === '.js' && fileObj.name !== 'index') {
      var controller = require(__dirname  + path.sep + fileObj.name);
      controller.initRouter(router);
    }
  });

  return router;
};

module.exports = exports = {
  getRouter: getRouter
};
