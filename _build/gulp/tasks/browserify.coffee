gulp = require 'gulp'
config = require '../config'
browserify = require 'browserify'
source = require 'vinyl-source-stream'
through2 = require "through2"
$ = (require 'gulp-load-plugins')()

$browserify = (opt) ->
  return through2.obj (file, enc, next) ->
    browserify(opt)
      .transform 'babelify', {presets: ['es2015']}
      .add file.path
      .bundle (err, res) ->
        file.contents = if res then res else null
        next err, file

gulp.task 'browserify:coffee', () ->
    return browserify({
        entries: [config.path.coffee + config.entry.coffee],
        extensions: ['.coffee']
    })
    .bundle()
    .pipe(source(config.name.js))
    .pipe(gulp.dest(config.path.js))

gulp.task 'browserify:babel', () ->
    return gulp
      .src config.path.js_src + config.entry.js
      .pipe $.plumber
          errorHandler: (err) ->
            console.log("[ERROR]", err.annotated || err.message || err)
            @emit("end")
      .pipe $browserify
        extensions: [".js", ".json"]
      .pipe $.rename
        extname: ".js"
      .pipe gulp.dest(config.path.js)
