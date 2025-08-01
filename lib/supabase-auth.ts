// Supabase Authentication Service
import { supabase } from './supabase'

export interface AppUser {
  id: string
  email: string
  username: string
  full_name: string
  role: 'admin' | 'bendahara' | 'user'
  avatar_url?: string
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface UserSession {
  id: string
  user_id: string
  session_token: string
  ip_address?: string
  user_agent?: string
  expires_at: string
  created_at: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  full_name: string
  role?: 'admin' | 'bendahara' | 'user'
}

class SupabaseAuthService {
  // Login user with username/password
  async login(credentials: LoginCredentials): Promise<{ user: AppUser | null, error: string | null }> {
    try {
      // Login with username and password
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', credentials.username)
        .eq('password_hash', credentials.password)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return { user: null, error: 'Username atau password salah' }
      }

      // Update last login
      await supabase
        .from('app_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id)

      return { user: data as AppUser, error: null }
    } catch (error) {
      console.error('Login error:', error)
      return { user: null, error: 'Terjadi kesalahan saat login' }
    }
  }

  // Register new user
  async register(userData: RegisterData): Promise<{ user: AppUser | null, error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .insert([{
          email: userData.email,
          username: userData.username,
          password_hash: userData.password, // In production, hash this!
          full_name: userData.full_name,
          role: userData.role || 'user'
        }])
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return { user: null, error: 'Username atau email sudah digunakan' }
        }
        return { user: null, error: 'Gagal membuat akun baru' }
      }

      return { user: data as AppUser, error: null }
    } catch (error) {
      console.error('Register error:', error)
      return { user: null, error: 'Terjadi kesalahan saat registrasi' }
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<{ user: AppUser | null, error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return { user: null, error: 'User tidak ditemukan' }
      }

      return { user: data as AppUser, error: null }
    } catch (error) {
      console.error('Get user error:', error)
      return { user: null, error: 'Terjadi kesalahan saat mengambil data user' }
    }
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<{ users: AppUser[], error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return { users: [], error: 'Gagal mengambil data users' }
      }

      return { users: data as AppUser[], error: null }
    } catch (error) {
      console.error('Get all users error:', error)
      return { users: [], error: 'Terjadi kesalahan saat mengambil data users' }
    }
  }

  // Update user
  async updateUser(userId: string, updates: Partial<AppUser>): Promise<{ user: AppUser | null, error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        return { user: null, error: 'Gagal mengupdate user' }
      }

      return { user: data as AppUser, error: null }
    } catch (error) {
      console.error('Update user error:', error)
      return { user: null, error: 'Terjadi kesalahan saat mengupdate user' }
    }
  }

  // Delete user (soft delete - set is_active to false)
  async deleteUser(userId: string): Promise<{ success: boolean, error: string | null }> {
    try {
      const { error } = await supabase
        .from('app_users')
        .update({ is_active: false })
        .eq('id', userId)

      if (error) {
        return { success: false, error: 'Gagal menghapus user' }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Delete user error:', error)
      return { success: false, error: 'Terjadi kesalahan saat menghapus user' }
    }
  }

  // Create user session
  async createSession(userId: string, sessionToken: string, expiresAt: string, metadata?: {
    ip_address?: string
    user_agent?: string
  }): Promise<{ session: UserSession | null, error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .insert([{
          user_id: userId,
          session_token: sessionToken,
          ip_address: metadata?.ip_address,
          user_agent: metadata?.user_agent,
          expires_at: expiresAt
        }])
        .select()
        .single()

      if (error) {
        return { session: null, error: 'Gagal membuat session' }
      }

      return { session: data as UserSession, error: null }
    } catch (error) {
      console.error('Create session error:', error)
      return { session: null, error: 'Terjadi kesalahan saat membuat session' }
    }
  }

  // Validate session
  async validateSession(sessionToken: string): Promise<{ user: AppUser | null, error: string | null }> {
    try {
      // First get session data
      const { data: sessionData, error: sessionError } = await supabase
        .from('user_sessions')
        .select('user_id, expires_at')
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (sessionError || !sessionData) {
        return { user: null, error: 'Session tidak valid atau sudah expired' }
      }

      // Then get user data separately
      const { data: userData, error: userError } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', sessionData.user_id)
        .eq('is_active', true)
        .single()

      if (userError || !userData) {
        return { user: null, error: 'User tidak ditemukan' }
      }

      return { user: userData as AppUser, error: null }
    } catch (error) {
      console.error('Validate session error:', error)
      return { user: null, error: 'Terjadi kesalahan saat validasi session' }
    }
  }

  // Delete session (logout)
  async deleteSession(sessionToken: string): Promise<{ success: boolean, error: string | null }> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('session_token', sessionToken)

      if (error) {
        return { success: false, error: 'Gagal logout' }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Delete session error:', error)
      return { success: false, error: 'Terjadi kesalahan saat logout' }
    }
  }

  // Clean expired sessions
  async cleanExpiredSessions(): Promise<{ success: boolean, error: string | null }> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString())

      if (error) {
        return { success: false, error: 'Gagal membersihkan session expired' }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Clean expired sessions error:', error)
      return { success: false, error: 'Terjadi kesalahan saat membersihkan session' }
    }
  }
}

export const supabaseAuthService = new SupabaseAuthService()