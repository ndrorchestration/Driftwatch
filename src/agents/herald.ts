/**
 * herald.ts — Agent Herald: Gemini-powered system host for Driftwatch
 *
 * Responsibilities:
 *  · Maintain multi-turn conversation history via memory.working
 *  · Emit structured trace events on every cognition cycle
 *  · Expose a clean `sendMessage()` API consumed by App.tsx
 *
 * Architecture:
 *  · Uses Gemini SDK startChat() for stateful multi-turn sessions
 *  · Working memory window(8) provides the last 8 turns as history
 *  · Each call: trace.newCycle() → Gemini → trace.cognition() → memory.working.push()
 */

import { GoogleGenerativeAI, type ChatSession } from '@google/generative-ai';
import { env } from '../lib/env';
import { memory } from '../lib/memory';
import { trace } from '../lib/trace';

// Herald's identity and operational directives.
// Injected as system instruction (not as a chat turn) so it persists across eviction.
const HERALD_SYSTEM_INSTRUCTION = `
Identity:
You are Agent Herald — the official System Host, Interface Conductor, and
session-facing ceremonial operator for the Driftwatch Synthesis Simulation.
You are the visible host layer that frames the environment, guides the user,
announces state, and preserves clarity across the multi-agent system.

Core Mission:
Make the environment feel lucid, capable, legible, and intelligently governed.

Voice and Tone:
- Calm, authoritative, lucid, ceremonially precise.
- Architecturally literate and user-centered.
- Polished and composed.
- Avoid goofy, over-familiar, or mystical tones.

Operational Precision:
When referencing system state, use the telemetry values provided in each message.
Format structured updates with: Status:, Host Function:, System Reading:, Recommended Next Step:

Behavioral Directives:
- Respond as the Host only.
- Keep responses concise but architecturally aware.
- Never break character.
`.trim();

export interface HeraldSystemState {
  consensus: number;
  spread: number;
  truth: number;
  info: number;
}

class HeraldAgent {
  private genAI: GoogleGenerativeAI;
  private chatSession: ChatSession | null = null;

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.VITE_GEMINI_API_KEY);
    // Seed working memory with Herald's opening message
    memory.working.setSystem(HERALD_SYSTEM_INSTRUCTION);
    trace.lifecycle('start', { agent: 'herald', model: 'gemini-2.5-flash' });
  }

  /** Lazy-init or return existing chat session */
  private getSession(): ChatSession {
    if (!this.chatSession) {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: HERALD_SYSTEM_INSTRUCTION,
      });
      // Rehydrate from working memory so session survives page re-renders
      const history = memory.working
        .window(8)
        .filter((t) => t.role === 'user' || t.role === 'assistant')
        .map((t) => ({
          role: t.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: t.content }],
        }));
      this.chatSession = model.startChat({ history });
    }
    return this.chatSession;
  }

  /** Reset session (e.g. on context overflow or explicit user reset) */
  resetSession(): void {
    this.chatSession = null;
    memory.working.clear();
    memory.working.setSystem(HERALD_SYSTEM_INSTRUCTION);
    trace.lifecycle('stop', { agent: 'herald', reason: 'session_reset' });
    trace.lifecycle('start', { agent: 'herald', model: 'gemini-2.5-flash' });
  }

  /**
   * Send a user message and return Herald's response.
   * Handles memory, tracing, and error recovery internally.
   */
  async sendMessage(userMsg: string, state: HeraldSystemState): Promise<string> {
    const traceId = trace.newCycle();
    const t0 = performance.now();

    // Record user turn in working memory
    memory.working.push({ role: 'user', content: userMsg, traceId });

    // Inject live telemetry into the prompt so Herald can reference exact values
    const augmentedPrompt = `
System Telemetry:
- Consensus: ${(state.consensus * 100).toFixed(0)}%
- Reasoning Spread: ${state.spread.toFixed(2)}
- Truth Level: ${state.truth.toFixed(2)}
- Info Density: ${(state.info * 100).toFixed(0)}%

User Message: "${userMsg}"

Respond as Agent Herald.
    `.trim();

    try {
      const session = this.getSession();
      const result = await session.sendMessage(augmentedPrompt);
      const response = result.response;
      const text = response.text();
      const durationMs = Math.round(performance.now() - t0);

      // Record assistant turn in working memory
      memory.working.push({ role: 'assistant', content: text, traceId });

      // Emit structured cognition trace
      trace.cognition({
        model: 'gemini-2.5-flash',
        input: augmentedPrompt,
        output: text,
        durationMs,
        inputTokens: response.usageMetadata?.promptTokenCount,
        outputTokens: response.usageMetadata?.candidatesTokenCount,
      });

      // Record as episodic event for future memory queries
      memory.episodic.record({
        type: 'cognition_complete',
        payload: { userMsg, responseLength: text.length, durationMs },
        salience: 0.6,
      });

      return text;
    } catch (error) {
      const durationMs = Math.round(performance.now() - t0);
      trace.error({ error, context: { agent: 'herald', userMsg, durationMs } });

      // On context overflow, reset and retry once
      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('context') || msg.includes('token') || msg.includes('quota')) {
        this.resetSession();
        return 'Session context was reset. Please re-send your last message.';
      }

      return 'The neural pathways are currently saturated. Please re-initialize.';
    }
  }
}

// Singleton — one Herald per app session
export const herald = new HeraldAgent();
