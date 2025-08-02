import { supabase } from './supabase'

export interface Activity {
  id: string
  type: 'payment' | 'expense' | 'whatsapp' | 'reminder'
  title: string
  description: string
  amount?: number
  timestamp: string
  status?: 'success' | 'pending' | 'failed'
  studentName?: string
}

class ActivityService {
  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    try {
      const activities: Activity[] = []
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      // Fetch recent payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          status,
          created_at,
          updated_at,
          student:students(nama)
        `)
        .gte('updated_at', twentyFourHoursAgo)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (!paymentsError && payments) {
        payments.forEach(payment => {
          if (payment.status === 'paid') {
            activities.push({
              id: `payment-${payment.id}`,
              type: 'payment',
              title: 'Pembayaran Diterima',
              description: `${payment.student?.nama || 'Unknown'} - Kas Kelas`,
              amount: payment.amount,
              timestamp: payment.updated_at,
              status: 'success',
              studentName: payment.student?.nama
            })
          }
        })
      }

      // Fetch recent expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          id,
          amount,
          description,
          status,
          created_at,
          category:expense_categories(name)
        `)
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (!expensesError && expenses) {
        expenses.forEach(expense => {
          activities.push({
            id: `expense-${expense.id}`,
            type: 'expense',
            title: 'Pengeluaran Baru',
            description: expense.description || expense.category?.name || 'Pengeluaran',
            amount: expense.amount,
            timestamp: expense.created_at,
            status: expense.status === 'approved' ? 'success' : expense.status === 'rejected' ? 'failed' : 'pending'
          })
        })
      }

      // Fetch recent WhatsApp messages from audit logs
      const { data: whatsappLogs, error: whatsappError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('action', 'whatsapp_sent')
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (!whatsappError && whatsappLogs) {
        whatsappLogs.forEach(log => {
          const metadata = log.metadata || {}
          activities.push({
            id: `whatsapp-${log.id}`,
            type: 'whatsapp',
            title: 'WhatsApp Terkirim',
            description: metadata.description || 'Pesan WhatsApp terkirim',
            timestamp: log.created_at,
            status: 'success'
          })
        })
      }

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      // Return only the requested limit
      return activities.slice(0, limit)
    } catch (error) {
      console.error('Error fetching activities:', error)
      return []
    }
  }

  async getActivityCount(): Promise<number> {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      let count = 0

      // Count payments
      const { count: paymentCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'paid')
        .gte('updated_at', twentyFourHoursAgo)

      if (paymentCount) count += paymentCount

      // Count expenses
      const { count: expenseCount } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', twentyFourHoursAgo)

      if (expenseCount) count += expenseCount

      // Count WhatsApp messages
      const { count: whatsappCount } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'whatsapp_sent')
        .gte('created_at', twentyFourHoursAgo)

      if (whatsappCount) count += whatsappCount

      return count
    } catch (error) {
      console.error('Error counting activities:', error)
      return 0
    }
  }
}

export const activityService = new ActivityService()