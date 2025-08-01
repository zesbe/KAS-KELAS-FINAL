import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export const dateUtils = {
  // Format date to Indonesian locale
  formatDate: (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  },

  // Format date for input fields (YYYY-MM-DD)
  formatDateInput: (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toISOString().split('T')[0]
  },

  // Get month name in Indonesian
  getMonthName: (monthIndex: number): string => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return months[monthIndex]
  },

  // Get current month year string
  getCurrentMonthYear: (): string => {
    const now = new Date()
    return `${dateUtils.getMonthName(now.getMonth())} ${now.getFullYear()}`
  },

  // Get first and last day of month
  getMonthRange: (year: number, month: number): { start: Date; end: Date } => {
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0)
    return { start, end }
  },

  // Check if date is today
  isToday: (date: string | Date): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date
    const today = new Date()
    return d.toDateString() === today.toDateString()
  },

  // Get relative time (e.g., "2 days ago", "in 3 days")
  getRelativeTime: (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffTime = d.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hari ini'
    if (diffDays === 1) return 'Besok'
    if (diffDays === -1) return 'Kemarin'
    if (diffDays > 1) return `${diffDays} hari lagi`
    if (diffDays < -1) return `${Math.abs(diffDays)} hari yang lalu`
    
    return dateUtils.formatDate(d)
  }
}

// Currency formatting utilities
export const currencyUtils = {
  // Format number to Indonesian Rupiah
  format: (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  },

  // Format number without currency symbol
  formatNumber: (amount: number): string => {
    return new Intl.NumberFormat('id-ID').format(amount)
  },

  // Parse formatted currency string back to number
  parse: (formattedAmount: string): number => {
    return parseInt(formattedAmount.replace(/[^\d]/g, '')) || 0
  },

  // Add thousand separators
  addSeparators: (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseInt(amount) : amount
    return num.toLocaleString('id-ID')
  }
}

// String utilities
export const stringUtils = {
  // Capitalize first letter
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  },

  // Convert to title case
  toTitleCase: (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  },

  // Generate initials from name
  getInitials: (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  },

  // Truncate text with ellipsis
  truncate: (str: string, length: number): string => {
    return str.length > length ? str.substring(0, length) + '...' : str
  },

  // Generate slug from string
  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}

// Validation utilities
export const validationUtils = {
  // Validate email address
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Validate Indonesian phone number
  isValidPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^(\+62|62|0)[2-9]\d{7,11}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  },

  // Validate required field
  isRequired: (value: any): boolean => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    return true
  },

  // Validate positive number
  isPositiveNumber: (value: number): boolean => {
    return !isNaN(value) && value > 0
  },

  // Validate date format (YYYY-MM-DD)
  isValidDate: (dateString: string): boolean => {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  }
}

// Array utilities
export const arrayUtils = {
  // Group array by key
  groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = String(item[key])
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {} as Record<string, T[]>)
  },

  // Remove duplicates from array
  unique: <T>(array: T[]): T[] => {
    return array.filter((item, index) => array.indexOf(item) === index)
  },

  // Sort array by multiple keys
  sortBy: <T>(array: T[], ...keys: (keyof T)[]): T[] => {
    return array.sort((a, b) => {
      for (const key of keys) {
        if (a[key] < b[key]) return -1
        if (a[key] > b[key]) return 1
      }
      return 0
    })
  },

  // Chunk array into smaller arrays
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}

// Local storage utilities (client-side only)
export const storageUtils = {
  // Set item in localStorage
  set: (key: string, value: any): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value))
    }
  },

  // Get item from localStorage
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    }
    return defaultValue || null
  },

  // Remove item from localStorage
  remove: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  },

  // Clear all localStorage
  clear: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }
  }
}

// File utilities
export const fileUtils = {
  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // Get file extension
  getFileExtension: (filename: string): string => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
  },

  // Check if file is image
  isImage: (filename: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
    const extension = fileUtils.getFileExtension(filename).toLowerCase()
    return imageExtensions.includes(extension)
  },

  // Generate filename with timestamp
  generateFilename: (originalName: string): string => {
    const timestamp = Date.now()
    const extension = fileUtils.getFileExtension(originalName)
    const nameWithoutExt = originalName.replace(`.${extension}`, '')
    return `${nameWithoutExt}_${timestamp}.${extension}`
  }
}

// Export utility functions
export const utils = {
  date: dateUtils,
  currency: currencyUtils,
  string: stringUtils,
  validation: validationUtils,
  array: arrayUtils,
  storage: storageUtils,
  file: fileUtils
}