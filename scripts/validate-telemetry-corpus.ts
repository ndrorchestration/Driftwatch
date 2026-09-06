import fs from 'node:fs';
import path from 'node:path';

type Manifest = {
  schema: string;
  corpusId: string;
  status: string;
  provenance: {
    sourceDescription: string;
    collectedAt: string;
    collector: string;
    immutableDigest?: string;
  };
  dimensions: string[];
  cases: Array<{
    id: string;
    split: 'calibration' | 'evaluation';
    label: 'baseline' | 'drift';
    labelSource: string;
    detectorIndependentLabel: boolean;
    perturbationType?: string;
    telemetryPath?: string;
  }>;
};

function fail(message: string): never {
  console.error(`telemetry-corpus validation failed: ${message}`);
  process.exit(1);
}

const manifestPath = process.argv[2];
if (!manifestPath) fail('manifest path argument is required');

const absolute = path.resolve(manifestPath);
if (!fs.existsSync(absolute)) fail(`manifest does not exist: ${manifestPath}`);

let manifest: Manifest;
try {
  manifest = JSON.parse(fs.readFileSync(absolute, 'utf8')) as Manifest;
} catch {
  fail('manifest is not valid JSON');
}

if (manifest.schema !== 'driftwatch.real-telemetry-corpus.v1') fail('unsupported schema');
if (!manifest.corpusId?.trim()) fail('corpusId is required');
if (!manifest.status?.trim()) fail('status is required');
if (!manifest.provenance?.sourceDescription?.trim()) fail('provenance.sourceDescription is required');
if (!manifest.provenance?.collectedAt?.trim()) fail('provenance.collectedAt is required');
if (!manifest.provenance?.collector?.trim()) fail('provenance.collector is required');
if (!Array.isArray(manifest.dimensions) || manifest.dimensions.length === 0) fail('at least one telemetry dimension is required');
if (new Set(manifest.dimensions).size !== manifest.dimensions.length) fail('telemetry dimensions must be unique');
if (!Array.isArray(manifest.cases) || manifest.cases.length === 0) fail('at least one case is required');

const ids = new Set<string>();
for (const item of manifest.cases) {
  if (!item.id?.trim()) fail('every case requires an id');
  if (ids.has(item.id)) fail(`duplicate case id: ${item.id}`);
  ids.add(item.id);
  if (!['calibration', 'evaluation'].includes(item.split)) fail(`invalid split for ${item.id}`);
  if (!['baseline', 'drift'].includes(item.label)) fail(`invalid label for ${item.id}`);
  if (!item.labelSource?.trim()) fail(`labelSource is required for ${item.id}`);
  if (item.detectorIndependentLabel !== true) fail(`label for ${item.id} is not explicitly detector-independent`);
}

const calibration = manifest.cases.filter((x) => x.split === 'calibration');
const evaluation = manifest.cases.filter((x) => x.split === 'evaluation');
if (calibration.length === 0) fail('at least one calibration case is required');
if (evaluation.length === 0) fail('at least one held-out evaluation case is required');
if (!calibration.some((x) => x.label === 'baseline') || !calibration.some((x) => x.label === 'drift')) {
  fail('calibration split must include both baseline and drift labels');
}
if (!evaluation.some((x) => x.label === 'baseline') || !evaluation.some((x) => x.label === 'drift')) {
  fail('evaluation split must include both baseline and drift labels');
}

if (manifest.status === 'representative-frozen' && !manifest.provenance.immutableDigest?.match(/^sha256:[0-9a-f]{64}$/)) {
  fail('representative-frozen corpora require a sha256 immutableDigest');
}

console.log(JSON.stringify({
  valid: true,
  schema: manifest.schema,
  corpusId: manifest.corpusId,
  status: manifest.status,
  dimensions: manifest.dimensions.length,
  cases: manifest.cases.length,
  calibrationCases: calibration.length,
  evaluationCases: evaluation.length,
  evidenceBoundary: manifest.status === 'schema-example-only'
    ? 'schema example only; not detector-effectiveness evidence'
    : 'manifest structure validated; detector effectiveness requires execution and analysis',
}, null, 2));
