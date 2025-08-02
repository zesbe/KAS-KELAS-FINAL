'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'
import { 
  Download, 
  FileText, 
  DollarSign, 
  Calendar, 
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

// Extend jsPDF type
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface Payment {
  id: string
  student_id: string
  category_id: string
  amount: number
  status: string
  payment_method: string | null
  completed_at: string | null
  due_date: string
  created_at: string
  order_id: string
  student: {
    nama: string
    kelas: string
    nomor_hp_ortu: string
  }
  category: {
    name: string
  }
}

interface ReportSummary {
  totalAmount: number
  totalPaid: number
  totalPending: number
  totalOverdue: number
  paidCount: number
  pendingCount: number
  overdueCount: number
  totalStudents: number
}

export default function LaporanKeuanganPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState<ReportSummary>({
    totalAmount: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0,
    totalStudents: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'all',
    category: 'all'
  })

  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    fetchPayments()
    fetchCategories()
  }, [filters])

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('payment_categories')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    if (!error && data) {
      setCategories(data)
    }
  }

  const fetchPayments = async () => {
    setIsLoading(true)
    
    try {
      let query = supabase
        .from('payments')
        .select(`
          *,
          student:students(nama, kelas, nomor_hp_ortu),
          category:payment_categories(name)
        `)
        .gte('created_at', filters.startDate)
        .lte('created_at', filters.endDate + 'T23:59:59')
        .order('created_at', { ascending: false })

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters.category !== 'all') {
        query = query.eq('category_id', filters.category)
      }

      const { data, error } = await query

      if (error) {
        toast.error('Gagal memuat data pembayaran')
        console.error(error)
      } else {
        setPayments(data || [])
        setFilteredPayments(data || [])
        calculateSummary(data || [])
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Terjadi kesalahan saat memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateSummary = (data: Payment[]) => {
    const today = new Date()
    
    const summary = data.reduce((acc, payment) => {
      acc.totalAmount += payment.amount
      
      if (payment.status === 'paid') {
        acc.totalPaid += payment.amount
        acc.paidCount++
      } else if (payment.status === 'pending') {
        const dueDate = new Date(payment.due_date)
        if (dueDate < today) {
          acc.totalOverdue += payment.amount
          acc.overdueCount++
        } else {
          acc.totalPending += payment.amount
          acc.pendingCount++
        }
      }
      
      return acc
    }, {
      totalAmount: 0,
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      paidCount: 0,
      pendingCount: 0,
      overdueCount: 0,
      totalStudents: 0
    })

    // Count unique students
    const uniqueStudents = new Set(data.map(p => p.student_id))
    summary.totalStudents = uniqueStudents.size

    setSummary(summary)
  }

  const downloadCSV = () => {
    const headers = [
      'Tanggal',
      'Order ID',
      'Nama Siswa',
      'Kelas',
      'No HP Ortu',
      'Kategori',
      'Nominal',
      'Status',
      'Metode Pembayaran',
      'Tanggal Bayar',
      'Jatuh Tempo'
    ]

    const rows = filteredPayments.map(payment => [
      new Date(payment.created_at).toLocaleDateString('id-ID'),
      payment.order_id,
      payment.student.nama,
      payment.student.kelas,
      payment.student.nomor_hp_ortu,
      payment.category.name,
      payment.amount,
      payment.status === 'paid' ? 'Lunas' : payment.status === 'pending' ? 'Belum Bayar' : 'Dibatalkan',
      payment.payment_method || '-',
      payment.completed_at ? new Date(payment.completed_at).toLocaleDateString('id-ID') : '-',
      new Date(payment.due_date).toLocaleDateString('id-ID')
    ])

    // Add summary rows
    rows.push([])
    rows.push(['RINGKASAN LAPORAN'])
    rows.push(['Periode', `${new Date(filters.startDate).toLocaleDateString('id-ID')} - ${new Date(filters.endDate).toLocaleDateString('id-ID')}`])
    rows.push(['Total Tagihan', '', '', '', '', '', `Rp ${summary.totalAmount.toLocaleString('id-ID')}`])
    rows.push(['Total Dibayar', '', '', '', '', '', `Rp ${summary.totalPaid.toLocaleString('id-ID')}`])
    rows.push(['Total Belum Bayar', '', '', '', '', '', `Rp ${summary.totalPending.toLocaleString('id-ID')}`])
    rows.push(['Total Jatuh Tempo', '', '', '', '', '', `Rp ${summary.totalOverdue.toLocaleString('id-ID')}`])
    rows.push(['Jumlah Lunas', `${summary.paidCount} transaksi`])
    rows.push(['Jumlah Belum Bayar', `${summary.pendingCount} transaksi`])
    rows.push(['Jumlah Jatuh Tempo', `${summary.overdueCount} transaksi`])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `laporan-keuangan-${filters.startDate}-${filters.endDate}.csv`
    link.click()
    window.URL.revokeObjectURL(url)

    toast.success('Laporan berhasil didownload')
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(18)
    doc.text('LAPORAN KEUANGAN', 14, 20)
    
    // Period
    doc.setFontSize(12)
    doc.text(`Periode: ${new Date(filters.startDate).toLocaleDateString('id-ID')} - ${new Date(filters.endDate).toLocaleDateString('id-ID')}`, 14, 30)
    
    // Summary
    doc.setFontSize(14)
    doc.text('RINGKASAN', 14, 45)
    
    doc.setFontSize(10)
    const summaryData = [
      ['Total Tagihan', `Rp ${summary.totalAmount.toLocaleString('id-ID')}`],
      ['Total Dibayar', `Rp ${summary.totalPaid.toLocaleString('id-ID')}`],
      ['Total Belum Bayar', `Rp ${summary.totalPending.toLocaleString('id-ID')}`],
      ['Total Jatuh Tempo', `Rp ${summary.totalOverdue.toLocaleString('id-ID')}`],
      ['Transaksi Lunas', `${summary.paidCount} transaksi`],
      ['Transaksi Belum Bayar', `${summary.pendingCount} transaksi`],
      ['Transaksi Jatuh Tempo', `${summary.overdueCount} transaksi`],
      ['Total Siswa', `${summary.totalStudents} siswa`]
    ]
    
    let yPos = 55
    summaryData.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 14, yPos)
      yPos += 7
    })
    
    // Detail table
    const tableData = filteredPayments.map(payment => [
      new Date(payment.created_at).toLocaleDateString('id-ID'),
      payment.student.nama,
      payment.category.name,
      `Rp ${payment.amount.toLocaleString('id-ID')}`,
      payment.status === 'paid' ? 'Lunas' : payment.status === 'pending' ? 'Belum Bayar' : 'Dibatalkan'
    ])
    
    doc.autoTable({
      head: [['Tanggal', 'Nama Siswa', 'Kategori', 'Nominal', 'Status']],
      body: tableData,
      startY: yPos + 10,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    })
    
    doc.save(`laporan-keuangan-${filters.startDate}-${filters.endDate}.pdf`)
    toast.success('Laporan PDF berhasil didownload')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Lunas</Badge>
      case 'pending':
        return <Badge variant="warning">Belum Bayar</Badge>
      case 'cancelled':
        return <Badge variant="danger">Dibatalkan</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
          <p className="text-gray-600">Laporan pembayaran dan transaksi keuangan</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={downloadCSV}
            disabled={filteredPayments.length === 0}
          >
            <FileText className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
          <Button
            onClick={downloadPDF}
            disabled={filteredPayments.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="paid">Lunas</option>
                <option value="pending">Belum Bayar</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tagihan</p>
                <p className="text-2xl font-bold">
                  Rp {summary.totalAmount.toLocaleString('id-ID')}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Dibayar</p>
                <p className="text-2xl font-bold text-green-600">
                  Rp {summary.totalPaid.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500">{summary.paidCount} transaksi</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Belum Bayar</p>
                <p className="text-2xl font-bold text-yellow-600">
                  Rp {summary.totalPending.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500">{summary.pendingCount} transaksi</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jatuh Tempo</p>
                <p className="text-2xl font-bold text-red-600">
                  Rp {summary.totalOverdue.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500">{summary.overdueCount} transaksi</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Detail Pembayaran</span>
            <Badge variant="secondary">{filteredPayments.length} transaksi</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Tanggal</th>
                  <th className="text-left p-2">Order ID</th>
                  <th className="text-left p-2">Siswa</th>
                  <th className="text-left p-2">Kategori</th>
                  <th className="text-right p-2">Nominal</th>
                  <th className="text-center p-2">Status</th>
                  <th className="text-left p-2">Metode</th>
                  <th className="text-left p-2">Tanggal Bayar</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-gray-500">
                      Tidak ada data pembayaran
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        {new Date(payment.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-2 font-mono text-xs">{payment.order_id}</td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{payment.student.nama}</div>
                          <div className="text-xs text-gray-600">{payment.student.kelas}</div>
                        </div>
                      </td>
                      <td className="p-2">{payment.category.name}</td>
                      <td className="p-2 text-right font-medium">
                        Rp {payment.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2 text-center">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="p-2">{payment.payment_method || '-'}</td>
                      <td className="p-2">
                        {payment.completed_at 
                          ? new Date(payment.completed_at).toLocaleDateString('id-ID')
                          : '-'
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}