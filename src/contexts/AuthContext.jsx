import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'guardian_auth'
const USERS_KEY = 'guardian_users'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch { /* ignore parse errors */ }
    }
    setLoading(false)
  }, [])

  const getUsers = () => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    } catch { return [] }
  }

  const saveUser = (userData) => {
    setUser(userData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
  }

  const register = async (name, email, password, phone) => {
    await new Promise(r => setTimeout(r, 800))
    const users = getUsers()
    if (users.find(u => u.email === email)) {
      throw new Error('Email already registered')
    }
    const newUser = {
      id: 'user_' + Date.now(),
      name,
      email,
      phone,
      password,
      avatar: name.charAt(0).toUpperCase(),
      createdAt: new Date().toISOString()
    }
    users.push(newUser)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    const { password: _, ...safeUser } = newUser
    saveUser(safeUser)
    return safeUser
  }

  const login = async (email, password) => {
    await new Promise(r => setTimeout(r, 800))
    const users = getUsers()
    const found = users.find(u => u.email === email && u.password === password)
    if (!found) {
      throw new Error('Invalid email or password')
    }
    const { password: _, ...safeUser } = found
    saveUser(safeUser)
    return safeUser
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates }
    saveUser(updated)
    const users = getUsers().map(u => u.id === updated.id ? { ...u, ...updates } : u)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
