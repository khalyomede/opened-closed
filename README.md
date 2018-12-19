# Opened Closed

Provides availabiltiy and near-to-close information from periods.

```javascript
const store = new OpenedClosed({
  attendances: [
    { day: 'monday', start: '10:00:00', end: '13:00:00' },
    { day: 'monday', start: '15:00:00', end: '18:00:00' }
  ]
});

// Now we are 11:30:09

console.log(store.availability());
```

```bash
"opened"
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

or with Yarn

```bash
yarn add opened-closed@0.*
```

2. Import it in your script:

```bash
const OpenedClosed = require('opened-closed');
```

or with ES6

```bash
import * as OpenedClosed from "opened-closed";
```

## Usage

- [Example 1: getting started](#example-1-getting-started)

### Example 1: getting started

```javascript
const OpenedClosed = require("opened-closed");

const availability = new OpenedClosed({
  attendances: [
    { day: "monday", start: "10:00:00", end: "13:00:00" },
    { day: "monday", start: "15:00:00", end: "18:00:00" }
  ]
}).toString();

console.log(availability); // "opened"
```