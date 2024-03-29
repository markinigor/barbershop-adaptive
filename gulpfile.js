'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var autoprefixer = require('autoprefixer');
var server = require('browser-sync').create();
var minify = require('gulp-csso');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var imageminWebp = require('gulp-webp');
var svgstore = require('gulp-svgstore');
var run = require('run-sequence');
var del = require('del');
var uglifyjs = require('gulp-uglify');
var pump = require('pump');

gulp.task('uglify', function (cb) {
    pump([
            gulp.src('js/main.js'),
            uglifyjs(),
            gulp.dest('build/js')
        ],
        cb
    );
});

gulp.task('html', function() {
    return gulp.src('*.html')
        .pipe(posthtml([
            include()
        ]))
        .pipe(gulp.dest('build'))
        .pipe(server.stream());
});

gulp.task('sprite', function() {
    return gulp.src('img/{icon-*.svg,logo-*.svg}')
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename('sprite.svg'))
        .pipe(gulp.dest('build/img'));
});

gulp.task('images', function() {
    return gulp.src('img/**/*.{jpg,png,svg}')
        .pipe(imagemin([
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.svgo()
        ]))
        .pipe(gulp.dest('img'));
});

gulp.task('webp', function() {
    return gulp.src('img/**/*.{jpg,png}')
        .pipe(imageminWebp({quality: 90}))
        .pipe(gulp.dest('img'));
});

gulp.task('style', function() {
    gulp.src('sass/style.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(gulp.dest('build/css'))
        .pipe(minify())
        .pipe(rename('style.min.css'))
        .pipe(gulp.dest('build/css'))
        .pipe(server.stream());
});

gulp.task('serve', function() {
    server.init({
        server: 'build/',
        notify: false,
        open: true,
        cors: true,
        ui: false
    });

    gulp.watch('sass/**/*.{scss,sass}', ['style']);
    gulp.watch('*.html', ['html']);
});

gulp.task('copy', function() {
    return gulp.src([
        'fonts/**/*.{woff,woff2}',
        'img/**/*.{jpg,svg,webp}',
        'img/sprite.svg',
        'img/bg-*.svg',
        'img/icon-tick.svg',
        'js/**'
    ], {
        base: '.'
    })
        .pipe(gulp.dest('build'));
});

gulp.task('clean', function() {
    return del('build');
});

gulp.task('build', function(done) {
    run('clean', 'copy', 'style', 'uglify', 'sprite', 'html', done);
});
