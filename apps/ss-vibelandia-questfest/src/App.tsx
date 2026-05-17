import { Navigate, Route, Routes } from 'react-router-dom';
import { MediaShell } from './components/player/MediaShell';
import { BridgePage } from './pages/BridgePage';
import { RegistrationPage } from './pages/RegistrationPage';

export default function App() {
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
      <MediaShell />
    </>
  );
}
