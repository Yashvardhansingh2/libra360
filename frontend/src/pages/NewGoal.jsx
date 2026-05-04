import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer
} from 'recharts'
import { Sparkles, Loader } from 'lucide-react'
import { createGoal, listUsers } from '../utils/api'
import { fmt, buildProjection, CATEGORIES } from '../utils/format'
import toast, { Toaster } from 'react-hot-toast'

const INIT = {
  user_id: '', title: '', category: 'General',
  target_amount: '', current_savings: '0',
  monthly_contribution: '', duration_months: '12',
}

export default function NewGoal() {
  const nav = useNavigate()
  const [form, setForm] = useState(INIT)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [projection, setProjection] = useState([])

  useEffect(() => {
    listUsers().then(setUsers).catch(() => {})
  }, [])

  useEffect(() => {
    const { target_amount, current_savings, monthly_contribution, duration_months } = form
    if (target_amount && monthly_contribution && duration_months) {
      setProjection(buildProjection({
        target_amount: +target_amount,
        current_savings: +current_savings || 0,
        monthly_contribution: +monthly_contribution,
        duration_months: +duration_months,
      }))
    } else {
      setProjection([])
    }
  }, [form.target_amount, form.current_savings, form.monthly_contribution, form.duration_months])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.user_id) { toast.error('Please select a user.'); return }
    setLoading(true)
    try {
      await createGoal({
        user_id: +form.user_id,
        title: form.title,
        category: form.category,
        target_amount: +form.target_amount,
        current_savings: +form.current_savings || 0,
        monthly_contribution: +form.monthly_contribution,
        duration_months: +form.duration_months,
      })
      toast.success('Goal created with AI tip!')
      setTimeout(() => nav('/goals'), 1200)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error creating goal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a2035', color: '#e8edf8', border: '1px solid #2a3350' } }} />
      <div className="fade-up" style={styles.header}>
        <h1 style={styles.h1}>New Savings Goal</h1>
        <p style={styles.sub}>Fill in your goal — our AI will craft a personalized financial tip.</p>
      </div>

      <div style={styles.layout}>
        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>User *
            <select style={styles.input} value={form.user_id} onChange={set('user_id')} required>
              <option value="">— Select user —</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </label>

          <label style={styles.label}>Goal Title *
            <input style={styles.input} value={form.title} onChange={set('title')} placeholder="e.g. Down payment for apartment" required />
          </label>

          <label style={styles.label}>Category
            <select style={styles.input} value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </label>

          <div style={styles.row}>
            <label style={{ ...styles.label, flex: 1 }}>Target Amount (₹) *
              <input style={styles.input} type="number" min="1" step="0.01" value={form.target_amount} onChange={set('target_amount')} placeholder="500000" required />
            </label>
            <label style={{ ...styles.label, flex: 1 }}>Current Savings (₹)
              <input style={styles.input} type="number" min="0" step="0.01" value={form.current_savings} onChange={set('current_savings')} placeholder="0" />
            </label>
          </div>

          <div style={styles.row}>
            <label style={{ ...styles.label, flex: 1 }}>Monthly Contribution (₹) *
              <input style={styles.input} type="number" min="1" step="0.01" value={form.monthly_contribution} onChange={set('monthly_contribution')} placeholder="10000" required />
            </label>
            <label style={{ ...styles.label, flex: 1 }}>Duration (months) *
              <input style={styles.input} type="number" min="1" max="360" value={form.duration_months} onChange={set('duration_months')} required />
            </label>
          </div>

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? <><div className="spinner" style={{width:18,height:18}} /> Generating AI Plan…</> : <><Sparkles size={16} /> Create Goal & Get AI Tip</>}
          </button>
        </form>

        {/* Chart Preview */}
        <div style={styles.chartSection}>
          <h2 style={styles.chartTitle}>Savings Projection</h2>
          {projection.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={projection} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#4ade80" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3350" />
                  <XAxis dataKey="month" tick={{ fill: '#5a6480', fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fill: '#5a6480', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1a2035', border: '1px solid #2a3350', borderRadius: 10, color: '#e8edf8' }}
                    formatter={(v) => [fmt(v), '']}
                  />
                  <ReferenceLine y={+form.target_amount} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Target', fill: '#f59e0b', fontSize: 11 }} />
                  <Area type="monotone" dataKey="saved" stroke="#4ade80" strokeWidth={2} fill="url(#sg)" name="Saved" />
                </AreaChart>
              </ResponsiveContainer>
              {+form.monthly_contribution * +form.duration_months + +form.current_savings < +form.target_amount && (
                <div style={styles.warning}>
                  ⚠️ At this rate, you'll save {fmt(+form.monthly_contribution * +form.duration_months + (+form.current_savings || 0))} — short of target by {fmt(+form.target_amount - (+form.monthly_contribution * +form.duration_months) - (+form.current_savings || 0))}.
                </div>
              )}
            </>
          ) : (
            <div style={styles.chartPlaceholder}>
              <span style={{ fontSize: 40 }}>📈</span>
              <p>Fill in the amounts to preview your savings curve</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const inp = {
  width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
  borderRadius: 10, padding: '11px 14px', color: 'var(--text)', fontSize: 14,
  marginTop: 6, transition: 'border-color 0.15s',
}

const styles = {
  page: { padding: '40px 48px', maxWidth: 1100 },
  header: { marginBottom: 32 },
  h1: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, color: 'var(--text)' },
  sub: { color: 'var(--text2)', marginTop: 6, fontSize: 14 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  label: { display: 'flex', flexDirection: 'column', fontSize: 13, fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.3px' },
  input: inp,
  row: { display: 'flex', gap: 14 },
  btn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: 'var(--accent)', color: '#0a0d14',
    padding: '13px', borderRadius: 10, fontWeight: 700, fontSize: 15,
    fontFamily: 'var(--font-display)', transition: 'opacity 0.15s', marginTop: 4,
  },
  chartSection: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: 24,
  },
  chartTitle: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 20 },
  chartPlaceholder: {
    height: 260, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 12, color: 'var(--text3)', fontSize: 14,
  },
  warning: {
    marginTop: 14, background: 'rgba(244,63,94,0.08)',
    border: '1px solid rgba(244,63,94,0.2)',
    borderRadius: 10, padding: '10px 14px',
    fontSize: 12, color: '#fda4af',
  },
}
