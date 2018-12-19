const OpenedClosed = require("../lib/main");

const store = new OpenedClosed({
	timezone: "GMT+0100",
	openings: {
		monday: [
			{ start: "22:00:00", end: "23:59:59" },
			{ start: "15:00:00", end: "17:59:59" }
		]
	}
});

console.log(store._now()); // true or false
