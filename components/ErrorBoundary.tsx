'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <h2 className="mt-4 text-xl font-semibold text-center text-gray-900">
              Oops! Terjadi Kesalahan
            </h2>
            
            <p className="mt-2 text-sm text-center text-gray-600">
              Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi administrator.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                onClick={this.handleReset}
                className="flex-1"
              >
                Muat Ulang
              </Button>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="flex-1"
              >
                Kembali
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}