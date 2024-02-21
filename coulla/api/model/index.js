'use strict';

const Module = module.exports = exports = {};

const fs = require('fs');
const path = require('path');
const _ = require('lodash');

var files = fs.readdirSync(__dirname);
_.each(files, (file) => {
	let fileObj = path.parse(file);
	if (fileObj.ext === '.js' && fileObj.name !== 'index') {
		Module[fileObj.name] = require('./' + fileObj.name);
	}
});
