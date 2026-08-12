import { useCallback, useEffect, useState } from 'react';
import { HistoryRail, HistoryRailOverlay } from '@/components/HistoryRail';
import { ChatPane } from '@/components/ChatPane';
import { CollaborateShell } from '@/components/collaborate/CollaborateShell';
import { CollabDmNotifier } from '@/components/collaborate/CollabDmNotifier';
import { useLatticeStore } from '@/store';
import { useUnifiedFeed } from '@/feed/store';
import { formatChatThreadForDm } from '@/feed/sessionBridge';
import {
  newClientDmId,
  postCollaborateDm,
} from '@/feed/syncCollaborateDms';
import { migrateActiveProvider, saveActiveProvider } from '@/lib/providerKeys';
import type { NestTopology } from '@/types';

const MODE_KEY = 'lattice-workspace-mode';

function readNestFromUrl(): NestTopology | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('nest') || params.get('nestTopology');
    if (!raw) return null;
    const v = raw.trim().toLowerCase();
    if (v === 'octave99' || v === '99-octave' || v === '99' || v === 'multi-octave') return 'octave99';
    if (v === 'single') return 'single';
    if (v === 'multi') return 'multi';
    if (v === 'goldilocks') return 'goldilocks';
  } catch {
    /* ignore */
  }
  return null;
}

function readInitialMode(): 'chat' | 'collaborate' {
  try {
    const path = window.location.pathname.replace(/\/+$/, '');
    if (path.endsWith('/collaborate') || path === '/collaborate') {
      return 'collaborate';
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'collaborate' || params.get('collaborate') === '1') {
      return 'collaborate';
    }
    if (sessionStorage.getItem(MODE_KEY) === 'collaborate') return 'collaborate';
  } catch {
    /* ignore */
  }
  return 'chat';
}

export function App() {
  const [railOpen, setRailOpen] = useState(false);
  const [mode, setMode] = useState<'chat' | 'collaborate'>(readInitialMode);
  const [agentSeed, setAgentSeed] = useState<string | null>(null);
  const newChat = useLatticeStore((s) => s.newChat);
  const renameThread = useLatticeStore((s) => s.renameThread);
  const setNestTopology = useLatticeStore((s) => s.setNestTopology);
  const setProvider = useLatticeStore((s) => s.setProvider);
  const closeRail = useCallback(() => setRailOpen(false), []);
  const openRail = useCallback(() => setRailOpen(true), []);

  useEffect(() => {
    // Lattice Chat stays Cursor/Claude/Gemini only. OpenRouter lives on the Bridge product.
    const provider = migrateActiveProvider();
    saveActiveProvider(provider);
    setProvider(provider);
    const nest = readNestFromUrl();
    if (nest) setNestTopology(nest);
  }, [setNestTopology, setProvider]);

  useEffect(() => {
    try {
      sessionStorage.setItem(MODE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  const sendToAgent = useCallback(
    (prompt: string, opts?: { title?: string }) => {
      const threadId = newChat();
      if (opts?.title) renameThread(threadId, opts.title);
      setAgentSeed(prompt);
      setMode('chat');
    },
    [newChat, renameThread],
  );

  const bringChatIntoDm = useCallback((peerId: string) => {
    const { threads, activeThreadId } = useLatticeStore.getState();
    const thread = threads.find((t) => t.id === activeThreadId);
    const body = formatChatThreadForDm(thread?.title || 'Untitled', thread?.messages || []);
    const id = newClientDmId();
    const createdAt = new Date().toISOString();
    useUnifiedFeed.getState().ingestPayload({
      id,
      type: 'chat',
      platform: 'lattice',
      actor: 'You',
      body,
      threadPeerId: peerId,
      presenceHue: 'gold',
      createdAt,
    });
    void postCollaborateDm({ id, text: body, threadPeerId: peerId, createdAt });
    useUnifiedFeed.getState().openPeerDm(peerId);
    setMode('collaborate');
  }, []);

  if (mode === 'collaborate') {
    return (
      <>
        <CollaborateShell onExit={() => setMode('chat')} onSendToAgent={sendToAgent} />
        <CollabDmNotifier onOpenCollaborate={() => setMode('collaborate')} />
      </>
    );
  }

  return (
    <div className={`lattice-shell${railOpen ? ' rail-open' : ''}`}>
      <HistoryRailOverlay open={railOpen} onClose={closeRail} />
      <HistoryRail open={railOpen} onClose={closeRail} />
      <ChatPane
        onOpenHistory={openRail}
        onNewChat={() => {
          newChat();
          closeRail();
        }}
        onOpenCollaborate={() => setMode('collaborate')}
        onBringIntoDm={bringChatIntoDm}
        agentSeedPrompt={agentSeed}
        onAgentSeedConsumed={() => setAgentSeed(null)}
      />
      <CollabDmNotifier onOpenCollaborate={() => setMode('collaborate')} />
    </div>
  );
}
