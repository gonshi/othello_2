gulp = require 'gulp'
config = require '../config'
pngmin = require 'gulp-pngmin'
$ = (require 'gulp-load-plugins')()

# Optimize Images
gulp.task 'imagemin', () ->
    return gulp.src([
        config.path.image + '**/*'
    ])
        .pipe(pngmin())
        .pipe(gulp.dest(config.path.dist + 'img'))
        .pipe($.size({ title: 'imagemin' }))
