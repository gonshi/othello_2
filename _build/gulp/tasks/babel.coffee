gulp = require 'gulp'
config = require '../config'
babel = require "gulp-babel"
$ = (require 'gulp-load-plugins')()

gulp.task 'babel', () ->
    return gulp.src([
        config.path.js_src + '*.js'
    ])
        .pipe($.plumber())
        .pipe($.babel({presets:['es2015']}))
        .pipe(gulp.dest(config.path.js))
        .pipe($.size({ title: 'babel' }))
