var gulp = require('gulp');

var watch = require('gulp-watch');
var sass = require('gulp-sass');
var livereload = require('gulp-livereload');
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var preprocess = require('gulp-preprocess');
var nodemon = require('gulp-nodemon');
var requirejsOptimize = require('gulp-requirejs-optimize');

var autoprefixerOptions = {
  browsers: [
    '> 1%',
    'last 5 Chrome versions',
    'last 5 versions',
    'firefox >= 4',
    'safari 7',
    'safari 8',
    'safari 9',
    'iOS 7',
    'iOS 8',
    'iOS 9',
    'IE >= 8',
    'Edge >= 12'
  ]
};

gulp.task('requirejsOptimize', function () {
  return gulp.src('./src/**/*.js')
    .pipe(requirejsOptimize())
    .pipe(gulp.dest('./index.js'));
});

gulp.task('dev', function () {
  return gulp.src('./index.html')
    .pipe(preprocess({context: {NODE_ENV: 'DEVELOPMENT', DEBUG: true}}))
    .pipe(gulp.dest('.'));
});

gulp.task('mincss', function () {
  return gulp.src('./static/css/main.css', cssnano())
    .pipe(gulp.dest('./static/css/'));
});

gulp.task('preprocess', function () {
  return gulp.src('./index.html')
    .pipe(preprocess({context: {NODE_ENV: 'PRODUCTION'}}))
    .pipe(gulp.dest('.'));
});

gulp.task('sass', function () {
  return gulp.src('./static/scss/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(cssnano())
    .pipe(gulp.dest('./static/css'))
    .pipe(livereload());
});

gulp.task('production', function () {
  return gulp.src(['./src/**/*.js', './index.js'])
    .pipe(concat('./index.min.js'))
    .pipe(gulp.dest('./'))
    .pipe(uglify())
    .pipe(gulp.dest('./'));
});

gulp.task('launchServer', function () {
  nodemon({
    script: './server.js',
    ext: 'js html',
    env: {'NODE_ENV': 'DEVELOPMENT'}
  })
});

gulp.task('startProduction', function () {
  nodemon({
    script: './server.js',
    ext: 'js html',
    env: {'NODE_ENV': 'PRODUCTION'}
  })
});

gulp.task('liveReload', function () {
  livereload.reload();
});

gulp.task('watch', function () {
  livereload.listen();
  gulp.watch('./static/scss/**/*.scss', ['sass']);
  gulp.watch(['./index.html', './index.js', './src/**/*.js', './src/**/*.html'], ['liveReload']);
  gulp.task('requirejsOptimize');

});

// gulp.task('w', ['sass', 'dev', 'launchServer', 'requirejsOptimize', 'watch']);
gulp.task('w', ['sass', 'dev', 'launchServer', 'watch']);
gulp.task('default', ['sass', 'production', 'preprocess', 'mincss', 'startProduction']);

