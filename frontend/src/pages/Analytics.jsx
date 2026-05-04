import React, { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { topUsers, listGoals } from '../utils/api'
import { fmt } from '../utils/format'

const COLORS = ['#4ade80','#22d3ee','#f59e0b','#a78bfa','#fb923c','#f472b6','#60a5fa','#34d399','#f87171','#94a3b8']

export default function Analytics() {
  const [top,    setTop]    = useState([])
  const [goals,  setGoals]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([topUsers(), listGoals()])
      .then(([t, g]) => { setTop(t); setGoals(g) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Category breakdown for pie
  const catMap = goals.reduce((acc, g) => {
    acc[g.category] = (acc[g.category] || 0) + 1
    return acc
  }, {})
  const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }))

  // Progress bar data for top-3
  const barData = top.map(u => ({
    name: u.user_name.split(' ')[0],
    progress: u.progress_percent,
    saved: u.current_savings,
    target: u.target_amount,
  }))

  if (loading) return <div style={styles.center}><div className="spinner" style={{ width:36,height:36 }} /></div>

  return (
    <div style={styles.page}>
      <div className="fade-up">
        <h1 style={styles.h1}>Analytics</h1>
        <p style={styles.sub}>Visual breakdown of savings performance across users.</p>
      </div>

      <div style={styles.grid}>
        {/* Top 3 Progress */}
        <div className="fade-up-2" style={styles.card}>
          <h2 style={styles.h2}>Top 3 — Goal Progress (%)</h2>
          {barData.length === 0
            ? <div style={styles.empty}>No data yet.</div>
            : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3350" />
                  <XAxis dataKey="name" tick={{ fill: '#8b98b8', fontSize: 12 }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#5a6480', fontSize: 11 }} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ background: '#1a2035', border: '1px solid #2a3350', borderRadius: 10 }}
                    formatter={(v, n, p) => [`${v}%`, 'Progress']}
                  />
                  <Bar dataKey="progress" radius={[6,6,0,0]}>
                    {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Category Pie */}
        <div className="fade-up-3" style={styles.card}>
          <h2 style={styles.h2}>Goals by Category</h2>
          {pieData.length === 0
            ? <div style={styles.empty}>No data yet.</div>
            : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12, color: '#8b98b8' }} />
                  <Tooltip contentStyle={{ background: '#1a2035', border: '1px solid #2a3350', borderRadius: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Goals table */}
        <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
          <h2 style={styles.h2}>All Goals Overview</h2>
          {goals.length === 0
            ? <div style={styles.empty}>No goals yet.</div>
            : (
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>{['Title','Category','Target','Saved','Progress','Monthly'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {goals.map(g => (
                      <tr key={g.id} style={styles.tr}>
                        <td style={styles.td}>{g.title}</td>
                        <td style={styles.td}><span style={styles.tag}>{g.category}</span></td>
                        <td style={styles.td}>{fmt(g.target_amount)}</td>
                        <td style={styles.td}>{fmt(g.current_savings)}</td>
                        <td style={styles.td}>
                          <div style={styles.miniBar}>
                            <div style={{ ...styles.miniFill, width: `${g.progress_percent}%` }} />
                          </div>
                          <span style={styles.pct}>{g.progress_percent}%</span>
                        </td>
                        <td style={styles.td}>{fmt(g.monthly_contribution)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

const styles = {
  page:    { padding: '40px 48px', maxWidth: 1100 },
  center:  { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' },
  h1:      { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32 },
  sub:     { color: 'var(--text2)', marginTop: 4, fontSize: 14, marginBottom: 32 },
  grid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  card:    { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 },
  h2:      { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginBottom: 20 },
  empty:   { color: 'var(--text3)', textAlign: 'center', padding: 40, fontSize: 14 },
  table:   { width: '100%', borderCollapse: 'collapse' },
  th:      { textAlign: 'left', padding: '8px 12px', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)' },
  tr:      { borderBottom: '1px solid var(--border)' },
  td:      { padding: '12px 12px', fontSize: 13, color: 'var(--text2)', verticalAlign: 'middle' },
  tag:     { background: 'rgba(74,222,128,0.1)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
  miniBar: { height: 4, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden', display: 'inline-block', width: 60, marginRight: 8, verticalAlign: 'middle' },
  miniFill:{ height: '100%', background: 'var(--accent)', borderRadius: 99 },
  pct:     { fontSize: 12, fontWeight: 700, color: 'var(--text)' },
}
