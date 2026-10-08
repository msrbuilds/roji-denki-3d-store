import { useState } from 'react';
import { useStore } from '../store.jsx';

export default function Settings() {
  const { settings, setSetting } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="settings-btn" onClick={() => setOpen(o => !o)} aria-expanded={open}>設定 · Settings</button>
      {open && (
        <div className="settings" role="dialog" aria-label="Display settings">
          <div className="seg">
            {['akihabara', 'cyberpunk'].map(t => (
              <button key={t} className={settings.theme === t ? 'on' : ''} onClick={() => setSetting('theme', t)}>{t === 'akihabara' ? '90s Akihabara' : 'Cyberpunk'}</button>
            ))}
          </div>
          <label>Rain<input type="checkbox" checked={settings.rain} onChange={e => setSetting('rain', e.target.checked)} /></label>
          <label>Neon flicker<input type="range" min="0" max="1" step="0.05" value={settings.flicker} onChange={e => setSetting('flicker', +e.target.value)} /></label>
          <label>Auto-walk the street<input type="checkbox" checked={settings.autoWalk} onChange={e => setSetting('autoWalk', e.target.checked)} /></label>
          <label>Japanese text<input type="checkbox" checked={settings.japanese} onChange={e => setSetting('japanese', e.target.checked)} /></label>
        </div>
      )}
    </>
  );
}
