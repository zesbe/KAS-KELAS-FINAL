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
import { currencyUtils } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

// Sample data - in real app, this would come from Supabase
const samplePayments: Payment[] = [
  {
    id: '1',
    student_id: '1',
    category_id: '1',
    amount: 25000,
    order_id: 'KAS202408001',
    status: 'completed',
    payment_method: 'qris',
    pakasir_payment_url: 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202408001',
    due_date: '2024-08-05',
    completed_at: '2024-08-03T10:30:00.000Z',
    created_at: '2024-08-01T00:00:00.000Z',
    updated_at: '2024-08-03T10:30:00.000Z',
    student: {
      id: '1',
      nama: 'Ahmad Rizki Pratama',
      nomor_absen: 1,
      nomor_hp_ortu: '628123456789',
      nama_ortu: 'Budi Santoso',
      email_ortu: 'budi.santoso@email.com',
      is_active: true,
      created_at: '2024-01-15T00:00:00.000Z',
      updated_at: '2024-01-15T00:00:00.000Z'
    },
    category: {
      id: '1',
      name: 'Kas Bulanan',
      description: 'Iuran kas bulanan siswa',
      default_amount: 25000,
      is_active: true,
      created_at: '2024-01-15T00:00:00.000Z'
    }
  },
  {
    id: '2',
    student_id: '2',
    category_id: '1',
    amount: 25000,
    order_id: 'KAS202408002',
    status: 'pending',
    pakasir_payment_url: 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202408002',
    due_date: '2024-08-05',
    created_at: '2024-08-01T00:00:00.000Z',
    updated_at: '2024-08-01T00:00:00.000Z',
    student: {
      id: '2',
      nama: 'Siti Nurhaliza',
      nomor_absen: 2,
      nomor_hp_ortu: '628234567890',
      nama_ortu: 'Sari Dewi',
      email_ortu: 'sari.dewi@email.com',
      is_active: true,
      created_at: '2024-01-15T00:00:00.000Z',
      updated_at: '2024-01-15T00:00:00.000Z'
    },
    category: {
      id: '1',
      name: 'Kas Bulanan',
      description: 'Iuran kas bulanan siswa',
      default_amount: 25000,
      is_active: true,
      created_at: '2024-01-15T00:00:00.000Z'
    }
  },
  {
    id: '3',
    student_id: '3',
    category_id: '1',
    amount: 25000,
    order_id: 'KAS202408003',
    status: 'pending',
    pakasir_payment_url: 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202408003',
    due_date: '2024-08-02',
    created_at: '2024-08-01T00:00:00.000Z',
    updated_at: '2024-08-01T00:00:00.000Z',
    student: {
      id: '3',
      nama: 'Muhammad Fajar',
      nomor_absen: 3,
      nomor_hp_ortu: '628345678901',
      nama_ortu: 'Andi Wijaya',
      email_ortu: 'andi.wijaya@email.com',
      is_active: true,
      created_at: '2024-01-15T00:00:00.000Z',
      updated_at: '2024-01-15T00:00:00.000Z'
    },
    category: {
      id: '1',
      name: 'Kas Bulanan',
      description: 'Iuran kas bulanan siswa',
      default_amount: 25000,
      is_active: true,
      created_at: '2024-01-15T00:00:00.000Z'
    }
  },
  {
    id: '4',
    student_id: '4',
    category_id: '1',
    amount: 25000,
    order_id: 'KAS202408004',
    status: 'completed',
    payment_method: 'bank_transfer',
    pakasir_payment_url: 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202408004',
    due_date: '2024-08-05',
    completed_at: '2024-08-04T15:20:00.000Z',
    created_at: '2024-08-01T00:00:00.000Z',
    updated_at: '2024-08-04T15:20:00.000Z',
    student: {
      id: '4',
      nama: 'Aisyah Putri',
      nomor_absen: 4,
      nomor_hp_ortu: '628456789012',
      nama_ortu: 'Indah Permata',
      email_ortu: 'indah.permata@email.com',
      is_active: true,
      created_at: '2024-01-15T00:00:00.000Z',
      updated_at: '2024-01-15T00:00:00.000Z'
    },
    category: {
      id: '1',
      name: 'Kas Bulanan',
      description: 'Iuran kas bulanan siswa',
      default_amount: 25000,
      is_active: true,
      created_at: '2024-01-15T00:00:00.000Z'
    }
  },
  {
    id: '5',
    student_id: '5',
    category_id: '1',
    amount: 25000,
    order_id: 'KAS202408005',
    status: 'failed',
    pakasir_payment_url: 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202408005',
    due_date: '2024-08-05',
    created_at: '2024-08-01T00:00:00.000Z',
    updated_at: '2024-08-04T12:00:00.000Z',
    student: {
      id: '5',
      nama: 'Rizky Ramadhan',
      nomor_absen: 5,
      nomor_hp_ortu: '628567890123',
      nama_ortu: 'Agus Setiawan',
      email_ortu: 'agus.setiawan@email.com',
      is_active: true,
      created_at: '2024-01-15T00:00:00.000Z',
      updated_at: '2024-01-15T00:00:00.000Z'
    },
    category: {
      id: '1',
      name: 'Kas Bulanan',
      description: 'Iuran kas bulanan siswa',
      default_amount: 25000,
      is_active: true,
      created_at: '2024-01-15T00:00:00.000Z'
    }
  }
]

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(samplePayments)
  const [loading, setLoading] = useState(false)

  const handleRefresh = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    // In real app, fetch payments from Supabase
    setLoading(false)
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
    
    // Simulate sending WhatsApp reminders
    setLoading(true)
    
    try {
      // Simulate API call to WhatsApp gateway
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update payment status to show reminder sent
      setPayments(prev => prev.map(payment => {
        if (overdueList.some(overdue => overdue.id === payment.id)) {
          return {
            ...payment,
            reminder_sent_at: new Date().toISOString()
          }
        }
        return payment
      }))
      
      toast.success(`✅ Reminder WhatsApp berhasil dikirim ke ${overdueList.length} orang tua`)
    } catch (error) {
      toast.error('Gagal mengirim reminder. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
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
          <Link href="/dashboard/payments/monthly">
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

          <Link href="/dashboard/payments/reminder">
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

          <Link href="/dashboard/payments/history">
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