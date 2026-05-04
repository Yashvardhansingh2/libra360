import React, { useEffect, useState } from 'react'
import { listGoals, deleteGoal, listUsers } from '../utils/api'
import GoalCard from '../components/GoalCard'
import { Link } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import { Plus } from 'lucide-react'

export default function Goals() {
  const [goals,   setGoals]   = useState([])
  const [users,   setUsers]   = useState([])
  const [filter,  setFilter]  = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    Promise.all([listGoals(filter || undefined), listUsers()])
      .then(([g, u]) => { setGoals(g); setUsers(u) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return
    await deleteGoal(id)
    toast.success('Goal deleted.')
    setGoals(g => g.filter(x => x.id !== id))
  }

  return (
    <div style={styles.page}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a2035', color: '#e8edf8', border: '1px solid #2a3350' } }} />
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>Savings Goals</h1>
          <p style={styles.sub}>{goals.length} goal{goals.length !== 1 ? 's' : ''} found</p>
        </div>
        <div style={styles.controls}>
          <select style={styles.select} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Users</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <Link to="/new-goal" style={styles.btn}><Plus size={16} /> New Goal</Link>
        </div>
      </div>

      {loading ? (
        <div style={styles.center}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
      ) : goals.length === 0 ? (
        <div style={styles.empty}>
          <span style={{ fontSize: 48 }}>🎯</span>
          <p>No goals yet. <Link to="/new-goal" style={{ color: 'var(--accent)' }}>Create your first one!</Link></p>
        </div>
      ) : (
        <div style={styles.grid}>
          {goals.map((g, i) => (
            <div key={g.id} className="fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <GoalCard goal={g} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  page:   { padding: '40px 48px', maxWidth: 1100 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 },
  h1:     { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, color: 'var(--text)' },
  sub:    { color: 'var(--text2)', marginTop: 4, fontSize: 14 },
  controls: { display: 'flex', gap: 12, alignItems: 'center' },
  select: {
    background: 'var(--card)', border: '1px solid var(--border)',
    color: 'var(--text)', padding: '9px 14px', borderRadius: 10, fontSize: 14,
  },
  btn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'var(--accent)', color: '#0a0d14',
    padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 14,
    fontFamily: 'var(--font-display)',
  },
  grid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 },
  empty:  { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'var(--text2)', paddingTop: 80, fontSize: 15 },
}
