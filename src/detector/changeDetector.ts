export interface DetectorConfig {
  threshold: number;
  persistence: number;
}

export interface Detection {
  score: number;
  drift: boolean;
  consecutiveAboveThreshold: number;
}

export const DETECTOR_NAME = 'transparent-normalized-change';
export const DETECTOR_VERSION = '0.1.0';

export function normalizedChangeScore(
  vector: number[],
  baselineMean: number[],
  baselineScale: number[],
  epsilon = 1e-9,
): number {
  if (!vector.length || vector.length !== baselineMean.length || vector.length !== baselineScale.length) {
    throw new TypeError('vector, baselineMean, and baselineScale must be non-empty arrays with equal length.');
  }
  if (!Number.isFinite(epsilon) || epsilon <= 0) throw new TypeError('epsilon must be positive and finite.');

  let sumSquares = 0;
  for (let index = 0; index < vector.length; index += 1) {
    const value = vector[index];
    const mean = baselineMean[index];
    const scale = baselineScale[index];
    if (![value, mean, scale].every(Number.isFinite)) throw new TypeError('detector vectors must contain finite numbers.');
    const z = (value - mean) / Math.max(Math.abs(scale), epsilon);
    sumSquares += z * z;
  }
  return Math.sqrt(sumSquares) / Math.sqrt(vector.length);
}

export function detectScoreSeries(scores: number[], config: DetectorConfig): Detection[] {
  if (!Array.isArray(scores)) throw new TypeError('scores must be an array.');
  if (!Number.isFinite(config.threshold) || config.threshold < 0) throw new TypeError('threshold must be finite and non-negative.');
  if (!Number.isInteger(config.persistence) || config.persistence < 1) throw new TypeError('persistence must be an integer >= 1.');

  let consecutive = 0;
  return scores.map((score) => {
    if (!Number.isFinite(score) || score < 0) throw new TypeError('scores must contain finite non-negative numbers.');
    consecutive = score > config.threshold ? consecutive + 1 : 0;
    return Object.freeze({
      score,
      consecutiveAboveThreshold: consecutive,
      drift: consecutive >= config.persistence,
    });
  });
}
