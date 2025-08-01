// Authentication utilities
export const AUTH_CONFIG = {
  LOGIN_PATH: '/login',
  DASHBOARD_PATH: '/dashboard',
  STORAGE_KEYS: {
    IS_LOGGED_IN: 'isLoggedIn',
    USER_ROLE: 'userRole',
    USER_NAME: 'userName'
  }
}

export interface User {
  name: string
  role: string
  isLoggedIn: boolean
}

// Check if user is authenticated (client-side only)
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.IS_LOGGED_IN) === 'true'
}

// Get current user info
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null
  
  const isLoggedIn = isAuthenticated()
  if (!isLoggedIn) return null

  return {
    name: localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER_NAME) || 'User',
    role: localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER_ROLE) || 'user',
    isLoggedIn: true
  }
}

// Logout user
export const logout = (): void => {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.IS_LOGGED_IN)
  localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER_ROLE)
  localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER_NAME)
  
  // Redirect to login
  window.location.href = AUTH_CONFIG.LOGIN_PATH
}

// Login user
export const loginUser = (username: string, role: string = 'bendahara'): void => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.IS_LOGGED_IN, 'true')
  localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER_ROLE, role)
  localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER_NAME, username)
}

// Validate credentials (simple demo - replace with real auth)
export const validateCredentials = (username: string, password: string): boolean => {
  const validCredentials = [
    { username: 'bendahara', password: 'kaskelas123', name: 'Ibu Sari Wijaya' },
    { username: 'admin', password: 'admin123', name: 'Admin System' }
  ]

  return validCredentials.some(cred => 
    cred.username === username && cred.password === password
  )
}

// Get user name by username
export const getUserName = (username: string): string => {
  const users = {
    'bendahara': 'Ibu Sari Wijaya',
    'admin': 'Admin System'
  }
  return users[username as keyof typeof users] || username
}