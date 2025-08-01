'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getCurrentUser, isAuthenticated, logout, AUTH_CONFIG, User } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  logout: () => void
  checkAuth: () => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login']
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    checkAuthStatus()
  }, [pathname, router])

  const checkAuthStatus = () => {
    setIsLoading(true)
    
    try {
      const currentUser = getCurrentUser()
      setUser(currentUser)

      // Redirect logic
      if (!currentUser && !isPublicRoute) {
        // Not authenticated and trying to access protected route
        router.push(AUTH_CONFIG.LOGIN_PATH)
      } else if (currentUser && pathname === '/login') {
        // Authenticated but on login page
        router.push(AUTH_CONFIG.DASHBOARD_PATH)
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    router.push(AUTH_CONFIG.LOGIN_PATH)
  }

  const checkAuth = () => {
    return isAuthenticated()
  }

  const value: AuthContextType = {
    user,
    isLoading,
    logout: handleLogout,
    checkAuth
  }

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}