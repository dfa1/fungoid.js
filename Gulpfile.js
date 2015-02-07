var gulp = require('gulp');
var umd = require('gulp-umd');
var to5 = require('gulp-6to5');
var jshint = require('gulp-jshint');
var jasmine = require('gulp-jasmine');
var cover = require('gulp-coverage');

var jasmineOptions = {
	includeStackTrace: true,
	verbose: true
};

gulp.task('build', function () {
    return gulp.src('./fungoid.js')
	.pipe(to5())
	.pipe(umd({
		exports: function(file)   { return 'exports';},
		namespace: function(file) { return 'Fungoid'; }
	}))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
	.pipe(gulp.dest('build'));
});

gulp.task('test', [ 'build' ], function () {
	return gulp.src(['test-fungoid.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
	.pipe(jasmine(jasmineOptions));
});

gulp.task('coverage', [ 'build' ], function () {
	return gulp.src(['test-fungoid.js'])
	.pipe(cover.instrument({
		pattern: ['build/fungoid.js'],
		debugDirectory: 'build/debug'
	}))
	.pipe(jasmine())
	.pipe(cover.gather())
	.pipe(cover.format())
	.pipe(gulp.dest('build/reports'));
});

