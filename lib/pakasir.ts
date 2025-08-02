// Pakasir Payment Gateway Integration
// Configuration from environment variables

export const PAKASIR_CONFIG = {
  slug: process.env.PAKASIR_SLUG || 'uangkasalhusna',
  apiKey: process.env.PAKASIR_API_KEY || 'u8e0CphRmRVuNwDyqnfNoeOwHa6UBpLg',
  baseUrl: process.env.PAKASIR_BASE_URL || 'https://pakasir.zone.id',
  redirectUrl: process.env.PAKASIR_REDIRECT_URL || 'https://kas-kelas-final.vercel.app'
}

// Generate unique order ID format: KAS + YYYYMM + counter
export const generateOrderId = (): string => {
  const now = new Date()
  const yearMonth = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0')
  const timestamp = now.getTime().toString().slice(-6) // Last 6 digits of timestamp
  return `KAS${yearMonth}${timestamp}`
}

// Generate Pakasir payment URL
export const generatePaymentUrl = (amount: number, orderId: string, qrisOnly = false): string => {
  const baseUrl = `${PAKASIR_CONFIG.baseUrl}/pay/${PAKASIR_CONFIG.slug}/${amount}`
  const params = new URLSearchParams({
    order_id: orderId,
    redirect: `${PAKASIR_CONFIG.redirectUrl}/payment-success`
  })
  
  if (qrisOnly) {
    params.append('qris_only', '1')
  }
  
  return `${baseUrl}?${params.toString()}`
}

// Verify payment status using Pakasir Transaction Detail API
export const verifyPayment = async (amount: number, orderId: string): Promise<any> => {
  try {
    const params = new URLSearchParams({
      project: PAKASIR_CONFIG.slug,
      amount: amount.toString(),
      order_id: orderId,
      api_key: PAKASIR_CONFIG.apiKey
    })
    
    const response = await fetch(`${PAKASIR_CONFIG.baseUrl}/api/transactiondetail?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error verifying payment:', error)
    throw error
  }
}

// Process Pakasir webhook payload
export interface PakasirWebhookPayload {
  amount: number
  order_id: string
  project: string
  status: 'completed' | 'failed' | 'pending'
  payment_method: string
  completed_at: string
}

export const validateWebhookPayload = (payload: any): PakasirWebhookPayload | null => {
  try {
    // Validate required fields
    if (!payload.amount || !payload.order_id || !payload.project || !payload.status) {
      return null
    }
    
    // Validate project matches our slug
    if (payload.project !== PAKASIR_CONFIG.slug) {
      return null
    }
    
    // Validate order_id format (starts with KAS)
    if (!payload.order_id.startsWith('KAS')) {
      return null
    }
    
    return {
      amount: parseInt(payload.amount),
      order_id: payload.order_id,
      project: payload.project,
      status: payload.status,
      payment_method: payload.payment_method || 'unknown',
      completed_at: payload.completed_at || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error validating webhook payload:', error)
    return null
  }
}

// Helper functions for payment status
export const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return { color: 'success', text: 'Lunas', icon: '✅' }
    case 'pending':
      return { color: 'warning', text: 'Menunggu', icon: '⏳' }
    case 'failed':
      return { color: 'danger', text: 'Gagal', icon: '❌' }
    case 'expired':
      return { color: 'secondary', text: 'Kedaluwarsa', icon: '⏰' }
    default:
      return { color: 'secondary', text: 'Unknown', icon: '❓' }
  }
}

// Format currency for Indonesian Rupiah
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Payment methods mapping
export const getPaymentMethodInfo = (method: string) => {
  const methods: { [key: string]: { name: string; icon: string } } = {
    'qris': { name: 'QRIS', icon: '📱' },
    'bank_transfer': { name: 'Transfer Bank', icon: '🏦' },
    'gopay': { name: 'GoPay', icon: '💳' },
    'ovo': { name: 'OVO', icon: '💳' },
    'dana': { name: 'DANA', icon: '💳' },
    'shopeepay': { name: 'ShopeePay', icon: '💳' },
    'linkaja': { name: 'LinkAja', icon: '💳' },
    'bca': { name: 'BCA', icon: '🏦' },
    'mandiri': { name: 'Mandiri', icon: '🏦' },
    'bni': { name: 'BNI', icon: '🏦' },
    'bri': { name: 'BRI', icon: '🏦' },
    'unknown': { name: 'Lainnya', icon: '💰' }
  }
  
  return methods[method.toLowerCase()] || methods['unknown']
}

// Create payment record with Pakasir integration
export const createPaymentWithPakasir = async (
  studentId: string,
  categoryId: string,
  amount: number,
  dueDate: string
) => {
  const orderId = generateOrderId()
  const paymentUrl = generatePaymentUrl(amount, orderId)
  
  const paymentData = {
    student_id: studentId,
    category_id: categoryId,
    amount,
    order_id: orderId,
    pakasir_payment_url: paymentUrl,
    due_date: dueDate,
    status: 'pending' as const
  }
  
  return {
    paymentData,
    paymentUrl,
    orderId
  }
}

// Bulk create payments for all students
export const createBulkPayments = async (
  studentIds: string[],
  categoryId: string,
  amount: number,
  dueDate: string
) => {
  const payments = studentIds.map(studentId => {
    const orderId = generateOrderId()
    const paymentUrl = generatePaymentUrl(amount, orderId)
    
    return {
      student_id: studentId,
      category_id: categoryId,
      amount,
      order_id: orderId,
      pakasir_payment_url: paymentUrl,
      due_date: dueDate,
      status: 'pending' as const
    }
  })
  
  return payments
}

// Helper to check if payment is overdue
export const isPaymentOverdue = (dueDate: string): boolean => {
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

// Calculate days until/past due date
export const getDaysFromDue = (dueDate: string): { days: number; status: 'upcoming' | 'due' | 'overdue' } => {
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays > 0) {
    return { days: diffDays, status: 'upcoming' }
  } else if (diffDays === 0) {
    return { days: 0, status: 'due' }
  } else {
    return { days: Math.abs(diffDays), status: 'overdue' }
  }
}

// Export all configurations and utilities
const pakasirUtils = {
  config: PAKASIR_CONFIG,
  generateOrderId,
  generatePaymentUrl,
  verifyPayment,
  validateWebhookPayload,
  getPaymentStatusBadge,
  formatCurrency,
  getPaymentMethodInfo,
  createPaymentWithPakasir,
  createBulkPayments,
  isPaymentOverdue,
  getDaysFromDue
}

export default pakasirUtils