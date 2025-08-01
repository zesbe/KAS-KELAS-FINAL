'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  MessageCircle,
  ExternalLink,
  RefreshCw,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { Payment } from '@/lib/supabase'
import { currencyUtils, dateUtils } from '@/lib/utils'
import { getPaymentStatusBadge, getDaysFromDue } from '@/lib/pakasir'

interface PaymentTableProps {
  payments: Payment[]
  onRefresh: () => void
  loading?: boolean
}

// Sample data for development
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
  }
]

const PaymentTable: React.FC<PaymentTableProps> = ({
  payments = samplePayments,
  onRefresh,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all')
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])

  // Filter payments based on search and status
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.student?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student?.nomor_absen.toString().includes(searchTerm)
    
    let matchesStatus = true
    if (filterStatus === 'pending') {
      matchesStatus = payment.status === 'pending' && !isOverdue(payment.due_date)
    } else if (filterStatus === 'completed') {
      matchesStatus = payment.status === 'completed'
    } else if (filterStatus === 'overdue') {
      matchesStatus = payment.status === 'pending' && isOverdue(payment.due_date)
    }
    
    return matchesSearch && matchesStatus
  })

  const isOverdue = (dueDate: string): boolean => {
    const due = new Date(dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return due < today
  }

  const getStatusDisplay = (payment: Payment) => {
    if (payment.status === 'completed') {
      return <StatusBadge status="completed" />
    } else if (payment.status === 'pending') {
      if (isOverdue(payment.due_date)) {
        return <StatusBadge status="overdue" />
      } else {
        return <StatusBadge status="pending" />
      }
    } else {
      return <StatusBadge status={payment.status as any} />
    }
  }

  const getDueDateInfo = (dueDate: string) => {
    const daysInfo = getDaysFromDue(dueDate)
    
    if (daysInfo.status === 'overdue') {
      return (
        <div className="flex items-center text-red-600">
          <AlertTriangle className="w-4 h-4 mr-1" />
          <span className="text-sm">Terlambat {daysInfo.days} hari</span>
        </div>
      )
    } else if (daysInfo.status === 'due') {
      return (
        <div className="flex items-center text-orange-600">
          <Clock className="w-4 h-4 mr-1" />
          <span className="text-sm">Jatuh tempo hari ini</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-1" />
          <span className="text-sm">{daysInfo.days} hari lagi</span>
        </div>
      )
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayments(filteredPayments.map(p => p.id))
    } else {
      setSelectedPayments([])
    }
  }

  const handleSelectPayment = (paymentId: string, checked: boolean) => {
    if (checked) {
      setSelectedPayments([...selectedPayments, paymentId])
    } else {
      setSelectedPayments(selectedPayments.filter(id => id !== paymentId))
    }
  }

  const handleBulkReminder = () => {
    const selectedData = payments.filter(p => selectedPayments.includes(p.id))
    console.log('Send reminder to:', selectedData)
  }

  // Calculate statistics
  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
  const completedAmount = filteredPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = totalAmount - completedAmount
  const overdueCount = filteredPayments.filter(p => 
    p.status === 'pending' && isOverdue(p.due_date)
  ).length

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Tagihan</p>
                <p className="text-lg font-semibold">{currencyUtils.format(totalAmount)}</p>
              </div>
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Sudah Dibayar</p>
                <p className="text-lg font-semibold text-green-600">{currencyUtils.format(completedAmount)}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Belum Dibayar</p>
                <p className="text-lg font-semibold text-orange-600">{currencyUtils.format(pendingAmount)}</p>
              </div>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Terlambat</p>
                <p className="text-lg font-semibold text-red-600">{overdueCount} siswa</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Daftar Pembayaran</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {filteredPayments.length} dari {payments.length} pembayaran
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={onRefresh} loading={loading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Link href="/dashboard/payments/create">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Tagihan
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Cari nama siswa, order ID, atau nomor absen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Belum Bayar</option>
                <option value="completed">Lunas</option>
                <option value="overdue">Terlambat</option>
              </select>
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedPayments.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-800">
                  {selectedPayments.length} pembayaran dipilih
                </p>
                <div className="flex items-center space-x-2">
                  <Button variant="primary" size="sm" onClick={handleBulkReminder}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Kirim Reminder
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedPayments([])}>
                    Batal
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedPayments.length === filteredPayments.length && filteredPayments.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Order ID
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Siswa
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Kategori
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Jumlah
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Jatuh Tempo
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedPayments.includes(payment.id)}
                        onChange={(e) => handleSelectPayment(payment.id, e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-mono text-gray-900">
                        {payment.order_id}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {dateUtils.formatDate(payment.created_at)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-primary-700">
                            {payment.student?.nomor_absen}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {payment.student?.nama}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.student?.nama_ortu}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" size="sm">
                        {payment.category?.name}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {currencyUtils.format(payment.amount)}
                      </div>
                      {payment.completed_at && (
                        <div className="text-xs text-green-600 mt-1">
                          Dibayar {dateUtils.getRelativeTime(payment.completed_at)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">
                        {dateUtils.formatDate(payment.due_date)}
                      </div>
                      <div className="mt-1">
                        {getDueDateInfo(payment.due_date)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusDisplay(payment)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {payment.pakasir_payment_url && payment.status === 'pending' && (
                          <Link href={payment.pakasir_payment_url} target="_blank">
                            <Button variant="primary" size="sm">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Bayar
                            </Button>
                          </Link>
                        )}
                        {payment.status === 'pending' && (
                          <Button variant="outline" size="sm">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Reminder
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPayments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchTerm ? 'Tidak ada pembayaran yang sesuai dengan pencarian' : 'Belum ada data pembayaran'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentTable