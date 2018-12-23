const expect = require("chai").expect;
const OpenedClosed = require("../../lib/main");

const options = {
	timezone: "GMT+0100"
};

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

describe("private functions", function() {
	const options = {
		timezone: "GMT+0100",
		openings: {
			monday: [{ start: "10:00", end: "13:00" }]
		}
	};

	describe("this.options.language", function() {
		it("should fill language in english if there is no language", function() {
			const instance = new OpenedClosed(options);

			expect(instance.options.language).to.be.deep.equal({
				opened: "opened",
				closed: "closed"
			});
		});

		it("should fill opened in french if there is the french counterpart", function() {
			const instance = new OpenedClosed({
				timezone: "GMT+0100",
				openings: {
					monday: [{ start: "10:00", end: "13:00" }]
				},
				language: {
					opened: "ouvert"
				}
			});

			expect(instance.options.language).to.be.deep.equal({
				opened: "ouvert",
				closed: "closed"
			});
		});

		it("should fill closed in french if there is the french counterpart", function() {
			const instance = new OpenedClosed({
				timezone: "GMT+0100",
				openings: {
					monday: [{ start: "10:00", end: "13:00" }]
				},
				language: {
					closed: "fermé"
				}
			});

			expect(instance.options.language).to.be.deep.equal({
				opened: "opened",
				closed: "fermé"
			});
		});

		it("should fill language in french if there is the french language", function() {
			const instance = new OpenedClosed({
				timezone: "GMT+0100",
				openings: {
					monday: [{ start: "10:00", end: "13:00" }]
				},
				language: {
					opened: "ouvert",
					closed: "fermé"
				}
			});

			expect(instance.options.language).to.be.deep.equal({
				opened: "ouvert",
				closed: "fermé"
			});
		});
	});

	describe("this._dayNumberFromString", function() {
		it("should throw an Error if the day is not supported", function() {
			const instance = new OpenedClosed(options);

			expect(function() {
				instance._dayNumberFromString("foo");
			}).to.throw(OpenedClosed.ERR_UNSUPPORTED_DAY);
		});

		const correspondences = [
			{ day: "sunday", expected: 0 },
			{ day: "monday", expected: 1 },
			{ day: "tuesday", expected: 2 },
			{ day: "wednesday", expected: 3 },
			{ day: "thursday", expected: 4 },
			{ day: "friday", expected: 5 },
			{ day: "saturday", expected: 6 }
		];

		for (const correspondence of correspondences) {
			const day = correspondence.day;
			const expected = correspondence.expected;

			it(`should return ${expected} if day is ${day}`, function() {
				const instance = new OpenedClosed(options);

				expect(instance._dayNumberFromString(day)).to.be.equal(
					expected
				);
			});
		}
	});

	describe("this._now", function() {
		it("should return the exact day as now", function() {
			const instance = new OpenedClosed(options);

			expect(instance._now().toISOString()).to.be.equal(
				new Date().toISOString()
			);
		});
	});

	describe("this._currentYear", function() {
		it("should return the correct current year", function() {
			const instance = new OpenedClosed(options);

			expect(instance._currentYear()).to.be.equal(
				new Date().getFullYear()
			);
		});
	});

	describe("this._currentMonth", function() {
		it("should return the correct current month", function() {
			const instance = new OpenedClosed(options);

			expect(instance._currentMonth()).to.be.equal(
				new Date().getMonth() + 1
			);
		});
	});

	describe("this._currentDay", function() {
		it("should return the correct current day", function() {
			const instance = new OpenedClosed(options);

			expect(instance._currentDay()).to.be.equal(new Date().getDate());
		});
	});

	describe("this._currentDate", function() {
		it("should return the correct current date", function() {
			const timezone = "GMT+0100";

			const instance = new OpenedClosed({
				timezone: timezone
			});

			const year = instance._currentYear();
			const month = instance._currentMonth();
			const day = instance._currentDay();
			const time = "11:00";

			const dateNow = new Date();
			const yearNow = dateNow.getFullYear();
			const monthNow = dateNow.getMonth() + 1;
			const dayNow = dateNow.getDate();

			expect(
				instance._currentDate({
					year: year,
					month: month,
					day: day,
					time: time
				})
			).to.be.equal(
				`${yearNow}-${monthNow}-${dayNow} ${time} ${timezone}`
			);
		});
	});

	describe("_dateToEpoch", function() {
		const samples = [
			{ type: "null", value: null },
			{ type: "undefined", value: undefined },
			{ type: "string", value: "hello world" },
			{ type: "empty string", value: "" },
			{ type: "integer", value: 42 },
			{ type: "float", value: 3.14 },
			{ type: "array", value: [1, 2, 3] },
			{ type: "empty array", value: [] },
			{ type: "object", value: { type: "GET", async: true } },
			{ type: "empty object", value: {} },
			{ type: "regular expression", value: new RegExp("[a-z]+") },
			{ type: "empty regular expression", value: new RegExp() },
			{ type: "date string", value: "2018-01-01 20:42:00" }
		];

		for (const sample of samples) {
			it(`should throw an Error if the date is not a Date but a ${
				sample.type
			}`, function() {
				const instance = new OpenedClosed(options);

				expect(function() {
					instance._dateToEpoch(sample.value);
				}).to.throw(OpenedClosed.ERR_DATE_INVALID);
			});
		}

		it("should not throw an Error if the date is a date", function() {
			const instance = new OpenedClosed(options);

			expect(function() {
				instance._dateToEpoch(new Date());
			}).to.not.throw(OpenedClosed.ERR_INTERNAL_DATE_INVALID);
		});

		// it('should throw an Error if the date is not ...')

		it("should return 0 if the date is the 1 janauary, 1970 00:00:00", function() {
			const instance = new OpenedClosed(options);

			expect(
				instance._dateToEpoch(new Date("1970-01-01 00:00:00 GMT+0000"))
			).to.be.equal(0);
		});

		it("should return the correct timestamp for a given date", function() {
			const instance = new OpenedClosed(options);

			expect(
				instance._dateToEpoch(new Date("2018-12-20 20:29:06 GMT+0000"))
			).to.be.equal(1545337746);
		});
	});

	describe("_datesDifferenceToEpoch", function() {
		it("should return 3600 seconds for two dates separated by 1 hour", function() {
			const instance = new OpenedClosed(options);

			const dateStart = new Date("2018-01-01 00:00:00 GMT+0100");
			const dateEnd = new Date("2018-01-01 01:00:00 GMT+0100");

			expect(
				instance._datesDifferenceToEpoch(dateStart, dateEnd)
			).to.be.equal(3600);
		});

		it("should return 0 seconds for two exact same dates", function() {
			const instance = new OpenedClosed(options);

			const dateStart = new Date("2018-01-01 00:00:00 GMT+0100");
			const dateEnd = dateStart;

			expect(
				instance._datesDifferenceToEpoch(dateStart, dateEnd)
			).to.be.equal(0);
		});
	});

	describe("_max", function() {
		const samples = [
			{ type: "null", value: null },
			{ type: "undefined", value: undefined },
			{ type: "string", value: "hello world" },
			{ type: "empty string", value: "" },
			{ type: "integer", value: 42 },
			{ type: "float", value: 3.14 },
			{ type: "object", value: { type: "GET", async: true } },
			{ type: "empty object", value: {} },
			{ type: "regular expression", value: new RegExp("[a-z]+") },
			{ type: "empty regular expression", value: new RegExp() },
			{ type: "date", value: new Date() }
		];

		for (const sample of samples) {
			it(`should throw an Error if the parameter is not an array but a ${
				sample.type
			}`, function() {
				const instance = new OpenedClosed(options);

				expect(function() {
					instance._max(sample.value);
				}).to.throw(OpenedClosed.ERR_INTERNAL_NOT_ARRAY);
			});
		}

		it("should return 0 if the array is empty", function() {
			const instance = new OpenedClosed(options);

			expect(instance._max([])).to.be.equal(0);
		});

		it("should return 42 if the array is filled with number that sum to 42", function() {
			const instance = new OpenedClosed(options);

			expect(instance._max([1, 2, 4, 8, 16, 32, 42])).to.be.equal(42);
		});
	});

	describe("_nowIsTheDay", function() {
		it("should throw an Error if the day is not supported", function() {
			const instance = new OpenedClosed(options);

			expect(function() {
				instance._nowIsTheDay("foo");
			}).to.throw(OpenedClosed.ERR_UNSUPPORTED_DAY);
		});

		const days = [
			{ name: "monday", value: 1 },
			{ name: "tuesday", value: 2 },
			{ name: "wednesday", value: 3 },
			{ name: "thursday", value: 4 },
			{ name: "friday", value: 5 },
			{ name: "saturday", value: 6 },
			{ name: "sunday", value: 0 }
		];

		const store = new OpenedClosed(options);

		for (const day of days) {
			it(`should return true if today is ${day.name}`, function() {
				OpenedClosed.prototype._dayNow = function() {
					return day.value;
				};

				expect(store._nowIsTheDay(day.name)).to.be.true;
			});

			for (const badDay of days) {
				if (badDay.name !== day.name) {
					it(`should return false if today is ${day.name} and not ${
						badDay.name
					}`, function() {
						OpenedClosed.prototype._dayNow = function() {
							return day.value;
						};

						expect(store._nowIsTheDay(badDay.name)).to.be.false;
					});
				}
			}
		}
	});
});
