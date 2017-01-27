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
var watch                   = require('gulp-watch');
var cache               = require('gulp-cache');
var imagemin            = require('gulp-imagemin');
var pngquant            = require('imagemin-pngquant');


var wiredep 			= require('wiredep').stream;
var del 					= require('del');
var gulpif 				= require('gulp-if');
var useref 				= require('gulp-useref');
var filter 				= require('gulp-filter');
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
        bootstrapScss: 'src/style/bootstrap/bootstrap.scss',
        bootstrapCss: 'src/vendor/bootstrap-sass/assets/stylesheets',
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
 * Js
 */

gulp.task('js:build', function () {
    gulp.src(path.src.js)  
        .pipe(sourcemaps.init()) 
        .pipe(uglify()) 
        .pipe(sourcemaps.write()) 
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});


/*
 * Bootstrap
 */


gulp.task('bootstrap:build', function () {
  return gulp.src(path.src.bootstrapScss)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(gulp.dest(path.src.bootstrapCss));
});

/*
 * Vendor
 */

gulp.task('vendor:build',['bootstrap:build'], function() {
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
 *  Img
 */

 gulp.task('image:build', function (){
    gulp.src(path.src.img)
    .pipe(cache(imagemin({      
        progressive: true,
        interlaced: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    })))
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({stream: true}));
});


/*
 * Fonts
 */


gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
});


/*
 * Watch
 */

gulp.task('watch', function(){
    watch(path.watch.html, function(){
        gulp.start('html:build');
    });
  //watch('src/scss/**/bootstrap.scss', ['bootstrap']);
    watch(path.watch.style, function(){
        gulp.start('style:build');
    });
    watch(path.watch.fonts, function(){
        gulp.start('fonts:build');
    });
    watch(path.watch.js, function(){
        gulp.start('js:build');
    });
    watch(path.watch.img, function(){
        gulp.start('image:build');
    });
    watch('bower.json', function(){
        gulp.start('vendor:build');
    });  
});


gulp.task('default', [  'webserver', 
                        'watch', 
                        'vendor:build', 
                        'style:build', 
                        'html:build',
                        'fonts:build',
                        'js:build',
                        'image:build',
                    ]);