# Opened Closed

![](https://img.shields.io/codeship/ca85c7c0-e8cc-0136-0c9e-7620f6fdb86b.svg)
[![Coverage Status](https://coveralls.io/repos/github/khalyomede/opened-closed/badge.svg?branch=master)](https://coveralls.io/github/khalyomede/opened-closed?branch=master)
![Mutations](https://img.shields.io/badge/mutations-0.00%25-brightgreen.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/khalyomede/opened-closed/badge.svg?targetFile=package.json)](https://snyk.io/test/github/khalyomede/opened-closed?targetFile=package.json)

Provides availabiltiy and near-to-close information from periods.

```javascript
const OpenedClosed = require("opened-closed");

const store = new OpenedClosed({
  timezone: "GMT+0100",
  openings: {
    monday: [
      { start: "10:00", end: "13:00" },
      { start: "15:00", end: "18:00" }
    ]
  }
});

console.log(store.opened());
```

## Summary

- [Installation](#installation)
- [Usage](#usage)

## Installation

- [Web](#web)
- [NPM](#npm)

### Web

Include the following script in your project:

```html
<script type="text/javascript" src="https://github.com/khalyomede/opened-closed/blob/master/dist/opened-closed.min.js"></script>
```

### NPM

1. Include Opened Closed in your dependencies:

```bash
npm install --save opened-closed@0.*
```

2. Import it in your script:

```bash
const OpenedClosed = require('opened-closed');
```

## Usage

All the examples can be found in the folder `example` of this repository.

- [Example 1: checking if a store is opened now](#example-1-checking-if-a-store-is-opened-now)

### Example 1: checking if a store is opened now

```javascript
const OpenedClosed = require("../lib/main");

const store = new OpenedClosed({
  timezone: "GMT+0100",
  openings: {
    monday: [
      { start: "10:00", end: "13:00" },
      { start: "15:00", end: "18:00" }
    ]
  }
});

console.log(store.opened());
```

### Example 2: adding exceptional closings dates

```javascript
const OpenedClosed = require("opened-closed");

const store = new OpenedClosed({
  timezone: "GMT+0100",
  openings: {
    monday: [
      { start: "10:00", end: "13:00" },
      { start: "15:00", end: "18:00" }
    ],
    tuesday: [
      { start: "10:00", end: "13:00" },
      { start: "15:00", end: "18:00" }
    ]
  },
  closings: [
    {
      reason: "Christmas", // optional
      from: new Date("2018-12-25 00:00:00 GMT+0100"),
      to: new Date("2018-12-25 23:59:59 GMT+0100")
    }
  ]
});
```

### Example 3: getting the opening state as a string

```javascript
const OpenedClosed = require("opened-closed");

const store = new OpenedClosed({
  timezone: "GMT+0100",
  openings: {
    monday: [
      { start: "10:00", end: "13:00" },
      { start: "15:00", end: "18:00" }
    ]
  }
});

console.log(store.availability());
```

### Example 4: changing the language

```javascript
const OpenedClosed = require("../lib/main");

const store = new OpenedClosed({
  timezone: "GMT+0100",
  openings: {
    monday: [
      { start: "10:00", end: "13:00" },
      { start: "15:00", end: "18:00" }
    ]
  },
  language: {
    opened: "ouvert",
    closed: "fermé"
  }
});

console.log(store.availability());
```

### Example 5: get the "store closes in" in seconds

```javascript
const OpenedClosed = require("../lib/main");

const store = new OpenedClosed({
  timezone: "GMT+0100",
  openings: {
    monday: [
      { start: "10:00", end: "13:00" },
      { start: "15:00", end: "18:00" }
    ]
  }
});

if (store.opened()) {
  console.log("closes in", store.closeIn());
} else {
  console.log(store.availability());
}
```