/**
 * trace.ts — Agent trace logger
 * Every cognition cycle, tool call, memory read/write, and error
 * emits a structured TraceEvent. In dev: console table. In prod:
 * structured JSON lines ready for Vercel log drain / Datadog / etc.
 *
 * Usage:
 *   import { trace } from '@/lib/trace'
 *   trace.cognition({ input, output, model, durationMs })
 *   trace.tool({ name, input, output, durationMs })
 *   trace.memory({ op: 'read' | 'write' | 'evict', key, bytes })
 *   trace.error({ error, context })
 */

export type TraceLevel = 'debug' | 'info' | 'warn' | 'error';

export type TraceEventType =
  | 'cognition'
  | 'tool_call'
  | 'memory_read'
  | 'memory_write'
  | 'memory_evict'
  | 'agent_start'
  | 'agent_stop'
  | 'error';

export interface TraceEvent {
  /** ISO timestamp */
  ts: string;
  /** Monotonic session counter for ordering */
  seq: number;
  /** Correlation ID — same ID groups a full planner→executor→verifier cycle */
  traceId: string;
  type: TraceEventType;
  level: TraceLevel;
  /** Duration in ms for timed operations */
  durationMs?: number;
  /** Arbitrary structured payload */
  payload: Record<string, unknown>;
}

// ─── Internal state ──────────────────────────────────────────────────────────

let _seq = 0;
let _currentTraceId = generateTraceId();
const _isDev = import.meta.env.MODE !== 'production';

/** In-memory ring buffer — last 500 events, useful for debug panels */
const _buffer: TraceEvent[] = [];
const BUFFER_MAX = 500;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateTraceId(): string {
  return `dw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function emit(event: TraceEvent): void {
  // Ring buffer
  if (_buffer.length >= BUFFER_MAX) _buffer.shift();
  _buffer.push(event);

  if (_isDev) {
    // Human-readable dev output
    const style = event.level === 'error' ? 'color:red' :
                  event.level === 'warn'  ? 'color:orange' :
                  event.level === 'info'  ? 'color:cyan' : 'color:gray';
    console.groupCollapsed(
      `%c[trace:${event.type}] ${event.ts.slice(11, 23)} seq=${event.seq} trace=${event.traceId}`,
      style
    );
    console.table(event.payload);
    if (event.durationMs !== undefined) console.log(`⏱ ${event.durationMs}ms`);
    console.groupEnd();
  } else {
    // Production: structured JSON line for log drain
    console.log(JSON.stringify(event));
  }
}

function makeEvent(
  type: TraceEventType,
  level: TraceLevel,
  payload: Record<string, unknown>,
  durationMs?: number
): TraceEvent {
  return {
    ts: new Date().toISOString(),
    seq: ++_seq,
    traceId: _currentTraceId,
    type,
    level,
    durationMs,
    payload,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const trace = {
  /** Start a new trace context (call at the top of each cognition cycle) */
  newCycle(): string {
    _currentTraceId = generateTraceId();
    return _currentTraceId;
  },

  /** Current trace ID — for attaching to external requests */
  get id(): string {
    return _currentTraceId;
  },

  /** Log a full cognition round-trip */
  cognition(opts: {
    model: string;
    inputTokens?: number;
    outputTokens?: number;
    input: string;
    output: string;
    durationMs: number;
  }): void {
    emit(makeEvent('cognition', 'info', opts as Record<string, unknown>, opts.durationMs));
  },

  /** Log a tool call */
  tool(opts: {
    name: string;
    input: unknown;
    output: unknown;
    durationMs: number;
    success: boolean;
  }): void {
    emit(makeEvent('tool_call', opts.success ? 'info' : 'warn', opts as Record<string, unknown>, opts.durationMs));
  },

  /** Log a memory operation */
  memory(opts: {
    op: 'read' | 'write' | 'evict';
    key: string;
    bytes?: number;
    hit?: boolean;
  }): void {
    const type: TraceEventType =
      opts.op === 'read'  ? 'memory_read' :
      opts.op === 'write' ? 'memory_write' : 'memory_evict';
    emit(makeEvent(type, 'debug', opts as Record<string, unknown>));
  },

  /** Log agent lifecycle */
  lifecycle(event: 'start' | 'stop', meta?: Record<string, unknown>): void {
    const type: TraceEventType = event === 'start' ? 'agent_start' : 'agent_stop';
    emit(makeEvent(type, 'info', meta ?? {}));
  },

  /** Log an error with full context */
  error(opts: { error: unknown; context?: Record<string, unknown> }): void {
    const payload = {
      message: opts.error instanceof Error ? opts.error.message : String(opts.error),
      stack: opts.error instanceof Error ? opts.error.stack : undefined,
      ...opts.context,
    };
    emit(makeEvent('error', 'error', payload));
  },

  /** Return a copy of the ring buffer (dev tools / debug panel) */
  dump(): TraceEvent[] {
    return [..._buffer];
  },

  /** Clear the buffer */
  flush(): void {
    _buffer.length = 0;
  },
};
