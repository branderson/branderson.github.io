var gulp = require('gulp'),
    webserver = require('gulp-webserver'),
    sass = require('gulp-ruby-sass'),
    notify = require('gulp-notify'),
    bower = require('gulp-bower');

var config = {
    srcPath: './src',
    distPath: './dist',
    bowerDir: './bower_components'
}

// Initialize Bower
gulp.task('bower', function() {
    return bower()
        .pipe(gulp.dest(config.bowerDir));
});

// Set up FontAwesome
gulp.task('icons', function() {
    return gulp.src(config.bowerDir + '/fontawesome/fonts/**.*')
        .pipe(gulp.dest(config.distPath + '/fonts'));
});

// Set up Sass with Bootstrap and FontAwesome
gulp.task('css', function() {
    return sass(config.srcPath + '/style.scss', {
            style: 'compressed',
            loadPath: [
                config.srcPath,
                config.bowerDir + '/bootstrap-sass/assets/stylesheets',
                config.bowerDir + '/font-awesome/scss'
            ]
        })
        .on("error", notify.onError(function(error) {
            return "Error: " + error.message;
        }))
        .pipe(gulp.dest(config.distPath + '/css'));
});

// Webserver
gulp.task('webserver', function() {
    gulp.src('.')
        .pipe(webserver({
            host: 'localhost',
            port: 8000,
            livereload: true,
            open: true
        }));
});

// Build Sass
gulp.task('build', function() {
    gulp.watch(config.srcPath + '/**/*.scss', ['css']);
});

// Watch Sass
gulp.task('watch', ['build'], function() {
    return gulp.start(['webserver']);
});

// Default task
gulp.task('default', ['bower', 'icons', 'css']);
