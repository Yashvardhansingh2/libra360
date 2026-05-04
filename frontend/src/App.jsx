import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Goals from './pages/Goals'
import NewGoal from './pages/NewGoal'
import UsersPage from './pages/Users'
import Analytics from './pages/Analytics'

export default function App() {
  return (
    <div style={styles.shell}>
      <Sidebar />
      <main style={styles.main}>
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/goals"     element={<Goals />} />
          <Route path="/new-goal"  element={<NewGoal />} />
          <Route path="/users"     element={<UsersPage />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
    </div>
  )
}

const styles = {
  shell: { display: 'flex', minHeight: '100vh' },
  main:  { marginLeft: 240, flex: 1, minHeight: '100vh', background: 'var(--bg)' },
}
