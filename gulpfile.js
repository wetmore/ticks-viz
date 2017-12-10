var resolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var rollup = require('rollup-stream');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

// Static server
gulp.task('serve', ['rollup'], function() {
  browserSync.init({
    server: {
      baseDir: "./app"
    }
  });

  gulp.watch("app/*.html").on('change', browserSync.reload);
  gulp.watch("app/*.js", ['js-watch']);
});

gulp.task('rollup', function() {
  return rollup({
    input: './app/index.js',
    format: 'iife',
    globals: {'d3': 'd3'},
    external: ['d3'],
    plugins: [
      resolve({jsnext: true, main: true}),
      commonjs({
        include: 'node_modules/**'
      }),
    ],
    sourcemap: true
  })

  // give the file the name you want to output with
  .pipe(source('index.js', './app'))

  .pipe(buffer())

  // tell gulp-sourcemaps to load the inline sourcemap produced by rollup-stream.
  .pipe(sourcemaps.init({
    loadMaps: true
  }))

  .pipe(sourcemaps.write('.'))


  // and output to ./app/dist/app.compiled.js as normal.
  .pipe(gulp.dest('./app/dist'));
});

gulp.task('js-watch', ['rollup'], function(done) {
  browserSync.reload();
  done();
});

gulp.task('default', ['serve']);