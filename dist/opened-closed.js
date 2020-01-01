(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    constructor(options) {
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
    opened() {
        let opened = false;
        const now = this._now();
        for (const day in this._options.openings) {
            const openings = this._options.openings[day];
            for (const opening of openings) {
                const start = this._getDateFromString(opening.start);
                const end = this._getDateFromString(opening.end);
                const nowIsClosed = this._nowIsClosed();
                if (this._nowIsTheDay(day) &&
                    this._dateBetween(now, start, end) &&
                    !nowIsClosed) {
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
    availability() {
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
    closeIn() {
        let closesIn = [];
        const now = this._now();
        for (const day in this._options.openings) {
            const openings = this._options.openings[day];
            for (const opening of openings) {
                const start = this._getDateFromString(opening.start);
                const end = this._getDateFromString(opening.end);
                if (this._nowIsTheDay(day) &&
                    this._dateBetween(now, start, end)) {
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
    closeAt() {
        let closeAt = new Date();
        const now = this._now();
        for (const day in this._options.openings) {
            const openings = this._options.openings[day];
            for (const opening of openings) {
                const start = this._getDateFromString(opening.start);
                const end = this._getDateFromString(opening.end);
                if (this._nowIsTheDay(day) &&
                    this._dateBetween(now, start, end)) {
                    closeAt = end;
                    break;
                }
            }
        }
        return closeAt;
    }
    _currentYear() {
        return this.now.getFullYear();
    }
    _currentMonth() {
        return this.now.getMonth() + 1;
    }
    _currentDay() {
        return this.now.getDate();
    }
    _dayNow() {
        return this.now.getDay();
    }
    _now() {
        return new Date();
    }
    _currentDate(options) {
        return `${options.year}-${options.month}-${options.day} ${options.time} ${this._options.timezone}`;
    }
    /**
     *
     * @throws {Error} If the time is not a string.
     * @throws {Error} If the time not a correct time.
     */
    _getDateFromString(dateString) {
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
            time: dateString,
        });
        const result = new Date(date);
        if (isNaN(result.getTime())) {
            throw new Error(OpenedClosed.ERR_TIME_NOT_CORRECT);
        }
        return new Date(date);
    }
    _dayNumberFromString(dayString) {
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
    _nowIsTheDay(dayString) {
        const dayNumber = this._dayNumberFromString(dayString);
        const dayNumberOfTheWeek = this._dayNow();
        return dayNumberOfTheWeek === dayNumber;
    }
    _autoFillLanguage() {
        if ("language" in this._options === false) {
            this._options.language = {
                opened: "opened",
                closed: "closed",
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
            throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_NOT_STRING);
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
            throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_CLOSED_NOT_STRING);
        }
        if (closed.trim().length === 0) {
            throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_CLOSED_EMPTY);
        }
    }
    _dateToEpoch(date) {
        if (!this._isDate(date)) {
            throw new Error(OpenedClosed.ERR_INTERNAL_NOT_DATE);
        }
        let epoch = date.getTime() / 1000;
        epoch = parseInt(epoch.toString());
        return epoch;
    }
    _datesDifferenceToEpoch(start, end) {
        const startEpoch = this._dateToEpoch(start);
        const endEpoch = this._dateToEpoch(end);
        return endEpoch - startEpoch;
    }
    _max(numbers) {
        if (!Array.isArray(numbers)) {
            throw new Error(OpenedClosed.ERR_INTERNAL_NOT_ARRAY);
        }
        return numbers.length === 0 ? 0 : Math.max(...numbers);
    }
    _nowIsClosed() {
        let nowIsClosed = this._hasOpenings() ? false : true;
        const closings = this._options.closings;
        const now = this._now();
        if (Array.isArray(closings)) {
            for (const closing of closings) {
                if (this._dateBetween(now, closing.from, closing.to)) {
                    nowIsClosed = true;
                    break;
                }
            }
        }
        return nowIsClosed;
    }
    _throwErrorIfClosingDateIncorrect() {
        const closings = "closings" in this._options ? this._options.closings : undefined;
        if (Array.isArray(closings)) {
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
        }
        else if (closings !== null && closings !== undefined) {
            throw new Error(OpenedClosed.ERR_MALFORMED_CLOSINGS);
        }
    }
    _throwErrorIfOpeningDateIncorrect() {
        const openings = this._options.openings;
        if (this._isObject(openings)) {
            for (const key in openings) {
                const timeSpans = openings[key];
                if (!Array.isArray(timeSpans)) {
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
        }
        else if (openings !== null && openings !== undefined) {
            throw new Error(OpenedClosed.ERR_MALFORMED_OPENINGS);
        }
    }
    _dateBetween(date, lowerDate, greaterDate) {
        return lowerDate <= date && date <= greaterDate;
    }
    _isDate(mixed) {
        return mixed instanceof Date;
    }
    _isObject(mixed) {
        return mixed instanceof Object;
    }
    _isString(mixed) {
        return typeof mixed === "string";
    }
    _hasOpenings() {
        return ("openings" in this._options &&
            Object.keys(this._options.openings).length > 0);
    }
}
OpenedClosed.ERR_OPTIONS_NOT_OBJECT = "expected parameter 1 to be an object";
OpenedClosed.ERR_OPTIONS_EMPTY = "options is empty";
OpenedClosed.ERR_OPTIONS_MISSING_TIMEZONE = "options is missing timezone";
OpenedClosed.ERR_OPTIONS_LANGUAGE_NOT_OBJECT = "language options should be an object";
OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_NOT_STRING = "opened language is string";
OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_EMPTY = "opened language is empty";
OpenedClosed.ERR_OPTIONS_LANGUAGE_CLOSED_NOT_STRING = "closed language is string";
OpenedClosed.ERR_OPTIONS_LANGUAGE_CLOSED_EMPTY = "closed language is empty";
OpenedClosed.ERR_UNSUPPORTED_DAY = "unsupported day";
OpenedClosed.ERR_MISSING_FROM_KEY = 'key "from" is missing';
OpenedClosed.ERR_MISSING_TO_KEY = 'key "to" is missing';
OpenedClosed.ERR_KEY_FROM_NOT_DATE = 'key "from" should be a Date';
OpenedClosed.ERR_KEY_TO_NOT_DATE = 'key "to" should be a Date';
OpenedClosed.ERR_CLOSINGS_DATE_NOT_OBJECT = "each closing dates should be an object";
OpenedClosed.ERR_MALFORMED_OPENINGS = "malformed openings data";
OpenedClosed.ERR_MALFORMED_CLOSINGS = "malformed closings data";
OpenedClosed.ERR_TIME_NOT_CORRECT = "the time is not valid";
OpenedClosed.ERR_TIME_SHOULD_BE_STRING = "the time should be a string";
OpenedClosed.ERR_INTERNAL_NOT_DATE = "internal error: invalid date";
OpenedClosed.ERR_INTERNAL_NOT_ARRAY = "internal error: invalid array";
OpenedClosed.DEFAULT_LANGUAGE_CLOSED = "closed";
OpenedClosed.DEFAULT_LANGUAGE_OPENED = "opened";

},{}]},{},[1]);
