'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatsCard from '@/components/dashboard/StatsCard'
import PaymentChart from '@/components/dashboard/PaymentChart'
import RecentActivities from '@/components/dashboard/RecentActivities'
import QuickActions from '@/components/dashboard/QuickActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { balanceService, BalanceData, PaymentSummary, ExpenseSummary, formatCurrency } from '@/lib/balanceService'
import { expenseService } from '@/lib/expense-service'
import { supabase } from '@/lib/supabase'
import { 
  Wallet, 
  Users, 
  CreditCard, 
  Receipt, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  MessageCircle
} from 'lucide-react'
import { currencyUtils, dateUtils } from '@/lib/utils'
import toast from 'react-hot-toast'

interface DashboardData {
  balance: BalanceData
  payments: PaymentSummary
  expenses: ExpenseSummary
  recentExpenses: any[]
  unpaidStudents: any[]
}

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const router = useRouter()

  // Load dashboard data from Supabase
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get balance, payments, and expenses summary
      const stats = await balanceService.getDashboardStats()
      
      // Get recent expenses
      const { expenses: recentExpenses } = await expenseService.getExpenses({
        limit: 5,
        offset: 0
      })

      // Get unpaid students (dummy for now - will implement when payments table is populated)
      const unpaidStudents = [
        { id: 1, name: 'Muhammad Fajar', amount: 25000, daysOverdue: 0, phone: '628345678901' },
        { id: 2, name: 'Nabila Azzahra', amount: 25000, daysOverdue: 2, phone: '628890123456' },
        { id: 3, name: 'Kevin Alamsyah', amount: 25000, daysOverdue: 5, phone: '628123456780' }
      ]

      setDashboardData({
        balance: stats.balance,
        payments: stats.payments,
        expenses: stats.expenses,
        recentExpenses,
        unpaidStudents
      })

      setLastRefresh(new Date())
      toast.success('Data berhasil dimuat')
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Gagal memuat data dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadDashboardData()
  }

  // Load data on component mount
  useEffect(() => {
    loadDashboardData()

    // Subscribe to real-time balance changes
    const unsubscribe = balanceService.subscribeToBalanceChanges((newBalance) => {
      if (dashboardData) {
        setDashboardData(prev => prev ? { ...prev, balance: newBalance } : null)
      }
    })

    return unsubscribe
  }, [])

  if (loading || !dashboardData) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Memuat data dashboard...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const { balance, payments, expenses } = dashboardData
  const paymentCompletionRate = payments.paymentRate
  const balanceChange = balance.totalIncome - balance.totalExpenses

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Selamat datang kembali! Berikut ringkasan kas kelas Anda.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <p className="text-sm text-gray-500">
              Update terakhir: {dateUtils.getRelativeTime(lastRefresh.toISOString())}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              loading={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Alert for overdue payments */}
        {dashboardData.unpaidStudents.filter(s => s.daysOverdue > 0).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Perhatian: {dashboardData.unpaidStudents.filter(s => s.daysOverdue > 0).length} siswa terlambat bayar
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Segera kirim reminder atau hubungi orang tua siswa yang terlambat.
                </p>
              </div>
              <Button variant="danger" size="sm">
                Kirim Reminder
              </Button>
            </div>
          </div>
        )}

        {/* Balance Alert */}
        {balance.currentBalance < 500000 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Saldo kas mulai menipis
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Saldo saat ini {formatCurrency(balance.currentBalance)}. Pertimbangkan untuk menunda pengeluaran non-urgent.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Saldo Kas"
            value={formatCurrency(balance.currentBalance)}
            icon={Wallet}
            description="Total saldo saat ini"
            trend={{
              value: balanceChange > 0 ? Math.round((balanceChange / balance.totalIncome) * 100) : 0,
              label: 'dari pemasukan',
              isPositive: balanceChange > 0
            }}
            color="blue"
          />
          
          <StatsCard
            title="Total Siswa"
            value={payments.studentsPaid + payments.studentsUnpaid}
            icon={Users}
            description={`${payments.studentsPaid} sudah bayar`}
            trend={{
              value: Math.round(paymentCompletionRate),
              label: 'completion rate',
              isPositive: paymentCompletionRate > 80
            }}
            color="green"
          />
          
          <StatsCard
            title="Pemasukan"
            value={formatCurrency(balance.totalIncome)}
            icon={CreditCard}
            description="Total pembayaran diterima"
            color="green"
          />
          
          <StatsCard
            title="Pengeluaran"
            value={formatCurrency(balance.totalExpenses)}
            icon={Receipt}
            description={`${expenses.countApproved} transaksi approved`}
            color="red"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PaymentChart
              type="bar"
              title="Pemasukan vs Pengeluaran"
              description="Perbandingan cashflow 6 bulan terakhir"
            />
          </div>
          
          <div>
            <PaymentChart
              type="pie"
              title="Status Pembayaran"
              description="Distribusi status pembayaran siswa"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <RecentActivities />
          </div>

          {/* Unpaid Students */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Siswa Belum Bayar</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {dashboardData.unpaidStudents.length} dari {payments.studentsPaid + payments.studentsUnpaid} siswa
                  </p>
                </div>
                <Badge variant="warning">
                  {dashboardData.unpaidStudents.length}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.unpaidStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currencyUtils.format(student.amount)}
                        </p>
                      </div>
                      <div className="text-right">
                        {student.daysOverdue > 0 ? (
                          <Badge variant="danger" size="sm">
                            {student.daysOverdue} hari
                          </Badge>
                        ) : (
                          <Badge variant="warning" size="sm">
                            Jatuh tempo
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button 
                    variant="primary" 
                    className="w-full" 
                    size="sm"
                    onClick={() => router.push('/dashboard/whatsapp')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Kirim Reminder WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Payments - Placeholder until payment system is implemented */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pembayaran Terbaru</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Belum ada pembayaran hari ini
              </p>
            </div>
            <Button variant="ghost" size="sm">
              Lihat Semua
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Belum ada data pembayaran</p>
              <p className="text-sm text-gray-400 mt-1">Pembayaran akan muncul di sini setelah sistem pembayaran aktif</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage