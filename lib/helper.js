'use strict';

const url = require('url');
const path = require('path');
const config = require('config');
const _ = require('lodash');

const createURL = function () {
  var pathname = path.join.apply(path, arguments);
  let urlObj = url.parse(config.get('ORIGIN'));
  if (!pathname) {
    return urlObj.href;
  }
  urlObj.pathname = pathname;
  return url.format(urlObj);
};

const createStaticURL = function () {
  var pathname = path.join.apply(path, arguments);
  let urlObj = url.parse(config.get('MEDIA.ORIGIN'));
  if (!pathname) {
    return urlObj.href;
  }
  urlObj.pathname = pathname;
  return url.format(urlObj);
};

const streamPrivateMediaURL = function (folder, fileName, opts) {
  opts = (opts)? opts : {};
  var uploadDir = config.get('MEDIA.UPLOAD_DIRECTORY');
  var imgPath = path.join(uploadDir, folder, fileName);
  return imgPath;
};

var validateFormData = function(postData, defaultData) {
  var resultData = _.chain(defaultData)
    .cloneDeep()
    .mapValues(function(v, k) {
      if (_.isString(v)) {
        return _.toString(postData[k]);
      }
      if (_.isNumber(v)) {
        return isNaN(_.toNumber(postData[k])) ? v : _.toNumber(postData[k]);
      }
      if (_.isInteger(v)) {
        return isNaN(_.toInteger(postData[k])) ? v : _.toInteger(postData[k]);
      }
      return postData[k];
    }).value();

  return resultData;
};

var shortkey = function (len) {
    var id = "";
    var chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

    for (var i = 0; i < len; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return id;
};

const validateEmail = function (email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

module.exports = exports = {
  createURL: createURL,
  createStaticURL: createStaticURL,
  streamPrivateMediaURL: streamPrivateMediaURL,
  validateFormData: validateFormData,
  shortkey: shortkey,
  validateEmail: validateEmail
};
