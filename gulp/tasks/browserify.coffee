gulp = require 'gulp'
config = require '../config'
browserify = require 'browserify'
source = require 'vinyl-source-stream'

gulp.task 'browserify:coffee', () ->
    return browserify({
        entries: [config.path.coffee + config.entry.coffee],
        extensions: ['.coffee']
    })
    .bundle()
    .pipe(source(config.name.js))
    .pipe(gulp.dest(config.path.js))

gulp.task 'browserify:babel', () ->
    return browserify({
        entries: [config.path.js_src + config.entry.js],
        extensions: ['.js']
    })
    .transform('babelify', {presets: ['es2015']})
    .bundle()
    .pipe(source(config.name.js))
    .pipe(gulp.dest(config.path.js))
