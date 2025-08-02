// Real-time Balance Calculation Service
import { supabase } from './supabase'

export interface BalanceData {
  totalIncome: number
  totalExpenses: number
  currentBalance: number
  pendingExpenses: number
  lastUpdated: string
}

export interface PaymentSummary {
  totalPaid: number
  totalUnpaid: number
  studentsPaid: number
  studentsUnpaid: number
  paymentRate: number
}

export interface ExpenseSummary {
  totalApproved: number
  totalPending: number
  totalRejected: number
  countApproved: number
  countPending: number
  countRejected: number
}

class BalanceService {
  // Hitung total pemasukan dari payments
  async getTotalIncome(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid')

      if (error) {
        console.error('Error getting total income:', error)
        return 0
      }

      return data?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0
    } catch (error) {
      console.error('Error calculating total income:', error)
      return 0
    }
  }

  // Hitung total pengeluaran yang sudah approved
  async getTotalExpenses(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('amount')
        .eq('status', 'approved')

      if (error) {
        console.error('Error getting total expenses:', error)
        return 0
      }

      return data?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0
    } catch (error) {
      console.error('Error calculating total expenses:', error)
      return 0
    }
  }

  // Hitung pengeluaran yang masih pending
  async getPendingExpenses(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('amount')
        .eq('status', 'pending')

      if (error) {
        console.error('Error getting pending expenses:', error)
        return 0
      }

      return data?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0
    } catch (error) {
      console.error('Error calculating pending expenses:', error)
      return 0
    }
  }

  // Hitung saldo kas real-time
  async getCurrentBalance(): Promise<BalanceData> {
    try {
      const [totalIncome, totalExpenses, pendingExpenses] = await Promise.all([
        this.getTotalIncome(),
        this.getTotalExpenses(),
        this.getPendingExpenses()
      ])

      const currentBalance = totalIncome - totalExpenses

      return {
        totalIncome,
        totalExpenses,
        currentBalance,
        pendingExpenses,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error calculating current balance:', error)
      return {
        totalIncome: 0,
        totalExpenses: 0,
        currentBalance: 0,
        pendingExpenses: 0,
        lastUpdated: new Date().toISOString()
      }
    }
  }

  // Statistik pembayaran siswa
  async getPaymentSummary(): Promise<PaymentSummary> {
    try {
      // Ambil total siswa aktif
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('is_active', true)

      if (studentsError) {
        console.error('Error getting students:', studentsError)
        return {
          totalPaid: 0,
          totalUnpaid: 0,
          studentsPaid: 0,
          studentsUnpaid: 0,
          paymentRate: 0
        }
      }

      const totalStudents = students?.length || 0

      // Ambil pembayaran bulan ini
      const now = new Date()
      const currentMonth = now.toISOString().slice(0, 7) // YYYY-MM format
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10)
      
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('student_id, amount, status')
        .gte('due_date', currentMonth + '-01')
        .lt('due_date', nextMonth)

      if (paymentsError) {
        console.error('Error getting payments:', paymentsError)
        return {
          totalPaid: 0,
          totalUnpaid: 0,
          studentsPaid: 0,
          studentsUnpaid: 0,
          paymentRate: 0
        }
      }

      // Hitung yang sudah bayar
      const paidPayments = payments?.filter((p: any) => p.status === 'paid') || []
      const uniquePaidStudents = Array.from(new Set(paidPayments.map((p: any) => p.student_id)))
      
      const totalPaid = paidPayments.reduce((sum: number, p: any) => sum + p.amount, 0)
      const studentsPaid = uniquePaidStudents.length
      const studentsUnpaid = totalStudents - studentsPaid
      const paymentRate = totalStudents > 0 ? (studentsPaid / totalStudents) * 100 : 0

      // Estimasi total yang belum dibayar (asumsi 25000 per siswa)
      const totalUnpaid = studentsUnpaid * 25000

      return {
        totalPaid,
        totalUnpaid,
        studentsPaid,
        studentsUnpaid,
        paymentRate: Math.round(paymentRate * 10) / 10 // Round to 1 decimal
      }
    } catch (error) {
      console.error('Error calculating payment summary:', error)
      return {
        totalPaid: 0,
        totalUnpaid: 0,
        studentsPaid: 0,
        studentsUnpaid: 0,
        paymentRate: 0
      }
    }
  }

  // Statistik pengeluaran
  async getExpenseSummary(): Promise<ExpenseSummary> {
    try {
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('amount, status')

      if (error) {
        console.error('Error getting expenses:', error)
        return {
          totalApproved: 0,
          totalPending: 0,
          totalRejected: 0,
          countApproved: 0,
          countPending: 0,
          countRejected: 0
        }
      }

      const approved = expenses?.filter((e: any) => e.status === 'approved') || []
      const pending = expenses?.filter((e: any) => e.status === 'pending') || []
      const rejected = expenses?.filter((e: any) => e.status === 'rejected') || []

      return {
        totalApproved: approved.reduce((sum: number, e: any) => sum + e.amount, 0),
        totalPending: pending.reduce((sum: number, e: any) => sum + e.amount, 0),
        totalRejected: rejected.reduce((sum: number, e: any) => sum + e.amount, 0),
        countApproved: approved.length,
        countPending: pending.length,
        countRejected: rejected.length
      }
    } catch (error) {
      console.error('Error calculating expense summary:', error)
      return {
        totalApproved: 0,
        totalPending: 0,
        totalRejected: 0,
        countApproved: 0,
        countPending: 0,
        countRejected: 0
      }
    }
  }

  // Dashboard stats lengkap
  async getDashboardStats(): Promise<{
    balance: BalanceData
    payments: PaymentSummary
    expenses: ExpenseSummary
  }> {
    try {
      const [balance, payments, expenses] = await Promise.all([
        this.getCurrentBalance(),
        this.getPaymentSummary(),
        this.getExpenseSummary()
      ])

      return { balance, payments, expenses }
    } catch (error) {
      console.error('Error getting dashboard stats:', error)
      return {
        balance: {
          totalIncome: 0,
          totalExpenses: 0,
          currentBalance: 0,
          pendingExpenses: 0,
          lastUpdated: new Date().toISOString()
        },
        payments: {
          totalPaid: 0,
          totalUnpaid: 0,
          studentsPaid: 0,
          studentsUnpaid: 0,
          paymentRate: 0
        },
        expenses: {
          totalApproved: 0,
          totalPending: 0,
          totalRejected: 0,
          countApproved: 0,
          countPending: 0,
          countRejected: 0
        }
      }
    }
  }

  // Real-time subscription untuk perubahan balance
  subscribeToBalanceChanges(callback: (balance: BalanceData) => void) {
    // Subscribe ke perubahan pada tabel payments dan expenses
    const paymentsSubscription = supabase
      .channel('payments-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'payments' },
        async () => {
          const balance = await this.getCurrentBalance()
          callback(balance)
        }
      )
      .subscribe()

    const expensesSubscription = supabase
      .channel('expenses-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        async () => {
          const balance = await this.getCurrentBalance()
          callback(balance)
        }
      )
      .subscribe()

    // Return cleanup function
    return () => {
      paymentsSubscription.unsubscribe()
      expensesSubscription.unsubscribe()
    }
  }
}

export const balanceService = new BalanceService()

// Helper functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`
}