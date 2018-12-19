const gulp = require("gulp");
const typescript = require("gulp-typescript");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify-es").default;
const tap = require("gulp-tap");
const browserify = require("gulp-browserify");
const bro = require("gulp-bro");
const umd = require("gulp-umd");
const babel = require("gulp-babel");

const ts = function() {
	return gulp
		.src("src/**/*.ts")
		.pipe(typescript())
		.pipe(gulp.dest("lib"));
};

const watch = function() {
	return gulp.watch("src/**/*.ts", gulp.parallel("ts"));
};

const prod = function() {
	return gulp
		.src("src/**/*.ts")
		.pipe(typescript())
		.pipe(
			rename({
				basename: "opened-closed"
			})
		)
		.pipe(gulp.dest("dist"))
		.pipe(uglify())
		.pipe(
			rename({
				basename: "opened-closed",
				suffix: ".min"
			})
		)
		.pipe(gulp.dest("dist"));
};

module.exports = { ts, watch, prod };
