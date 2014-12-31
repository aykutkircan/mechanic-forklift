var gulp = require('gulp');
var mocha = require('gulp-mocha');

// Run tests
gulp.task('test', function () {
  gulp.src('./test/**/*.js')
    .pipe(mocha({
          reporter: "spec",
          timeout: 10 * 1000
      }));
});