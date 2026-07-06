import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MediaShell } from './components/player/MediaShell';
import { PlaybackRoot } from './components/player/PlaybackRoot';
import { QuestfestFastLink } from './components/QuestfestFastLink';
import { useIOSHtmlClass } from '@/lib/useIOSHtmlClass';
import { BridgePage } from './pages/BridgePage';
import { BulkUploadPage } from './pages/BulkUploadPage';
import { JukeboxListenPage } from './pages/JukeboxListenPage';
import { RegistrationPage } from './pages/RegistrationPage';

function AppChrome() {
  const { pathname } = useLocation();
  const noPlayerRoute = pathname === '/dj' || pathname === '/bulk-upload';
  return (
    <>
      {!noPlayerRoute ? <PlaybackRoot /> : null}
      <MediaShell />
    </>
  );
}

export default function App() {
  useIOSHtmlClass();
  return (
    <>
      <QuestfestFastLink />
      <Routes>
        <Route path="/" element={<Navigate to="/bridge" replace />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/bridge" element={<BridgePage />} />
        <Route path="/listen" element={<JukeboxListenPage />} />
        <Route path="/playlists" element={<BridgePage />} />
        <Route path="/dj" element={<BridgePage />} />
        <Route path="/bulk-upload" element={<BulkUploadPage />} />
        <Route path="*" element={<Navigate to="/bridge" replace />} />
      </Routes>
      <AppChrome />
    </>
  );
}
