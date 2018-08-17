import gulp from 'gulp'
import sass from 'gulp-sass'
import rename from 'gulp-rename'
import autoprefixer from 'gulp-autoprefixer'

const paths = {
  sassConfig: {
    inputDirectory: 'src/sass/**/*.scss',
    outputDirectory: 'assets/css',
    options: {
      sourceComments: false,
      outputStyle: 'compressed',
      includePaths: 'bower_components'
    }
  },
  fontConfig: {
      inputDirectory: './bower_components/vend.ui/dist/fonts/*',
      outputDirectory: './assets/fonts'
  }
}

var buildCSS = function () {
  return gulp
    .src(paths.sassConfig.inputDirectory)
    .pipe(sass(paths.sassConfig.options).on('error', sass.logError))
    .pipe(autoprefixer({browsers: ['last 2 versions', 'Safari >= 8', 'iOS >= 8']}))
    .pipe(gulp.dest(paths.sassConfig.outputDirectory))
    .pipe(
      rename(function (path) {
        // We want to create an importable Sass file with the same output of
        // the CSS, but that gets included in the output not resolve to a
        // native CSS @import.
        path.extname = '.scss'
      })
    )
    .pipe(gulp.dest(paths.sassConfig.outputDirectory))
}

var watchSource = function () {
  console.log('Watching for changes to source files...')
  gulp.watch('src/sass/**/*.scss', buildCSS)
}

var moveFonts = function () {
  return gulp
    .src(paths.fontConfig.inputDirectory)
    .pipe(gulp.dest(paths.fontConfig.outputDirectory))
}

const build = gulp.series(buildCSS)
build.description = 'build and move css files to output directory'

const watch = gulp.series(watchSource)
watch.description = 'watch for changes to all source'

const fonts = gulp.series(moveFonts)
fonts.description = 'move fonts to output directory'

const defaultTasks = gulp.series(build, watch)

export {
  build,
  watch,
  fonts,
}

export default defaultTasks