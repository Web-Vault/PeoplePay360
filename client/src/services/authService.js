import api from './api'

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export async function getMe() {
  const { data } = await api.get('/auth/me')
  return data
}

export function storeAuth({ token, user }) {
  localStorage.setItem('auth', JSON.stringify({ token, user }))
}

export function clearAuth() {
  localStorage.removeItem('auth')
}

export function getAuth() {
  const raw = localStorage.getItem('auth')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}
