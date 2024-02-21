'use strict';

const clientConfig = require('./package.json').clientConfig.cms;
const CLIENT = clientConfig.root;

module.exports = function(grunt) {
  var target = grunt.option('target');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    client: CLIENT,
    target: target,

    sass: {
      dist: {
        options: {
          style: 'nested'
        },
        files: [{
          expand: true,
          cwd: '<%= client %>src/scss',
          src: ['*.scss'],
          dest: '<%= client %>public/css',
          ext: '.css'
        }]
      }
    },

    browserify: {
      vendor: {
        src: [
          '<%= client %>src/js/vendor.js'
        ],
        dest: '<%= client %>public/dev/js/vendor.js',
        options: {
          require: []
        }
      }
    },

    uglify: {
      vendor: {
        files: {
          '<%= client %>public/dev/js/vendor.min.js': ['<%= client %>public/dev/js/vendor.js']
        }
      }
    },

    cssmin: {
      options: {
        sourceMap: true
      },
      vendor: {
        files: {
          '<%= client %>public/dev/css/vendor.min.css': [
            'node_modules/bootstrap/dist/css/bootstrap.css',
            'node_modules/font-awesome/css/font-awesome.css',
            'node_modules/izitoast/dist/css/iziToast.css',
            'node_modules/admin-lte/dist/css/AdminLTE.css',
            'node_modules/datatables.net-bs/css/dataTables.bootstrap.css',
            'node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker3.css'
          ]
        }
      }
    },

    concat: {
      options: {
        separator: ';\n',
      },
      vendor: {
        files: {
          '<%= client %>public/dev/js/vendor.min.js': [
            '<%= client %>public/dev/js/vendor.min.js'
          ]
        }
      }
    },

    copy: {
      webpage: {
        files: [{
          expand: true,
          cwd: CLIENT + 'template/',
          src: 'tmpl.htm',
          dest: '<%= client %>view/',
          rename: function () { return '<%= client %>view/<%= target %>.mustache'; }
        }, {
          expand: true,
          cwd: CLIENT + 'template/',
          src: 'tmpl.js',
          dest: '<%= client %>public/js',
          rename: function () { return '<%= client %>public/js/<%= target %>.js'; }
        }, {
          expand: true,
          cwd: CLIENT + 'template/',
          src: 'tmpl.scss',
          dest: '<%= client %>src/scss',
          rename: function () { return '<%= client %>src/scss/<%= target %>.scss'; }
        }],
      },
      vendor: {
        files: [{
          expand: true,
          cwd: 'node_modules/bootstrap/dist/fonts',
          src: ['**'],
          dest: '<%= client %>public/dev/fonts'
        }, {
          expand: true,
          cwd: 'node_modules/font-awesome/fonts',
          src: ['**'],
          dest: '<%= client %>public/dev/fonts'
        }, {
          expand: true,
          cwd: 'node_modules/admin-lte/dist/css/skins',
          src: ['skin-blue-light.min.css'],
          dest: '<%= client %>public/dev/css'
        }]
      }
    },

    watch: { // watch task for general work
      sass: {
        files: ['<%= client %>src/scss/**/*.scss'],
        tasks: ['sass']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // the default task can be run just by typing "grunt" on the command line
  grunt.registerTask('default', ['sass']);
	grunt.registerTask('vendor', [
    'browserify:vendor', 'uglify:vendor', 'cssmin:vendor', 'concat:vendor', 'copy:vendor'
  ]);
  grunt.registerTask('webpage', ['copy:webpage']);
};
