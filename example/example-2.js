const OpenedClosed = require("../lib/main");

const store = new OpenedClosed({
	timezone: "GMT+0100",
	openings: {
		monday: [
			{ start: "10:00", end: "13:00" },
			{ start: "15:00", end: "18:00" }
		],
		tuesday: [
			{ start: "10:00", end: "13:00" },
			{ start: "15:00", end: "18:00" }
		]
	},
	closings: [
		{
			reason: "Christmas", // optional
			from: new Date("2018-12-25 00:00:00 GMT+0100"),
			to: new Date("2018-12-25 23:59:59 GMT+0100")
		}
	]
});

console.log(store.opened()); // true or false
