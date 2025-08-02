'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PaymentTable from '@/components/payments/PaymentTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus,
  MessageCircle,
  Download,
  RefreshCw
} from 'lucide-react'
import { Payment } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { currencyUtils } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          student:students(*),
          category:payment_categories(*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Gagal memuat data pembayaran')
        console.error(error)
      } else {
        setPayments(data || [])
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await fetchPayments()
    toast.success('Data pembayaran berhasil diperbarui!')
  }

  // Calculate statistics
  const totalPayments = payments.length
  const completedPayments = payments.filter(p => p.status === 'completed').length
  const pendingPayments = payments.filter(p => p.status === 'pending').length
  const overduePayments = payments.filter(p => {
    if (p.status !== 'pending') return false
    const dueDate = new Date(p.due_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return dueDate < today
  }).length

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const completedAmount = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)

  const handleSendBulkReminder = async () => {
    const overdueList = payments.filter(p => {
      if (p.status !== 'pending') return false
      const dueDate = new Date(p.due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return dueDate < today
    })
    
    if (overdueList.length === 0) {
      toast.error('Tidak ada pembayaran yang terlambat')
      return
    }
    
    // Navigate to WhatsApp broadcast page with overdue payments
    const studentIds = overdueList.map(p => p.student_id).join(',')
    window.location.href = `/dashboard/whatsapp?type=overdue&students=${studentIds}`
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Pembayaran</h1>
            <p className="text-gray-600 mt-1">
              Kelola tagihan dan pembayaran kas kelas dengan mudah
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <Button variant="outline" onClick={handleSendBulkReminder}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Kirim Reminder
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Link href="/dashboard/payments/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Buat Tagihan
              </Button>
            </Link>
          </div>
        </div>

        {/* Alert for overdue payments */}
        {overduePayments > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Perhatian: {overduePayments} pembayaran terlambat
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Ada siswa yang belum membayar melebihi tanggal jatuh tempo. 
                  Segera kirim reminder atau hubungi orang tua.
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={handleSendBulkReminder}>
                Kirim Reminder
              </Button>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tagihan</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currencyUtils.format(totalAmount)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {totalPayments} tagihan
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sudah Dibayar</p>
                  <p className="text-2xl font-bold text-green-600">
                    {currencyUtils.format(completedAmount)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {completedPayments} pembayaran
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Belum Dibayar</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {currencyUtils.format(pendingAmount)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {pendingPayments} pembayaran
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Terlambat</p>
                  <p className="text-2xl font-bold text-red-600">{overduePayments}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Pembayaran terlambat
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/broadcast-tagihan">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full mr-4">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Tagihan Bulanan</h3>
                    <p className="text-sm text-gray-600">Buat tagihan rutin untuk semua siswa</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/whatsapp">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-full mr-4">
                    <MessageCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Kirim Reminder</h3>
                    <p className="text-sm text-gray-600">Ingatkan pembayaran via WhatsApp</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/laporan-keuangan">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full mr-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Riwayat Pembayaran</h3>
                    <p className="text-sm text-gray-600">Lihat semua pembayaran yang masuk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Payments Table */}
        <PaymentTable
          payments={payments}
          onRefresh={handleRefresh}
          loading={loading}
        />
      </div>
    </DashboardLayout>
  )
}

export default PaymentsPage