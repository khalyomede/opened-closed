"use strict";

var OpenedClosed =
/** @class */
function () {
  function OpenedClosed(options) {
    if (options === undefined || options === null || options.constructor !== Object) {
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

  OpenedClosed.prototype.opened = function () {
    var opened = false;

    var now = this._now();

    for (var day in this.options.openings) {
      var openings = this.options.openings[day];

      if (this._nowIsTheDay(day) === true) {
        for (var _i = 0, openings_1 = openings; _i < openings_1.length; _i++) {
          var opening = openings_1[_i];

          var start = this._getDateFromString(opening.start, day);

          var end = this._getDateFromString(opening.end, day);

          if (start <= now && now <= end) {
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

      if (this._nowIsTheDay(day) === true) {
        for (var _i = 0, openings_2 = openings; _i < openings_2.length; _i++) {
          var opening = openings_2[_i];

          var start = this._getDateFromString(opening.start, day);

          var end = this._getDateFromString(opening.end, day);

          if (start <= now && now <= end) {
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
    var year = this._currentYear();

    var month = this._currentMonth();

    var day = this._currentDay();

    var date = this._currentDate({
      year: year,
      month: month,
      day: day,
      time: dateString
    });

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

    if (language === null || language === undefined || language.constructor !== Object) {
      throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_NOT_OBJECT);
    }

    if ("opened" in this.options.language === false) {
      this.options.language.opened = OpenedClosed.DEFAULT_LANGUAGE_OPENED;
    }

    var opened = this.options.language.opened;

    if (opened === null || opened === undefined || opened.constructor !== String) {
      throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_NOT_STRING);
    }

    if (opened.trim().length === 0) {
      throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_EMPTY);
    }

    if ("closed" in this.options.language === false) {
      this.options.language.closed = OpenedClosed.DEFAULT_LANGUAGE_CLOSED;
    }

    var closed = this.options.language.closed;

    if (closed === null || closed === undefined || closed.constructor !== String) {
      throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_CLOSED_NOT_STRING);
    }

    if (closed.trim().length === 0) {
      throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_CLOSED_EMPTY);
    }
  };

  OpenedClosed.prototype._dateToEpoch = function (date) {
    if (date === null || date === undefined || date.constructor !== Date) {
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
    if (numbers === null || numbers === undefined || numbers.constructor !== Array) {
      throw new Error(OpenedClosed.ERR_INTERNAL_NOT_ARRAY);
    }

    return numbers.length === 0 ? 0 : Math.max.apply(Math, numbers);
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
  OpenedClosed.ERR_INTERNAL_NOT_DATE = "internal error: invalid date";
  OpenedClosed.ERR_INTERNAL_NOT_ARRAY = "internal error: invalid array";
  OpenedClosed.DEFAULT_LANGUAGE_CLOSED = "closed";
  OpenedClosed.DEFAULT_LANGUAGE_OPENED = "opened";
  return OpenedClosed;
}();

module.exports = OpenedClosed;