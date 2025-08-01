'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatsCard from '@/components/dashboard/StatsCard'
import PaymentChart from '@/components/dashboard/PaymentChart'
import RecentActivities from '@/components/dashboard/RecentActivities'
import QuickActions from '@/components/dashboard/QuickActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
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

// Sample data - in real app, this would come from Supabase
const dashboardStats = {
  totalBalance: 2875000,
  totalStudents: 25,
  paidStudents: 22,
  unpaidStudents: 3,
  overdueStudents: 1,
  monthlyIncome: 650000,
  monthlyExpense: 125000,
  lastUpdated: new Date().toISOString()
}

const unpaidStudents = [
  { id: 1, name: 'Muhammad Fajar', amount: 25000, daysOverdue: 0, phone: '628345678901' },
  { id: 2, name: 'Nabila Azzahra', amount: 25000, daysOverdue: 2, phone: '628890123456' },
  { id: 3, name: 'Kevin Alamsyah', amount: 25000, daysOverdue: 5, phone: '628123456780' }
]

const recentPayments = [
  { id: 1, studentName: 'Ahmad Rizki', amount: 25000, timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 2, studentName: 'Siti Nurhaliza', amount: 25000, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 3, studentName: 'Aisyah Putri', amount: 25000, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() }
]

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const handleRefresh = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLastRefresh(new Date())
    setLoading(false)
  }

  const paymentCompletionRate = Math.round((dashboardStats.paidStudents / dashboardStats.totalStudents) * 100)
  const balanceChange = dashboardStats.monthlyIncome - dashboardStats.monthlyExpense

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
        {dashboardStats.overdueStudents > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Perhatian: {dashboardStats.overdueStudents} siswa terlambat bayar
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Saldo Kas"
            value={currencyUtils.format(dashboardStats.totalBalance)}
            icon={Wallet}
            description="Total saldo saat ini"
            trend={{
              value: 12,
              label: 'bulan ini',
              isPositive: balanceChange > 0
            }}
            color="blue"
          />
          
          <StatsCard
            title="Total Siswa"
            value={dashboardStats.totalStudents}
            icon={Users}
            description={`${dashboardStats.paidStudents} sudah bayar`}
            trend={{
              value: paymentCompletionRate,
              label: 'completion rate',
              isPositive: paymentCompletionRate > 80
            }}
            color="green"
          />
          
          <StatsCard
            title="Pemasukan Bulan Ini"
            value={currencyUtils.format(dashboardStats.monthlyIncome)}
            icon={CreditCard}
            description="Pembayaran yang diterima"
            color="green"
          />
          
          <StatsCard
            title="Pengeluaran Bulan Ini"
            value={currencyUtils.format(dashboardStats.monthlyExpense)}
            icon={Receipt}
            description="Total pengeluaran kas"
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
                    {dashboardStats.unpaidStudents} dari {dashboardStats.totalStudents} siswa
                  </p>
                </div>
                <Badge variant="warning">
                  {dashboardStats.unpaidStudents}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unpaidStudents.map((student) => (
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
                  <Button variant="primary" className="w-full" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Kirim Reminder WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pembayaran Terbaru</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {recentPayments.length} pembayaran diterima hari ini
              </p>
            </div>
            <Button variant="ghost" size="sm">
              Lihat Semua
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">
                      Siswa
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">
                      Jumlah
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">
                      Waktu
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="py-3 text-sm font-medium text-gray-900">
                        {payment.studentName}
                      </td>
                      <td className="py-3 text-sm text-green-600 font-medium">
                        +{currencyUtils.format(payment.amount)}
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {dateUtils.getRelativeTime(payment.timestamp)}
                      </td>
                      <td className="py-3">
                        <StatusBadge status="completed" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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