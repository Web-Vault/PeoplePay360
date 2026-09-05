import { createContext, useContext, useEffect, useState } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const stored = authService.getAuth()
        if (stored?.token && stored?.user) {
          setToken(stored.token)
          setUser(stored.user)
          try {
            const me = await authService.getMe()
            const freshUser = me?.data?.user || me?.user || me
            if (!freshUser) throw new Error('Invalid user response')
            setUser(freshUser)
            authService.storeAuth({ token: stored.token, user: freshUser })
          } catch {
            authService.clearAuth()
            setToken(null)
            setUser(null)
          }
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = async (email, password) => {
    const result = await authService.login(email, password)
    const t = result?.data?.token
    const u = result?.data?.user
    if (!t || !u) {
      throw new Error(result?.message || 'Login failed')
    }
    authService.storeAuth({ token: t, user: u })
    setToken(t)
    setUser(u)
    return result
  }

  const logout = () => {
    authService.clearAuth()
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = Boolean(user && token)

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
