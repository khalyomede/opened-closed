import { src, dest, watch, series } from "gulp";
import typescript from "gulp-typescript";
import rename from "gulp-rename";
import uglify from "gulp-uglify-es";
import babel from "gulp-babel";

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
		.pipe(typescript())
		.pipe(
			babel({
				presets: ["env"],
			})
		)
		.pipe(
			rename({
				basename: "opened-closed",
			})
		)
		.pipe(dest("dist"))
		.pipe(uglify())
		.pipe(
			rename({
				suffix: ".min",
			})
		)
		.pipe(dest("dist"));

const start = () => watch("src/main.ts", series("lib"));

module.exports = { lib, dist, start };
