import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create admin client for server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database types
export interface Student {
  id: string
  nama: string
  nomor_absen: number
  nomor_hp_ortu: string
  nama_ortu: string
  email_ortu?: string
  alamat?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  student_id: string
  category_id: string
  amount: number
  order_id: string
  status: 'pending' | 'completed' | 'failed' | 'expired'
  payment_method?: string
  pakasir_payment_url?: string
  pakasir_response?: any
  due_date: string
  completed_at?: string
  notes?: string
  created_at: string
  updated_at: string
  student?: Student
  category?: PaymentCategory
}

export interface PaymentCategory {
  id: string
  name: string
  description?: string
  default_amount?: number
  is_active: boolean
  created_at: string
}

export interface Expense {
  id: string
  category_id: string
  deskripsi: string
  amount: number
  bukti_foto_url?: string
  tanggal: string
  status: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  approved_at?: string
  notes?: string
  created_by: string
  created_at: string
  updated_at: string
  category?: ExpenseCategory
}

export interface ExpenseCategory {
  id: string
  name: string
  description?: string
  color: string
  is_active: boolean
  created_at: string
}

export interface WhatsAppLog {
  id: string
  student_id?: string
  payment_id?: string
  phone_number: string
  message_type: string
  message_content: string
  wapanels_response?: any
  status: 'sent' | 'delivered' | 'failed' | 'pending'
  sent_at: string
  delivered_at?: string
  failed_reason?: string
  student?: Student
  payment?: Payment
}

export interface PaymentReminder {
  id: string
  payment_id: string
  reminder_type: 'before_due' | 'on_due' | 'after_due_3' | 'after_due_7'
  scheduled_at: string
  sent_at?: string
  whatsapp_log_id?: string
  status: 'pending' | 'sent' | 'failed' | 'skipped'
  created_at: string
  payment?: Payment
}

export interface Settings {
  id: string
  key: string
  value: string
  description?: string
  type: 'text' | 'number' | 'boolean' | 'json'
  updated_by?: string
  updated_at: string
}

// Helper functions for common operations
export const supabaseHelpers = {
  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Get user from app_users table
  async getAppUser(email: string) {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('email', email)
      .single()
    
    return { data, error }
  },

  // Create session
  async createSession(userId: string) {
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry

    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    return { data, error }
  },

  // Validate session
  async validateSession(sessionToken: string) {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*, app_users(*)')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    return { data, error }
  },

  // Logout
  async logout(sessionToken: string) {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('session_token', sessionToken)

    return { error }
  },

  // Students helpers
  async getStudents(supabaseClient: any, activeOnly = true) {
    let query = supabaseClient
      .from('students')
      .select('*')
      .order('nomor_absen', { ascending: true })
    
    if (activeOnly) {
      query = query.eq('is_active', true)
    }
    
    return query
  },

  async getStudentById(supabaseClient: any, id: string) {
    return supabaseClient
      .from('students')
      .select('*')
      .eq('id', id)
      .single()
  },

  async createStudent(supabaseClient: any, student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) {
    return supabaseClient
      .from('students')
      .insert(student)
      .select()
      .single()
  },

  async updateStudent(supabaseClient: any, id: string, updates: Partial<Student>) {
    return supabaseClient
      .from('students')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  },

  // Payments helpers
  async getPayments(supabaseClient: any, filters?: { student_id?: string; status?: string; month?: string }) {
    let query = supabaseClient
      .from('payments')
      .select(`
        *,
        student:students(*),
        category:payment_categories(*)
      `)
      .order('due_date', { ascending: false })
    
    if (filters?.student_id) {
      query = query.eq('student_id', filters.student_id)
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.month) {
      const startDate = new Date(filters.month + '-01')
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      query = query.gte('due_date', startDate.toISOString().split('T')[0])
                    .lte('due_date', endDate.toISOString().split('T')[0])
    }
    
    return query
  },

  async getPaymentByOrderId(supabaseClient: any, orderId: string) {
    return supabaseClient
      .from('payments')
      .select(`
        *,
        student:students(*)
      `)
      .eq('order_id', orderId)
      .single()
  },

  async createPayment(supabaseClient: any, payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) {
    return supabaseClient
      .from('payments')
      .insert(payment)
      .select(`
        *,
        student:students(*)
      `)
      .single()
  },

  async updatePayment(supabaseClient: any, id: string, updates: Partial<Payment>) {
    return supabaseClient
      .from('payments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        student:students(*)
      `)
      .single()
  },

  // Expenses helpers
  async getExpenses(supabaseClient: any, filters?: { month?: string; category_id?: string }) {
    let query = supabaseClient
      .from('expenses')
      .select(`
        *,
        category:expense_categories(*)
      `)
      .order('tanggal', { ascending: false })
    
    if (filters?.month) {
      const startDate = new Date(filters.month + '-01')
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      query = query.gte('tanggal', startDate.toISOString().split('T')[0])
                    .lte('tanggal', endDate.toISOString().split('T')[0])
    }
    
    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    
    return query
  },

  async createExpense(supabaseClient: any, expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
    return supabaseClient
      .from('expenses')
      .insert(expense)
      .select(`
        *,
        category:expense_categories(*)
      `)
      .single()
  },

  // WhatsApp Logs
  async createWhatsAppLog(supabaseClient: any, log: Omit<WhatsAppLog, 'id' | 'sent_at'>) {
    return supabaseClient
      .from('whatsapp_logs')
      .insert({
        ...log,
        sent_at: new Date().toISOString()
      })
      .select()
      .single()
  },

  // Settings helpers
  async getSettings(supabaseClient: any) {
    return supabaseClient
      .from('settings')
      .select('*')
      .order('key')
  },

  async getSettingByKey(supabaseClient: any, key: string) {
    return supabaseClient
      .from('settings')
      .select('*')
      .eq('key', key)
      .single()
  },

  async updateSetting(supabaseClient: any, key: string, value: string, updatedBy?: string) {
    const { data: existing } = await supabaseClient
      .from('settings')
      .select('id')
      .eq('key', key)
      .single()
    
    if (existing) {
      return supabaseClient
        .from('settings')
        .update({
          value,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .eq('key', key)
        .select()
        .single()
    } else {
      return supabaseClient
        .from('settings')
        .insert({
          key,
          value,
          updated_by: updatedBy,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
    }
  },

  // Dashboard statistics
  async getDashboardStats(supabaseClient: any) {
    const [
      studentsResult,
      paymentsResult,
      expensesResult,
      overdueResult
    ] = await Promise.all([
      supabaseClient.from('students').select('id').eq('is_active', true),
      supabaseClient.from('payments').select('amount, status').eq('status', 'completed'),
      supabaseClient.from('expenses').select('amount').eq('status', 'approved'),
      supabaseClient.from('payments').select('id').eq('status', 'pending').lt('due_date', new Date().toISOString().split('T')[0])
    ])

    const totalStudents = studentsResult.data?.length || 0
    const totalIncome = paymentsResult.data?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
    const totalExpense = expensesResult.data?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0
    const overdueCount = overdueResult.data?.length || 0

    return {
      totalStudents,
      totalIncome,
      totalExpense,
      currentBalance: totalIncome - totalExpense,
      overdueCount
    }
  }
}