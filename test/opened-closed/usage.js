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

	it("should return that the store closes in 0 seconds if there is no matching time span", function() {
		OpenedClosed.prototype._now = function() {
			return new Date(`2018-12-17 10:00:00 GMT+0100`);
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

		expect(store.closeIn()).to.be.equal(0);
	});

	it("should return that the store closes in 3600 seconds (1h00) if there is a time span in one hour", function() {
		OpenedClosed.prototype._now = function() {
			return new Date(`2018-12-17 17:00:00 GMT+0100`);
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

		expect(store.closeIn()).to.be.equal(3600);
	});

	it("should return that the store closes in 3600 seconds (1h00) if there is a time span in one hour with jet lag", function() {
		OpenedClosed.prototype._now = function() {
			return new Date(`2018-12-17 11:00:00 GMT-0500`);
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

		expect(store.closeIn()).to.be.equal(3600);
	});

	describe("with no openings", function() {
		it("should return false if we check if the store is opened but there is no openings", function() {
			const store = new OpenedClosed({
				timezone: "GMT+0100"
			});

			expect(store.opened()).to.be.false;
		});

		it("should return that the store closes in 0 seconds if there is no openings", function() {
			const store = new OpenedClosed({
				timezone: "GMT+0100"
			});

			expect(store.closeIn()).to.be.equal(0);
		});

		it('should return "closed" if the store does not have any openings', function() {
			const store = new OpenedClosed({
				timezone: "GMT+0100"
			});

			expect(store.availability()).to.be.equal("closed");
		});

		it('should return the translation for "closed" if the store does not have any openings', function() {
			const translation = "fermé";
			const store = new OpenedClosed({
				timezone: "GMT+0100",
				language: {
					closed: translation
				}
			});

			expect(store.availability()).to.be.equal(translation);
		});
	});

	describe("inclusives dates", function() {
		it("should return true if now is monday 10:00 AM and the store opens monday at 10:00 AM", function() {
			OpenedClosed.prototype._now = function() {
				return new Date(`2018-12-17 10:00:00 GMT+0100`);
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
					monday: [
						{ start: "10:00", end: "13:00" },
						{ start: "15:00", end: "18:00" }
					]
				}
			});

			expect(store.opened()).to.be.true;
		});

		it("should return true if now is monday 4:00 AM (New York) and the store opens monday at 10:00 AM (France)", function() {
			OpenedClosed.prototype._now = function() {
				return new Date(`2018-12-17 04:00:00 GMT-0500`);
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
					monday: [
						{ start: "10:00", end: "13:00" },
						{ start: "15:00", end: "18:00" }
					]
				}
			});

			expect(store.opened()).to.be.true;
		});

		it("should return true if now is monday 1:00 PM and the store closes monday at 1:00 PM", function() {
			OpenedClosed.prototype._now = function() {
				return new Date(`2018-12-17 13:00:00 GMT+0100`);
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
					monday: [
						{ start: "10:00", end: "13:00" },
						{ start: "15:00", end: "18:00" }
					]
				}
			});

			expect(store.opened()).to.be.true;
		});

		it("should return true if now is monday 07:00 AM (New York) and the store closes monday at 1:00 PM (France)", function() {
			OpenedClosed.prototype._now = function() {
				return new Date(`2018-12-17 07:00:00 GMT-0500`);
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
					monday: [
						{ start: "10:00", end: "13:00" },
						{ start: "15:00", end: "18:00" }
					]
				}
			});

			expect(store.opened()).to.be.true;
		});
	});

	describe("closings dates", function() {
		it("should return false if we are dec 25 and there is an opening day but also a closing day on christmas", function() {
			OpenedClosed.prototype._now = function() {
				return new Date(`2018-12-25 10:00:00 GMT+0100`);
			};
			OpenedClosed.prototype._dayNow = function() {
				return 2; // tuesday
			};
			OpenedClosed.prototype._currentDay = function() {
				return 25;
			};

			const store = new OpenedClosed({
				timezone: "GMT+0100",
				openings: {
					monday: [{ start: "00:00", end: "23:59" }],
					tuesday: [{ start: "00:00", end: "23:59" }],
					wednesday: [{ start: "00:00", end: "23:59" }],
					thursday: [{ start: "00:00", end: "23:59" }],
					friday: [{ start: "00:00", end: "23:59" }],
					saturday: [{ start: "00:00", end: "23:59" }],
					sunday: [{ start: "00:00", end: "23:59" }]
				},
				closings: [
					{
						from: new Date("2018-12-25 00:00:00 GMT+0100"),
						to: new Date("2018-12-25 23:59:59 GMT+0100")
					}
				]
			});

			expect(store.opened()).to.be.false;
		});
	});

	describe("closings dates inclusives", function() {
		it("should return false if there is openings days that match but there is a closing date that matches also", function() {
			OpenedClosed.prototype._now = function() {
				return new Date(`2018-12-24 14:00:00 GMT+0100`);
			};
			OpenedClosed.prototype._dayNow = function() {
				return 1; // tuesday
			};
			OpenedClosed.prototype._currentDay = function() {
				return 24;
			};

			const store = new OpenedClosed({
				timezone: "GMT+0100",
				openings: {
					monday: [{ start: "00:00", end: "23:59" }],
					tuesday: [{ start: "00:00", end: "23:59" }],
					wednesday: [{ start: "00:00", end: "23:59" }],
					thursday: [{ start: "00:00", end: "23:59" }],
					friday: [{ start: "00:00", end: "23:59" }],
					saturday: [{ start: "00:00", end: "23:59" }],
					sunday: [{ start: "00:00", end: "23:59" }]
				},
				closings: [
					{
						from: new Date("2018-12-24 10:00:00 GMT+0100"),
						to: new Date("2018-12-24 14:00:00 GMT+0100")
					}
				]
			});

			expect(store.opened()).to.be.false;
		});
	});
});
