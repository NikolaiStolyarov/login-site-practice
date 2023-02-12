"use strict"

const {src, dest} = require("gulp");
const gulp = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const cssbeautify = require("gulp-cssbeautify");
const removeComments = require('gulp-strip-css-comments');
const rename = require("gulp-rename");
const rigger = require("gulp-rigger");
const sass = require("gulp-sass")(require('sass'));
const cssnano = require("gulp-cssnano");
const uglify = require("gulp-uglify");
const plumber = require("gulp-plumber");
const panini = require("panini");
const imagemin = require("gulp-imagemin");
const del = require("del");
const notify = require("gulp-notify");
const imagewebp = require("gulp-webp");
const browserSync = require("browser-sync").create();

/* Paths */

const srcPath = "src/"; 
const distPath = "dist/";


const path = { //Объект "путь" содержит несколько свойств, определяющих путь источника и назначения для различных типов файлов.
    build: { // Свойство "build" содержит пути назначения для HTML, CSS, JS, изображений и шрифтов.
        html: distPath,
        css: distPath + "assets/css/",
        js: distPath + "assets/js/",
        images: distPath + "assets/img/",
        fonts: distPath + "assets/fonts/"
    },
    src: { // Свойство "src" содержит исходные пути для HTML, CSS, JS, изображений и шрифтов.
        html: srcPath + "*.html",
        css: srcPath + "assets/sass/*.sass",
        js: srcPath + "assets/js/*.js",
        images: srcPath + "assets/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts:  srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    watch: { // Свойство "наблюдать" содержит пути к файлам, за которыми необходимо следить на предмет изменений.
        html:   srcPath + "**/*.html",
        js:     srcPath + "assets/js/**/*.js",
        css:    srcPath + "assets/sass/**/*.sass",
        images: srcPath + "assets/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts:  srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    clean: "./" + distPath // Свойство "очистить" содержит путь к папке, которую необходимо очистить перед новой сборкой.
}

// Функция "serve" используется для запуска локального сервера разработки с использованием синхронизации браузера.
function serve() {
    browserSync.init({  // Метод BrowserSync.init запускает сервер и гарантирует, что сайт автоматически обновляется при изменении файлов.
        server: {
            baseDir: "./" + distPath
        }
    });
}

//Функция "html" используется для обработки HTML-файлов.
function html() { 
    panini.refresh() // Метод "panini.refresh()" вызывается для очистки кэша.
    return src(path.src.html, {base: srcPath}) // Метод "src" используется для указания исходных файлов, которые необходимо обработать. Путь берется из свойства "src" объекта "path", а для параметра "base" установлено значение "srcPath", которое является исходным путем для всех файлов, которые необходимо обработать.
        .pipe(plumber()) //Метод "трубы" используется для объединения нескольких задач обработки в цепочку.
        .pipe(panini({ //Метод "сантехник" используется для предотвращения разрыва трубы, если во время обработки возникает ошибка.
            root: srcPath,
            layouts: srcPath + "tpl/layouts/",
            partials: srcPath + "tpl/partials/",
            data: srcPath + "tpl/data/"
        }))
        .pipe(dest(path.build.html)) // Метод "dest" используется для указания папки назначения для обработанных файлов, которая берется из свойства "build" объекта "path".
        .pipe(browserSync.reload({stream: true})); //Метод "BrowserSync.reload" используется для перезагрузки браузера после того, как файлы были обработаны и сохранены в папке назначения. Для параметра "поток" установлено значение "true", чтобы убедиться, что браузер перезагружен, даже если HTML-файлы не изменены.
}

// Функция "css" используется для обработки файлов CSS.
function css() {
    return src(path.src.css, {base: srcPath + "assets/sass/"}) // Метод "src" используется для указания исходных файлов, которые необходимо обработать. 
        .pipe(plumber({ // Метод "трубы" используется для объединения нескольких задач обработки в цепочку.
            errorHandler : function(err) {
                notify.onError({
                    title:    "SASS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass()) // Метод "sass" используется для преобразования файлов scss в файлы css.
        .pipe(autoprefixer()) // Метод "autoprefixer" используется для автоматического добавления префиксов поставщиков в правила CSS.
        .pipe(cssbeautify()) // Метод "cssbeautify" используется для того, чтобы сделать css-файлы более удобочитаемыми путем добавления отступов и новых строк.
        .pipe(dest(path.build.css)) // Метод "dest" используется для указания папки назначения для обработанных файлов, которая берется из свойства "build" объекта "path".
        .pipe(cssnano({ // Метод "cssnano" используется для минимизации css-файлов. Параметры передаются для удаления z-индекса и отбрасывания всех комментариев.
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(removeComments()) // Метод "removeComments" используется для удаления комментариев из файлов css.
        .pipe(rename({ //Метод "переименовать" используется для переименования файлов с суффиксом ".min" и extname ".css".
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(dest(path.build.css)) //Метод "dest" используется для указания папки назначения для обработанных файлов, которая берется из свойства "build" объекта "path".
        .pipe(browserSync.reload({stream: true})); //Метод "BrowserSync.reload" используется для перезагрузки браузера после того, как файлы были обработаны и сохранены в папке назначения.
}

// Функция "js" используется для обработки файлов JavaScript.
function js() {
    return src(path.src.js, {base: srcPath + "assets/js/"}) // Метод "src" используется для указания исходных файлов, которые необходимо обработать. 
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "JS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(rigger()) // Метод "rigger" используется для включения внешних файлов, на которые сделаны ссылки в файлах JavaScript.
        .pipe(dest(path.build.js))  // Метод "dest" используется для указания папки назначения для обработанных файлов, которая берется из свойства "build" объекта "path".
        .pipe(uglify()) // Метод "uglify" используется для уменьшения размера файлов JavaScript.
        .pipe(rename({ // Метод "переименовать" используется для переименования файлов с суффиксом ".min" и extname ".js".
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({stream: true}));
}

// Функция "изображения" используется для обработки файлов изображений.
function images() {
    return src(path.src.images, {base: srcPath + "assets/img/"})
        .pipe(imagemin([ // Метод "imagemin" используется для оптимизации файлов изображений. Этот метод использует множество различных вариантов оптимизации для разных типов файлов.
            imagemin.gifsicle({interlaced: true}), //Метод "gifsicle" используется для оптимизации GIF-файлов путем чередования кадров.
            imagemin.mozjpeg({quality: 95, progressive: true}), // Метод "mozjpeg" используется для оптимизации файлов JPEG, снижая качество до 95 и делая его прогрессивным.
            imagemin.optipng({optimizationLevel: 8}), //  Метод "optipng" используется для оптимизации файлов PNG путем снижения уровня оптимизации до 3.
            imagemin.svgo({ // Метод "svgo" используется для оптимизации SVG-файлов путем удаления окна просмотра и отключения очистки идентификаторов.
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest(path.build.images))
        .pipe(browserSync.reload({stream: true}));
}

// Функция "webpImages" используется для создания веб-версий файлов изображений.
function webpImages() { 
    return src(path.src.images, {base: srcPath + "assets/img/"})
        .pipe(imagewebp()) // Метод "imagewebp" используется для создания webp-версий файлов изображений из исходного пути.
        .pipe(dest(path.build.images)); // используется для указания папки назначения для обрабатываемых файлов, которая берется из свойства
}

function fonts() { 
    return src(path.src.fonts, {base: srcPath + "assets/fonts/"})
    .pipe(dest(path.build.fonts))
    .pipe(browserSync.reload({stream: true}));
}

function clean() { //  функция используется для удаления файлов и папок в пути назначения.
    return del(path.clean);
}

function watchFiles() { // функуция наблюдения за файлами
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], images);
    gulp.watch([path.watch.fonts], fonts);
}

//Переменной "build" назначается результат метода "gulp.series", который сначала запускает "чистую" задачу, а затем запускает метод "gulp.parallel", который параллельно выполняет следующие задачи: "html", "css", "js", "images", "webpImages" и "fonts". Таким образом, задача сборки сначала очистить папку dist, а затем обработать все файлы и сохранить его в dist папку.
const build = gulp.series(clean, gulp.parallel(html,css,js,images,webpImages,fonts));
// Переменной "watch" назначается результат метода "gulp.parallel", который выполняет задачу "build" и задачу "watchFiles" и задачу "serve" параллельно.
const watch = gulp.parallel(build, watchFiles, serve);

// Объект "export" используется для того, чтобы сделать функции доступными для использования в других файлах. Каждая функция экспортируется под своим именем.
exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.webpImages = webpImages;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;