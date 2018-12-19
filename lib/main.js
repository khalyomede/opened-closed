"use strict";
var OpenedClosed = /** @class */ (function () {
    function OpenedClosed(options) {
        if (options === undefined ||
            options === null ||
            options.constructor !== Object) {
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
        var availability = this.options.language.closed || "closed";
        if (this.opened() === true) {
            availability = this.options.language.opened || "opened";
        }
        return availability;
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
    OpenedClosed.prototype._getDateFromString = function (dateString, dayString) {
        var year = this._currentYear();
        var month = this._currentMonth();
        var day = this._currentDay();
        var date = year + "-" + month + "-" + day + " " + dateString + " " + (this.options
            .timezone || "");
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
        if (language === null ||
            language === undefined ||
            language.constructor !== Object) {
            throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_NOT_OBJECT);
        }
        if ("opened" in this.options.language === false) {
            this.options.language.opened = "opened";
        }
        var opened = this.options.language.opened;
        if (opened === null ||
            opened === undefined ||
            opened.constructor !== String) {
            throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_NOT_STRING);
        }
        if (opened.trim().length === 0) {
            throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_EMPTY);
        }
        if ("closed" in this.options.language === false) {
            this.options.language.closed = "closed";
        }
        var closed = this.options.language.closed;
        if (closed === null ||
            closed === undefined ||
            closed.constructor !== String) {
            throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_CLOSED_NOT_STRING);
        }
        if (closed.trim().length === 0) {
            throw new Error(OpenedClosed.ERR_OPTIONS_LANGUAGE_CLOSED_EMPTY);
        }
    };
    OpenedClosed.ERR_OPTIONS_NOT_OBJECT = "expected parameter 1 to be an object";
    OpenedClosed.ERR_OPTIONS_EMPTY = "options is empty";
    OpenedClosed.ERR_OPTIONS_MISSING_TIMEZONE = "options is missing timezone";
    OpenedClosed.ERR_OPTIONS_LANGUAGE_NOT_OBJECT = "language options should be an object";
    OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_NOT_STRING = "opened language is string";
    OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_EMPTY = "opened language is empty";
    OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_NOT_STRING = "closed language is string";
    OpenedClosed.ERR_OPTIONS_LANGUAGE_OPENED_EMPTY = "closed language is empty";
    return OpenedClosed;
}());
module.exports = OpenedClosed;
