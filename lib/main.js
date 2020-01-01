"use strict";
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

var OpenedClosed =
/** @class */
function () {
  function OpenedClosed(options) {
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


  OpenedClosed.prototype.opened = function () {
    var opened = false;

    var now = this._now();

    for (var day in this._options.openings) {
      var openings = this._options.openings[day];

      for (var _i = 0, openings_1 = openings; _i < openings_1.length; _i++) {
        var opening = openings_1[_i];

        var start = this._getDateFromString(opening.start);

        var end = this._getDateFromString(opening.end);

        var nowIsClosed = this._nowIsClosed();

        if (this._nowIsTheDay(day) && this._dateBetween(now, start, end) && !nowIsClosed) {
          opened = true;
          break;
        }
      }
    }

    return opened;
  };
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


  OpenedClosed.prototype.availability = function () {
    var availability = this._options.language.closed;

    if (this.opened() === true) {
      availability = this._options.language.opened;
    }

    return availability;
  };
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


  OpenedClosed.prototype.closeIn = function () {
    var closesIn = [];

    var now = this._now();

    for (var day in this._options.openings) {
      var openings = this._options.openings[day];

      for (var _i = 0, openings_2 = openings; _i < openings_2.length; _i++) {
        var opening = openings_2[_i];

        var start = this._getDateFromString(opening.start);

        var end = this._getDateFromString(opening.end);

        if (this._nowIsTheDay(day) && this._dateBetween(now, start, end)) {
          var closeIn_1 = this._datesDifferenceToEpoch(now, end);

          closesIn.push(closeIn_1);
          break;
        }
      }
    }

    var closeIn = this._max(closesIn);

    return closeIn;
  };
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


  OpenedClosed.prototype.closeAt = function () {
    var closeAt = new Date();

    var now = this._now();

    for (var day in this._options.openings) {
      var openings = this._options.openings[day];

      for (var _i = 0, openings_3 = openings; _i < openings_3.length; _i++) {
        var opening = openings_3[_i];

        var start = this._getDateFromString(opening.start);

        var end = this._getDateFromString(opening.end);

        if (this._nowIsTheDay(day) && this._dateBetween(now, start, end)) {
          closeAt = end;
          break;
        }
      }
    }

    return closeAt;
  };

  OpenedClosed.prototype._currentYear = function () {
    return this.now.getFullYear();
  };

  OpenedClosed.prototype._currentMonth = function () {
    return this.now.getMonth() + 1;
  };

  OpenedClosed.prototype._currentDay = function () {
    return this.now.getDate();
  };

  OpenedClosed.prototype._dayNow = function () {
    return this.now.getDay();
  };

  OpenedClosed.prototype._now = function () {
    return new Date();
  };

  OpenedClosed.prototype._currentDate = function (options) {
    return options.year + "-" + options.month + "-" + options.day + " " + options.time + " " + this._options.timezone;
  };
  /**
   *
   * @throws {Error} If the time is not a string.
   * @throws {Error} If the time not a correct time.
   */


  OpenedClosed.prototype._getDateFromString = function (dateString) {
    if (!this._isString(dateString)) {
      throw new Error(OpenedClosed.ERR_TIME_SHOULD_BE_STRING);
    }

    if (dateString.length === 0) {
      throw new Error(OpenedClosed.ERR_TIME_NOT_CORRECT);
    }

    var year = this._currentYear();

    var month = this._currentMonth();

    var day = this._currentDay();

    var date = this._currentDate({
      year: year,
      month: month,
      day: day,
      time: dateString
    });

    var result = new Date(date);

    if (isNaN(result.getTime())) {
      throw new Error(OpenedClosed.ERR_TIME_NOT_CORRECT);
    }

    return new Date(date);
  };

  OpenedClosed.prototype._dayNumberFromString = function (dayString) {
    var dayNumber = 0;

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
  };

  OpenedClosed.prototype._nowIsTheDay = function (dayString) {
    var dayNumber = this._dayNumberFromString(dayString);

    var dayNumberOfTheWeek = this._dayNow();

    return dayNumberOfTheWeek === dayNumber;
  };

  OpenedClosed.prototype._autoFillLanguage = function () {
    if ("language" in this._options === false) {
      this._options.language = {
        opened: "opened",
        closed: "closed"
      };
      return;
    }

    var language = this._options.language;

    if (!this._isObject(language)) {
      throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_NOT_OBJECT);
    }

    if ("opened" in this._options.language === false) {
      this._options.language.opened = OpenedClosed.DEFAULT_LANGUAGE_OPENED;
    }

    var opened = this._options.language.opened;

    if (!this._isString(opened)) {
      throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_NOT_STRING);
    }

    if (opened.trim().length === 0) {
      throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_EMPTY);
    }

    if ("closed" in this._options.language === false) {
      this._options.language.closed = OpenedClosed.DEFAULT_LANGUAGE_CLOSED;
    }

    var closed = this._options.language.closed;

    if (!this._isString(closed)) {
      throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_CLOSED_NOT_STRING);
    }

    if (closed.trim().length === 0) {
      throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_CLOSED_EMPTY);
    }
  };

  OpenedClosed.prototype._dateToEpoch = function (date) {
    if (!this._isDate(date)) {
      throw new Error(OpenedClosed.ERR_INTERNAL_NOT_DATE);
    }

    var epoch = date.getTime() / 1000;
    epoch = parseInt(epoch.toString());
    return epoch;
  };

  OpenedClosed.prototype._datesDifferenceToEpoch = function (start, end) {
    var startEpoch = this._dateToEpoch(start);

    var endEpoch = this._dateToEpoch(end);

    return endEpoch - startEpoch;
  };

  OpenedClosed.prototype._max = function (numbers) {
    if (!Array.isArray(numbers)) {
      throw new Error(OpenedClosed.ERR_INTERNAL_NOT_ARRAY);
    }

    return numbers.length === 0 ? 0 : Math.max.apply(Math, numbers);
  };

  OpenedClosed.prototype._nowIsClosed = function () {
    var nowIsClosed = this._hasOpenings() ? false : true;
    var closings = this._options.closings;

    var now = this._now();

    if (Array.isArray(closings)) {
      for (var _i = 0, closings_1 = closings; _i < closings_1.length; _i++) {
        var closing = closings_1[_i];

        if (this._dateBetween(now, closing.from, closing.to)) {
          nowIsClosed = true;
          break;
        }
      }
    }

    return nowIsClosed;
  };

  OpenedClosed.prototype._throwErrorIfClosingDateIncorrect = function () {
    var closings = "closings" in this._options ? this._options.closings : undefined;

    if (Array.isArray(closings)) {
      for (var _i = 0, closings_2 = closings; _i < closings_2.length; _i++) {
        var closing = closings_2[_i];

        if (!this._isObject(closing)) {
          throw new Error(OpenedClosed.ERR_CLOSINGS_DATE_NOT_OBJECT);
        }

        if ("from" in closing === false) {
          throw new Error(OpenedClosed.ERR_MISSING_FROM_KEY);
        }

        if ("to" in closing === false) {
          throw new Error(OpenedClosed.ERR_MISSING_TO_KEY);
        }

        var from = closing.from;
        var to = closing.to;

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
  };

  OpenedClosed.prototype._throwErrorIfOpeningDateIncorrect = function () {
    var openings = this._options.openings;

    if (this._isObject(openings)) {
      for (var key in openings) {
        var timeSpans = openings[key];

        if (!Array.isArray(timeSpans)) {
          throw new Error(OpenedClosed.ERR_MALFORMED_OPENINGS);
        }

        for (var _i = 0, timeSpans_1 = timeSpans; _i < timeSpans_1.length; _i++) {
          var timeSpan = timeSpans_1[_i];

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
  };

  OpenedClosed.prototype._dateBetween = function (date, lowerDate, greaterDate) {
    return lowerDate <= date && date <= greaterDate;
  };

  OpenedClosed.prototype._isDate = function (mixed) {
    return mixed instanceof Date;
  };

  OpenedClosed.prototype._isObject = function (mixed) {
    return mixed instanceof Object;
  };

  OpenedClosed.prototype._isString = function (mixed) {
    return typeof mixed === "string";
  };

  OpenedClosed.prototype._hasOpenings = function () {
    return "openings" in this._options && Object.keys(this._options.openings).length > 0;
  };

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
  return OpenedClosed;
}();

module.exports = OpenedClosed;