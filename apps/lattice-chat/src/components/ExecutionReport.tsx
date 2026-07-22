import { useState } from 'react';
import type { LatticeAgentSlot, LatticeExecution } from '@/types';

function statusClass(status: LatticeAgentSlot['status']): string {
  return `agent-chip-status agent-status-${status}`;
}

/** Compact live roster while a run is in flight. */
export function AgentBoard({
  agents,
  title = 'Agents',
}: {
  agents: LatticeAgentSlot[];
  title?: string;
}) {
  return (
    <div className="exec-muted agent-board-lite" aria-label={title}>
      <span className="exec-muted-label">{title}</span>
      <ul className="agent-chip-list">
        {agents.map((a) => (
          <li key={a.id} className="agent-chip">
            <span className="agent-chip-name">{a.name}</span>
            <span className={statusClass(a.status)}>{a.status}</span>
            <span className="agent-chip-pct">{a.progress}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Condensed engine ledger — visually secondary to the chat reply. */
export function ExecutionReport({ execution }: { execution: LatticeExecution }) {
  const { tokens, selfTalk, agents, mode } = execution;
  const [open, setOpen] = useState(false);

  const talkLine = selfTalk.map((s) => s.phase).join(' → ');
  const agentLine = agents.map((a) => a.name).join(' · ');

  return (
    <section className="execution-report exec-muted" aria-label="Lattice engine summary">
      <p className="exec-summary-line">
        <span className="exec-muted-label">Engine</span>
        <span className="exec-summary-text">
          {talkLine}
          <span className="exec-dot">·</span>
          saved ~{tokens.savedTokens.toLocaleString()} tok (−{tokens.savedPercent}%)
          <span className="exec-dot">·</span>
          {mode}
        </span>
      </p>
      <p className="exec-summary-line exec-agents-line">
        <span className="exec-muted-label">Agents</span>
        <span className="exec-summary-text">{agentLine}</span>
      </p>
      <button
        type="button"
        className="exec-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Hide details' : 'Details'}
      </button>
      {open ? (
        <div className="exec-details">
          <p>
            Naive ≈ {tokens.naiveTokens.toLocaleString()} · Lattice ≈{' '}
            {tokens.latticeTokens.toLocaleString()}
          </p>
          <ul>
            {selfTalk.map((step) => (
              <li key={step.id}>
                <span className="st-phase">{step.phase}</span> {step.detail}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
