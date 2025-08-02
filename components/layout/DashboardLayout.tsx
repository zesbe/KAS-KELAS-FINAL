'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/components/providers/AuthProvider'
import { balanceService, formatCurrency } from '@/lib/balanceService'
import {
  BookOpen,
  Home,
  Users,
  CreditCard,
  Receipt,
  MessageCircle,
  FileText,
  Settings,
  Menu,
  X,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Wallet,
  Send,
  TrendingUp
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  description?: string
  badge?: number
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview dan statistik kas'
  },
  {
    name: 'Siswa',
    href: '/dashboard/students',
    icon: Users,
    description: 'Data dan manajemen siswa'
  },
  {
    name: 'Pembayaran',
    href: '/dashboard/payments',
    icon: CreditCard,
    description: 'Tagihan dan pembayaran'
  },
  {
    name: 'Pengeluaran',
    href: '/dashboard/expenses',
    icon: Receipt,
    description: 'Pengeluaran kas kelas'
  },
  {
    name: 'WhatsApp',
    href: '/dashboard/whatsapp',
    icon: MessageCircle,
    description: 'Kirim pesan dan reminder'
  },
  {
    name: 'Broadcast Tagihan',
    href: '/dashboard/broadcast-tagihan',
    icon: Send,
    description: 'Kirim tagihan massal'
  },
  {
    name: 'Laporan',
    href: '/dashboard/reports',
    icon: FileText,
    description: 'Laporan keuangan'
  },
  {
    name: 'Laporan Keuangan',
    href: '/dashboard/laporan-keuangan',
    icon: TrendingUp,
    description: 'Download laporan CSV/PDF'
  },
  {
    name: 'Pengaturan',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Konfigurasi aplikasi'
  }
]

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [currentBalance, setCurrentBalance] = useState(0)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  // Load current balance
  useEffect(() => {
    const loadBalance = async () => {
      try {
        const balanceData = await balanceService.getCurrentBalance()
        setCurrentBalance(balanceData.currentBalance)
      } catch (error) {
        console.error('Error loading balance:', error)
      }
    }

    loadBalance()

    // Subscribe to real-time balance changes
    const unsubscribe = balanceService.subscribeToBalanceChanges((balance) => {
      setCurrentBalance(balance.currentBalance)
    })

    return unsubscribe
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">KasKelas</h1>
                <p className="text-xs text-gray-500">Kelas 1A - SD Indonesia</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-b border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Saldo Kas</span>
                <Wallet className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(currentBalance)}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {currentBalance > 0 ? '↗ Real-time' : '↘ Real-time'}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <button
                  key={item.name}
                  onClick={(e) => {
                    e.preventDefault();
                    setSidebarOpen(false);
                    // Use router.push to navigate smoothly without scroll jump
                    router.push(item.href);
                  }}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 w-full text-left',
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    )}
                  </div>
                </button>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900"
              >
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900">{user?.full_name || user?.username || 'User'}</div>
                  <div className="text-xs text-gray-500">{user?.role === 'bendahara' ? 'Bendahara Kelas' : user?.role === 'admin' ? 'Admin' : 'User'}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profil Saya
                  </Link>
                  <button 
                    onClick={logout}
                    className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="ml-4 lg:ml-0">
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Kelola kas kelas dengan mudah</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Quick actions */}
              <div className="hidden md:flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Kirim WhatsApp
                </Button>
                <Button size="sm">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Buat Tagihan
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout