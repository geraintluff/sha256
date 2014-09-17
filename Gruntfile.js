module.exports = function (grunt) {
	'use strict';

	var path = require('path');
	var util = require('util');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.initConfig({
		mochaTest: {
			//node-side
			any: {
				src: ['test/setup.js', 'test/**/*.js'],
				options: {
					reporter: 'mocha-unfunk-reporter',
					bail: false
				}
			}
		},
		uglify: {
			main: {
				options: {
					report: 'min',
				},
				files: {
					'sha256.min.js': ['sha256.js']
				}
			}
		}
	});
	
	grunt.registerTask('measure', function () {
		var fs = require('fs');
		var code = fs.readFileSync('sha256.js');
		console.log('Minified length: ' + code.length + ' bytes');
	});
	
	grunt.registerTask('test', ['mochaTest', 'uglify']);
	grunt.registerTask('default', ['test', 'measure']);
};