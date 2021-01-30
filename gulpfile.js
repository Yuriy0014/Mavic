const { src, dest, watch, parallel, series } = require('gulp');
// Здесь мы передаем всю мощь галпа ключевым словам, которые мы будем использовать для поиск элементов, для слежения за проектом и тд
const scss = require('gulp-sass');
// Передали всю мощь установленного плагина в команду-константу scss
const concat = require('gulp-concat');

const browserSync = require('browser-sync').create();
// Подключили, как это сказано делать в документашке

const uglify = require('gulp-uglify-es').default;

const autoprefixer = require('gulp-autoprefixer');

const imagemin = require('gulp-imagemin');

const del = require('del');

function browsersync() {
	browserSync.init({
		server: {
			baseDir: "app/"
		}
	});
};

function cleanDist() {
	return del('dist')
}

function images() {
	return src('app/images/**/*')
		.pipe(imagemin([
			imagemin.gifsicle({ interlaced: true }),
			imagemin.mozjpeg({ quality: 75, progressive: true }),
			imagemin.optipng({ optimizationLevel: 5 }),
			imagemin.svgo({
				plugins: [
					{ removeViewBox: true },
					{ cleanupIDs: false }
				]
			})
		]))
		.pipe(dest('dist/images'))
}

function scripts() {
	return src([
		'node_modules/jquery/dist/jquery.js',
		'node_modules/slick-carousel/slick/slick.js',
		'node_modules/magnific-popup/dist/jquery.magnific-popup.js',
		'app/js/main.js'
	])
		.pipe(concat('main.min.js'))  // Собрали все в 1 js файл и переименовали
		.pipe(uglify()) // Сжали
		.pipe(dest('app/js'))
		.pipe(browserSync.stream()); // Обновление сттраницы при изменении кода
}

function libs(){
	return src([
	  'node_modules/normalize.css/normalize.css',
	  'node_modules/slick-carousel/slick/slick.css',
	])
	  .pipe(concat('libs.scss'))
	  .pipe(dest('app/scss'))
	  .pipe(browserSync.stream());
  }

function styles() {
	return src('app/scss/style.scss')
		.pipe(scss({ outputStyle: 'compressed' }))
		.pipe(concat('style.min.css'))
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 10 versions'],
			grid: true
		}))
		.pipe(dest('app/css'))
		.pipe(browserSync.stream()); // Обновление сттраницы при изменении кода

		// Эта функция конвертирует SCSS в СSS
		// 1. Находим файл, который надо переконвертировать
		// 2. Закинули файл в "трубу" - вошел Scss -> вышел CSS
		// 3. Закинули в трубу с одним именем - получили с другим
		// 4. Снова закинули в pipe - получили на выходе в другой папке наш CSS файл
		// 5. Снова закинули в pipe - и когда файлик scss меняется, страничка браузера с ним обновляется
}

function build() {
	return src([
		'app/css/style.min.css',
		'app/fonts/**/*',
		'app/js/main.min.js',
		'app/*.html'
	], { base: 'app' })
		.pipe(dest('dist'))
	// Задаем  base чтобы сохранилась структура папок, в которой лежат файлики, а не просто скинулись все файлы в папку dist в одну большую кучу
}


function watching() {
	watch(['app/**/*.scss'], styles);
	watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
	// Следим за всеми файлами в папке и всех подпапках app/js/ кроме !app/js/main.min.js, потому что если следить за этим файлом, то будет замкнутый круг обновления страницы
	watch("app/*.html").on('change', browserSync.reload);
}

exports.styles = styles;
// Это код для вызова нашей функции
// Пример:
// I:\Projects\2021\Education\gulp-start>gulp styles
// [13:22:35] Using gulpfile I:\Projects\2021\Education\gulp-start\gulpfile.js
// [13:22:35] Starting 'styles'...
// [13:22:35] Finished 'styles' after 28 ms
exports.libs = libs;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;


exports.build = series(cleanDist, images, build);
exports.default = parallel(libs, styles, scripts, watching, browsersync);