const expect = require("chai").expect;
const OpenedClosed = require("../../lib/main");

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
});
