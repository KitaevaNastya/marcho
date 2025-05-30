"use strict";

const {src, dest} = require('gulp');
const gulp = require('gulp') ;
const autoprefixer = require('gulp-autoprefixer');
const cssbeautify = require('gulp-cssbeautify');
const removeComments = require('gulp-strip-css-comments');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const rigger = require('gulp-rigger');
const plumber = require('gulp-plumber');
const imagemin = require('gulp-imagemin');
const notify = require('gulp-notify');
const del = require('del');
const browserSync = require('browser-sync').create();


const srcPath = "src/";
const distPath = "dist/";


const path = {
    build: { 
        html: distPath,
        css: distPath + "/css/",
        js: distPath + "/js/",
        images: distPath + "/images/",
        fonts: distPath + "/fonts/"
    },
    src: {
        html: srcPath + "*.html",
        css: srcPath + "/scss/*.scss",
        js: srcPath + "/js/*.js",
        images: srcPath + "/images/**/*.{jpg,png,svg,giv,ico,webp,webmanifest,xml,json}",
        fonts: srcPath + "/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    watch: {
        html: srcPath + "**/*.html",
        css: srcPath + "/scss/**/*.scss",
        js: srcPath + "/js/**/*.js",
        images: srcPath + "/images/**/*.{jpg,png,svg,giv,ico,webp,webmanifest,xml,json}",
        fonts: srcPath + "/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    clean: "./" + distPath 
};

function serve() {
    browserSync.init({
        server: {
            baseDir: "./" + distPath
        },
        notify: false,
        port: 3000
    });
}

function html() {
    return src(path.src.html, {base: srcPath}) 
        .pipe(plumber())
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({stream: true}));

}

function css() {
    return src(path.src.css, {base: srcPath + "/scss/"})
        .pipe(plumber({
            errorHandler: function(err){
                notify.onError({
                    title: "SCSS Error",
                    message: "Error <%= error.massage %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(cssbeautify())
        .pipe(dest(path.build.css))
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(removeComments())
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))              
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({stream: true}));
};

function js() {
    return src(path.src.js, {base: srcPath + "/js/"})
        .pipe(plumber({
            errorHandler: function(err){
                notify.onError({
                    title: "JS Error",
                    message: "Error <%= error.massage %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(rigger())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))              
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({stream: true}));
    }

function images() { //исправленный имейджмин
    return src(path.src.images, { encoding: false }) 
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 80, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(dest(path.build.images)) 
    .pipe(browserSync.reload({stream: true}));
}

function fonts() {
    return src(path.src.fonts, {base: srcPath + "/fonts/"}) 
         .pipe(browserSync.reload({stream: true}));
}

function clean(){
    return del(path.clean);
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], images);
    gulp.watch([path.watch.fonts], fonts);
}


const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts));
const watch = gulp.parallel(build, watchFiles, serve);

 exports.html = html;
 exports.css = css;
 exports.js = js;
 exports.images = images;
 exports.fonts = fonts;
 exports.clean = clean;
 exports.build = build;
 exports.watch = watch;
 exports.default = watch;