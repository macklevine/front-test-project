'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var server = require('gulp-develop-server');

//set up the watchers only once.
gulp.task('default', ['build-javascript-dev','start-server', 'watch-for-changes']);

var javaScriptSources = [
	'./bower_components/angular/angular.js',
	'./bower_components/jquery/dist/jquery.js',
	'./client/js/app.js'
];

gulp.task('build-javascript-dev', function() {
  return gulp.src(javaScriptSources)
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('./client/build/js'));
});


gulp.task('start-server', function() {
    server.listen( { path: './server/app.js' } );
});

gulp.task('watch-for-changes', function(){
	gulp.watch(['./client/js/**/*.js'], ['build-javascript-dev']);
	gulp.watch(['./server/**/*.js'], ['restart-server']);
});

 
gulp.task('restart-server', server.restart);