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
	
	grunt.registerTask('build', function () {
		var fs = require('fs');
		var indexTemplate = fs.readFileSync('templates/index.js', {encoding: 'utf-8'});
		var indexCode = indexTemplate.replace('{{code}}', fs.readFileSync('sha256.js', {encoding: 'utf-8'}));
		fs.writeFileSync('index.js', indexCode);
	});
	
	grunt.registerTask('measure', function () {
		var fs = require('fs');
		var code = fs.readFileSync('sha256.min.js');
		console.log('Minified length: ' + code.length + ' bytes');
	});
	
	grunt.registerTask('test', ['build', 'mochaTest', 'uglify']);
	grunt.registerTask('default', ['test', 'measure']);
};