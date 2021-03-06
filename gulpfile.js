var gulp = require('gulp'),
    fs = require('fs'),
    util = require('gulp-util'),
    foreach = require('gulp-foreach'),
    del = require('del'),
    webserver = require('gulp-webserver'),
    sass = require('gulp-sass'),
    filter = require('gulp-filter'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    uncss = require('gulp-uncss'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    flatten = require('gulp-flatten'),
    notify = require('gulp-notify'),
    inject = require('gulp-inject'),
    bower = require('gulp-bower'),
    mainBowerFiles = require('main-bower-files'),
    path = require('path'),
    handlebars = require('gulp-compile-handlebars');

var config = {
    srcPath: './src',
    distPath: './dist',
    bowerDir: './public/vendor',
    templateDir: './src/pages/templates',
    jsonDir: './src/pages/json',
    projectPath: './projects'
}

// Clean dist folder
gulp.task('clean:dist', gulp.series(function() {
    return del([
        'dist/**/*'
    ]);
}));

// Clean projects folder
gulp.task('clean:projects', gulp.series(function() {
    return del([
        'projects/**/*'
    ]);
}));

// Clean project
gulp.task('clean', gulp.parallel('clean:dist', 'clean:projects'));

// Initialize Bower
gulp.task('bower', function() {
    return bower()
        .pipe(gulp.dest(config.bowerDir));
});

// Inject sources
// gulp.task('inject', gulp.series(function() {
//     var target = gulp.src('index.html');
//     var sources = gulp.src([config.distPath + '/**/*.js',
//                             config.distPath + '/**/*.css'], {read: false});

//     return target.pipe(inject(sources))
//         .pipe(gulp.dest('.'));
// }));

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
        })
        .on("error", notify.onError(function(error) {
            return "Error: " + error.message;
        })))
        .pipe(uncss({
            html: ['index.html', 'projects/**/*.html']
        }))
        .pipe(cleanCSS())
        .pipe(concat('style.min.css'))
        .pipe(gulp.dest(config.distPath + '/css'));
});

// Minify, concatenate, and copy over JS files from src to dist
gulp.task('js', function() {
    // src JS files
    return gulp.src(config.srcPath + '/**/*.js')
        .pipe(uglify())
        .pipe(concat('all.min.js'))
        .on("error", notify.onError(function(error) {
            return "Error: " + error.message;
        }))
        .pipe(gulp.dest(config.distPath + '/js'));
});

// Compile project pages using handlebars
gulp.task('handlebars', function() {
    return gulp.src(config.jsonDir + '/*.json')
        .pipe(foreach(function(stream, file) {
            var json = JSON.parse(fs.readFileSync(config.jsonDir + '/' + path.basename(file.path), 'utf8'));
            var name = path.basename(file.path, '.json');
            var templateName = json.template;
            var options = {
                ignorePartials: true,
                batch: ['src/pages/partials'],
                helpers: {
                    inc: function(value)
                    {
                        return parseInt(value) + 1;
                    }
                }
            }
            util.log("Compiling " + path.basename(file.path) + " using template " + templateName);
            return gulp.src(config.templateDir + '/' + templateName + '.handlebars')
                .pipe(handlebars(json, options))
                .pipe(rename({basename: name, extname: '.html'}));
        }))
        .pipe(gulp.dest(config.projectPath))
        .on("error", notify.onError(function(error) {
            return "Error: " + error.message;
        }))
        .on('end', function(){ util.log('Done!'); });
});

// Minify and copy over JS files from Bower to dist
gulp.task('bowerFiles', function() {
    var jsFilter = filter('**/*.js', {restore: true});

    return gulp.src(mainBowerFiles())
        // Bower JS files
        .pipe(jsFilter)
        .pipe(uglify())
        .pipe(rename({suffix: ".min"}))
        .pipe(gulp.dest(config.distPath + '/js'))
        .pipe(jsFilter.restore)

        .on("error", notify.onError(function(error) {
            return "Error: " + error.message;
        }));
});

// Copy over fonts from Bower to dist
gulp.task('bowerFonts', function() {
    return gulp.src(config.bowerDir + '/**/*.{eot,woff*,svg,ttf}')
        .pipe(flatten())
        .pipe(gulp.dest(config.distPath + '/fonts'))
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

// Clean dist, build Sass and copy sources to dist
gulp.task('build', gulp.parallel('bowerFiles', 'bowerFonts', 'sass', 'js', 'handlebars'));

// Watch files for changes
gulp.task('watch', function() {
    gulp.watch(config.srcPath + '/**/*.scss', gulp.series('sass'));
    gulp.watch(config.srcPath + '/**/*.js', gulp.series('js'));
    gulp.watch([
        config.templateDir + '/**/*.handlebars', 
        config.jsonDir + '/**/*.json'
    ], gulp.series('handlebars'));
});

// Watch files for changes and start webserver
gulp.task('run', gulp.parallel('webserver', 'watch'));

// Default task
gulp.task('default', gulp.series('bower', 'build', 'run'));
