'use strict';

module.exports = function (grunt) {

  var banner =
    '/*! <%= pkg.name %> <%= pkg.version %>\r\n' +
    ' * Author: <%= pkg.author %>\r\n' +
    ' * Description: <%= pkg.description %>\r\n' +
    ' * Date: <%= grunt.template.today("yyyy-mm-dd") %> */\r\n';


  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      compass: {
        files: ['src/sass/*.{scss,sass}'],
        tasks: ['compass']
      },
      livereload: {
        options: {
          livereload: 35729
        },
        files: [
          'demo/index.html',
          'dest/{,*/}*.css',
          'src/{,*/}*.js'
        ]
      }
    },
    compass: {
      main: {
        options: {
          noLineComments : true,
          outputStyle    : 'expanded',
          cssDir         : './dest',
          sassDir        : './src/sass',
          raw            : 'cache_dir="./src/sass/.sass-cache"\n'
        }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      main: [
        'Gruntfile.js',
        'src/**/*.js',
        'test/spec/**/*.js'
      ]
    },
    jasmine: {
      main: {
        src: ['src/autoCompleteJ.js', 'test/helper/*.js'],
        options: {
          specs   : 'test/spec/**/*.js'
        }
      }
    },
    clean: {
      build: ['dest/*']
    },
    concat: {
      options: {
        banner: banner,
      },
      dist: {
        src: [
          'src/autoCompleteJ.js'
        ],
        dest: 'dest/autoCompleteJ.js',
      },
    },
    uglify: {
      dist: {
        options: {
          banner: banner,
          sourceMap: 'dest/autoCompleteJ-source.js'
        },
        files: {
          'dest/autoCompleteJ.min.js': [ 'dest/autoCompleteJ.js' ]
        }
      }
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('build', [
    'test',
    'clean',
    'concat',
    'uglify',
    'compass'
  ]);

  grunt.registerTask('test', [
    'jshint',
    'jasmine'
  ]);

  grunt.registerTask('dev', [
    'watch'
  ]);
};
