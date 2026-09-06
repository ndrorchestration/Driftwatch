import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { detectScoreSeries, DETECTOR_NAME, DETECTOR_VERSION } from '../src/detector/changeDetector';

const fixturePath = new URL('../docs/fixtures/detector-benchmark-v1.json', import.meta.url);
const fixtureBytes = await readFile(fixturePath);
const fixture = JSON.parse(fixtureBytes.toString('utf8'));
const implementationCommit = process.env.BENCHMARK_IMPLEMENTATION_COMMIT;
if (!implementationCommit || !/^[a-f0-9]{40}$/.test(implementationCommit)) {
  throw new Error('BENCHMARK_IMPLEMENTATION_COMMIT must be an exact 40-character Git SHA.');
}

// Predeclared decision-layer configuration for this synthetic plumbing fixture.
// It is intentionally reported as uncalibrated and MUST NOT be promoted to a
// validated operating threshold for real Driftwatch telemetry.
const configuration = Object.freeze({ threshold: 0.5, persistence: 1 });
const detections = detectScoreSeries(fixture.cases.map((item: { signal: number }) => item.signal), configuration);

const cases = fixture.cases.map((item: { id: string; class: string; signal: number; expected_drift: boolean }, index: number) => ({
  id: item.id,
  class: item.class,
  signal: item.signal,
  expected_drift: item.expected_drift,
  predicted_drift: detections[index].drift,
  correct: detections[index].drift === item.expected_drift,
}));

const negatives = cases.filter((item) => !item.expected_drift);
const positives = cases.filter((item) => item.expected_drift);
const falsePositives = negatives.filter((item) => item.predicted_drift).length;
const falseNegatives = positives.filter((item) => !item.predicted_drift).length;

const result = {
  protocol: fixture.protocol,
  fixture_status: fixture.status,
  scope: 'synthetic decision-layer plumbing only; not detector-effectiveness evidence',
  implementation_commit: implementationCommit,
  fixture_sha256: createHash('sha256').update(fixtureBytes).digest('hex'),
  detector: { name: DETECTOR_NAME, version: DETECTOR_VERSION },
  configuration: {
    signal: 'fixture-provided scalar candidate score; multivariate score derivation is not exercised by this fixture',
    threshold: configuration.threshold,
    persistence: configuration.persistence,
  },
  cases,
  summary: {
    negative_cases: negatives.length,
    positive_cases: positives.length,
    false_positives: falsePositives,
    false_negatives: falseNegatives,
    false_positive_rate: negatives.length ? falsePositives / negatives.length : null,
    false_negative_rate: positives.length ? falseNegatives / positives.length : null,
  },
  calibration: {
    status: 'uncalibrated',
    dataset: null,
    note: 'Threshold 0.5 is a predeclared synthetic fixture decision boundary, not a calibrated Driftwatch production threshold.',
  },
  limitations: [
    'Fixture labels and scalar signals are synthetic and intentionally separable.',
    'The fixture validates benchmark plumbing and decision semantics only.',
    'The multivariate normalized-change score requires a separately frozen telemetry corpus for effectiveness evaluation.',
    'No claim about real-world precision, recall, calibration, or superiority is supported by this result.',
  ],
};

await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/benchmark-result.json', import.meta.url), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result.summary));
