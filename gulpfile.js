var gulp 		= require('gulp');
var gutil 		= require('gulp-util');
var notify 		= require('gulp-notify');
var sass 		= require('gulp-ruby-sass');
var autoprefix 	= require('gulp-autoprefixer');
var minifyCSS 	= require('gulp-minify-css');
var rename		= require('gulp-rename');
var include		= require('gulp-include');
var uglify		= require('gulp-uglify');
var importCss	= require('gulp-import-css');

var sassDir		= 'assets/sass';
var jsDir		= 'assets/js';
var outputDir	= 'public/assets';

gulp.task('main-css', function(){
	return gulp.src(sassDir + '/main.sass')
		.pipe(sass())
		.on('error', handleError)
	    .pipe(importCss())
		.pipe(autoprefix('last 3 version'))
		.pipe(minifyCSS({keepSpecialComments:0}))
        .pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(outputDir + '/css'));
});

gulp.task('main-js', function(){
	return gulp.src(jsDir + '/main.js')
		.pipe(include())
		.pipe(uglify({mangle: false}))
        .pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(outputDir + '/js'));
});

gulp.task('watch', function(){
	gulp.watch(sassDir + '/**/*.sass', ['main-css']);
	gulp.watch(jsDir + '/**/*.js', ['main-js']);
});

gulp.task('default', ['main-css', 'main-js', 'watch']);

function handleError(err) {
	gulp.src(sassDir + '/main.sass').pipe(notify(err));
	this.emit('end');
}