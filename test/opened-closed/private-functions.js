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
			}).to.throw("unsupported day");
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

	describe("this._dateToEpoch", function() {
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
				}).to.throw("internal error: invalid date");
			});
		}

		it("should not throw an Error if the date is a date", function() {
			const instance = new OpenedClosed(options);

			expect(function() {
				instance._dateToEpoch(new Date());
			}).to.not.throw("internal error: invalid date");
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

	describe("this._datesDifferenceToEpoch", function() {
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

	describe("this._max", function() {
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
				}).to.throw("internal error: invalid array");
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

	describe("this._nowIsTheDay", function() {
		it("should throw an Error if the day is not supported", function() {
			const instance = new OpenedClosed(options);

			expect(function() {
				instance._nowIsTheDay("foo");
			}).to.throw("unsupported day");
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

	describe("this._dateBetween", function() {
		it("should return true if a date is between a date span", function() {
			const instance = new OpenedClosed(options);

			const date = new Date("2018-01-01");
			const lowerDate = new Date("2017-12-31");
			const greaterDate = new Date("2018-01-02");

			expect(instance._dateBetween(date, lowerDate, greaterDate)).to.be
				.true;
		});

		it("should return true even if the start date is equal to the date we test", function() {
			const instance = new OpenedClosed(options);

			const date = new Date("2018-01-01");
			const lowerDate = new Date("2018-01-01");
			const greaterDate = new Date("2018-01-02");

			expect(instance._dateBetween(date, lowerDate, greaterDate)).to.be
				.true;
		});

		it("should return true even if the end date is equal to the date we test", function() {
			const instance = new OpenedClosed(options);

			const date = new Date("2018-01-01");
			const lowerDate = new Date("2017-12-31");
			const greaterDate = new Date("2018-01-01");

			expect(instance._dateBetween(date, lowerDate, greaterDate)).to.be
				.true;
		});

		it("should return false if the date is not between the dates", function() {
			const instance = new OpenedClosed(options);

			const date = new Date("2018-01-01");
			const lowerDate = new Date("2018-01-2");
			const greaterDate = new Date("2018-01-03");

			expect(instance._dateBetween(date, lowerDate, greaterDate)).to.be
				.false;
		});

		it("should throw an Error if the date we test is not a Date", function() {
			expect(function() {
				const instance = new OpenedClosed(options);

				instance._dateBetween("", new Date(), new Date());
			}).to.throw("internal error: invalid date");
		});

		it("should throw an Error if the start date is not a Date", function() {
			expect(function() {
				const instance = new OpenedClosed(options);

				instance._dateBetween(new Date(), "", new Date());
			}).to.throw("internal error: invalid date");
		});

		it("should throw an Error if the end date is not a Date", function() {
			expect(function() {
				const instance = new OpenedClosed(options);

				instance._dateBetween(new Date(), new Date(), "");
			}).to.throw("internal error: invalid date");
		});

		it("should throw an Error if the start date is greater than the end date", function() {
			expect(function() {
				const instance = new OpenedClosed(options);

				instance._dateBetween(
					new Date(),
					new Date("2018-01-01"),
					new Date("2017-01-01")
				);
			}).to.throw("internal error: reverted dates");
		});
	});

	describe("this._nowIsClosed", function() {
		it("should return true if there is no openings", function() {
			const store = new OpenedClosed({
				timezone: "GMT+0100"
			});

			expect(store._nowIsClosed()).to.be.true;
		});

		it("should return true if there is no openings and there is closings", function() {
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
				closings: [
					{
						from: new Date("2018-12-17 00:00:00 GMT+0100"),
						to: new Date("2018-12-17 23:59:59 GMT+0100")
					}
				]
			});

			expect(store._nowIsClosed()).to.be.true;
		});

		it("should return true if we are monday 11:00 AM and the store is opened, but this monday is marked as closed", function() {
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
					monday: [
						{ start: "10:00", end: "13:00" },
						{ start: "15:00", end: "18:00" }
					]
				},
				closings: [
					{
						from: new Date("2018-12-17 00:00:00 GMT+0100"),
						to: new Date("2018-12-17 23:59:59 GMT+0100")
					}
				]
			});

			expect(store._nowIsClosed()).to.be.true;
		});

		it("should return false if there is openings and today match one of the openings", function() {
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
					monday: [
						{ start: "10:00", end: "13:00" },
						{ start: "15:00", end: "18:00" }
					]
				}
			});

			expect(store._nowIsClosed()).to.be.false;
		});

		it("should return false if there is openings, closings the same day (but not the same period), but today match the openings", function() {
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
					monday: [
						{ start: "10:00", end: "13:00" },
						{ start: "15:00", end: "18:00" }
					]
				},
				closings: [
					{
						from: new Date("2018-12-17 00:00:00 GMT+0100"),
						to: new Date("2018-12-17 06:00:00 GMT+0100")
					}
				]
			});

			expect(store._nowIsClosed()).to.be.false;
		});

		describe("closings date inclusives", function() {
			it("should return true if now matches the begining of a closing that matches", function() {
				OpenedClosed.prototype._now = function() {
					return new Date(`2018-12-17 00:00:00 GMT+0100`);
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
					},
					closings: [
						{
							from: new Date("2018-12-17 00:00:00 GMT+0100"),
							to: new Date("2018-12-17 23:59:59 GMT+0100")
						}
					]
				});

				expect(store._nowIsClosed()).to.be.true;
			});
			it("should return true if now matches the end of a closing that matches", function() {
				OpenedClosed.prototype._now = function() {
					return new Date(`2018-12-17 23:59:59 GMT+0100`);
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
					},
					closings: [
						{
							from: new Date("2018-12-17 00:00:00 GMT+0100"),
							to: new Date("2018-12-17 23:59:59 GMT+0100")
						}
					]
				});

				expect(store._nowIsClosed()).to.be.true;
			});
		});
	});

	describe("this._hasOpenings", function() {
		it("should return true if there is openings", function() {
			const store = new OpenedClosed({
				timezone: "GMT+0100",
				openings: {
					monday: [{ start: "10:00", end: "13:00" }]
				}
			});

			expect(store._hasOpenings()).to.be.true;
		});

		it("should return false if there is no openings", function() {
			const store = new OpenedClosed({
				timezone: "GMT+0100"
			});

			expect(store._hasOpenings()).to.be.false;
		});

		it("should return false if there is an empty openings object", function() {
			const store = new OpenedClosed({
				timezone: "GMT+0100",
				openings: {}
			});

			expect(store._hasOpenings()).to.be.false;
		});
	});

	describe("this._getDateFromString", function() {
		it("should return the correct date from a time", function() {
			const store = new OpenedClosed({
				timezone: "GMT+0100"
			});

			OpenedClosed.prototype._currentYear = function() {
				return "2018";
			};
			OpenedClosed.prototype._currentMonth = function() {
				return "12";
			};
			OpenedClosed.prototype._currentDay = function() {
				return "17";
			};

			const time = "11:00";
			const expected = new Date("2018-12-17 " + time + " GMT+0100");
			const actual = store._getDateFromString(time);

			expect(actual.getTime()).to.equal(expected.getTime());
		});

		const samples = [
			{ type: "null", value: null },
			{ type: "undefined", value: undefined },
			{ type: "an integer", value: 42 },
			{ type: "a float", value: 3.14 },
			{ type: "an array", value: [1, 2, 3] },
			{ type: "an empty array", value: [] },
			{ type: "an object", value: { type: "GET", async: true } },
			{ type: "an empty object", value: {} },
			{ type: "a regular expression", value: new RegExp("[a-z]+") },
			{ type: "an empty regular expression", value: new RegExp() },
			{ type: "a date", value: new Date() }
		];

		for (const sample of samples) {
			it(`should throw an Error if the time is ${
				sample.type
			}`, function() {
				expect(function() {
					const store = new OpenedClosed(options);

					store._getDateFromString(sample.value);
				}).to.throw("the time should be a string");
			});
		}

		const samples2 = [
			{ type: "an invalid date", value: "foo" },
			{ type: "an empty date", value: "" }
		];

		for (const sample of samples2) {
			it(`should throw an Error if the time is ${
				sample.type
			}`, function() {
				expect(function() {
					const store = new OpenedClosed(options);

					store._getDateFromString(sample.value);
				}).to.throw("the time is not valid");
			});
		}
	});
});
