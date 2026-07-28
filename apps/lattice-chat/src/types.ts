export type ChatRole = 'user' | 'assistant' | 'system';

export type AgentMode = 'agent' | 'plan';
export type ReasoningLens = 'engine';

/** How Lattice should nest work for this turn. */
export type NestTopology = 'single' | 'multi' | 'goldilocks';

export type LatticeProvider = 'cursor' | 'claude' | 'gemini';

export type LatticeModelOption = {
  id: string;
  displayName: string;
  description?: string;
};

/** Cursor SDK stream items, rendered like the Cursor chat transcript. */
export type TranscriptItem =
  | { type: 'thinking'; text: string; durationMs?: number }
  | {
      type: 'tool_call';
      callId: string;
      name: string;
      status: string;
      argsPreview?: string;
      resultPreview?: string;
    }
  | { type: 'assistant'; text: string }
  | { type: 'status'; status: string; message?: string }
  | { type: 'task'; status?: string; text?: string };

/** Token meter — chat UI shows measured balances only (not chars÷4 estimates). */
export type TokenCompare = {
  /** Kept for proof/bench payloads; chat UI does not display estimates. */
  naiveTokens: number;
  latticeTokens: number;
  savedTokens: number;
  savedPercent: number;
  estimatedLatticeTokens?: number | null;
  measuredTokens?: number | null;
  balanceBefore?: number | null;
  balanceAfter?: number | null;
  balanceDelta?: number | null;
  standardLabel?: string;
  latticeLabel?: string;
  method?: string;
  assumptions?: string[];
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  transcript?: TranscriptItem[];
  model?: string;
  mode?: AgentMode;
  lens?: ReasoningLens;
  tokens?: TokenCompare;
};

export type ChatThread = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
  agentId?: string;
};
