'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  FileText,
  BarChart3,
  PieChart,
  Users,
  CreditCard,
  Filter,
  Eye,
  Share,
  Printer
} from 'lucide-react'

interface FinancialSummary {
  period: string
  total_income: number
  total_expenses: number
  balance: number
  payment_count: number
  expense_count: number
}

interface PaymentReport {
  month: string
  students_count: number
  paid_count: number
  unpaid_count: number
  total_amount: number
  payment_rate: number
}

interface ExpenseCategory {
  category: string
  amount: number
  count: number
  percentage: number
}

// Sample data
const financialSummary: FinancialSummary = {
  period: 'Januari 2024',
  total_income: 2875000,
  total_expenses: 450000,
  balance: 2425000,
  payment_count: 22,
  expense_count: 4
}

const monthlyReports: PaymentReport[] = [
  {
    month: 'Januari 2024',
    students_count: 25,
    paid_count: 22,
    unpaid_count: 3,
    total_amount: 550000,
    payment_rate: 88
  },
  {
    month: 'Desember 2023',
    students_count: 25,
    paid_count: 25,
    unpaid_count: 0,
    total_amount: 625000,
    payment_rate: 100
  },
  {
    month: 'November 2023',
    students_count: 25,
    paid_count: 24,
    unpaid_count: 1,
    total_amount: 600000,
    payment_rate: 96
  },
  {
    month: 'Oktober 2023',
    students_count: 25,
    paid_count: 23,
    unpaid_count: 2,
    total_amount: 575000,
    payment_rate: 92
  }
]

const expenseCategories: ExpenseCategory[] = [
  {
    category: 'Alat Tulis',
    amount: 175000,
    count: 2,
    percentage: 38.9
  },
  {
    category: 'Konsumsi',
    amount: 150000,
    count: 1,
    percentage: 33.3
  },
  {
    category: 'Dekorasi',
    amount: 75000,
    count: 1,
    percentage: 16.7
  },
  {
    category: 'Hadiah',
    amount: 50000,
    count: 1,
    percentage: 11.1
  }
]

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current_month')
  const [reportType, setReportType] = useState<'financial' | 'payment' | 'expense' | 'detailed'>('financial')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const generatePDF = (type: string) => {
    // Placeholder untuk generate PDF
    alert(`Generating ${type} PDF report...`)
  }

  const exportExcel = (type: string) => {
    // Placeholder untuk export Excel
    alert(`Exporting ${type} to Excel...`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
            <p className="text-gray-600 mt-1">
              Analisis dan laporan keuangan kas kelas
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="current_month">Bulan Ini</option>
              <option value="last_month">Bulan Lalu</option>
              <option value="current_year">Tahun Ini</option>
              <option value="custom">Periode Kustom</option>
            </select>
            <Button variant="outline" size="sm" onClick={() => generatePDF('summary')}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Pemasukan</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(financialSummary.total_income)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{financialSummary.payment_count} pembayaran</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(financialSummary.total_expenses)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{financialSummary.expense_count} pengeluaran</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Saldo Akhir</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(financialSummary.balance)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{financialSummary.period}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Tingkat Pembayaran</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPercentage(monthlyReports[0].payment_rate)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{monthlyReports[0].paid_count}/{monthlyReports[0].students_count} siswa</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Type Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'financial', label: 'Ringkasan Keuangan', icon: BarChart3 },
              { id: 'payment', label: 'Laporan Pembayaran', icon: CreditCard },
              { id: 'expense', label: 'Analisis Pengeluaran', icon: PieChart },
              { id: 'detailed', label: 'Laporan Detail', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  reportType === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Report Content */}
        {reportType === 'financial' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tren Keuangan Bulanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyReports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{report.month}</h4>
                        <p className="text-sm text-gray-600">
                          {report.paid_count}/{report.students_count} siswa bayar
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(report.total_amount)}</p>
                        <Badge variant={report.payment_rate >= 95 ? "success" : report.payment_rate >= 80 ? "warning" : "danger"}>
                          {formatPercentage(report.payment_rate)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribusi Pengeluaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseCategories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{category.category}</span>
                        <span className="text-sm text-gray-600">{formatCurrency(category.amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{category.count} transaksi</span>
                        <span>{formatPercentage(category.percentage)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {reportType === 'payment' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Laporan Pembayaran Detail</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportExcel('payment')}>
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => generatePDF('payment')}>
                    <Printer className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Periode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Siswa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sudah Bayar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Belum Bayar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tingkat Pembayaran
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {monthlyReports.map((report, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {report.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.students_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {report.paid_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                          {report.unpaid_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(report.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={report.payment_rate >= 95 ? "success" : report.payment_rate >= 80 ? "warning" : "danger"}>
                            {formatPercentage(report.payment_rate)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {reportType === 'expense' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Analisis Pengeluaran per Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {expenseCategories.map((category, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900">{category.category}</h3>
                          <Badge variant="secondary">{category.count} transaksi</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(category.amount)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {formatPercentage(category.percentage)} dari total
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300" 
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan Pengeluaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Pengeluaran:</span>
                      <span className="font-bold">{formatCurrency(financialSummary.total_expenses)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jumlah Transaksi:</span>
                      <span className="font-bold">{financialSummary.expense_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rata-rata per Transaksi:</span>
                      <span className="font-bold">
                        {formatCurrency(financialSummary.total_expenses / financialSummary.expense_count)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-gray-600">Kategori Terbanyak:</span>
                      <span className="font-bold">{expenseCategories[0].category}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => generatePDF('expense')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Export Laporan Pengeluaran
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => exportExcel('expense')}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Excel
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Share className="w-4 h-4 mr-2" />
                      Bagikan ke Orang Tua
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {reportType === 'detailed' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Laporan Keuangan Lengkap</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button onClick={() => generatePDF('detailed')}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Laporan
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-blue-900 mb-4">LAPORAN KEUANGAN KAS KELAS 1A</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700 font-medium">Periode: {financialSummary.period}</p>
                    <p className="text-blue-600">SD Indonesia</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Total Pemasukan:</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(financialSummary.total_income)}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Saldo Akhir:</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(financialSummary.balance)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">A. PEMASUKAN</h4>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-green-800">Kas Bulanan: {formatCurrency(financialSummary.total_income)}</p>
                    <p className="text-sm text-green-600">({financialSummary.payment_count} pembayaran dari 25 siswa)</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-3">B. PENGELUARAN</h4>
                  <div className="space-y-2">
                    {expenseCategories.map((category, index) => (
                      <div key={index} className="flex justify-between items-center bg-red-50 rounded-lg p-3">
                        <span className="text-red-800">{category.category}</span>
                        <span className="font-medium text-red-600">{formatCurrency(category.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center bg-red-100 rounded-lg p-3 font-bold">
                      <span className="text-red-900">TOTAL PENGELUARAN</span>
                      <span className="text-red-700">{formatCurrency(financialSummary.total_expenses)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center bg-blue-100 rounded-lg p-4">
                    <span className="text-xl font-bold text-blue-900">SALDO AKHIR</span>
                    <span className="text-2xl font-bold text-blue-700">{formatCurrency(financialSummary.balance)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ReportsPage