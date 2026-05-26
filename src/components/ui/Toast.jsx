import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onDismiss, duration = 4000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDismiss?.(); }, duration);
    return () => clearTimeout(t);
  }, [duration, onDismiss]);

  if (!visible) return null;

  const bg = type === 'success' ? '#0d9488' : type === 'error' ? '#dc2626' : '#f59e0b';

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: bg, color: '#fff', padding: '12px 20px',
      borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      display: 'flex', alignItems: 'center', gap: 10,
      maxWidth: 360, fontSize: 14, fontWeight: 500,
      animation: 'slideUp 0.3s ease',
    }}>
    <style>{`
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: none; opacity: 1; }
        }
      `}</style>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={() => { setVisible(false); onDismiss?.(); }}
        style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', fontSize:18, lineHeight:1 }}>
        ×
      </button>
    </div>
  );
}