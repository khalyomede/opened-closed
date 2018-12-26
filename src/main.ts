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

/**
 * @description Provides store availabiltiy, near-to-close information and more.
 * @kind class
 * @license MIT
 * @since 0.1.0
 * @param {Object} options The settings.
 * @param {String} options.timezone The timezone (in any format that Date supports).
 * @param {Object} options.openings The openings hours.
 * @param {Array} options.closings The closings hours.
 * @return {OpenedClosed}
 * @example
 * const store = new OpenedClosed({
 *   timezone: 'GMT+0100',
 *   openings: {
 *     monday: [
 *       { start: '10:00', end: '13:00' },
 *       { start: '15:00', end: '18:00' }
 *     ],
 *     wednesday: [
 *       { start: '08:00:00', end: '16:59:59' }
 *     ]
 *   }
 * });
 * @example
 * const store = new OpenedClosed({
 *   timezone: 'GMT+0100',
 *   openings: {
 *     monday: [
 *       { start: '10:00', end: '18:00' }
 *     ]
 *   },
 *   closings: [
 *     {
 *       reason: 'Christmas',
 *       from: new Date('2018-12-25 00:00:00 GMT+0100'),
 *       to: new Date('2018-12-25 23:59:00 GMT+0100')
 *     },
 *     {
 *       from: new Date('2018-12-31 00:00:00 GMT+0100'),
 *       to: new Date('2019-01-01 23:59:00 GMT+0100')
 *     }
 *   ]
 * });
 * @example
 * const store = new OpenedClosed({
 *   timezone: 'GMT+0100',
 *   openings: {
 *     monday: [
 *       { start: '10:00', end: '18:00' }
 *     ]
 *   },
 *   language: {
 *     opened: 'ouvert',
 *     closed: 'fermé'
 *   }
 * });
 */
class OpenedClosed {
	private _options: Options;
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
	private static ERR_CLOSINGS_DATE_NOT_OBJECT =
		"each closing dates should be an object";
	private static ERR_MALFORMED_OPENINGS = "malformed openings data";
	private static ERR_MALFORMED_CLOSINGS = "malformed closings data";
	private static ERR_TIME_NOT_CORRECT = "the time is not valid";
	private static ERR_TIME_SHOULD_BE_STRING = "the time should be a string";
	private static ERR_INTERNAL_NOT_DATE = "internal error: invalid date";
	private static ERR_INTERNAL_NOT_ARRAY = "internal error: invalid array";
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

		this._options = options;
		this.now = new Date();

		this._throwErrorIfClosingDateIncorrect();
		this._throwErrorIfOpeningDateIncorrect();
		this._autoFillLanguage();
	}

	/**
	 * @description Returns true if the store is opened right now, else returns false.
	 * @kind member
	 * @memberof OpenedClosed
	 * @return {Boolean}
	 * @since 0.1.0
	 * @example
	 * const store = new OpenedClosed({
	 *   'timezone': 'GMT+0100'
	 * });
	 *
	 * store.opened();
	 */
	public opened(): boolean {
		let opened: boolean = false;

		const now = this._now();

		for (const day in this._options.openings) {
			const openings = this._options.openings[day];

			for (const opening of openings) {
				const start = this._getDateFromString(opening.start);
				const end = this._getDateFromString(opening.end);
				const nowIsClosed = this._nowIsClosed();

				if (
					this._nowIsTheDay(day) &&
					this._dateBetween(now, start, end) &&
					!nowIsClosed
				) {
					opened = true;

					break;
				}
			}
		}

		return opened;
	}

	/**
	 * @description Returns "opened" or "closed" (or the equivalent set in the language options) depending the store is opened right now or not.
	 * @return {String}
	 * @kind member
	 * @memberof OpenedClosed
	 * @since 0.1.0
	 * @example
	 * const store = new OpenedClosed({
	 *   timezone: 'GMT+0100'
	 * });
	 *
	 * console.log(store.availability());
	 */
	public availability(): string {
		let availability = this._options.language.closed;

		if (this.opened() === true) {
			availability = this._options.language.opened;
		}

		return availability;
	}

	/**
	 * @description Returns the number of seconds before the store will close.
	 * @since 0.1.0
	 * @kind member
	 * @memberof OpenedClosed
	 * @return {Integer}
	 * @example
	 * const store = new OpenedClosed({
	 *   timezone: 'GMT+0100'
	 * });
	 *
	 * if(store.opened()) {
	 *   console.log(store.closeIn());
	 * }
	 */
	public closeIn(): number {
		let closesIn: Array<number> = [];

		const now = this._now();

		for (const day in this._options.openings) {
			const openings = this._options.openings[day];

			for (const opening of openings) {
				const start = this._getDateFromString(opening.start);
				const end = this._getDateFromString(opening.end);

				if (
					this._nowIsTheDay(day) &&
					this._dateBetween(now, start, end)
				) {
					const closeIn = this._datesDifferenceToEpoch(now, end);

					closesIn.push(closeIn);

					break;
				}
			}
		}

		const closeIn = this._max(closesIn);

		return closeIn;
	}

	/**
	 * @description Returns a Date when the store is about to close. Note that if the store is already closed, this will return now as a Date.
	 * @return {Date}
	 * @since 0.1.0
	 * @kind member
	 * @memberof OpenedClosed
	 * @example
	 * const store = new OpenedClosed({
	 *   timezone: 'GMT+0100'
	 * });
	 *
	 * if(store.opened()) {
	 *   console.log(store.closeAt());
	 * }
	 */
	public closeAt(): Date {
		let closeAt: Date = new Date();

		const now = this._now();

		for (const day in this._options.openings) {
			const openings = this._options.openings[day];

			for (const opening of openings) {
				const start = this._getDateFromString(opening.start);
				const end = this._getDateFromString(opening.end);

				if (
					this._nowIsTheDay(day) &&
					this._dateBetween(now, start, end)
				) {
					closeAt = end;

					break;
				}
			}
		}

		return closeAt;
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
		} ${this._options.timezone}`;
	}

	/**
	 *
	 * @throws {Error} If the time is not a string.
	 * @throws {Error} If the time not a correct time.
	 */
	private _getDateFromString(dateString: string): Date {
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
		if ("language" in this._options === false) {
			this._options.language = {
				opened: "opened",
				closed: "closed"
			};

			return;
		}

		const language = this._options.language;

		if (!this._isObject(language)) {
			throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_NOT_OBJECT);
		}

		if ("opened" in this._options.language === false) {
			this._options.language.opened =
				OpenedClosed.DEFAULT_LANGUAGE_OPENED;
		}

		const opened = this._options.language.opened;

		if (!this._isString(opened)) {
			throw new Error(
				OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_NOT_STRING
			);
		}

		if (opened.trim().length === 0) {
			throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_EMPTY);
		}

		if ("closed" in this._options.language === false) {
			this._options.language.closed =
				OpenedClosed.DEFAULT_LANGUAGE_CLOSED;
		}

		const closed = this._options.language.closed;

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

		const closings = this._options.closings;
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
			"closings" in this._options ? this._options.closings : undefined;

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
			}
		} else if (closings !== null && closings !== undefined) {
			throw new Error(OpenedClosed.ERR_MALFORMED_CLOSINGS);
		}
	}

	private _throwErrorIfOpeningDateIncorrect(): void {
		const openings = this._options.openings;

		if (this._isObject(openings)) {
			for (const key in openings) {
				const timeSpans: Array<TimeSpan> = openings[key];

				if (!this._isArray(timeSpans)) {
					throw new Error(OpenedClosed.ERR_MALFORMED_OPENINGS);
				}

				for (const timeSpan of timeSpans) {
					if (!this._isObject(timeSpan)) {
						throw new Error(OpenedClosed.ERR_MALFORMED_OPENINGS);
					}

					if (!("start" in timeSpan && "end" in timeSpan)) {
						throw new Error(OpenedClosed.ERR_MALFORMED_OPENINGS);
					}

					this._getDateFromString(timeSpan.start);
					this._getDateFromString(timeSpan.end);
				}
			}
		} else if (openings !== null && openings !== undefined) {
			throw new Error(OpenedClosed.ERR_MALFORMED_OPENINGS);
		}
	}

	private _dateBetween(
		date: Date,
		lowerDate: Date,
		greaterDate: Date
	): boolean {
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
			"openings" in this._options &&
			Object.keys(this._options.openings).length > 0
		);
	}
}

export = OpenedClosed;
