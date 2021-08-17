let sourceFolder = "#src";
let projectFolder = "ready";

// ФАЙЛОВАЯ СТРУКТУРА
let path = {
	build: {
		html: projectFolder + "/",
		css: projectFolder + "/css/",
		js: projectFolder + "/js/",
		img: projectFolder + "/img/",
		// img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		fonts: projectFolder + "/fonts/",
	},
	src: {
		html: [sourceFolder + "/*.html", "!" + sourceFolder + "/_*.html"],
		css: sourceFolder + "/scss/style.scss",
		js: sourceFolder + "/js/script.js",
		img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		fonts: sourceFolder + "/fonts/*.ttf",
	},
	watch: {
		html: sourceFolder + "/**/*.html",
		css: sourceFolder + "/scss/**/*.scss",
		js: sourceFolder + "/js/**/*.js",
		img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
	},
	clean: [projectFolder + "/css", projectFolder + "/js", projectFolder + "/fonts"]
};

// ПЛАГИНЫ
let { src, dest } = require("gulp"),
	gulp = require("gulp"),
	browsersync = require("browser-sync").create(),
	fileinclude = require("gulp-file-include"),
	concat = require("gulp-concat"),
	del = require("del"),
	scss = require("gulp-sass"),
	autoprefixer = require("gulp-autoprefixer"),
	groupmedia = require("gulp-group-css-media-queries"),
	cleancss = require("gulp-clean-css"),
	gulprename = require("gulp-rename"),
	imagemin = require("gulp-imagemin"),
	webp = require("gulp-webp"),
	webphtml = require("gulp-webp-html"),
	uglify = require("gulp-uglify-es").default;

// 
// ОСНОВНЫЕ ФУНКЦИИ
// 

function browserSync(params) {
	browsersync.init({
		server: {
			baseDir: "./" + projectFolder + "/",
		},
		port: 3000,
		notify: false,
	});
}

// HTML
function html() {
	return src(path.src.html)
		.pipe(fileinclude())
		.pipe(webphtml())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream());
}

// CSS
function css() {
	return src(path.src.css)
		.pipe(
			scss({
				outputStyle: "expanded",
			})
		)
		.pipe(groupmedia())
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 5 versions"],
				cascade: true,
				grid: true
			})
		)
		.pipe(dest(path.build.css))
		.pipe(cleancss())
		.pipe(
			gulprename({
				extname: ".min.css",
			})
		)
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream());
}

// FONTS
function fonts() {
	return src(path.src.fonts)
		.pipe(dest(path.build.fonts))
}

// JS
function js() {
	return src([
		"node_modules/jquery/dist/jquery.js",
		path.src.js,
		"node_modules/slick-carousel/slick/slick.js",
		"node_modules/mixitup/dist/mixitup.js",
		"node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js"
	])
		.pipe(concat("script.js"))
		.pipe(fileinclude())
		.pipe(dest(path.build.js))
		.pipe(uglify())
		.pipe(
			gulprename({
				extname: ".min.js",
			})
		)
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream());
}

// КАРТИНКИ
// COMPRESS + WEBP
// RECOMMEND ONLY ONCE PER-PROJECT DUE TO LONG MINIMAZING TIME, CAPICE?
function img() {
	return src(path.src.img)
		.pipe(
			imagemin([
				imagemin.gifsicle({ interlaced: true }),
				imagemin.mozjpeg({ quality: 75, progressive: true }),
				imagemin.optipng({ optimizationLevel: 5 }),
				imagemin.svgo({
					plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
				}),
			])
		)
		.pipe(dest(path.build.img))
		.pipe(webp())
		.pipe(dest(path.build.img));
}

// ВАРИАНТ 2
// function images() {
//   return src(path.src.img)
//     .pipe(
//       webp({
//         quality: 70,
//       })
//     )
//     .pipe(dest(path.build.img))
//     .pipe(src(path.src.img))
//     .pipe(
//       imagemin({
//         progressive: true,
//         svgoPlugins: [{ removeViewBox: false }],
//         interlaced: true,
//         optimizationLevel: 3,
//       })
//     )
//     .pipe(fileinclude())
//     .pipe(dest(path.build.img))
//     .pipe(browsersync.stream());
// }

// НАБЛЮДЕНИЕ ЗА ФАЙЛАМИ В РЕАЛТАЙМЕ
function watchFiles(params) {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
}

//ОЧИСТКА ЧИСТОВИКА ОТ НЕНУЖНЫХ ФАЙЛОВ
function clean(params) {
	return del(path.clean);
}

// ДАННЫЕ ДЛЯ ГУЛЬПА
let build = gulp.series(clean, gulp.parallel(js, fonts, css, html));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.img = img;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
