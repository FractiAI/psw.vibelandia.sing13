import type { LatticeAgentSlot, LatticeExecution } from '@/types';

function statusClass(status: LatticeAgentSlot['status']): string {
  return `agent-status agent-status-${status}`;
}

export function AgentBoard({
  agents,
  title = 'Active agents',
}: {
  agents: LatticeAgentSlot[];
  title?: string;
}) {
  return (
    <div className="agent-board" role="table" aria-label={title}>
      <div className="agent-board-head">
        <span>{title}</span>
        <span className="agent-board-count">{agents.length}</span>
      </div>
      <div className="agent-board-row head" role="row">
        <span role="columnheader">Agent</span>
        <span role="columnheader">Role</span>
        <span role="columnheader">Status</span>
        <span role="columnheader">Progress</span>
      </div>
      {agents.map((a) => (
        <div className="agent-board-row" role="row" key={a.id}>
          <span role="cell" className="agent-name">
            <strong>{a.name}</strong>
            <em>{a.scale}</em>
          </span>
          <span role="cell" className="agent-role">
            {a.role}
            {a.note ? <small>{a.note}</small> : null}
          </span>
          <span role="cell" className={statusClass(a.status)}>
            {a.status}
          </span>
          <span role="cell" className="agent-progress">
            <span className="progress-track" aria-hidden="true">
              <span className="progress-fill" style={{ width: `${a.progress}%` }} />
            </span>
            <span className="progress-label">{a.progress}%</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function ExecutionReport({ execution }: { execution: LatticeExecution }) {
  const { tokens, selfTalk, agents, organization, engine, cycle, mode } = execution;

  return (
    <section className="execution-report" aria-label="Lattice execution">
      <header className="exec-header">
        <p className="exec-engine">{engine}</p>
        <p className="exec-cycle">
          {cycle} · <span className="exec-mode">{mode}</span>
        </p>
      </header>

      <div className="token-savings" aria-label="Token savings estimate">
        <p className="token-saved">
          Estimated tokens saved:{' '}
          <strong>{tokens.savedTokens.toLocaleString()}</strong>
          <span className="token-pct"> (−{tokens.savedPercent}%)</span>
        </p>
        <p className="token-breakdown">
          Naive ≈ {tokens.naiveTokens.toLocaleString()} tok · Lattice ≈{' '}
          {tokens.latticeTokens.toLocaleString()} tok
        </p>
        <p className="token-method">{tokens.method}</p>
        <ul className="token-assumptions">
          {tokens.assumptions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>

      <AgentBoard agents={agents} />

      <div className="self-talk">
        <p className="self-talk-title">Engine self-talk</p>
        <ol>
          {selfTalk.map((step) => (
            <li key={step.id}>
              <span className="st-phase">{step.phase}</span>
              <span className="st-voice">{step.voice}</span>
              <span className="st-detail">{step.detail}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="exec-org">
        <p className="self-talk-title">Organization</p>
        <ul>
          {organization.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
