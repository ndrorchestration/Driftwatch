import test from 'node:test';
import assert from 'node:assert/strict';
import { detectScoreSeries, normalizedChangeScore } from '../src/detector/changeDetector';

test('normalized change score follows the documented RMS z-score definition', () => {
  const score = normalizedChangeScore([2, 4], [1, 2], [1, 2]);
  assert.ok(Math.abs(score - 1) < 1e-12);
});

test('persistence requires consecutive threshold exceedances', () => {
  const result = detectScoreSeries([0.2, 0.7, 0.8, 0.1, 0.9], { threshold: 0.5, persistence: 2 });
  assert.deepEqual(result.map((item) => item.drift), [false, false, true, false, false]);
});

test('threshold equality is not an exceedance', () => {
  assert.equal(detectScoreSeries([0.5], { threshold: 0.5, persistence: 1 })[0].drift, false);
});

test('invalid detector dimensions fail closed', () => {
  assert.throws(() => normalizedChangeScore([1], [1, 2], [1]), /equal length/);
});
