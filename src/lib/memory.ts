/**
 * memory.ts — Agent memory architecture for Driftwatch's Gemini agent
 *
 * Memory is classified into four tiers, matching Google/Anthropic 2025
 * production agent patterns:
 *
 *  ┌─────────────────────────────────────────────────────────┐
 *  │  TIER 0: Context Window   (managed by Gemini, ephemeral) │
 *  │  TIER 1: Working Memory   (session, in-memory ring buf)  │
 *  │  TIER 2: Episodic Memory  (session events, queryable)    │
 *  │  TIER 3: Semantic Memory  (persistent facts, future ext) │
 *  └─────────────────────────────────────────────────────────┘
 *
 * Usage:
 *   import { memory } from '@/lib/memory'
 *   memory.working.push({ role: 'user', content: '...' })
 *   memory.working.window(8)          // last 8 turns for context
 *   memory.episodic.record(event)      // log a drift event
 *   memory.episodic.query({ type })    // retrieve by type
 *   memory.semantic.set(key, value)    // store a persistent fact
 *   memory.semantic.get(key)           // retrieve a fact
 *   memory.stats()                     // audit memory pressure
 */

import { trace } from './trace';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface ConversationTurn {
  role: MessageRole;
  content: string;
  ts: string;
  traceId?: string;
  tokenEstimate?: number;
}

export type EpisodicEventType =
  | 'drift_detected'
  | 'cognition_complete'
  | 'tool_result'
  | 'scene_update'
  | 'user_intent'
  | 'error_recovered';

export interface EpisodicEvent {
  id: string;
  type: EpisodicEventType;
  ts: string;
  traceId: string;
  payload: Record<string, unknown>;
  /** Salience 0–1: higher = more likely to survive eviction */
  salience: number;
}

export interface SemanticFact {
  key: string;
  value: unknown;
  updatedAt: string;
  source: 'agent' | 'user' | 'system';
  /** Confidence 0–1 */
  confidence: number;
}

// ─── Tier 1: Working Memory ───────────────────────────────────────────────────

const WORKING_MAX_TURNS = 32;

const workingMemory = {
  _turns: [] as ConversationTurn[],

  push(turn: Omit<ConversationTurn, 'ts'>): void {
    const full: ConversationTurn = { ...turn, ts: new Date().toISOString() };
    this._turns.push(full);
    if (this._turns.length > WORKING_MAX_TURNS) {
      // Evict oldest non-system turn
      const idx = this._turns.findIndex((t) => t.role !== 'system');
      if (idx !== -1) {
        const evicted = this._turns.splice(idx, 1)[0];
        trace.memory({ op: 'evict', key: `working:turn:${evicted.ts}`, bytes: evicted.content.length * 2 });
      }
    }
    trace.memory({ op: 'write', key: `working:turn:${full.ts}`, bytes: full.content.length * 2 });
  },

  /** Return the last N turns — the context window slice for Gemini */
  window(n = 8): ConversationTurn[] {
    const slice = this._turns.slice(-n);
    trace.memory({ op: 'read', key: `working:window:${n}`, hit: slice.length > 0 });
    return slice;
  },

  /** System prompt — always prepended, never evicted */
  setSystem(content: string): void {
    this._turns = this._turns.filter((t) => t.role !== 'system');
    this._turns.unshift({ role: 'system', content, ts: new Date().toISOString() });
  },

  clear(): void {
    this._turns = [];
  },

  get size(): number {
    return this._turns.length;
  },
};

// ─── Tier 2: Episodic Memory ──────────────────────────────────────────────────

const EPISODIC_MAX = 200;

let _episodicSeq = 0;

const episodicMemory = {
  _events: [] as EpisodicEvent[],

  record(opts: Omit<EpisodicEvent, 'id' | 'ts' | 'traceId'>): EpisodicEvent {
    const event: EpisodicEvent = {
      id: `ep-${++_episodicSeq}`,
      ts: new Date().toISOString(),
      traceId: trace.id,
      ...opts,
    };
    this._events.push(event);
    // Evict lowest-salience events when over capacity
    if (this._events.length > EPISODIC_MAX) {
      this._events.sort((a, b) => b.salience - a.salience);
      const evicted = this._events.splice(EPISODIC_MAX);
      evicted.forEach((e) =>
        trace.memory({ op: 'evict', key: `episodic:${e.id}` })
      );
    }
    trace.memory({ op: 'write', key: `episodic:${event.id}` });
    return event;
  },

  /** Query events by type, recency, or minimum salience */
  query(opts: {
    type?: EpisodicEventType;
    since?: string;     // ISO timestamp
    minSalience?: number;
    limit?: number;
  }): EpisodicEvent[] {
    let results = this._events;
    if (opts.type)         results = results.filter((e) => e.type === opts.type);
    if (opts.since)        results = results.filter((e) => e.ts >= opts.since!);
    if (opts.minSalience)  results = results.filter((e) => e.salience >= opts.minSalience!);
    const out = results.slice(-(opts.limit ?? 20));
    trace.memory({ op: 'read', key: `episodic:query`, hit: out.length > 0 });
    return out;
  },

  get size(): number {
    return this._events.length;
  },

  clear(): void {
    this._events = [];
  },
};

// ─── Tier 3: Semantic Memory ──────────────────────────────────────────────────
// Persistent facts the agent builds about the environment.
// Current impl: in-memory Map. Future: replace backing store with
// IndexedDB (browser persistence) or a Vercel KV store without
// changing the public API.

const semanticMemory = {
  _facts: new Map<string, SemanticFact>(),

  set(key: string, value: unknown, opts?: { source?: SemanticFact['source']; confidence?: number }): void {
    const fact: SemanticFact = {
      key,
      value,
      updatedAt: new Date().toISOString(),
      source: opts?.source ?? 'agent',
      confidence: opts?.confidence ?? 1.0,
    };
    this._facts.set(key, fact);
    trace.memory({ op: 'write', key: `semantic:${key}` });
  },

  get(key: string): unknown | undefined {
    const fact = this._facts.get(key);
    trace.memory({ op: 'read', key: `semantic:${key}`, hit: fact !== undefined });
    return fact?.value;
  },

  has(key: string): boolean {
    return this._facts.has(key);
  },

  delete(key: string): void {
    if (this._facts.has(key)) {
      this._facts.delete(key);
      trace.memory({ op: 'evict', key: `semantic:${key}` });
    }
  },

  all(): SemanticFact[] {
    return Array.from(this._facts.values());
  },

  get size(): number {
    return this._facts.size;
  },
};

// ─── Memory pressure audit ────────────────────────────────────────────────────

export function memoryStats() {
  return {
    working: { size: workingMemory.size, max: WORKING_MAX_TURNS },
    episodic: { size: episodicMemory.size, max: EPISODIC_MAX },
    semantic: { size: semanticMemory.size },
  };
}

// ─── Public facade ────────────────────────────────────────────────────────────

export const memory = {
  working: workingMemory,
  episodic: episodicMemory,
  semantic: semanticMemory,
  stats: memoryStats,
};
