var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var series = require('stream-series');
var angularFilesort = require('gulp-angular-filesort')
var inject = require('gulp-inject');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');

var paths = {
  sass: ['./scss/**/*.scss'],
  injectFiles: ['./www/vendors/**/*.min.js', './www/js/components/**/*.js']
};



gulp.task('default', ['sass', 'index']);

gulp.task('index', function(){
  var target = gulp.src('./www/index.html');
  var vendorStream = gulp.src(['./www/vendors/**/*.min.js'], {read: true}).pipe(angularFilesort());
  var appStream = gulp.src(['./www/js/*.js'], {read: true}).pipe(angularFilesort());
  var appComponentsStream = gulp.src(['./www/js/components/**/*.js'], {read: true}).pipe(angularFilesort());

  return target
  //.pipe(inject(gulp.src('./www/vendors/**/*.min.js', {read: false}), {relative: true}))
  //.pipe(inject(gulp.src('./www/js/components/**/*.js', {read: false}), {relative: true}))
  .pipe(inject(series(vendorStream, appStream, appComponentsStream), {relative: true})) // This will always inject vendor files before app files 
  .pipe(gulp.dest('./www'));
});


gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.injectFiles, ['index']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
