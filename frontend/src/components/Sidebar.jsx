import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Target, Users, BarChart2, Zap } from 'lucide-react'

const links = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/goals',     icon: Target,          label: 'My Goals'  },
  { to: '/new-goal',  icon: Zap,             label: 'New Goal'  },
  { to: '/users',     icon: Users,           label: 'Users'     },
  { to: '/analytics', icon: BarChart2,        label: 'Analytics' },
]

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <span style={styles.logoIcon}>⚖️</span>
        <span style={styles.logoText}>Libra<span style={styles.logoAccent}>360</span></span>
      </div>
      <nav style={styles.nav}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.linkActive : {}),
            })}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div style={styles.footer}>
        <div style={styles.badge}>Fintech · AI Powered</div>
      </div>
    </aside>
  )
}

const styles = {
  sidebar: {
    width: 240,
    minHeight: '100vh',
    background: 'var(--bg2)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0 0 24px',
    position: 'fixed',
    top: 0, left: 0, bottom: 0,
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '28px 24px 24px',
    borderBottom: '1px solid var(--border)',
  },
  logoIcon: { fontSize: 24 },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 22,
    letterSpacing: '-0.5px',
    color: 'var(--text)',
  },
  logoAccent: { color: 'var(--accent)' },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '20px 12px',
    flex: 1,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 14px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text2)',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.15s',
    textDecoration: 'none',
  },
  linkActive: {
    background: 'rgba(74, 222, 128, 0.1)',
    color: 'var(--accent)',
    fontWeight: 600,
  },
  footer: {
    padding: '0 24px',
  },
  badge: {
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 11,
    color: 'var(--text3)',
    textAlign: 'center',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
}
