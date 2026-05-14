import { Navigate, Route, Routes } from 'react-router-dom';
import { BridgePage } from './pages/BridgePage';
import { CaptainUnlockPage } from './pages/CaptainUnlockPage';
import { RegistrationPage } from './pages/RegistrationPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RegistrationPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/bridge" element={<BridgePage />} />
      <Route path="/dj" element={<BridgePage />} />
      <Route path="/capitan" element={<CaptainUnlockPage />} />
      <Route path="/captain" element={<CaptainUnlockPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
