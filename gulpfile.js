const gulp = require("gulp");
const typescript = require("gulp-typescript");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify-es").default;
const tap = require("gulp-tap");
const browserify = require("gulp-browserify");
const bro = require("gulp-bro");
const umd = require("gulp-umd");
const babel = require("gulp-babel");

const lib = function() {
	return gulp
		.src("src/main.ts")
		.pipe(typescript())
		.pipe(
			babel({
				presets: ["env"]
			})
		)
		.pipe(gulp.dest("lib"));
};

const dist = function() {
	return gulp
		.src("src/opened-closed.ts")
		.pipe(typescript())
		.pipe(
			babel({
				presets: ["env"]
			})
		)
		.pipe(
			rename({
				basename: "opened-closed"
			})
		)
		.pipe(gulp.dest("dist"))
		.pipe(uglify())
		.pipe(
			rename({
				suffix: ".min"
			})
		)
		.pipe(gulp.dest("dist"));
};

const watch = function() {
	return gulp.watch("src/main.ts", gulp.series("lib"));
};

const prod = async function() {
	return gulp.parallel("lib", "dist");
};

module.exports = { lib, dist, watch, prod };
