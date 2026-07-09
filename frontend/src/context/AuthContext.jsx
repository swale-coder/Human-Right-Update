import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('hrpc_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('hrpc_access_token')
      if (token) {
        try {
          const profile = await authService.getProfile()
          setUser(profile.user)
          localStorage.setItem('hrpc_user', JSON.stringify(profile.user))
        } catch {
          setUser(null)
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const login = async (email, password) => {
    const data = await authService.login(email, password)
    localStorage.setItem('hrpc_access_token', data.accessToken)
    localStorage.setItem('hrpc_refresh_token', data.refreshToken)
    localStorage.setItem('hrpc_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem('hrpc_access_token')
    localStorage.removeItem('hrpc_refresh_token')
    localStorage.removeItem('hrpc_user')
    setUser(null)
  }

  const value = { user, setUser, login, logout, loading, isAuthenticated: !!user }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
