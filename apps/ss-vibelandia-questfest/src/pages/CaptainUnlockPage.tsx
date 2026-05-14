import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getCaptainDeviceId,
  isCaptain,
  unlockCaptain,
} from '@/lib/captainAccess';

export function CaptainUnlockPage() {
  const navigate = useNavigate();
  const [passphrase, setPassphrase] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState(getCaptainDeviceId());
  const already = isCaptain();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = unlockCaptain(passphrase);
    setDeviceId(result.deviceId);
    if (result.ok) {
      setMsg('Capitan deck unlocked on this device. Upload is enabled.');
      setTimeout(() => navigate('/dj', { replace: true }), 800);
    } else {
      setMsg('Wrong passphrase.');
    }
  };

  return (
    <div className="gate">
      <div className="gate-inner">
        <p className="gate-kicker">Capitan only</p>
        <h1 className="gate-title">Unlock upload deck</h1>
        <p className="gate-lead">
          Upload is only for Capitan on his registered devices (laptop and iPhone). Listeners can
          only play.
        </p>
        {already ? (
          <p className="gate-fine">This device is already registered as Capitan.</p>
        ) : null}
        <form className="gate-actions" onSubmit={submit}>
          <input
            className="spotify-input"
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Capitan passphrase"
            autoComplete="current-password"
          />
          <button type="submit" className="voxel-btn voxel-btn--orange">
            Unlock upload
          </button>
        </form>
        {msg && <p className="gate-fine">{msg}</p>}
        <p className="gate-fine">
          Device id: <code className="gate-code">{deviceId}</code>
        </p>
        <p className="gate-fine">
          <Link to="/bridge">Back to Listen</Link>
        </p>
      </div>
    </div>
  );
}
