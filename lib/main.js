"use strict";

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

    this.options = options;
    this.now = new Date();

    this._throwErrorIfClosingDateIncorrect();

    this._autoFillLanguage();
  }

  OpenedClosed.prototype.opened = function () {
    var opened = false;

    var now = this._now();

    for (var day in this.options.openings) {
      var openings = this.options.openings[day];

      if (this._nowIsTheDay(day)) {
        for (var _i = 0, openings_1 = openings; _i < openings_1.length; _i++) {
          var opening = openings_1[_i];

          var start = this._getDateFromString(opening.start, day);

          var end = this._getDateFromString(opening.end, day);

          var nowIsClosed = this._nowIsClosed();

          if (this._dateBetween(now, start, end) && !nowIsClosed) {
            opened = true;
            break;
          }
        }
      }
    }

    return opened;
  };

  OpenedClosed.prototype.availability = function () {
    var availability = this.options.language.closed;

    if (this.opened() === true) {
      availability = this.options.language.opened;
    }

    return availability;
  };

  OpenedClosed.prototype.closeIn = function () {
    var closesIn = [];

    var now = this._now();

    for (var day in this.options.openings) {
      var openings = this.options.openings[day];

      if (this._nowIsTheDay(day)) {
        for (var _i = 0, openings_2 = openings; _i < openings_2.length; _i++) {
          var opening = openings_2[_i];

          var start = this._getDateFromString(opening.start, day);

          var end = this._getDateFromString(opening.end, day);

          if (this._dateBetween(now, start, end)) {
            var closeIn_1 = this._datesDifferenceToEpoch(now, end);

            closesIn.push(closeIn_1);
            break;
          }
        }
      }
    }

    var closeIn = this._max(closesIn);

    return closeIn;
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
    return options.year + "-" + options.month + "-" + options.day + " " + options.time + " " + this.options.timezone;
  };

  OpenedClosed.prototype._getDateFromString = function (dateString, dayString) {
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
    if ("language" in this.options === false) {
      this.options.language = {
        opened: "opened",
        closed: "closed"
      };
    }

    var language = this.options.language;

    if (!this._isObject(language)) {
      throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_NOT_OBJECT);
    }

    if ("opened" in this.options.language === false) {
      this.options.language.opened = OpenedClosed.DEFAULT_LANGUAGE_OPENED;
    }

    var opened = this.options.language.opened;

    if (!this._isString(opened)) {
      throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_NOT_STRING);
    }

    if (opened.trim().length === 0) {
      throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_EMPTY);
    }

    if ("closed" in this.options.language === false) {
      this.options.language.closed = OpenedClosed.DEFAULT_LANGUAGE_CLOSED;
    }

    var closed = this.options.language.closed;

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
    if (!this._isArray(numbers)) {
      throw new Error(OpenedClosed.ERR_INTERNAL_NOT_ARRAY);
    }

    return numbers.length === 0 ? 0 : Math.max.apply(Math, numbers);
  };

  OpenedClosed.prototype._nowIsClosed = function () {
    var nowIsClosed = this._hasOpenings() ? false : true;
    var closings = this.options.closings;

    var now = this._now();

    if (this._isArray(closings)) {
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
    var closings = "closings" in this.options ? this.options.closings : undefined;

    if (this._isArray(closings)) {
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

        if (from.toISOString() === to.toISOString()) {
          throw new Error(OpenedClosed.ERR_CLOSING_DATE_CONTAINS_UNSAFE_DATES);
        }
      }
    }
  };

  OpenedClosed.prototype._dateBetween = function (date, lowerDate, greaterDate) {
    var items = [date, lowerDate, greaterDate];

    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
      var item = items_1[_i];

      if (!this._isDate(item)) {
        throw new Error(OpenedClosed.ERR_INTERNAL_NOT_DATE);
      }
    }

    if (lowerDate !== greaterDate && lowerDate > greaterDate) {
      throw new Error(OpenedClosed.ERR_INTERNAL_REVERTED_DATES);
    }

    return lowerDate <= date && date <= greaterDate;
  };

  OpenedClosed.prototype._isNull = function (mixed) {
    return mixed === null;
  };

  OpenedClosed.prototype._isUndefined = function (mixed) {
    return mixed === undefined;
  };

  OpenedClosed.prototype._isDate = function (mixed) {
    return !this._isNull(mixed) && !this._isUndefined(mixed) && mixed.constructor === Date;
  };

  OpenedClosed.prototype._isObject = function (mixed) {
    return !this._isNull(mixed) && !this._isUndefined(mixed) && mixed.constructor === Object;
  };

  OpenedClosed.prototype._isArray = function (mixed) {
    return !this._isNull(mixed) && !this._isUndefined(mixed) && mixed.constructor === Array;
  };

  OpenedClosed.prototype._isString = function (mixed) {
    return !this._isNull(mixed) && !this._isUndefined(mixed) && mixed.constructor === String;
  };

  OpenedClosed.prototype._hasOpenings = function () {
    return "openings" in this.options && Object.keys(this.options.openings).length > 0;
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
  OpenedClosed.ERR_CLOSING_DATE_CONTAINS_UNSAFE_DATES = 'keys "from" and "to" have the same date, which is unsafe (if you set the same date for those dates, please precise a different time for both)';
  OpenedClosed.ERR_CLOSINGS_DATE_NOT_OBJECT = "each closing dates should be an object";
  OpenedClosed.ERR_TIME_NOT_CORRECT = "the time is not valid";
  OpenedClosed.ERR_TIME_SHOULD_BE_STRING = "the time should be a string";
  OpenedClosed.ERR_INTERNAL_NOT_DATE = "internal error: invalid date";
  OpenedClosed.ERR_INTERNAL_NOT_ARRAY = "internal error: invalid array";
  OpenedClosed.ERR_INTERNAL_REVERTED_DATES = "internal error: reverted dates";
  OpenedClosed.DEFAULT_LANGUAGE_CLOSED = "closed";
  OpenedClosed.DEFAULT_LANGUAGE_OPENED = "opened";
  return OpenedClosed;
}();

module.exports = OpenedClosed;