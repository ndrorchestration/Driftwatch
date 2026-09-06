// App.tsx currently owns the narrow global ImportMeta.env declaration used by
// this application. Do not also import Vite's competing global declaration
// here; doing so creates a duplicate `env` property with an incompatible type.

declare const now: number;
