interface Opening {
	start: string;
	end: string;
}

interface Openings {
	day: Array<Opening>;
}

interface Language {
	opened: string;
	closed: string;
}

interface Options {
	locale: string;
	timezone: string;
	openings: Openings;
	language: Language;
}

class OpenedClosed {
	private options: Options;
	private now: Date;

	private static ERR_OPTIONS_NOT_OBJECT =
		"expected parameter 1 to be an object";
	private static ERR_OPTIONS_EMPTY = "options is empty";
	private static ERR_OPTIONS_MISSING_TIMEZONE = "options is missing timezone";
	private static ERR_OPTIONS_LANGUAGE_NOT_OBJECT =
		"language options should be an object";
	private static ERR_OPTIONS_LANGUAGE_OPENED_NOT_STRING =
		"opened language is string";
	private static ERR_OPTIONS_LANGUAGE_OPENED_EMPTY =
		"opened language is empty";
	private static ERR_OPTIONS_LANGUAGE_OPENED_NOT_STRING =
		"closed language is string";
	private static ERR_OPTIONS_LANGUAGE_OPENED_EMPTY =
		"closed language is empty";

	constructor(options: Options) {
		if (
			options === undefined ||
			options === null ||
			options.constructor !== Object
		) {
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

		this._autoFillLanguage();
	}

	public opened(): boolean {
		let opened: boolean = false;

		const now = this._now();

		for (const day in this.options.openings) {
			const openings = this.options.openings[day];

			if (this._nowIsTheDay(day) === true) {
				for (const opening of openings) {
					const start = this._getDateFromString(opening.start, day);
					const end = this._getDateFromString(opening.end, day);

					if (start <= now && now <= end) {
						opened = true;

						break;
					}
				}
			}
		}

		return opened;
	}

	public availability(): string {
		let availability = this.options.language.closed || "closed";

		if (this.opened() === true) {
			availability = this.options.language.opened || "opened";
		}

		return availability;
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

	private _getDateFromString(dateString: string, dayString: string): Date {
		const year = this._currentYear();
		const month = this._currentMonth();
		const day = this._currentDay();
		const date = `${year}-${month}-${day} ${dateString} ${this.options
			.timezone || ""}`;

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

		if (
			language === null ||
			language === undefined ||
			language.constructor !== Object
		) {
			throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_NOT_OBJECT);
		}

		if ("opened" in this.options.language === false) {
			this.options.language.opened = "opened";
		}

		const opened = this.options.language.opened;

		if (
			opened === null ||
			opened === undefined ||
			opened.constructor !== String
		) {
			throw new Error(
				OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_NOT_STRING
			);
		}

		if (opened.trim().length === 0) {
			throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_EMPTY);
		}

		if ("closed" in this.options.language === false) {
			this.options.language.closed = "closed";
		}

		const closed = this.options.language.closed;

		if (
			closed === null ||
			closed === undefined ||
			closed.constructor !== String
		) {
			throw new Error(
				OpenedClosed.ERR_OPTIONS_LANGUAGE_CLOSED_NOT_STRING
			);
		}

		if (closed.trim().length === 0) {
			throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_CLOSED_EMPTY);
		}
	}
}

export = OpenedClosed;
