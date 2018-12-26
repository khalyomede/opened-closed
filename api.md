# API

Technical documentation for end developpers.

## Summary

- [OpenedClosed](#OpenedClosed)
- [OpenedClosed.opened()](#opened)
- [OpenedClosed.availability()](#availability)
- [OpenedClosed.closeIn()](#closeIn)
- [OpenedClosed.closeAt()](#closeAt)
### OpenedClosed

Provides store availabiltiy, near-to-close information and more.

#### Available since version

0.1.0

#### Parameters

| Variable         | Description                                      | Type   |
| ---------------- | ------------------------------------------------ | ------ |
| options          | The settings.                                    | Object |
| options.timezone | The timezone (in any format that Date supports). | String |
| options.openings | The openings hours.                              | Object |
| options.closings | The closings hours.                              | Array  |

#### Returns

OpenedClosed

#### Examples

```javascript
const store = new OpenedClosed({
  timezone: 'GMT+0100',
  openings: {
    monday: [
      { start: '10:00', end: '13:00' },
      { start: '15:00', end: '18:00' }
    ],
    wednesday: [
      { start: '08:00:00', end: '16:59:59' }
    ]
  }
});
```
```javascript
const store = new OpenedClosed({
  timezone: 'GMT+0100',
  openings: {
    monday: [
      { start: '10:00', end: '18:00' }
    ]
  },
  closings: [
    {
      reason: 'Christmas',
      from: new Date('2018-12-25 00:00:00 GMT+0100'),
      to: new Date('2018-12-25 23:59:00 GMT+0100')
    },
    {
      from: new Date('2018-12-31 00:00:00 GMT+0100'),
      to: new Date('2019-01-01 23:59:00 GMT+0100')
    }
  ]
});
```
```javascript
const store = new OpenedClosed({
  timezone: 'GMT+0100',
  openings: {
    monday: [
      { start: '10:00', end: '18:00' }
    ]
  },
  language: {
    opened: 'ouvert',
    closed: 'fermé'
  }
});
```
[back to menu](#summary)
### opened

Returns true if the store is opened right now, else returns false.

#### Available since version

0.1.0

#### Parameters

None.

#### Returns

Boolean

#### Examples

```javascript
const store = new OpenedClosed({
  'timezone': 'GMT+0100'
});

store.opened();
```
[back to menu](#summary)
### availability

Returns "opened" or "closed" (or the equivalent set in the language options) depending the store is opened right now or not.

#### Available since version

0.1.0

#### Parameters

None.

#### Returns

String

#### Examples

```javascript
const store = new OpenedClosed({
  timezone: 'GMT+0100'
});

console.log(store.availability());
```
[back to menu](#summary)
### closeIn

Returns the number of seconds before the store will close.

#### Available since version

0.1.0

#### Parameters

None.

#### Returns

Integer

#### Examples

```javascript
const store = new OpenedClosed({
  timezone: 'GMT+0100'
});

if(store.opened()) {
  console.log(store.closeIn());
}
```
[back to menu](#summary)
### closeAt

Returns a Date when the store is about to close. Note that if the store is already closed, this will return now as a Date.

#### Available since version

0.1.0

#### Parameters

None.

#### Returns

Date

#### Examples

```javascript
const store = new OpenedClosed({
  timezone: 'GMT+0100'
});

if(store.opened()) {
  console.log(store.closeAt());
}
```
[back to menu](#summary)
