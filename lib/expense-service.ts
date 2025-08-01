// Supabase Expense Management Service
import { supabase } from './supabase'

export interface ExpenseCategory {
  id: string
  name: string
  description?: string
  color: string
  is_active: boolean
  created_at: string
}

export interface Expense {
  id: string
  category_id: string
  title: string
  deskripsi: string
  amount: number
  bukti_foto_url?: string
  bukti_foto_public_id?: string
  tanggal: string
  toko_tempat?: string
  metode_pembayaran: 'cash' | 'transfer' | 'qris' | 'debit'
  status: 'pending' | 'approved' | 'rejected'
  approval_notes?: string
  approved_by_user_id?: string
  approved_at?: string
  created_by_user_id: string
  created_at: string
  updated_at: string
  // Joined data
  expense_categories?: ExpenseCategory
  created_by?: {
    id: string
    full_name: string
    username: string
  }
  approved_by?: {
    id: string
    full_name: string
    username: string
  }
}

export interface CreateExpenseData {
  category_id: string
  title: string
  deskripsi: string
  amount: number
  bukti_foto_url?: string
  bukti_foto_public_id?: string
  tanggal: string
  toko_tempat?: string
  metode_pembayaran: 'cash' | 'transfer' | 'qris' | 'debit'
  created_by_user_id: string
}

export interface UpdateExpenseData {
  category_id?: string
  title?: string
  deskripsi?: string
  amount?: number
  bukti_foto_url?: string
  bukti_foto_public_id?: string
  tanggal?: string
  toko_tempat?: string
  metode_pembayaran?: 'cash' | 'transfer' | 'qris' | 'debit'
}

export interface ApproveExpenseData {
  status: 'approved' | 'rejected'
  approval_notes?: string
  approved_by_user_id: string
}

class ExpenseService {
  // Get all expense categories
  async getExpenseCategories(): Promise<{ categories: ExpenseCategory[], error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        return { categories: [], error: 'Gagal mengambil kategori pengeluaran' }
      }

      return { categories: data as ExpenseCategory[], error: null }
    } catch (error) {
      console.error('Get expense categories error:', error)
      return { categories: [], error: 'Terjadi kesalahan saat mengambil kategori' }
    }
  }

  // Get all expenses with filters
  async getExpenses(filters?: {
    status?: 'pending' | 'approved' | 'rejected'
    category_id?: string
    created_by_user_id?: string
    date_from?: string
    date_to?: string
    limit?: number
    offset?: number
  }): Promise<{ expenses: Expense[], total: number, error: string | null }> {
    try {
      let query = supabase
        .from('expenses')
        .select('*')

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id)
      }
      if (filters?.created_by_user_id) {
        query = query.eq('created_by_user_id', filters.created_by_user_id)
      }
      if (filters?.date_from) {
        query = query.gte('tanggal', filters.date_from)
      }
      if (filters?.date_to) {
        query = query.lte('tanggal', filters.date_to)
      }

      // Get total count
      const { count } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })

      // Apply pagination and ordering
      query = query
        .order('tanggal', { ascending: false })
        .order('created_at', { ascending: false })

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        return { expenses: [], total: 0, error: 'Gagal mengambil data pengeluaran' }
      }

      return { expenses: data as Expense[], total: count || 0, error: null }
    } catch (error) {
      console.error('Get expenses error:', error)
      return { expenses: [], total: 0, error: 'Terjadi kesalahan saat mengambil data pengeluaran' }
    }
  }

  // Get expense by ID
  async getExpenseById(expenseId: string): Promise<{ expense: Expense | null, error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_categories (
            id,
            name,
            color,
            description
          ),
          created_by:app_users!created_by_user_id (
            id,
            full_name,
            username,
            role
          ),
          approved_by:app_users!approved_by_user_id (
            id,
            full_name,
            username,
            role
          )
        `)
        .eq('id', expenseId)
        .single()

      if (error || !data) {
        return { expense: null, error: 'Pengeluaran tidak ditemukan' }
      }

      return { expense: data as Expense, error: null }
    } catch (error) {
      console.error('Get expense by ID error:', error)
      return { expense: null, error: 'Terjadi kesalahan saat mengambil data pengeluaran' }
    }
  }

  // Create new expense
  async createExpense(expenseData: CreateExpenseData): Promise<{ expense: Expense | null, error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select(`
          *,
          expense_categories (
            id,
            name,
            color
          ),
          created_by:app_users!created_by_user_id (
            id,
            full_name,
            username
          )
        `)
        .single()

      if (error) {
        return { expense: null, error: 'Gagal membuat pengeluaran baru' }
      }

      return { expense: data as Expense, error: null }
    } catch (error) {
      console.error('Create expense error:', error)
      return { expense: null, error: 'Terjadi kesalahan saat membuat pengeluaran' }
    }
  }

  // Update expense
  async updateExpense(expenseId: string, updates: UpdateExpenseData): Promise<{ expense: Expense | null, error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', expenseId)
        .select(`
          *,
          expense_categories (
            id,
            name,
            color
          ),
          created_by:app_users!created_by_user_id (
            id,
            full_name,
            username
          )
        `)
        .single()

      if (error) {
        return { expense: null, error: 'Gagal mengupdate pengeluaran' }
      }

      return { expense: data as Expense, error: null }
    } catch (error) {
      console.error('Update expense error:', error)
      return { expense: null, error: 'Terjadi kesalahan saat mengupdate pengeluaran' }
    }
  }

  // Approve or reject expense
  async approveExpense(expenseId: string, approvalData: ApproveExpenseData): Promise<{ expense: Expense | null, error: string | null }> {
    try {
      const updateData = {
        status: approvalData.status,
        approval_notes: approvalData.approval_notes,
        approved_by_user_id: approvalData.approved_by_user_id,
        approved_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', expenseId)
        .select(`
          *,
          expense_categories (
            id,
            name,
            color
          ),
          created_by:app_users!created_by_user_id (
            id,
            full_name,
            username
          ),
          approved_by:app_users!approved_by_user_id (
            id,
            full_name,
            username
          )
        `)
        .single()

      if (error) {
        return { expense: null, error: 'Gagal memproses approval pengeluaran' }
      }

      return { expense: data as Expense, error: null }
    } catch (error) {
      console.error('Approve expense error:', error)
      return { expense: null, error: 'Terjadi kesalahan saat memproses approval' }
    }
  }

  // Delete expense
  async deleteExpense(expenseId: string): Promise<{ success: boolean, error: string | null }> {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)

      if (error) {
        return { success: false, error: 'Gagal menghapus pengeluaran' }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Delete expense error:', error)
      return { success: false, error: 'Terjadi kesalahan saat menghapus pengeluaran' }
    }
  }

  // Get expense statistics
  async getExpenseStats(filters?: {
    date_from?: string
    date_to?: string
    category_id?: string
  }): Promise<{ 
    stats: {
      total_expenses: number
      total_amount: number
      pending_count: number
      approved_count: number
      rejected_count: number
      by_category: Array<{
        category_id: string
        category_name: string
        category_color: string
        count: number
        total_amount: number
      }>
      by_payment_method: Array<{
        method: string
        count: number
        total_amount: number
      }>
    }
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('expenses')
        .select(`
          id,
          amount,
          status,
          metode_pembayaran,
          expense_categories (
            id,
            name,
            color
          )
        `)

      // Apply filters
      if (filters?.date_from) {
        query = query.gte('tanggal', filters.date_from)
      }
      if (filters?.date_to) {
        query = query.lte('tanggal', filters.date_to)
      }
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id)
      }

      const { data, error } = await query

      if (error) {
        return { 
          stats: {
            total_expenses: 0,
            total_amount: 0,
            pending_count: 0,
            approved_count: 0,
            rejected_count: 0,
            by_category: [],
            by_payment_method: []
          }, 
          error: 'Gagal mengambil statistik pengeluaran' 
        }
      }

      // Calculate statistics
      const totalExpenses = data.length
      const totalAmount = data.reduce((sum: number, expense: any) => sum + expense.amount, 0)
      const pendingCount = data.filter((e: any) => e.status === 'pending').length
      const approvedCount = data.filter((e: any) => e.status === 'approved').length
      const rejectedCount = data.filter((e: any) => e.status === 'rejected').length

      // Group by category
      const categoryStats = data.reduce((acc: any, expense: any) => {
        const category = Array.isArray(expense.expense_categories) 
          ? expense.expense_categories[0] 
          : expense.expense_categories
        const categoryId = category?.id
        const categoryName = category?.name || 'Unknown'
        const categoryColor = category?.color || '#6B7280'
        
        if (!acc[categoryId]) {
          acc[categoryId] = {
            category_id: categoryId,
            category_name: categoryName,
            category_color: categoryColor,
            count: 0,
            total_amount: 0
          }
        }
        
        acc[categoryId].count++
        acc[categoryId].total_amount += expense.amount
        return acc
      }, {} as Record<string, any>)

      // Group by payment method
      const paymentMethodStats = data.reduce((acc: any, expense: any) => {
        const method = expense.metode_pembayaran
        
        if (!acc[method]) {
          acc[method] = {
            method,
            count: 0,
            total_amount: 0
          }
        }
        
        acc[method].count++
        acc[method].total_amount += expense.amount
        return acc
      }, {} as Record<string, any>)

      return {
        stats: {
          total_expenses: totalExpenses,
          total_amount: totalAmount,
          pending_count: pendingCount,
          approved_count: approvedCount,
          rejected_count: rejectedCount,
          by_category: Object.values(categoryStats),
          by_payment_method: Object.values(paymentMethodStats)
        },
        error: null
      }
    } catch (error) {
      console.error('Get expense stats error:', error)
      return { 
        stats: {
          total_expenses: 0,
          total_amount: 0,
          pending_count: 0,
          approved_count: 0,
          rejected_count: 0,
          by_category: [],
          by_payment_method: []
        }, 
        error: 'Terjadi kesalahan saat mengambil statistik' 
      }
    }
  }
}

export const expenseService = new ExpenseService()