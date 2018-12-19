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
				}).to.throw(OpenedClosed.ERR_OPTIONS_NOT_OBJECT);
			});
		}

		it("should throw an Error if the options is empty", function() {
			expect(function() {
				new OpenedClosed({});
			}).to.throw(OpenedClosed.ERR_OPTIONS_EMPTY);
		});

		it("should throw an Error if the options is missing the timezone", function() {
			expect(function() {
				new OpenedClosed({
					openings: {
						monday: [{ start: "10:00", end: "13:00" }]
					}
				});
			}).to.throw(OpenedClosed.ERR_OPTIONS_MISSING_TIMEZONE);
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
				}).to.throw(OpenedClosed.ERR_OPTIONS_LANGUAGE_NOT_OBJECT);
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
				}).to.throw(
					OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_NOT_STRING
				);
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
			}).to.throw(OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_EMPTY);
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
				}).to.throw(
					OpenedClosed.ERR_OPTIONS_LANGUAGE_CLOSED_NOT_STRING
				);
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
			}).to.throw(OpenedClosed.ERR_OPTIONS_LANGUAGE_CLOSED_EMPTY);
		});
	});
});
