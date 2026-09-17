import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  distanceFromSpeedTime,
  speedFromDistanceTime,
  timeHoursFromDistanceSpeed,
  parseDuration,
  formatDuration,
  encodeState,
  decodeState,
} from './cycling.ts';

test('distanceFromSpeedTime multiplies speed by time in hours', () => {
  assert.equal(distanceFromSpeedTime(20, 1.5), 30);
});

test('speedFromDistanceTime divides distance by time in hours', () => {
  assert.equal(speedFromDistanceTime(30, 1.5), 20);
});

test('speedFromDistanceTime returns null for non-positive time', () => {
  assert.equal(speedFromDistanceTime(30, 0), null);
});

test('timeHoursFromDistanceSpeed divides distance by speed', () => {
  assert.equal(timeHoursFromDistanceSpeed(30, 20), 1.5);
});

test('timeHoursFromDistanceSpeed returns null for non-positive speed', () => {
  assert.equal(timeHoursFromDistanceSpeed(30, 0), null);
});

test('the three formulas round-trip consistently', () => {
  const speed = 22;
  const timeHours = 2.25;
  const distance = distanceFromSpeedTime(speed, timeHours);
  assert.ok(Math.abs((speedFromDistanceTime(distance, timeHours) ?? NaN) - speed) < 1e-9);
  assert.ok(Math.abs((timeHoursFromDistanceSpeed(distance, speed) ?? NaN) - timeHours) < 1e-9);
});

test('parseDuration reads h:mm format', () => {
  assert.equal(parseDuration('1:30'), 5400);
});

test('parseDuration reads h:mm:ss format', () => {
  assert.equal(parseDuration('1:30:00'), 5400);
});

test('parseDuration reads a plain number of seconds', () => {
  assert.equal(parseDuration('5400'), 5400);
});

test('formatDuration renders hours and minutes', () => {
  assert.equal(formatDuration(5400), '1:30');
});

test('encodeState/decodeState round-trips every field', () => {
  const state = { mode: 'distance', unit: 'kmh', speed: 20, distance: 30, timeSeconds: 5400 };
  const params = encodeState(state);
  const fallback = { mode: 'time', unit: 'mph', speed: 0, distance: 0, timeSeconds: 0 };
  assert.deepEqual(decodeState(params, fallback), state);
});

test('decodeState falls back to the default for corrupted data', () => {
  const params = new URLSearchParams();
  params.set('d', 'garbage!!!');
  const fallback = { mode: 'distance', unit: 'kmh', speed: 20, distance: 30, timeSeconds: 5400 };
  assert.deepEqual(decodeState(params, fallback), fallback);
});
