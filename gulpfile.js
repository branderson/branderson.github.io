var gulp = require('gulp'),
    del = require('del'),
    webserver = require('gulp-webserver'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    inject = require('gulp-inject'),
    bower = require('gulp-bower');

var config = {
    srcPath: './src',
    distPath: './dist',
    bowerDir: './public/vendor'
}

// Initialize Bower
gulp.task('bower', function() {
    return bower()
        .pipe(gulp.dest(config.bowerDir));
});

// Inject sources
gulp.task('inject', function() {
    var target = gulp.src('src/index.html');
    var sources = gulp.src([config.distPath + '/**/*.js',
                            config.distPath + '/**/*.css'], {read: false});

    return target.pipe(inject(sources))
        .pipe(gulp.dest('.'));
})

// Copy FontAwesome to dist
gulp.task('icons', function() {
    return gulp.src(config.bowerDir + '/font-awesome/fonts/**.*')
        .pipe(gulp.dest(config.distPath + '/fonts'));
});

// gulp.task('compile-bootstrap', function() {
//     // Compile and move Sass files
//     return gulp.src(config.bowerDir + '/bootstrap-sass/assets/stylesheets/**/*.scss')
//         .pipe(sass({outputStyle: 'compressed'})
//             .on("error", notify.onError(function(error) {
//                 return "Error: " + error.message;
//             })))
//         .pipe(gulp.dest(config.distPath + '/css'));
// });

// Compile Sass sources
gulp.task('sass', function() {
    // Compile and move Sass files
    return gulp.src(config.srcPath + '/sass/**/*.scss')
        .pipe(sass({
            style: 'compressed',
            includePaths: [
                config.srcPath + '/sass',
                config.bowerDir + '/bootstrap-sass/assets/stylesheets',
                config.bowerDir + '/font-awesome/scss'
            ]
            // loadPath: [
            //     config.srcPath + '/sass',
            //     config.bowerDir + '/bootstrap-sass/assets/stylesheets',
            //     config.bowerDir + '/font-awesome/scss'
            // ]
        })
        .on("error", notify.onError(function(error) {
            return "Error: " + error.message;
        })))
        .pipe(gulp.dest(config.distPath + '/css'));
});

// Concatenate and copy over regular CSS files from src to dist
gulp.task('css', function() {
    return gulp.src(config.srcPath + '/**/*.css')
        .pipe(cleanCSS())
        .pipe(concat('style.min.css'))
        .on("error", notify.onError(function(error) {
            return "Error: " + error.message;
        }))
        .pipe(gulp.dest(config.distPath + '/css'));
});

// Minify, concatenate, and copy over JS files from src and Bower to dist
gulp.task('js', function() {
    // src JS files
    gulp.src(config.srcPath + '/**/*.js')
        .pipe(uglify())
        .pipe(concat('all.min.js'))
        .on("error", notify.onError(function(error) {
            return "Error: " + error.message;
        }))
        .pipe(gulp.dest(config.distPath + '/js'));
    // Bower JS files
    return gulp.src(config.bowerDir + '/**/*.js')
        .pipe(uglify())
        .pipe(concat('vendor.min.js'))
        .on("error", notify.onError(function(error) {
            return "Error: " + error.message;
        }))
        .pipe(gulp.dest(config.distPath + '/js'));
});

// gulp.task('copy-resources', function() {
//     // Copy over resources
//     return gulp.src(config.srcPath + '/resources/*')
//         .on("error", notify.onError(function(error) {
//             return "Error: " + error.message;
//         }))
//         .pipe(gulp.dest(config.distPath + '/resources'));
// });

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

// Clean dist folder and index.html
gulp.task('clean:dist', function() {
    del(['index.html']);
    return del([
        'dist/**/*'
    ]);
});

// Clean project
gulp.task('clean', gulp.parallel('clean:dist'));

// Clean dist, build Sass and copy sources to dist
gulp.task('build', gulp.series(gulp.parallel('icons', 'sass', 'css', 'js'), 'inject'));

// Watch files for changes
gulp.task('watch', function() {
    gulp.watch(config.srcPath + '/**/*.scss', gulp.series('sass'));
    gulp.watch(config.srcPath + '/**/*.css', gulp.series('css'));
    gulp.watch([
        config.distPath + '/**/*.css',
        config.distPath + '/**/*.js'
    ], gulp.series('inject'));
    // gulp.watch([
    //     config.srcPath + '/index.html',
    //     config.srcPath + '/**/*.scss',
    //     config.srcPath + '/**/*.css',
    //     config.srcPath + '/**/*.js'
    // ], ['build']);
});

// Watch files for changes and start webserver
gulp.task('run', gulp.parallel('webserver', 'watch'));

// Default task
gulp.task('default', gulp.series('bower', 'build', 'run'));
