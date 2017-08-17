var gulp = require('gulp'), sass = require('gulp-sass')

var sassConfig = {
  inputDirectory: 'assets/sass/**/*.scss',
  outputDirectory: 'assets/css',
  options: {
    outputStyle: 'compact',
    includePaths: 'bower_components'
  }
}

gulp.task('build-css', function () {
  return gulp
    .src(sassConfig.inputDirectory)
    .pipe(sass(sassConfig.options).on('error', sass.logError))
    .pipe(gulp.dest(sassConfig.outputDirectory))
})

gulp.task('watch', function () {
  gulp.watch('assets/sass/**/*.scss', ['build-css'])
})
