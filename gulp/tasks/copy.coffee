gulp = require 'gulp'
config = require '../config'
$ = (require 'gulp-load-plugins')()

# Copy All Files At The Root Level (dist)
gulp.task 'copy', (dir) ->
    gulp.src("#{config.path.dist}**/*")
        .pipe(gulp.dest('../html5-cl/taji/othello/'))
        .pipe($.size({ title: 'copy' }))

# gulp.task 'copy:docs', () ->
#     gulp.src([])
#         .pipe(gulp.dest())
