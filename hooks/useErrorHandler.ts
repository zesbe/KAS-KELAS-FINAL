import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { ERROR_MESSAGES } from '@/lib/constants'

interface ErrorOptions {
  showToast?: boolean
  fallbackMessage?: string
  onError?: (error: any) => void
}

export function useErrorHandler() {
  const handleError = useCallback((error: any, options: ErrorOptions = {}) => {
    const {
      showToast = true,
      fallbackMessage = ERROR_MESSAGES.GENERIC,
      onError
    } = options

    // Log error for debugging
    console.error('Error caught:', error)

    // Extract error message
    let errorMessage = fallbackMessage
    
    if (error?.message) {
      errorMessage = error.message
    } else if (error?.error?.message) {
      errorMessage = error.error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }

    // Handle specific error types
    if (error?.code === 'PGRST301') {
      errorMessage = 'Session expired. Please login again.'
    } else if (error?.code === '23505') {
      errorMessage = 'Data already exists.'
    } else if (error?.code === '23503') {
      errorMessage = 'Cannot delete - data is being used elsewhere.'
    } else if (error?.code === 'NETWORK_ERROR') {
      errorMessage = ERROR_MESSAGES.NETWORK
    }

    // Show toast notification
    if (showToast) {
      toast.error(errorMessage)
    }

    // Call custom error handler if provided
    if (onError) {
      onError(error)
    }

    return errorMessage
  }, [])

  return { handleError }
}

// Async wrapper with error handling
export function useAsyncError() {
  const { handleError } = useErrorHandler()

  const execute = useCallback(async <T,>(
    asyncFunction: () => Promise<T>,
    options: ErrorOptions = {}
  ): Promise<T | null> => {
    try {
      return await asyncFunction()
    } catch (error) {
      handleError(error, options)
      return null
    }
  }, [handleError])

  return { execute }
}