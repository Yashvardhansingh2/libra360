import React, { useEffect, useState } from 'react'
import { listUsers, createUser } from '../utils/api'
import { UserPlus, Mail, Calendar } from 'lucide-react'
import { fmtDate } from '../utils/format'
import toast, { Toaster } from 'react-hot-toast'

export default function UsersPage() {
  const [users,   setUsers]   = useState([])
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)

  const load = () => listUsers().then(setUsers).catch(console.error)
  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const u = await createUser({ name, email })
      setUsers(prev => [...prev, u])
      toast.success(`User "${u.name}" created!`)
      setName(''); setEmail('')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create user.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a2035', color: '#e8edf8', border: '1px solid #2a3350' } }} />
      <div className="fade-up" style={styles.header}>
        <h1 style={styles.h1}>Users</h1>
        <p style={styles.sub}>{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
      </div>

      <div style={styles.layout}>
        {/* Create form */}
        <div className="fade-up-2" style={styles.formCard}>
          <h2 style={styles.h2}><UserPlus size={18} /> Add User</h2>
          <form onSubmit={handleCreate} style={styles.form}>
            <label style={styles.label}>Full Name *
              <input style={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="Yashvardhan Singh" required />
            </label>
            <label style={styles.label}>Email *
              <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="yash@example.com" required />
            </label>
            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? <div className="spinner" /> : 'Create User'}
            </button>
          </form>
        </div>

        {/* User list */}
        <div className="fade-up-3" style={styles.listWrap}>
          {users.length === 0
            ? <div style={styles.empty}>No users yet.</div>
            : users.map(u => (
              <div key={u.id} style={styles.card}>
                <div style={styles.avatar}>{u.name[0].toUpperCase()}</div>
                <div>
                  <div style={styles.cardName}>{u.name}</div>
                  <div style={styles.cardMeta}><Mail size={12} /> {u.email}</div>
                  <div style={styles.cardMeta}><Calendar size={12} /> {fmtDate(u.created_at)}</div>
                </div>
                <div style={styles.cardId}>ID #{u.id}</div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

const inp = {
  width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
  borderRadius: 10, padding: '11px 14px', color: 'var(--text)', fontSize: 14,
  marginTop: 6,
}

const styles = {
  page: { padding: '40px 48px', maxWidth: 1000 },
  header: { marginBottom: 32 },
  h1: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32 },
  sub: { color: 'var(--text2)', marginTop: 4, fontSize: 14 },
  layout: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: 28, alignItems: 'start' },
  formCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 },
  h2: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  label: { display: 'flex', flexDirection: 'column', fontSize: 13, fontWeight: 600, color: 'var(--text2)' },
  input: inp,
  btn: {
    background: 'var(--accent)', color: '#0a0d14',
    padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 14,
    fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  listWrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  empty: { color: 'var(--text3)', padding: 20, textAlign: 'center' },
  card: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '14px 18px',
    display: 'flex', alignItems: 'center', gap: 14,
  },
  avatar: {
    width: 42, height: 42, borderRadius: '50%',
    background: 'rgba(74,222,128,0.15)', color: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, flexShrink: 0,
  },
  cardName: { fontWeight: 600, fontSize: 15, color: 'var(--text)' },
  cardMeta: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text3)', marginTop: 3 },
  cardId: { marginLeft: 'auto', fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-display)', fontWeight: 700 },
}
