var gulp = require('gulp');
var babel = require('gulp-babel');
var umd = require('gulp-umd');
var jshint = require('gulp-jshint');
var jasmine = require('gulp-jasmine');

var jshint_options = {
	esnext: true,
	undef: true,
	unused: true,
	eqnull: true,
	curly: true,
	eqeqeq: true,
	jasmine: true,
	node: true,
};

gulp.task('build', function () {
	return gulp.src('src/fungoid.js')
		.pipe(jshint(jshint_options))
		.pipe(jshint.reporter('default'))
		.pipe(babel({
			presets: [ 'es2015' ],
		}))
		.pipe(umd({
			template: 'src/umd_template'
		}))
		.pipe(gulp.dest('build'));
});

gulp.task('test', gulp.series('build', function () {
	return gulp.src(['test/test-fungoid.js'])
		.pipe(jshint(jshint_options))
		.pipe(jshint.reporter('default'))
		.pipe(jasmine({
			verbose: true
		}));
}));

