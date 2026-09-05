export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date, options = {}) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  })
}

export function truncate(str, n = 30) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}
