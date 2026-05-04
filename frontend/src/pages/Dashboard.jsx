import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Target, TrendingUp, DollarSign, ArrowRight } from 'lucide-react'
import StatCard from '../components/StatCard'
import { dashboardStats, topUsers } from '../utils/api'
import { fmt } from '../utils/format'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [top,   setTop]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([dashboardStats(), topUsers()])
      .then(([s, t]) => { setStats(s); setTop(t) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={styles.center}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  )

  return (
    <div style={styles.page}>
      <div className="fade-up" style={styles.hero}>
        <h1 style={styles.h1}>Smart Savings Dashboard</h1>
        <p style={styles.sub}>Your financial goals, tracked with AI precision.</p>
        <Link to="/new-goal" style={styles.cta}>
          Create New Goal <ArrowRight size={16} />
        </Link>
      </div>

      <div style={styles.grid}>
        <StatCard icon={<Users size={20}/>}      label="Total Users"      value={stats?.total_users ?? 0}          delay={0} />
        <StatCard icon={<Target size={20}/>}     label="Active Goals"     value={stats?.total_goals ?? 0}          delay={0.05} accent="var(--accent2)" />
        <StatCard icon={<DollarSign size={20}/>} label="Total Saved"      value={fmt(stats?.total_saved ?? 0)}     delay={0.1}  accent="var(--accent3)" />
        <StatCard icon={<TrendingUp size={20}/>} label="Avg. Progress"    value={`${Number(stats?.avg_progress ?? 0).toFixed(1)}%`} delay={0.15} />
      </div>

      <div className="fade-up-2" style={styles.section}>
        <h2 style={styles.h2}>🏆 Top 3 Users Closest to Goal</h2>
        {top.length === 0
          ? <p style={styles.empty}>No active goals yet. <Link to="/new-goal" style={{ color: 'var(--accent)' }}>Create one!</Link></p>
          : (
            <div style={styles.topList}>
              {top.map((u, i) => (
                <div key={i} style={styles.topCard}>
                  <div style={styles.rank}>#{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.topName}>{u.user_name}</div>
                    <div style={styles.topGoal}>{u.goal_title}</div>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${u.progress_percent}%` }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={styles.topPct}>{u.progress_percent}%</div>
                    <div style={styles.topSub}>{u.months_remaining}mo left</div>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}

const styles = {
  page:  { padding: '40px 48px', maxWidth: 960 },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' },
  hero:  { marginBottom: 36 },
  h1:    { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, lineHeight: 1.1, color: 'var(--text)' },
  sub:   { color: 'var(--text2)', marginTop: 8, fontSize: 15 },
  cta:   {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    marginTop: 18, background: 'var(--accent)', color: '#0a0d14',
    padding: '11px 22px', borderRadius: 10, fontWeight: 700, fontSize: 14,
    fontFamily: 'var(--font-display)',
    transition: 'opacity 0.15s',
  },
  grid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 40 },
  section: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28 },
  h2: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 20 },
  empty: { color: 'var(--text2)', fontSize: 14 },
  topList: { display: 'flex', flexDirection: 'column', gap: 14 },
  topCard: {
    display: 'flex', gap: 16, alignItems: 'center',
    background: 'var(--bg3)', borderRadius: 12, padding: '14px 18px',
    border: '1px solid var(--border)',
  },
  rank: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--accent)', minWidth: 32 },
  topName: { fontWeight: 600, fontSize: 15, color: 'var(--text)' },
  topGoal: { fontSize: 12, color: 'var(--text3)', marginBottom: 8 },
  progressBar: { height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'var(--accent)', borderRadius: 99, transition: 'width 0.6s' },
  topPct: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--accent)' },
  topSub: { fontSize: 11, color: 'var(--text3)', marginTop: 2 },
}
