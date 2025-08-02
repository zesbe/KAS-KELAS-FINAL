// Application constants

export const APP_NAME = 'Kas Kelas'
export const APP_VERSION = '1.0.0'

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  STUDENTS: '/dashboard/students',
  PAYMENTS: '/dashboard/payments',
  CREATE_PAYMENT: '/dashboard/payments/create',
  EXPENSES: '/dashboard/expenses',
  REPORTS: '/dashboard/laporan-keuangan',
  ACTIVITIES: '/dashboard/activities',
  WHATSAPP: '/dashboard/whatsapp',
  BROADCAST: '/dashboard/broadcast-tagihan',
  SETTINGS: '/dashboard/settings',
  PROFILE: '/dashboard/profile',
  PAYMENT_SUCCESS: '/payment-success'
} as const

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  BENDAHARA: 'bendahara',
  USER: 'user'
} as const

// Payment status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  EXPIRED: 'expired'
} as const

// Expense status
export const EXPENSE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const

// Transaction types
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
} as const

// Activity types
export const ACTIVITY_TYPES = {
  PAYMENT: 'payment',
  EXPENSE: 'expense',
  STUDENT: 'student',
  USER: 'user'
} as const

// WhatsApp message types
export const MESSAGE_TYPES = {
  PAYMENT_REMINDER: 'payment_reminder',
  PAYMENT_CONFIRMATION: 'payment_confirmation',
  BROADCAST: 'broadcast',
  CUSTOM: 'custom'
} as const

// Reminder types
export const REMINDER_TYPES = {
  BEFORE_DUE: 'before_due',
  ON_DUE: 'on_due',
  AFTER_DUE_3: 'after_due_3',
  AFTER_DUE_7: 'after_due_7'
} as const

// Default values
export const DEFAULTS = {
  PAYMENT_AMOUNT: 50000,
  ITEMS_PER_PAGE: 10,
  SESSION_DURATION_HOURS: 24,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg']
} as const

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  DISPLAY_WITH_TIME: 'dd MMM yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  MONTH_YEAR: 'MMMM yyyy',
  API: "yyyy-MM-dd'T'HH:mm:ss"
} as const

// Currency
export const CURRENCY = {
  CODE: 'IDR',
  SYMBOL: 'Rp',
  LOCALE: 'id-ID'
} as const

// Colors for charts and UI
export const COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#6366F1',
  CHART_COLORS: [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#14B8A6',
    '#F97316'
  ]
} as const

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Terjadi kesalahan, silakan coba lagi',
  NETWORK: 'Koneksi gagal, periksa internet Anda',
  UNAUTHORIZED: 'Anda tidak memiliki akses',
  SESSION_EXPIRED: 'Sesi Anda telah berakhir, silakan login kembali',
  VALIDATION: 'Data yang Anda masukkan tidak valid'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  SAVE: 'Data berhasil disimpan',
  UPDATE: 'Data berhasil diperbarui',
  DELETE: 'Data berhasil dihapus',
  SEND: 'Pesan berhasil dikirim'
} as const