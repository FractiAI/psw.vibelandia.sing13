export type ChatRole = 'user' | 'assistant' | 'system';

export type AgentMode = 'agent' | 'plan';

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

/** Standard agentic vs Lattice token estimate (heuristic). */
export type TokenCompare = {
  naiveTokens: number;
  latticeTokens: number;
  savedTokens: number;
  savedPercent: number;
  standardLabel?: string;
  latticeLabel?: string;
  method?: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  transcript?: TranscriptItem[];
  model?: string;
  mode?: AgentMode;
  tokens?: TokenCompare;
};

export type ChatThread = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
  agentId?: string;
};
