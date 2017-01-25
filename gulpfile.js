var gulp 					          = require ('gulp');
var sass                    = require('gulp-sass');
var autoprefixer            = require('gulp-autoprefixer');
var sourcemaps              = require('gulp-sourcemaps');
var mainBowerFiles          = require('gulp-main-bower-files');
var gulpFilter              = require('gulp-filter');
var concat                  = require('gulp-concat');
var uglify                  = require('gulp-uglify');
var cleanCSS                = require('gulp-clean-css');
var rigger                  = require('gulp-rigger');
var browserSync             = require('browser-sync');
var reload                  = browserSync.reload;


var wiredep 			= require('wiredep').stream;
var del 					= require('del');
var gulpif 				= require('gulp-if');
var useref 				= require('gulp-useref');
var filter 				= require('gulp-filter');
var imagemin 			= require('gulp-imagemin');
var pngquant 			= require('imagemin-pngquant');
var cache 				= require('gulp-cache');
var size 					= require('gulp-size');
var extender 			= require('gulp-html-extend');
var prettify 			= require('gulp-prettify');



/* ======================= Settings ======================= */


var path = {
    build: {
        html: 'dist/',
        js: 'dist/js/',
        css: 'dist/css/',
        img: 'dist/img/',
        fonts: 'dist/fonts/',
        vendor: 'dist/vendor',
        vendorJs: 'dist/js/vendor.min.js',
        vendorCss: 'dist/css/vendor.min.css'
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/main.js',
        style: 'src/style/main.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        bootstrapScss: 'src/style/bootstrap.scss',
        bootstrapCss: 'src/style/',
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};


/*
 * Live Reload
 */

var config = {
    server: {
        baseDir: "./dist"
    }    
};


gulp.task('webserver', function () {
    browserSync(config);
});



/*
 * Html
 */

gulp.task('html:build', function () {
    gulp.src(path.src.html) 
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});


/*
 * style
 */

gulp.task('style:build', function () {
  return gulp.src(path.src.style)
    .pipe(sourcemaps.init())
    .pipe(sass({
        includePaths: require('node-bourbon').includePaths,
        sourceMap: true,
        outputStyle: 'compressed',
    }).on('error', sass.logError))
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css))
    .pipe(reload({stream: true}));
});


/*
 * Bootstrap
 */

gulp.task('bootstrap:build', function () {
  return gulp.src(path.src.bootstrapScss)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(path.src.bootstrapCss));
});

/*
 * Vendor
 */

gulp.task('vendor:build', function() {
    var filterJS = gulpFilter('**/*.js', { restore: true, passthrough: false });
    var filterCss = gulpFilter('**/*.css', { restore: true, passthrough: false });

    gulp.src('./bower.json')
        .pipe(mainBowerFiles( ))
        .pipe(filterJS)        
        .pipe(concat(path.build.vendorJs))
        .pipe(uglify())
        .pipe(gulp.dest('./'));



    gulp.src('./bower.json')
        .pipe(mainBowerFiles( ))
        .pipe(filterCss)
        .pipe(concat(path.build.vendorCss))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('./'));


    gulp.src('./bower.json')
        .pipe(mainBowerFiles( ))        
        .pipe(gulp.dest(path.build.vendor))
        .pipe(reload({stream: true}));

});


/*
 * Watch
 */

gulp.task('watch', function(){
  gulp.watch(path.src.html, ['html:build']);
  //gulp.watch('src/scss/**/bootstrap.scss', ['bootstrap']);
  gulp.watch(path.src.style, ['style:build']);
  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch('bower.json', ['vendor:build']);  
});


gulp.task('default', ['webserver', 'watch', 'bootstrap:build']);