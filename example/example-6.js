const OpenedClosed = require("../lib/main");

const store = new OpenedClosed({
	timezone: "GMT+0100",
	openings: {
		wednesday: [{ start: "10:00", end: "19:00" }]
	}
});

if (store.opened()) {
	const closeAt = store.closeAt().toLocaleString(); // Maybe GMT+01 is not yours, so LocalString take care of it.

	console.log("will close at", closeAt);
} else {
	console.log(store.availability()); // "closed"
}
