const OpenedClosed = require("../lib/main");

const store = new OpenedClosed({
	timezone: "GMT+0100",
	openings: {
		monday: [
			{ start: "10:00", end: "13:00" },
			{ start: "15:00", end: "18:00" },
		],
	},
});

if (store.opened()) {
	console.log("closes in", store.closeIn());
} else {
	console.log(store.availability());
}
