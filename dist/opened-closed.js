(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var OpenedClosed =
/** @class */
function () {
  function OpenedClosed(options) {
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

  OpenedClosed.prototype.toString = function () {
    // return this.availability() + " " + this.closeIn();
    return "";
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

  OpenedClosed.prototype._currentHour = function () {
    return this.now.getHours();
  };

  OpenedClosed.prototype._currentMinute = function () {
    return this.now.getMinutes();
  };

  OpenedClosed.prototype._currentSecond = function () {
    return this.now.getSeconds();
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

    var date = year + "-" + month + "-" + day + " " + dateString + " " + (this.options.timezone || "");
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

    if ("opened" in this.options.language === false) {
      this.options.language.opened = "opened";
    }

    if ("closed" in this.options.language === false) {
      this.options.language.closed = "closed";
    }
  };

  return OpenedClosed;
}();

module.exports = OpenedClosed;
},{}]},{},[1])