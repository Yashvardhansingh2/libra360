import React from 'react'
import { Trash2, TrendingUp, Sparkles } from 'lucide-react'
import { fmt } from '../utils/format'

const CATEGORY_COLORS = {
  'Emergency Fund': '#f59e0b',
  'Home Purchase':  '#4ade80',
  'Education':      '#22d3ee',
  'Vacation':       '#a78bfa',
  'Vehicle':        '#fb923c',
  'Retirement':     '#34d399',
  'Wedding':        '#f472b6',
  'Business':       '#60a5fa',
  'Healthcare':     '#f87171',
  'General':        '#94a3b8',
}

export default function GoalCard({ goal, onDelete }) {
  const color = CATEGORY_COLORS[goal.category] || '#94a3b8'
  const pct   = goal.progress_percent ?? 0
  const remaining = Math.max(goal.target_amount - goal.current_savings, 0)

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <span style={{ ...styles.tag, background: color + '20', color }}>{goal.category}</span>
          <h3 style={styles.title}>{goal.title}</h3>
        </div>
        <button style={styles.deleteBtn} onClick={() => onDelete(goal.id)} title="Delete goal">
          <Trash2 size={15} />
        </button>
      </div>

      <div style={styles.amounts}>
        <div>
          <div style={styles.amtLabel}>Saved</div>
          <div style={{ ...styles.amtVal, color }}>{fmt(goal.current_savings)}</div>
        </div>
        <div style={styles.divider} />
        <div>
          <div style={styles.amtLabel}>Target</div>
          <div style={styles.amtVal}>{fmt(goal.target_amount)}</div>
        </div>
        <div style={styles.divider} />
        <div>
          <div style={styles.amtLabel}>Remaining</div>
          <div style={styles.amtVal}>{fmt(remaining)}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={styles.progressWrap}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${pct}%`, background: color }} />
        </div>
        <span style={styles.progressPct}>{pct}%</span>
      </div>

      <div style={styles.meta}>
        <span style={styles.metaItem}>
          <TrendingUp size={13} /> {fmt(goal.monthly_contribution)}/mo · {goal.duration_months} months
        </span>
      </div>

      {goal.ai_tip && (
        <div style={styles.tip}>
          <Sparkles size={13} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
          <p style={styles.tipText}>{goal.ai_tip}</p>
        </div>
      )}
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: 22,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    transition: 'border-color 0.2s',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  tag: {
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 6,
    marginBottom: 6,
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 17,
    color: 'var(--text)',
    lineHeight: 1.3,
  },
  deleteBtn: {
    background: 'transparent',
    color: 'var(--text3)',
    padding: 6,
    borderRadius: 8,
    transition: 'all 0.15s',
    cursor: 'pointer',
  },
  amounts: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
  },
  amtLabel: { fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px' },
  amtVal:   { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginTop: 2 },
  divider:  { width: 1, height: 32, background: 'var(--border)' },
  progressWrap: { display: 'flex', alignItems: 'center', gap: 10 },
  progressBar: {
    flex: 1, height: 6, background: 'var(--bg3)',
    borderRadius: 99, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 99, transition: 'width 0.6s ease' },
  progressPct: { fontSize: 12, fontWeight: 700, color: 'var(--text2)', minWidth: 36, textAlign: 'right' },
  meta: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  metaItem: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 12, color: 'var(--text2)',
  },
  tip: {
    background: 'rgba(245,158,11,0.07)',
    border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: 10,
    padding: '10px 12px',
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
  },
  tipText: { fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 },
}
