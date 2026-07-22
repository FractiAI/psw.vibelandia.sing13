export type ChatRole = 'user' | 'assistant' | 'system';

export type AgentStatus = 'queued' | 'running' | 'complete' | 'idle' | 'error';

export type LatticeAgentSlot = {
  id: string;
  name: string;
  role: string;
  scale: string;
  status: AgentStatus;
  progress: number;
  note?: string;
};

export type LatticeSelfTalkStep = {
  id: string;
  phase: string;
  voice: string;
  detail: string;
};

export type LatticeTokenSavings = {
  naiveTokens: number;
  latticeTokens: number;
  savedTokens: number;
  savedPercent: number;
  method: string;
  assumptions: string[];
};

export type LatticeExecution = {
  engine: string;
  mode: 'edge' | 'cloud';
  cycle: string;
  selfTalk: LatticeSelfTalkStep[];
  agents: LatticeAgentSlot[];
  tokens: LatticeTokenSavings;
  organization: string[];
  closedAt: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  execution?: LatticeExecution;
};

export type ChatThread = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
  agentId?: string;
};
