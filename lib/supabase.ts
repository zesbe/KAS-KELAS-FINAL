import { createClient } from '@supabase/supabase-js'

// Singleton pattern to prevent multiple instances
let supabaseInstance: any = null

// Client-side Supabase client
export const createSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance
  
  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    }
  )
  
  return supabaseInstance
}

// Default client instance
export const supabase = createSupabaseClient()

// Service role client (for admin operations)
export const createSupabaseServiceClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

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

// Database helper functions
export const supabaseHelpers = {
  // Students
  async getStudents(supabase: any, activeOnly = true) {
    let query = supabase
      .from('students')
      .select('*')
      .order('nomor_absen', { ascending: true })
    
    if (activeOnly) {
      query = query.eq('is_active', true)
    }
    
    return query
  },

  async getStudentById(supabase: any, id: string) {
    return supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single()
  },

  async createStudent(supabase: any, student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) {
    return supabase
      .from('students')
      .insert(student)
      .select()
      .single()
  },

  async updateStudent(supabase: any, id: string, updates: Partial<Student>) {
    return supabase
      .from('students')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  },

  // Payments
  async getPayments(supabase: any, filters?: { student_id?: string; status?: string; month?: string }) {
    let query = supabase
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

  async getPaymentByOrderId(supabase: any, orderId: string) {
    return supabase
      .from('payments')
      .select(`
        *,
        student:students(*)
      `)
      .eq('order_id', orderId)
      .single()
  },

  async createPayment(supabase: any, payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) {
    return supabase
      .from('payments')
      .insert(payment)
      .select(`
        *,
        student:students(*)
      `)
      .single()
  },

  async updatePayment(supabase: any, id: string, updates: Partial<Payment>) {
    return supabase
      .from('payments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        student:students(*)
      `)
      .single()
  },

  // Expenses
  async getExpenses(supabase: any, filters?: { month?: string; category_id?: string }) {
    let query = supabase
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

  async createExpense(supabase: any, expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
    return supabase
      .from('expenses')
      .insert(expense)
      .select(`
        *,
        category:expense_categories(*)
      `)
      .single()
  },

  // WhatsApp Logs
  async createWhatsAppLog(supabase: any, log: Omit<WhatsAppLog, 'id' | 'sent_at'>) {
    return supabase
      .from('whatsapp_logs')
      .insert({
        ...log,
        sent_at: new Date().toISOString()
      })
      .select()
      .single()
  },

  // Settings
  async getSettings(supabase: any) {
    return supabase
      .from('settings')
      .select('*')
      .order('key')
  },

  async getSettingByKey(supabase: any, key: string) {
    return supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .single()
  },

  async updateSetting(supabase: any, key: string, value: string, updatedBy?: string) {
    // First check if setting exists
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .eq('key', key)
      .single()
    
    if (existing) {
      // Update existing setting
      return supabase
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
      // Create new setting
      return supabase
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
  async getDashboardStats(supabase: any) {
    const [
      studentsResult,
      paymentsResult,
      expensesResult,
      overdueResult
    ] = await Promise.all([
      supabase.from('students').select('id').eq('is_active', true),
      supabase.from('payments').select('amount, status').eq('status', 'completed'),
      supabase.from('expenses').select('amount').eq('status', 'approved'),
      supabase.from('payments').select('id').eq('status', 'pending').lt('due_date', new Date().toISOString().split('T')[0])
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