gulp = require 'gulp'
config = require '../config'
$ = (require 'gulp-load-plugins')()

# Lint Javascript
gulp.task 'jshint', () ->
    return gulp.src([
            config.path.src_js + '**/*.js'
        ])
        .pipe($.plumber())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
