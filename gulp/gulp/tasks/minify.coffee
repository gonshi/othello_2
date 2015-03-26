gulp = require 'gulp'
config = require '../config'
$ = (require 'gulp-load-plugins')()

gulp.task 'minify:html', () ->
    assets = $.useref.assets({ searchPath: '{.tmp, ' + config.path.htdocs + '}' })

    return gulp.src(config.path.htdocs + '*.html')
        .pipe($.plumber())
        # Minify Any HTML
        .pipe($.if('*.html', $.minifyHtml()))
        # Output Files
        .pipe(gulp.dest(config.path.dist))
        .pipe($.size({ title: 'minify:html' }))


gulp.task 'minify:styles', () ->
    # For best performance, don't add Sass partials to `gulp.src`
    return gulp.src([
        config.path.css + '*.css'
    ])
        .pipe($.plumber())
        # Concatenate And Minify Styles
        .pipe($.if('*.css', $.csscomb()))
        .pipe($.if('*.css', $.csso()))
        # .pipe($.concat(file.name.css))
        .pipe(gulp.dest(config.path.dist + 'css'))
        .pipe($.size({ title: 'minify:styles' }))


gulp.task 'minify:lib', () ->
    return gulp.src(file.lib)
        .pipe($.plumber())
        .pipe($.concat('lib.min.js'))
        # Concatenate And Minify JavaScript
        .pipe($.if('*.js', $.uglify({ preserveComments: 'some' })))
        # Output Files
        .pipe(gulp.dest(config.path.js))
        .pipe($.size({ title: 'minify:lib' }))


gulp.task 'minify:class', () ->
    return gulp.src(file.classes)
        .pipe($.plumber())
        .pipe($.concat('kazoku.min.js'))
        # Concatenate And Minify JavaScript
        .pipe($.if('*.js', $.uglify({ preserveComments: 'some' })))
        # Output Files
        .pipe(gulp.dest(config.path.js))
        .pipe($.size({ title: 'minify:class' }))


gulp.task 'minify:scripts', () ->
    return gulp.src(
        file.lib,
        file.classes,
        [ 'js/app.js' ]
    )
        .pipe($.plumber())
        .pipe($.concat('all.min.js'))
        # Concatenate And Minify JavaScript
        .pipe($.if('*.js', $.uglify({ preserveComments: 'some' })))
        # Output Files
        .pipe(gulp.dest(config.path.js))
        .pipe($.size({ title: 'minify:all' }))