var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var sourcemaps = require('gulp-sourcemaps');
var minifycss = require('gulp-minify-css');
var del = require('del');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var less = require('gulp-less');


var paths = {
    scripts: ['static/js/**/*.js', '!static/js/vendor/*.js'],
    gmu_scripts: [
        'static/js/gmu/extend/touch.js',
        'static/js/gmu/extend/matchMedia.js',
        'static/js/gmu/extend/event.ortchange.js',
        'static/js/gmu/extend/parseTpl.js',
        'static/js/gmu/core/gmu.js',
        'static/js/gmu/core/event.js',
        'static/js/gmu/core/widget.js',
        'static/js/gmu/widget/slider/slider.js',
        'static/js/gmu/widget/slider/dots.js',
        'static/js/gmu/widget/slider/$touch.js',
        'static/js/gmu/widget/slider/$autoplay.js',
        'static/js/gmu/widget/slider/$lazyloadimg.js'
    ],
    gmu_css: [
        'static/css/gmu/reset.css',
        'static/css/gmu/slider.css',
        'static/css/gmu/slider.default.css'
    ],
    rotate_scss: [
        'rotate/rotate_files/test.scss'
    ],
    rotate_less: [
        'rotate/rotate_files/*.less'
    ],
    images: 'static/images/**/*'
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use all packages available on npm
gulp.task('clean', function (cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    del(['build'], cb);
});

gulp.task('scripts', ['clean'], function () {
    // Minify and copy all JavaScript (except vendor scripts)
    // with sourcemaps all the way down
    return gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat('all.min.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build/js'));
});

// Copy all static images
gulp.task('images', ['clean'], function () {
    return gulp.src(paths.images)
        // Pass in options to the task
        .pipe(imagemin({optimizationLevel: 5}))
        .pipe(gulp.dest('build/images'));
});

gulp.task('gmu-scripts', ['clean'], function () {
    // Minify and copy all JavaScript (except vendor scripts)
    // with sourcemaps all the way down
    return gulp.src(paths.gmu_scripts)
        .pipe(uglify())
        .pipe(concat('gmu-slider.min.js'))
        .pipe(gulp.dest('build/js'));
});
gulp.task('gmu-css', ['clean'], function () {
    // Minify and copy all JavaScript (except vendor scripts)
    // with sourcemaps all the way down
    return gulp.src(paths.gmu_css)
        .pipe(minifycss())
        .pipe(concat('gmu-slider.min.css'))
        .pipe(gulp.dest('build/css'));
});



gulp.task('less-clean', function (cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    del(['rotate/build'], cb);
});

gulp.task('less', [], function () {
    gulp.src(paths.rotate_less) //多个文件以数组形式传入
        .pipe(less())
        .pipe(autoprefixer({
            browsers: [
                'last 2 versions',
                'safari 5',
                'ios 6',
                'android 4'
            ],
            cascade: true
        }))
        .pipe(gulp.dest('rotate/rotate_files')); //将会在src/css下生成index.css以及detail.css
});

// Rerun the task when a file changes
//gulp.task('watch', function () {
//    gulp.watch(paths.scripts, ['scripts']);
//    gulp.watch(paths.images, ['images']);
//});

gulp.task('watch', function () {
    gulp.watch(paths.rotate_less, ['less']);
});


// The default task (called when you run `gulp` from cli)
//gulp.task('default', ['watch', 'gmu-scripts', 'scripts', 'images']);
gulp.task('default', ['watch', 'gmu-css', 'gmu-scripts', 'scripts']);
