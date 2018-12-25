const expect = require("chai").expect;
const OpenedClosed = require("../../lib/main");

describe("public functions", function() {
	describe("constructor", function() {
		const optionsSamples = [
			{ type: "undefined", value: undefined },
			{ type: "null", value: null },
			{ type: "integer", value: 42 },
			{ type: "float", value: 3.14 },
			{ type: "array", value: [1, 2, 3] },
			{ type: "empty array", value: [] },
			{ type: "date", value: new Date() },
			{ type: "regular expression", value: new RegExp("w+") },
			{ type: "empty regular expression", value: new RegExp() },
			{ type: "boolean(true)", value: true },
			{ type: "boolean(false)", value: false },
			{ type: "string", value: "hello world" },
			{ type: "empty string", value: "" }
		];

		const languageSamples = [
			{ type: "undefined", value: undefined },
			{ type: "null", value: null },
			{ type: "integer", value: 42 },
			{ type: "float", value: 3.14 },
			{ type: "array", value: [1, 2, 3] },
			{ type: "empty array", value: [] },
			{ type: "date", value: new Date() },
			{ type: "regular expression", value: new RegExp("w+") },
			{ type: "empty regular expression", value: new RegExp() },
			{ type: "boolean(true)", value: true },
			{ type: "boolean(false)", value: false },
			{ type: "object", value: { type: "GET", async: true } },
			{ type: "empty object", value: {} }
		];

		for (const sample of optionsSamples) {
			it(`should throw an Error if it is constructed with a variable of type ${
				sample.type
			}`, function() {
				expect(function() {
					new OpenedClosed(sample.value);
				}).to.throw("expected parameter 1 to be an object");
			});
		}

		it("should throw an Error if the options is empty", function() {
			expect(function() {
				new OpenedClosed({});
			}).to.throw("options is empty");
		});

		it("should throw an Error if the options is missing the timezone", function() {
			expect(function() {
				new OpenedClosed({
					openings: {
						monday: [{ start: "10:00", end: "13:00" }]
					}
				});
			}).to.throw("options is missing timezone");
		});

		for (const sample of optionsSamples) {
			it(`should throw an Error if it is constructed with an option language with type ${
				sample.type
			}`, function() {
				expect(function() {
					new OpenedClosed({
						timezone: "GMT+0100",
						language: sample.value
					});
				}).to.throw("language options should be an object");
			});
		}

		for (const sample of languageSamples) {
			it(`should throw an Error if it is constructed with an opened language with type ${
				sample.type
			}`, function() {
				expect(function() {
					new OpenedClosed({
						timezone: "GMT+0100",
						language: {
							opened: sample.value
						}
					});
				}).to.throw("opened language is string");
			});
		}

		it("should throw an Error if it is constructed with an empty opened language", function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					language: {
						opened: ""
					}
				});
			}).to.throw("opened language is empty");
		});

		for (const sample of languageSamples) {
			it(`should throw an Error if it is constructed with an closed language with type ${
				sample.type
			}`, function() {
				expect(function() {
					new OpenedClosed({
						timezone: "GMT+0100",
						language: {
							closed: sample.value
						}
					});
				}).to.throw("closed language is string");
			});
		}

		it("should throw an Error if it is constructed with an empty closed language", function() {
			expect(function() {
				new OpenedClosed({
					timezone: "GMT+0100",
					language: {
						closed: ""
					}
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
							to: new Date("2018-01-07")
						}
					]
				});
			}).to.not.throw(Error);
		});

		describe("closings", function() {
			it("should throw an Error if one of the closings dates does not have a from key", function() {
				expect(function() {
					new OpenedClosed({
						timezone: "GMT+0100",
						closings: [{ to: new Date() }]
					});
				}).to.throw('key "from" is missing');
			});

			it("should throw an Error if one of the closings dates does not have to key", function() {
				expect(function() {
					new OpenedClosed({
						timezone: "GMT+0100",
						closings: [{ from: new Date() }]
					});
				}).to.throw('key "to" is missing');
			});

			it("should throw an Error if one of the closings dates does not have a Date on the from key", function() {
				expect(function() {
					new OpenedClosed({
						timezone: "GMT+0100",
						closings: [
							{
								from: "2018-01-01 00:00:00",
								to: new Date("2018-01-01 23:59:00")
							}
						]
					});
				}).to.throw('key "from" should be a Date');
			});

			it("should throw an Error if one of the closings dates does not have a Date on the to key", function() {
				expect(function() {
					new OpenedClosed({
						timezone: "GMT+0100",
						closings: [
							{
								from: new Date("2018-01-01 00:00:00"),
								to: "2018-01-01 23:59:00"
							}
						]
					});
				}).to.throw('key "to" should be a Date');
			});

			it("should throw an Error if one of the closings date contains equal date for from and to dates (which is unsafe)", function() {
				expect(function() {
					new OpenedClosed({
						timezone: "GMT+0100",
						closings: [{ from: new Date(), to: new Date() }]
					});
				}).to.throw(
					'keys "from" and "to" have the same date, which is unsafe (if you set the same date for those dates, please precise a different time for both)'
				);
			});

			it("should throw an Error if one of the closings date is not an object", function() {
				expect(function() {
					new OpenedClosed({
						timezone: "GMT+0100",
						closings: [
							{
								from: new Date("2018-01-01"),
								to: new Date("2018-12-01")
							},
							42
						]
					});
				}).to.throw("each closing dates should be an object");
			});
		});
	});
});
