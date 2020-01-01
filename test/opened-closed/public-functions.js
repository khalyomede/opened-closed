const expect = require("chai").expect;
const OpenedClosed = require("../../lib/main");

describe("public functions", function() {
	describe("constructor", function() {
		it(`should throw an Error if it is constructed without an object`, function() {
			expect(function() {
				new OpenedClosed(42);
			}).to.throw("expected parameter 1 to be an object");
		});

		it("should throw an Error if the options is empty", function() {
			expect(function() {
				new OpenedClosed({});
			}).to.throw("options is empty");
		});

		it("should throw an Error if the options is missing the timezone", function() {
			expect(function() {
				new OpenedClosed({
					openings: {
						monday: [{ start: "10:00", end: "13:00" }],
					},
				});
			}).to.throw("options is missing timezone");
		});

		it(`should throw an Error if it is constructed with an option language that is not an object`, function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					language: 42,
				});
			}).to.throw("language options should be an object");
		});

		it(`should throw an Error if it is constructed with an opened language that is not a string`, function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					language: {
						opened: 42,
					},
				});
			}).to.throw("opened language is string");
		});

		it("should throw an Error if it is constructed with an empty opened language", function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					language: {
						opened: "",
					},
				});
			}).to.throw("opened language is empty");
		});

		it(`should throw an Error if it is constructed with an closed language that is not a string`, function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					language: {
						closed: 42,
					},
				});
			}).to.throw("closed language is string");
		});

		it("should throw an Error if it is constructed with an empty closed language", function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					language: {
						closed: "",
					},
				});
			}).to.throw("closed language is empty");
		});

		it("should not throw an exception if the objects have all required keys (but not the optional ones)", function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					closings: [
						{
							from: new Date("2018-01-01"),
							to: new Date("2018-01-07"),
						},
					],
				});
			}).to.not.throw(Error);
		});
	});

	describe("openings", function() {
		it("should not throw an Error if the openings is an empty object", function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					openings: {},
				});
			}).to.not.throw(Error);
		});

		it("should not throw an Error if the openings is not defined", function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
				});
			}).to.not.throw(Error);
		});

		it("should not throw an Erorr if the openings is correctly formed", function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					openings: {
						monday: [{ start: "10:00", end: "13:00" }],
					},
				});
			}).to.not.throw(Error);
		});

		it("should not throw an Error if one of the openings have an empty array on one day", function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					openings: {
						monday: [],
						tuesday: [{ start: "10:00", end: "13:00" }],
					},
				});
			}).to.not.throw(Error);
		});

		it(`should throw an Error if the openings is not an object`, function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					openings: 42,
				});
			}).to.throw("malformed openings data");
		});

		it(`should throw an Error if the openings keys is not an Array`, function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					openings: {
						monday: 42,
					},
				});
			}).to.throw("malformed openings data");
		});

		it(`should throw an Error if one of the openings keys is not an Object`, function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					openings: {
						monday: [42],
					},
				});
			}).to.throw("malformed openings data");
		});

		it("should throw an Error if one of the openings does not have start key", function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					openings: {
						monday: [{ end: "13:00" }],
					},
				});
			}).to.throw("malformed openings data");
		});

		it("should throw an Error if one of the openings does not have end key", function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					openings: {
						monday: [{ start: "10:00" }],
					},
				});
			}).to.throw("malformed openings data");
		});

		it(`should throw an Error if one of the openings has a key start that is not a string`, function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					openings: {
						monday: [{ start: 42, end: "13:00" }],
					},
				});
			}).to.throw("the time should be a string");
		});

		it(`should throw an Error if one of the openings has a key end that is not a string`, function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					openings: {
						monday: [{ start: "11:00", end: 42 }],
					},
				});
			}).to.throw("the time should be a string");
		});

		it("should throw an Error if one of the openings has a key start not a valid time", function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					openings: {
						monday: [{ start: "foo", end: "13:00" }],
					},
				});
			}).to.throw("the time is not valid");
		});

		it("should throw an Error if one of the openings has a key end not a valid time", function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					openings: {
						monday: [{ start: "10:00", end: "foo" }],
					},
				});
			}).to.throw("the time is not valid");
		});
	});

	describe("closeAt", function() {
		it("should return now if the store does not have any openings", function() {
			const now = new Date();
			const store = new OpenedClosed({
				timezone: "GMT+0100",
			});
			const expected = parseInt(now.getTime() / 1000);
			const actual = parseInt(store.closeAt().getTime() / 1000);

			expect(actual).to.be.equal(expected);
		});

		it("should return now if there is openings, but no openings matches now", function() {
			OpenedClosed.prototype._now = function() {
				return new Date(`2018-12-17 11:00:00 GMT-0500`);
			};
			OpenedClosed.prototype._dayNow = function() {
				return 1; // monday
			};
			OpenedClosed.prototype._currentDay = function() {
				return 17;
			};

			const now = new Date();
			const store = new OpenedClosed({
				timezone: "GMT+0100",
				openings: {
					monday: [
						{ start: "09:00", end: "10:00" },
						{ start: "12:00", end: "13:00" },
					],
				},
			});

			const expected = parseInt(now.getTime() / 1000);
			const actual = parseInt(store.closeAt().getTime() / 1000);

			expect(actual).to.be.equal(expected);
		});

		it("should return now if there is openings that match now, but there is a closing that override it", function() {
			OpenedClosed.prototype._now = function() {
				return new Date(`2018-12-17 11:00:00 GMT-0500`);
			};
			OpenedClosed.prototype._dayNow = function() {
				return 1; // monday
			};
			OpenedClosed.prototype._currentDay = function() {
				return 17;
			};

			const now = new Date();
			const store = new OpenedClosed({
				timezone: "GMT+0100",
				openings: {
					monday: [{ start: "10:00", end: "13:00" }],
				},
				closings: [
					{
						reason: "Exceptional",
						from: new Date("2018-12-17 00:00:00 GMT+0100"),
						to: new Date("2018-12-17 23:59:59 GMT+0100"),
					},
				],
			});
			const expected = parseInt(now.getTime() / 1000);
			const actual = parseInt(store.closeAt().getTime() / 1000);

			expect(actual).to.be.equal(expected);
		});

		it("should return the next closing date if there is openings that match now", function() {
			const now = new Date();

			OpenedClosed.prototype._now = function() {
				return new Date(
					`${now.getFullYear()}-${now.getMonth() +
						1}-${now.getDate()} 11:00:00 GMT-0500`
				);
			};
			OpenedClosed.prototype._dayNow = function() {
				return now.getDay(); // monday
			};
			OpenedClosed.prototype._currentDay = function() {
				return now.getDate();
			};

			const closingDate = new Date(
				`${now.getFullYear()}-${now.getMonth() +
					1}-${now.getDate()} 23:59:59 GMT+0100`
			);
			const store = new OpenedClosed({
				timezone: "GMT+0100",
				openings: {
					monday: [{ start: "00:00", end: "23:59:59" }],
					tuesday: [{ start: "00:00", end: "23:59:59" }],
					wednesday: [{ start: "00:00", end: "23:59:59" }],
					thursday: [{ start: "00:00", end: "23:59:59" }],
					friday: [{ start: "00:00", end: "23:59:59" }],
					saturday: [{ start: "00:00", end: "23:59:59" }],
					sunday: [{ start: "00:00", end: "23:59:59" }],
				},
			});
			const expected = parseInt(closingDate.getTime() / 1000);
			const actual = parseInt(store.closeAt().getTime() / 1000);

			expect(actual).to.be.equal(expected);
		});
	});
});
