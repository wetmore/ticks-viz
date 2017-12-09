var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var rollup = require('rollup-stream');
var source = require('vinyl-source-stream');

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
      format: 'es',
    })

    // give the file the name you want to output with
    .pipe(source('app.compiled.js'))

    // and output to ./app/dist/app.compiled.js as normal.
    .pipe(gulp.dest('./app/dist'));
});

gulp.task('js-watch', ['rollup'], function (done) {
    browserSync.reload();
    done();
});

gulp.task('default', ['serve']);
