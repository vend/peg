var gulp = require('gulp'),
  sass = require('gulp-sass'),
  rename = require('gulp-rename'),
  autoprefixer = require('gulp-autoprefixer')

var sassConfig = {
  inputDirectory: 'src/sass/**/*.scss',
  outputDirectory: 'assets/css',
  options: {
    sourceComments: false,
    outputStyle: 'compressed',
    includePaths: 'bower_components'
  }
}

var fontConfig = {
  inputDirectory: './bower_components/vend.ui/dist/fonts/*',
  outputDirectory: './assets/fonts'
}

gulp.task('build-css', function () {
  return gulp
    .src(sassConfig.inputDirectory)
    .pipe(sass(sassConfig.options).on('error', sass.logError))
    .pipe(autoprefixer({browsers: ['last 2 versions', 'Safari >= 8', 'iOS >= 8']}))
    .pipe(gulp.dest(sassConfig.outputDirectory))
    .pipe(
      rename(function (path) {
        // We want to create an importable Sass file with the same output of
        // the CSS, but that gets included in the output not resolve to a
        // native CSS @import.
        path.extname = '.scss'
      })
    )
    .pipe(gulp.dest(sassConfig.outputDirectory))
})

gulp.task('fonts', function () {
  return gulp
    .src(fontConfig.inputDirectory)
    .pipe(gulp.dest(fontConfig.outputDirectory))
})

gulp.task('watch', function () {
  gulp.watch('src/sass/**/*.scss', ['build-css'])
})
