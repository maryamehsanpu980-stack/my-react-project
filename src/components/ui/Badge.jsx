const styles = {
  high:   { background: '#fee2e2', color: '#991b1b' },
  medium: { background: '#fef3c7', color: '#92400e' },
  low:    { background: '#d1fae5', color: '#065f46' },
};

export default function Badge({ severity }) {
  const s = styles[severity] || styles.low;
  return (
    <span style={{
      ...s, display: 'inline-block',
      padding: '3px 8px', borderRadius: 999,
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>
      {severity}
    </span>
  );
}