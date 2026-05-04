import React from 'react'

export default function StatCard({ icon, label, value, sub, accent = 'var(--accent)', delay = 0 }) {
  return (
    <div className="fade-up" style={{ ...styles.card, animationDelay: `${delay}s` }}>
      <div style={{ ...styles.iconWrap, background: accent + '18', color: accent }}>
        {icon}
      </div>
      <div>
        <div style={styles.value}>{value}</div>
        <div style={styles.label}>{label}</div>
        {sub && <div style={styles.sub}>{sub}</div>}
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '20px 22px',
    display: 'flex',
    gap: 16,
    alignItems: 'center',
  },
  iconWrap: {
    width: 44, height: 44,
    borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  value: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 22,
    color: 'var(--text)',
    lineHeight: 1.2,
  },
  label: {
    fontSize: 13,
    color: 'var(--text2)',
    marginTop: 2,
  },
  sub: {
    fontSize: 11,
    color: 'var(--text3)',
    marginTop: 2,
  },
}
