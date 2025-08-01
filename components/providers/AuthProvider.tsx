'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabaseAuthService, AppUser } from '@/lib/supabase-auth'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: AppUser | null
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
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Auth config
  const AUTH_CONFIG = {
    LOGIN_PATH: '/login',
    DASHBOARD_PATH: '/dashboard'
  }

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true)
    
    try {
      // Get session token from localStorage
      const sessionToken = localStorage.getItem('session_token')
      
      if (sessionToken) {
        // Validate session from database
        const { user: validatedUser, error } = await supabaseAuthService.validateSession(sessionToken)
        
        if (validatedUser && !error) {
          setUser(validatedUser)
          // Update user data in localStorage
          localStorage.setItem('user', JSON.stringify(validatedUser))
        } else {
          // Session invalid or expired
          localStorage.removeItem('session_token')
          localStorage.removeItem('user')
          setUser(null)
        }
      } else {
        setUser(null)
      }

      // Redirect logic
      setTimeout(() => {
        if (!user && !isPublicRoute) {
          // Not authenticated and trying to access protected route
          router.push(AUTH_CONFIG.LOGIN_PATH)
        } else if (user && pathname === '/login') {
          // Authenticated but on login page
          router.push(AUTH_CONFIG.DASHBOARD_PATH)
        }
      }, 100)
      
    } catch (error) {
      console.error('Auth check error:', error)
      toast.error('Terjadi kesalahan saat memverifikasi login')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [pathname, router])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  const handleLogout = async () => {
    try {
      // Get session token before clearing
      const sessionToken = localStorage.getItem('session_token')
      
      // Delete session from database if exists
      if (sessionToken) {
        await supabaseAuthService.deleteSession(sessionToken)
      }
      
      // Clear localStorage
      localStorage.removeItem('session_token')
      localStorage.removeItem('user')
      setUser(null)
      
      toast.success('Berhasil logout')
      router.push(AUTH_CONFIG.LOGIN_PATH)
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if error
      localStorage.removeItem('session_token')
      localStorage.removeItem('user')
      setUser(null)
      router.push(AUTH_CONFIG.LOGIN_PATH)
    }
  }

  const checkAuth = () => {
    // Check Supabase session
    const hasSession = !!localStorage.getItem('session_token')
    return hasSession || !!user
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