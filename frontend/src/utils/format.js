export const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export const fmtNum = (n) =>
  new Intl.NumberFormat('en-IN').format(n)

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export const buildProjection = (goal) => {
  const { current_savings, monthly_contribution, target_amount, duration_months } = goal
  const months = Math.max(duration_months, 1)
  return Array.from({ length: months + 1 }, (_, i) => ({
    month: i === 0 ? 'Now' : `M${i}`,
    saved: Math.min(current_savings + monthly_contribution * i, target_amount),
    target: target_amount,
  }))
}

export const CATEGORIES = [
  'Emergency Fund', 'Home Purchase', 'Education', 'Vacation',
  'Vehicle', 'Retirement', 'Wedding', 'Business', 'Healthcare', 'General'
]
