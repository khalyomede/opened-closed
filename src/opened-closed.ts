interface TimeSpan {
	start: string;
	end: string;
}

interface Closing {
	reason?: string;
	from: Date;
	to: Date;
}

interface TimeSpans {
	day: Array<TimeSpan>;
}

interface Language {
	opened: string;
	closed: string;
}

interface Options {
	locale: string;
	timezone: string;
	openings: TimeSpans;
	closings: Array<Closing>;
	language: Language;
}

class OpenedClosed {
	private options: Options;
	private now: Date;

	private static readonly ERR_OPTIONS_NOT_OBJECT =
		"expected parameter 1 to be an object";
	private static ERR_OPTIONS_EMPTY = "options is empty";
	private static ERR_OPTIONS_MISSING_TIMEZONE = "options is missing timezone";
	private static ERR_OPTIONS_LANGUAGE_NOT_OBJECT =
		"language options should be an object";
	private static ERR_OPTIONS_LANGUAGE_OPENED_NOT_STRING =
		"opened language is string";
	private static ERR_OPTIONS_LANGUAGE_OPENED_EMPTY =
		"opened language is empty";
	private static ERR_OPTIONS_LANGUAGE_CLOSED_NOT_STRING =
		"closed language is string";
	private static ERR_OPTIONS_LANGUAGE_CLOSED_EMPTY =
		"closed language is empty";
	private static ERR_UNSUPPORTED_DAY = "unsupported day";
	private static ERR_MISSING_FROM_KEY = 'key "from" is missing';
	private static ERR_MISSING_TO_KEY = 'key "to" is missing';
	private static ERR_KEY_FROM_NOT_DATE = 'key "from" should be a Date';
	private static ERR_KEY_TO_NOT_DATE = 'key "to" should be a Date';
	private static ERR_CLOSING_DATE_CONTAINS_UNSAFE_DATES =
		'keys "from" and "to" have the same date, which is unsafe (if you set the same date for those dates, please precise a different time for both)';
	private static ERR_CLOSINGS_DATE_NOT_OBJECT =
		"each closing dates should be an object";
	private static ERR_TIME_NOT_CORRECT = "the time is not valid";
	private static ERR_TIME_SHOULD_BE_STRING = "the time should be a string";
	private static ERR_INTERNAL_NOT_DATE = "internal error: invalid date";
	private static ERR_INTERNAL_NOT_ARRAY = "internal error: invalid array";
	private static ERR_INTERNAL_REVERTED_DATES =
		"internal error: reverted dates";
	private static DEFAULT_LANGUAGE_CLOSED = "closed";
	private static DEFAULT_LANGUAGE_OPENED = "opened";

	constructor(options: Options) {
		if (!this._isObject(options)) {
			throw new Error(OpenedClosed.ERR_OPTIONS_NOT_OBJECT);
		}

		if (Object.keys(options).length === 0) {
			throw new Error(OpenedClosed.ERR_OPTIONS_EMPTY);
		}

		if ("timezone" in options === false) {
			throw new Error(OpenedClosed.ERR_OPTIONS_MISSING_TIMEZONE);
		}

		this.options = options;
		this.now = new Date();

		this._throwErrorIfClosingDateIncorrect();
		this._autoFillLanguage();
	}

	public opened(): boolean {
		let opened: boolean = false;

		const now = this._now();

		for (const day in this.options.openings) {
			const openings = this.options.openings[day];

			if (this._nowIsTheDay(day)) {
				for (const opening of openings) {
					const start = this._getDateFromString(opening.start, day);
					const end = this._getDateFromString(opening.end, day);
					const nowIsClosed = this._nowIsClosed();

					if (this._dateBetween(now, start, end) && !nowIsClosed) {
						opened = true;

						break;
					}
				}
			}
		}

		return opened;
	}

	public availability(): string {
		let availability = this.options.language.closed;

		if (this.opened() === true) {
			availability = this.options.language.opened;
		}

		return availability;
	}

	public closeIn(): number {
		let closesIn: Array<number> = [];

		const now = this._now();

		for (const day in this.options.openings) {
			const openings = this.options.openings[day];

			if (this._nowIsTheDay(day)) {
				for (const opening of openings) {
					const start = this._getDateFromString(opening.start, day);
					const end = this._getDateFromString(opening.end, day);

					if (this._dateBetween(now, start, end)) {
						const closeIn = this._datesDifferenceToEpoch(now, end);

						closesIn.push(closeIn);

						break;
					}
				}
			}
		}

		const closeIn = this._max(closesIn);

		return closeIn;
	}

	private _currentYear(): number {
		return this.now.getFullYear();
	}

	private _currentMonth(): number {
		return this.now.getMonth() + 1;
	}

	private _currentDay(): number {
		return this.now.getDate();
	}

	private _dayNow(): number {
		return this.now.getDay();
	}

	private _now(): Date {
		return new Date();
	}

	private _currentDate(options): string {
		return `${options.year}-${options.month}-${options.day} ${
			options.time
		} ${this.options.timezone}`;
	}

	private _getDateFromString(dateString: string, dayString: string): Date {
		if (!this._isString(dateString)) {
			throw new Error(OpenedClosed.ERR_TIME_SHOULD_BE_STRING);
		}

		if (dateString.length === 0) {
			throw new Error(OpenedClosed.ERR_TIME_NOT_CORRECT);
		}

		const year = this._currentYear();
		const month = this._currentMonth();
		const day = this._currentDay();
		const date = this._currentDate({
			year: year,
			month: month,
			day: day,
			time: dateString
		});

		const result = new Date(date);

		if (isNaN(result.getTime())) {
			throw new Error(OpenedClosed.ERR_TIME_NOT_CORRECT);
		}

		return new Date(date);
	}

	private _dayNumberFromString(dayString: string): Number {
		let dayNumber = 0;

		switch (dayString) {
			case "sunday":
				dayNumber = 0;
				break;
			case "monday":
				dayNumber = 1;
				break;
			case "tuesday":
				dayNumber = 2;
				break;
			case "wednesday":
				dayNumber = 3;
				break;
			case "thursday":
				dayNumber = 4;
				break;
			case "friday":
				dayNumber = 5;
				break;
			case "saturday":
				dayNumber = 6;
				break;

			default:
				throw new Error(OpenedClosed.ERR_UNSUPPORTED_DAY);
		}

		return dayNumber;
	}

	private _nowIsTheDay(dayString: string) {
		const dayNumber = this._dayNumberFromString(dayString);
		const dayNumberOfTheWeek = this._dayNow();

		return dayNumberOfTheWeek === dayNumber;
	}

	private _autoFillLanguage(): void {
		if ("language" in this.options === false) {
			this.options.language = {
				opened: "opened",
				closed: "closed"
			};
		}

		const language = this.options.language;

		if (!this._isObject(language)) {
			throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_NOT_OBJECT);
		}

		if ("opened" in this.options.language === false) {
			this.options.language.opened = OpenedClosed.DEFAULT_LANGUAGE_OPENED;
		}

		const opened = this.options.language.opened;

		if (!this._isString(opened)) {
			throw new Error(
				OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_NOT_STRING
			);
		}

		if (opened.trim().length === 0) {
			throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_EMPTY);
		}

		if ("closed" in this.options.language === false) {
			this.options.language.closed = OpenedClosed.DEFAULT_LANGUAGE_CLOSED;
		}

		const closed = this.options.language.closed;

		if (!this._isString(closed)) {
			throw new Error(
				OpenedClosed.ERR_OPTIONS_LANGUAGE_CLOSED_NOT_STRING
			);
		}

		if (closed.trim().length === 0) {
			throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_CLOSED_EMPTY);
		}
	}

	private _dateToEpoch(date: Date): number {
		if (!this._isDate(date)) {
			throw new Error(OpenedClosed.ERR_INTERNAL_NOT_DATE);
		}

		let epoch = date.getTime() / 1000;

		epoch = parseInt(epoch.toString());

		return epoch;
	}

	private _datesDifferenceToEpoch(start: Date, end: Date): number {
		const startEpoch = this._dateToEpoch(start);
		const endEpoch = this._dateToEpoch(end);

		return endEpoch - startEpoch;
	}

	private _max(numbers: Array<number>): number {
		if (!this._isArray(numbers)) {
			throw new Error(OpenedClosed.ERR_INTERNAL_NOT_ARRAY);
		}

		return numbers.length === 0 ? 0 : Math.max(...numbers);
	}

	private _nowIsClosed(): boolean {
		let nowIsClosed = this._hasOpenings() ? false : true;

		const closings = this.options.closings;
		const now = this._now();

		if (this._isArray(closings)) {
			for (const closing of closings) {
				if (this._dateBetween(now, closing.from, closing.to)) {
					nowIsClosed = true;

					break;
				}
			}
		}

		return nowIsClosed;
	}

	private _throwErrorIfClosingDateIncorrect() {
		const closings =
			"closings" in this.options ? this.options.closings : undefined;

		if (this._isArray(closings)) {
			for (const closing of closings) {
				if (!this._isObject(closing)) {
					throw new Error(OpenedClosed.ERR_CLOSINGS_DATE_NOT_OBJECT);
				}

				if ("from" in closing === false) {
					throw new Error(OpenedClosed.ERR_MISSING_FROM_KEY);
				}

				if ("to" in closing === false) {
					throw new Error(OpenedClosed.ERR_MISSING_TO_KEY);
				}

				const from = closing.from;
				const to = closing.to;

				if (!this._isDate(from)) {
					throw new Error(OpenedClosed.ERR_KEY_FROM_NOT_DATE);
				}

				if (!this._isDate(to)) {
					throw new Error(OpenedClosed.ERR_KEY_TO_NOT_DATE);
				}

				if (from.toISOString() === to.toISOString()) {
					throw new Error(
						OpenedClosed.ERR_CLOSING_DATE_CONTAINS_UNSAFE_DATES
					);
				}
			}
		}
	}

	private _dateBetween(
		date: Date,
		lowerDate: Date,
		greaterDate: Date
	): boolean {
		const items = [date, lowerDate, greaterDate];

		for (const item of items) {
			if (!this._isDate(item)) {
				throw new Error(OpenedClosed.ERR_INTERNAL_NOT_DATE);
			}
		}

		if (lowerDate !== greaterDate && lowerDate > greaterDate) {
			throw new Error(OpenedClosed.ERR_INTERNAL_REVERTED_DATES);
		}

		return lowerDate <= date && date <= greaterDate;
	}

	private _isNull(mixed): boolean {
		return mixed === null;
	}

	private _isUndefined(mixed): boolean {
		return mixed === undefined;
	}

	private _isDate(mixed): boolean {
		return (
			!this._isNull(mixed) &&
			!this._isUndefined(mixed) &&
			mixed.constructor === Date
		);
	}

	private _isObject(mixed): boolean {
		return (
			!this._isNull(mixed) &&
			!this._isUndefined(mixed) &&
			mixed.constructor === Object
		);
	}

	private _isArray(mixed): boolean {
		return (
			!this._isNull(mixed) &&
			!this._isUndefined(mixed) &&
			mixed.constructor === Array
		);
	}

	private _isString(mixed): boolean {
		return (
			!this._isNull(mixed) &&
			!this._isUndefined(mixed) &&
			mixed.constructor === String
		);
	}

	private _hasOpenings(): boolean {
		return (
			"openings" in this.options &&
			Object.keys(this.options.openings).length > 0
		);
	}
}
