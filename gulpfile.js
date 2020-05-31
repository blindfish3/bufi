// - - - - - DEPENDENCIES - - - - - //
const gulp = require("gulp");
const { series, parallel } = require("gulp");

const gutil = require("gulp-util");
const notify = require("gulp-notify");
const del = require("del");
const sourcemaps = require("gulp-sourcemaps");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const globby = require("globby");
const rename = require("gulp-rename");
const es = require("event-stream");

const jade = require("gulp-jade");
const sass = require("gulp-dart-sass");
const cleanCSS = require("gulp-clean-css");
const postcss = require('gulp-postcss');
const uncss = require('postcss-uncss');

const jshint = require("gulp-jshint");
const browserify = require("browserify");
const uglify = require("gulp-uglify");

const browserSync = require("browser-sync").create();

// - - - - - VARIABLES - - - - - //
const reload = browserSync.reload;
const SRC = "./src";
const DIST = "./dist";
const BUILD = "./build"; //maybe rename this as test?

// - - - - - HELPERS - - - - - //
//source: https://gist.github.com/mlouro/8886076
const handleError = function(task) {
  return function(err) {
    notify.onError({
      message: task + " failed, check the logs.."
    })(err);

    gutil.log(gutil.colors.bgRed(task + " error:"), gutil.colors.red(err));
  };
};

// - - - - - TASKS - - - - - //
function clean(callback) {
  del([DIST + "/**", BUILD + "/**"]).then(function() {
    callback();
  });
}

async function scripts(done) {
  const entries = await getScriptEntries();
  await entries.forEach((entry) => {
    return doBrowserify(entry);
  })
  done();
};

//NOTE: this works to a point; but I suspect that `.pipe(browserSync.stream());`
// leads to browserSync refresh happening before all files are parsed :(
async function getScriptEntries() {
  return await globby(["./src/js/main_bufi.js", "./tests/js/main_**.js"])
    .then(function(entries) {
      return entries.map(function(entry) {
        var entryAsString = String(entry);
        var filename = entryAsString.substring(
          entryAsString.indexOf("main_") + 5,
          entryAsString.length - 3
        );
        return { entry, filename };
      });

    })
    .catch(function(err) {
      handleError("getScriptEntries");
    });
}

//TODO: rename output to .min.js
function doUglify() {
  return gulp
    .src(BUILD + "/js/bufi.js")
    .pipe(uglify({ output: { comments: /^!|@preserve|@license|@cc_on/i } }))
    .pipe(
      rename(function(path) {
        path.basename += ".min";
      })
    )
    .pipe(gulp.dest(DIST));
}

function doBrowserify({entry, filename}) {
  return (
    browserify({
      entries: entry,
      debug: true,
      // for standalone to work you need to feed it
      // the desired (unique!) global identifier
      standalone: filename
    })
      .bundle()
      .on("error", handleError("browserify"))
      .pipe(source(entry))
      .pipe(
        rename(function(path) {
          // TODO: replacing pathname like this seems crude - particularly
          // since it doesn't use the SRC variable
          path.dirname = path.dirname.replace("src/", "");
          path.dirname = path.dirname.replace("tests/", "");
          path.basename = path.basename.replace("main_", "");
        })
      )
      .pipe(buffer())
      // Add gulp plugins to the pipeline here.
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest(BUILD))
      .pipe(browserSync.stream())
  );
}


function templates() {
  //TODO: avoid processing pages that haven't changed
  return (
    gulp
      .src(["./src/**/*.jade", "./tests/*.jade", "!./_templates/**"])
      .pipe(
        jade({
          pretty: true,
          basedir: "./tests/_templates"
        })
      )
      //TODO: fix this: reports errors, but doesn't allow watch task to continue
      .on("error", handleError("jade"))
      .pipe(gulp.dest(BUILD))
  );
}

function doSass() {
  return gulp
    .src([SRC + "/**/*.scss", "./tests/**/*.scss"])
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        // outputStyle: 'compressed',
        includePaths: ["node_modules"]
      }).on("error", sass.logError)
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(BUILD))
    .pipe(browserSync.stream());
}

function minifyCSS() {
  return gulp
    .src(DIST + "/bufi_m.css")
    .pipe(cleanCSS({ compatibility: "ie11" }))
    .pipe(
      rename(function(path) {
        path.basename += ".min";
      })
    )
    .pipe(gulp.dest(DIST));
}

// TODO: this appears to work but throws an error when trying to load
// browserSync script; which it doesn't need.
// Can't include it in the build process if it errors :/
function foo() {
  const plugins = [
    uncss({
      html: [BUILD + '/static.html']
    }),
  ];

  return gulp.src(BUILD + "/css/bufi_m.css")
    .pipe(postcss(plugins))
    .pipe(gulp.dest(DIST));
}

function serve() {
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

  gulp.watch(SRC + "/**/*.scss", doSass);
  gulp.watch(SRC + "/**/*.js", scripts);

  gulp.watch("./tests/*.jade", series(templates, reload));
  gulp.watch("./tests/**/*.scss", doSass);
  gulp.watch("./tests/**/*.js", scripts);
}

// working :)
gulp.task('clean', clean);
gulp.task('css', doSass);
gulp.task('minCss', minifyCSS);
gulp.task('foo', foo);
gulp.task('jade', templates);
gulp.task('scripts', scripts);
// NOTE: not quite there yet: need to run scripts manually before this.
// TODO: fix timing issue; presumably because scripts is async.
gulp.task('build', series(scripts, templates, doSass, doUglify, minifyCSS));
gulp.task("default", series(clean, series(parallel(templates, doSass, scripts), serve)));
