'use client'

import React from 'react'
import { BookOpen } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-2xl">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>
        
        {/* Title */}
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          {title}
        </h2>
        
        {subtitle && (
          <p className="mt-2 text-center text-sm text-gray-600">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-200">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          KasKelas - Sistem Manajemen Kas Kelas Modern
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Dikembangkan dengan ❤️ untuk pendidikan Indonesia
        </p>
      </div>
    </div>
  )
}

export default AuthLayout