const expect = require("chai").expect;
const OpenedClosed = require("../../lib/main");

const _now = OpenedClosed.prototype._now;
const _dayNow = OpenedClosed.prototype._dayNow;
const _currentDay = OpenedClosed.prototype._currentDay;

function resetPrototypes() {
	OpenedClosed.prototype._now = _now;
	OpenedClosed.prototype._dayNow = _dayNow;
	OpenedClosed.prototype._currentDay = _currentDay;
}

beforeEach(function() {
	resetPrototypes();
});

describe("usage", function() {
	// 22:00 - 00:40 not possible, because end is 23:59
	it("should return true if we are monday 11:00 and this is opened monday from 10:00 to 13:00", function() {
		OpenedClosed.prototype._now = function() {
			return new Date(`2018-12-17 11:00:00 GMT+0100`);
		};
		OpenedClosed.prototype._dayNow = function() {
			return 1; // monday
		};
		OpenedClosed.prototype._currentDay = function() {
			return 17;
		};

		const store = new OpenedClosed({
			timezone: "GMT+0100",
			openings: {
				monday: [{ start: "10:00", end: "13:00" }]
			}
		});

		expect(store.opened()).to.be.equal(true);
	});

	it("should return opened if we are monday, 11:00 and this is opened monday from 10:00 to 13:00", function() {
		OpenedClosed.prototype._now = function() {
			return new Date(`2018-12-17 11:00:00 GMT+0100`);
		};
		OpenedClosed.prototype._dayNow = function() {
			return 1; // monday
		};
		OpenedClosed.prototype._currentDay = function() {
			return 17;
		};

		const store = new OpenedClosed({
			timezone: "GMT+0100",
			openings: {
				monday: [{ start: "10:00", end: "13:00" }]
			}
		});

		expect(store.availability()).to.be.equal("opened");
	});

	it("should return false if we are monday, 15:00 and this is opened monday from 10:00 to 13:00", function() {
		OpenedClosed.prototype._now = function() {
			return new Date(`2018-12-17 15:00:00 GMT+0100`);
		};

		const store = new OpenedClosed({
			timezone: "GMT+0100",
			openings: {
				monday: [{ start: "10:00", end: "13:00" }]
			}
		});

		expect(store.opened()).to.be.equal(false);
	});

	it("should return closed if we are monday, 15:00 and this is opened monday from 10:00 to 13:00", function() {
		OpenedClosed.prototype._now = function() {
			return new Date(`2018-12-17 15:00:00 GMT+0100`);
		};

		const store = new OpenedClosed({
			timezone: "GMT+0100",
			openings: {
				monday: [{ start: "10:00", end: "13:00" }]
			}
		});

		expect(store.availability()).to.be.equal("closed");
	});

	it("should return true if we are monday, 15:00, and this is opened monday from 15:00 to 18:00", function() {
		OpenedClosed.prototype._now = function() {
			return new Date(`2018-12-17 15:00:00 GMT+0100`);
		};
		OpenedClosed.prototype._dayNow = function() {
			return 1; // monday
		};
		OpenedClosed.prototype._currentDay = function() {
			return 17;
		};

		const store = new OpenedClosed({
			timezone: "GMT+0100",
			openings: {
				monday: [{ start: "15:00", end: "18:00" }]
			}
		});

		expect(store.opened()).to.be.equal(true);
	});

	it("should return opened if we are monday, 15:00, and this is opened monday from 15:00 to 18:00", function() {
		OpenedClosed.prototype._now = function() {
			return new Date(`2018-12-17 15:00:00 GMT+0100`);
		};
		OpenedClosed.prototype._dayNow = function() {
			return 1; // monday
		};
		OpenedClosed.prototype._currentDay = function() {
			return 17;
		};

		const store = new OpenedClosed({
			timezone: "GMT+0100",
			openings: {
				monday: [{ start: "15:00", end: "18:00" }]
			}
		});

		expect(store.availability()).to.be.equal("opened");
	});

	it("should return true if we are monday, 10:00 at GMT-0500 and this is opened monday from 15:00 (GMT+0000) to 18:00", function() {
		OpenedClosed.prototype._now = function() {
			return new Date(`2018-12-17 10:00:00 GMT-0500`);
		};
		OpenedClosed.prototype._dayNow = function() {
			return 1; // monday
		};
		OpenedClosed.prototype._currentDay = function() {
			return 17;
		};

		const store = new OpenedClosed({
			timezone: "GMT+0000",
			openings: {
				monday: [{ start: "15:00", end: "18:00" }]
			}
		});

		expect(store.opened()).to.be.equal(true);
	});

	it("should return opened if we are monday, 10:00 at GMT-0500 and this is opened monday from 15:00 (GMT+0000) to 18:00", function() {
		OpenedClosed.prototype._now = function() {
			return new Date(`2018-12-17 10:00:00 GMT-0500`);
		};
		OpenedClosed.prototype._dayNow = function() {
			return 1; // monday
		};
		OpenedClosed.prototype._currentDay = function() {
			return 17;
		};

		const store = new OpenedClosed({
			timezone: "GMT+0000",
			openings: {
				monday: [{ start: "15:00", end: "18:00" }]
			}
		});

		expect(store.availability()).to.be.equal("opened");
	});

	it("should return false if we are monday, 10:00 at GMT-0500 and this is opened monday from 15:00 (GMT-0100) to 18:00", function() {
		OpenedClosed.prototype._now = function() {
			return new Date(`2018-12-17 10:00:00 GMT-0500`);
		};
		OpenedClosed.prototype._dayNow = function() {
			return 1; // monday
		};
		OpenedClosed.prototype._currentDay = function() {
			return 17;
		};

		const store = new OpenedClosed({
			timezone: "GMT-0100",
			openings: {
				monday: [{ start: "15:00", end: "18:00" }]
			}
		});

		expect(store.opened()).to.be.equal(false);
	});

	it("should return closed if we are monday, 10:00 at GMT-0500 and this is opened monday from 15:00 (GMT-0100) to 18:00", function() {
		OpenedClosed.prototype._now = function() {
			return new Date(`2018-12-17 10:00:00 GMT-0500`);
		};
		OpenedClosed.prototype._dayNow = function() {
			return 1; // monday
		};
		OpenedClosed.prototype._currentDay = function() {
			return 17;
		};

		const store = new OpenedClosed({
			timezone: "GMT-0100",
			openings: {
				monday: [{ start: "15:00", end: "18:00" }]
			}
		});

		expect(store.availability()).to.be.equal("closed");
	});
});
