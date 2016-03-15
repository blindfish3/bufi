// - - - - - DEPENDENCIES - - - - - //
var gulp    = require('gulp');

var gutil   = require('gulp-util');
var notify  = require('gulp-notify');
var del     = require('del');
var sourcemaps = require("gulp-sourcemaps");
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var globby = require('globby');
var rename  = require('gulp-rename');
var es      = require('event-stream');

var jade    = require('gulp-jade');
var sass    = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
// use this to remove unused CSS from vendor stylesheets :)
// var uncss    = require('gulp-uncss');

var jshint  = require('gulp-jshint');
var browserify = require('browserify');
var uglify  = require('gulp-uglify');

var browserSync = require('browser-sync').create();

// - - - - - VARIABLES - - - - - //
var reload  = browserSync.reload;
var SRC = './src';
var DIST = './dist';
var BUILD = './build'; //maybe rename this as test?

// - - - - - HELPERS - - - - - //
//source: https://gist.github.com/mlouro/8886076
var handleError = function(task) {
  return function(err) {

      notify.onError({
        message: task + ' failed, check the logs..'
      })(err);

    gutil.log(gutil.colors.bgRed(task + ' error:'), gutil.colors.red(err));
  };
};


// - - - - - TASKS - - - - - //
gulp.task('clean', function(callback) {
    del([DIST + '/**', BUILD + '/**']).then(function() {
        callback();
    });
});



gulp.task('browserify', function (done) {

  globby(['./src/js/main_bufi.js', './tests/js/main_**.js']).then(function(entries) {

      var tasks = entries.map(function(entry) {

          var entryAsString = String(entry);
          var filename = entryAsString.substring((entryAsString.indexOf('main_') + 5), (entryAsString.length-3));

        return browserify({
          entries: entry,
          debug: true,
          // for standalone to work you need to feed it
          // the desired (unique!) global identifier
          standalone: filename
        })
        .bundle()
        .on('error', handleError('browserify'))
        .pipe(source(entry))
        .pipe(rename(function(path) {
            // TODO: replacing pathname like this seems crude - particularly
            // since it doesn't use the SRC variable
            path.dirname = path.dirname.replace('src/', '');
            path.dirname = path.dirname.replace('tests/', '');
            path.basename = path.basename.replace('main_', '');
        }))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
          // Add gulp plugins to the pipeline here.
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(BUILD))
        .pipe(browserSync.stream());

    });

    es.merge(tasks).on('end', done);


  }).catch(function(err) {
    handleError('browserify')
  });

});


//TODO: rename output to .min.js
gulp.task('uglify', ['browserify'], function() {
  return gulp.src(BUILD + '/js/bufi.js')
    .pipe(uglify({output: {comments: /^!|@preserve|@license|@cc_on/i}}))
    .pipe(gulp.dest(DIST));
});



gulp.task('templates', function() {
    //TODO: avoid processing pages that haven't changed
    return gulp.src(['./src/**/*.jade', './tests/*.jade', '!./_templates/**' ])
        .pipe(jade({
            pretty: true,
            basedir: './tests/_templates'
        }))
        //TODO: fix this: reports errors, but doesn't allow watch task to continue
        .on('error', handleError('jade'))
        .pipe(gulp.dest(BUILD))
        //TODO: is this proper usage?
        .pipe(browserSync.stream());
});

gulp.task('jade-watch', ['templates'], reload);



gulp.task('sass', function() {

  return gulp.src([SRC + '/**/*.scss', './tests/**/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass({
        // outputStyle: 'compressed',
        includePaths : ['./_vendor']
    }).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(BUILD))
    // .pipe(browserSync.stream());

});


gulp.task('minify-css', function() {
  return gulp.src('./build/css/bufi_m.css')
    .pipe(cleanCSS({compatibility: 'ie9'}))
    .pipe(gulp.dest(DIST));
});



gulp.task('build', ['uglify', 'minify-css']);

//TODO: run clean first
gulp.task('serve',
         ['templates', 'sass', 'browserify'],
         function() {

          browserSync.init({
            server: {
              baseDir: BUILD,
              directory: true // displays navigable directory structure
            },
            ghostmode: {
              clicks: true,
              forms: true,
              scroll: true
            }

          });

          gulp.watch(SRC + "/**/*.scss", ['sass']);
          gulp.watch(SRC + "/**/*.js", ['browserify']);

          gulp.watch("./tests/*.jade",  ['jade-watch']);
          gulp.watch("./tests/**/*.scss", ['sass']);
          gulp.watch("./tests/**/*.js", ['browserify']);

});



gulp.task('default', ['serve']);
