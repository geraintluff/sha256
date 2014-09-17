module.exports = function (grunt) {
	'use strict';

	var path = require('path');
	var util = require('util');
	grunt.loadNpmTasks('grunt-mocha-test');

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
		}
	});
	
	grunt.registerTask('test', ['mochaTest']);
	grunt.registerTask('default', ['test']);
};