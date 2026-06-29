/**
 * src/lib/index.ts — barrel export for all agent infrastructure
 *
 * import { env, memory, trace, memoryStats } from '@/lib'
 */
export { env } from './env';
export { memory, memoryStats } from './memory';
export { trace } from './trace';
export type { TraceEvent, TraceEventType, TraceLevel } from './trace';
export type { ConversationTurn, EpisodicEvent, EpisodicEventType, SemanticFact } from './memory';
export type { Env } from './env';
