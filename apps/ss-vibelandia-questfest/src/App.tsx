import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MediaShell } from './components/player/MediaShell';
import { PlaybackRoot } from './components/player/PlaybackRoot';
import { useIOSHtmlClass } from '@/lib/useIOSHtmlClass';
import { BridgePage } from './pages/BridgePage';
import { RegistrationPage } from './pages/RegistrationPage';

function AppChrome() {
  const { pathname } = useLocation();
  const uploadRoute = pathname === '/dj';
  return (
    <>
      {!uploadRoute ? <PlaybackRoot /> : null}
      <MediaShell />
    </>
  );
}

export default function App() {
  useIOSHtmlClass();
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/bridge" replace />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/bridge" element={<BridgePage />} />
        <Route path="/playlists" element={<BridgePage />} />
        <Route path="/dj" element={<BridgePage />} />
        <Route path="*" element={<Navigate to="/bridge" replace />} />
      </Routes>
      <AppChrome />
    </>
  );
}
