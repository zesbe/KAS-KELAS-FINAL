'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatsCard from '@/components/dashboard/StatsCard'
import PaymentChart from '@/components/dashboard/PaymentChart'
import RecentActivities from '@/components/dashboard/RecentActivities'
import QuickActions from '@/components/dashboard/QuickActions'
import RecentPayments from '@/components/dashboard/RecentPayments'
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

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h2>
              <p className="text-gray-600 mb-4">Maaf, terjadi kesalahan saat memuat dashboard.</p>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Muat Ulang
              </Button>
            </div>
          </div>
        </DashboardLayout>
      )
    }

    return this.props.children
  }
}

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const router = useRouter()

  // Load dashboard data from Supabase
  const loadDashboardData = async () => {
    console.log('Loading dashboard data...')
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    
    try {
      setLoading(true)
      
      // Get balance, payments, and expenses summary with error handling
      let stats
      try {
        stats = await balanceService.getDashboardStats()
      } catch (error) {
        console.error('Error loading stats:', error)
        // Provide default values if stats fail
        stats = {
          balance: {
            currentBalance: 0,
            totalIncome: 0,
            totalExpenses: 0,
            pendingExpenses: 0,
            lastUpdated: new Date().toISOString()
          },
          payments: {
            studentsPaid: 0,
            studentsUnpaid: 0,
            totalPaid: 0,
            totalUnpaid: 0,
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
      
      // Get recent expenses with error handling
      let recentExpenses: any[] = []
      try {
        const { expenses } = await expenseService.getExpenses({
          limit: 5,
          offset: 0
        })
        recentExpenses = expenses || []
      } catch (error) {
        console.error('Error loading expenses:', error)
        recentExpenses = []
      }

      // Get unpaid students from Supabase with error handling
      let unpaidStudents: any[] = []
      try {
        const { data: unpaidPayments, error: unpaidError } = await supabase
          .from('payments')
          .select(`
            id,
            amount,
            due_date,
            student:students(
              id,
              nama,
              nomor_hp_ortu
            )
          `)
          .eq('status', 'pending')
          .order('due_date', { ascending: true })
          .limit(10)

        if (!unpaidError && unpaidPayments) {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          unpaidStudents = unpaidPayments
            .filter((p: any) => p.student) // Ensure student exists
            .map((payment: any) => {
              const dueDate = new Date(payment.due_date)
              const diffTime = today.getTime() - dueDate.getTime()
              const daysOverdue = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
              
              return {
                id: payment.student.id,
                name: payment.student.nama,
                amount: payment.amount,
                daysOverdue,
                phone: payment.student.nomor_hp_ortu
              }
            })
        }
      } catch (error) {
        console.error('Error loading unpaid students:', error)
      }

      setDashboardData({
        balance: stats.balance,
        payments: stats.payments,
        expenses: stats.expenses,
        recentExpenses,
        unpaidStudents
      })

      setLastRefresh(new Date())
      // toast.success('Data berhasil dimuat') // Removed to avoid annoying notifications
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Gagal memuat data dashboard')
      
      // Set default data to prevent crash
      setDashboardData({
        balance: {
          currentBalance: 0,
          totalIncome: 0,
          totalExpenses: 0,
          pendingExpenses: 0,
          lastUpdated: new Date().toISOString()
        },
        payments: {
          studentsPaid: 0,
          studentsUnpaid: 0,
          totalPaid: 0,
          totalUnpaid: 0,
          paymentRate: 0
        },
        expenses: {
          totalApproved: 0,
          totalPending: 0,
          totalRejected: 0,
          countApproved: 0,
          countPending: 0,
          countRejected: 0
        },
        recentExpenses: [],
        unpaidStudents: []
      })
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
      setDashboardData(prev => prev ? { ...prev, balance: newBalance } : null)
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
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => router.push('/dashboard/whatsapp')}
              >
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

        {/* Recent Payments */}
        <RecentPayments />

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </DashboardLayout>
  )
}

const DashboardPageWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary>
      <DashboardPage />
    </ErrorBoundary>
  )
}

export default DashboardPageWithErrorBoundary