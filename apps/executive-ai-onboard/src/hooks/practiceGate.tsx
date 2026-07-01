import { createContext, useContext, useEffect, type ReactNode } from 'react';

const PracticeGateContext = createContext<(ready: boolean) => void>(() => {});

export function usePracticeReady(ready: boolean) {
  const setReady = useContext(PracticeGateContext);
  useEffect(() => {
    setReady(ready);
    return () => setReady(false);
  }, [ready, setReady]);
}

export function PracticeGateProvider({
  onReadyChange,
  children,
}: {
  onReadyChange: (ready: boolean) => void;
  children: ReactNode;
}) {
  return <PracticeGateContext.Provider value={onReadyChange}>{children}</PracticeGateContext.Provider>;
}
