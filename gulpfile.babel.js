import { src, dest, watch, series } from "gulp";
import typescript from "gulp-typescript";
import rename from "gulp-rename";
import babel from "gulp-babel";
import browserify from "gulp-bro";

const lib = () =>
	src("src/main.ts")
		.pipe(typescript())
		.pipe(
			babel({
				presets: ["env"],
			})
		)
		.pipe(dest("lib"));

const dist = () =>
	src("src/opened-closed.ts")
		.pipe(
			browserify({
				transform: ["babelify"],
				plugin: ["tsify"],
			})
		)
		.pipe(
			rename({
				extname: ".js",
			})
		)
		.pipe(dest("dist"));

const distMin = () =>
	src("src/opened-closed.ts")
		.pipe(
			browserify({
				transform: ["babelify"],
				plugin: ["tsify", "tinyify"],
			})
		)
		.pipe(
			rename({
				suffix: ".min",
				extname: ".js",
			})
		)
		.pipe(dest("dist"));

const start = () => watch("src/main.ts", series("lib"));
const build = series(lib, dist, distMin);

module.exports = { lib, dist, distMin, build };
