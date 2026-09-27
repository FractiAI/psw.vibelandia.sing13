import { FormEvent, memo, useRef } from 'react';
import { ComposerOptions } from '@/components/ComposerOptions';
import {
  ComposerDraftRow,
  type ComposerDraftRowHandle,
} from '@/components/ComposerDraftRow';
import { useLatticeStore } from '@/store';
import type { LatticeProvider } from '@/lib/providerKeys';
import type { AgentMode, NestTopology } from '@/types';

type ComposerBarProps = {
  signedIn: boolean;
  hasEdgeKey: boolean;
  creatorAttach: boolean;
  showWorking: boolean;
  agentSeedPrompt?: string | null;
  onAgentSeedConsumed?: () => void;
  /** Called before send so parent can stick scroll to bottom. */
  onBeforeSend?: () => void;
};

/**
 * Shell: options (memo) + draft row (owns keystrokes).
 * Typing never re-renders ComposerOptions or ChatPane.
 */
export const ComposerBar = memo(function ComposerBar({
  signedIn,
  hasEdgeKey,
  creatorAttach,
  showWorking,
  agentSeedPrompt,
  onAgentSeedConsumed,
  onBeforeSend,
}: ComposerBarProps) {
  const draftRowRef = useRef<ComposerDraftRowHandle>(null);
  const activeThreadId = useLatticeStore((s) => s.activeThreadId);
  const sending = useLatticeStore((s) => s.sending);
  const sendPhase = useLatticeStore((s) => s.sendPhase);
  const pending = useLatticeStore((s) => s.pending);
  const provider = useLatticeStore((s) => s.provider);
  const agentMode = useLatticeStore((s) => s.agentMode);
  const nestTopology = useLatticeStore((s) => s.nestTopology);
  const agentRoster = useLatticeStore((s) => s.agentRoster);
  const modelId = useLatticeStore((s) => s.modelId);
  const models = useLatticeStore((s) => s.models);
  const setProvider = useLatticeStore((s) => s.setProvider);
  const setAgentMode = useLatticeStore((s) => s.setAgentMode);
  const setNestTopology = useLatticeStore((s) => s.setNestTopology);
  const setAgentRoster = useLatticeStore((s) => s.setAgentRoster);
  const setModelId = useLatticeStore((s) => s.setModelId);

  function onFormSubmit(e: FormEvent) {
    e.preventDefault();
    void draftRowRef.current?.submit();
  }

  return (
    <form
      className={`composer${signedIn && hasEdgeKey ? '' : ' composer--boarding'}`}
      onSubmit={onFormSubmit}
    >
      {signedIn && hasEdgeKey ? (
        <ComposerOptions
          provider={provider as LatticeProvider}
          mode={agentMode as AgentMode}
          nestTopology={nestTopology as NestTopology}
          agentRoster={agentRoster}
          modelId={modelId}
          models={models}
          disabled={sending}
          onProviderChange={setProvider}
          onModeChange={setAgentMode}
          onNestChange={setNestTopology}
          onRosterChange={setAgentRoster}
          onModelChange={setModelId}
        />
      ) : null}
      <ComposerDraftRow
        ref={draftRowRef}
        signedIn={signedIn}
        hasEdgeKey={hasEdgeKey}
        creatorAttach={creatorAttach}
        showWorking={showWorking}
        activeThreadId={activeThreadId}
        sending={sending}
        sendPhase={sendPhase}
        pendingPrompt={pending?.prompt}
        agentSeedPrompt={agentSeedPrompt}
        onAgentSeedConsumed={onAgentSeedConsumed}
        onBeforeSend={onBeforeSend}
      />
    </form>
  );
});
