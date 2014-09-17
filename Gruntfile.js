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
					'sha256.min.js': ['sha256.js'],
					'extras/get-sync.min.js': ['extras/get-sync.js']
				}
			}
		}
	});
	
	grunt.registerTask('build', function () {
		var fs = require('fs'), path = require('path');
		fs.readdirSync('templates').forEach(function (filename) {
			if (filename.charAt(0) === '.') return;
			var template = fs.readFileSync(path.join('templates', filename), {encoding: 'utf-8'});
			var output = template.replace(/\{\{([^\:]+\:)?([^\{\}]+)\}\}/g, function (match, modifier, filename) {
				var content = fs.readFileSync(filename, {encoding: 'utf-8'});
				modifier = modifier && modifier.replace(':', '').toLowerCase();
				if (modifier === 'html') {
					content = content.replace(/</g, '&lt;').replace('"').replace(/"/, '&quot').replace(/'/g, '&#39');
				} else if (modifier === 'json') {
					content = JSON.stringify(content);
				} else if (modifier === 'base64') {
					content = (new Buffer(content, 'utf-8')).toString('base64');
				}
				return content;
			});
			fs.writeFileSync(filename, output);
			console.log('Generated ' + filename);
		});
	});
	
	grunt.registerTask('measure', function () {
		var fs = require('fs');
		var code = fs.readFileSync('sha256.min.js');
		console.log('Minified length: ' + code.length + ' bytes');
	});
	
	grunt.registerTask('test', ['build', 'mochaTest', 'uglify']);
	grunt.registerTask('default', ['test', 'measure', 'build']); // Yes, we build twice, because some of the builds might rely on the minified versions
};