export default function MapLegend() {
  return (
    <div style={{
      position: 'absolute', bottom: 24, left: 12, zIndex: 800,
      background: 'rgba(255,255,255,0.95)', borderRadius: 10,
      padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontSize: 12, fontWeight: 600,
    }}>
      <p style={{ margin: '0 0 6px', fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Severity
      </p>
      {[['#ef4444','High'],['#f97316','Medium'],['#22c55e','Low']].map(([color, label]) => (
        <div key={label} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
          <div style={{ width:10, height:10, background:color, borderRadius:'50%' }} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}