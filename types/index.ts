// Centralized type definitions for Kas Kelas application

// Re-export types from supabase
export type {
  Student,
  Payment,
  PaymentCategory,
  Expense,
  ExpenseCategory,
  WhatsAppLog,
  PaymentReminder,
  Settings
} from '@/lib/supabase'

// Re-export auth types
export type {
  AppUser,
  UserSession,
  LoginCredentials,
  RegisterData
} from '@/lib/supabase-auth'

// Dashboard types
export interface DashboardStats {
  totalStudents: number
  totalIncome: number
  totalExpense: number
  currentBalance: number
  overdueCount: number
}

// Activity types
export interface Activity {
  id: string
  type: 'payment' | 'expense' | 'student' | 'user'
  action: string
  description: string
  user_id?: string
  user_name?: string
  metadata?: any
  created_at: string
}

// Report types
export interface ReportData {
  month: string
  year: number
  totalIncome: number
  totalExpense: number
  balance: number
  payments: Payment[]
  expenses: Expense[]
}

// Notification types
export interface Notification {
  id: string
  user_id?: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  action_url?: string
  created_at: string
  read_at?: string
}

// Form types
export interface FormState {
  isSubmitting: boolean
  error: string | null
  success: boolean
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}