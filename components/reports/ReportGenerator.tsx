'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ReportTemplates, ReportData, WhatsAppData } from '@/lib/reportTemplates'
import WhatsAppSender from '@/components/whatsapp/WhatsAppSender'
import { 
  FileText, 
  MessageCircle, 
  Download, 
  Eye, 
  Copy, 
  Send,
  Calendar,
  DollarSign,
  Users,
  Receipt,
  Printer
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ReportGeneratorProps {
  reportData?: ReportData
  students?: any[]
  expenses?: any[]
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ reportData, students, expenses }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  // Data dummy untuk demo (nanti akan diambil dari database)
  const dummyReportData: ReportData = reportData || {
    month: 'Januari',
    year: '2025',
    className: 'Kelas 1A',
    treasurerName: 'Ibu Sari Wijaya',
    teacherName: 'Pak Ahmad Guru',
    startBalance: 2000000,
    totalIncome: 625000,
    totalExpense: 867500,
    endBalance: 1757500,
    expenses: expenses || [],
    students: students || [],
    categories: [
      { id: '1', name: 'Alat Tulis' },
      { id: '2', name: 'Snack & Minuman' },
      { id: '3', name: 'Dekorasi Kelas' },
    ],
    paymentMethods: [
      { value: 'cash', label: 'Tunai' },
      { value: 'transfer', label: 'Transfer' },
      { value: 'qris', label: 'QRIS' },
    ],
    pendingExpenses: []
  }

  const templates = [
    {
      id: 'monthly-report',
      name: 'Laporan Keuangan Bulanan',
      description: 'Laporan lengkap pemasukan dan pengeluaran bulanan',
      icon: FileText,
      color: 'blue'
    },
    {
      id: 'payment-notice',
      name: 'Surat Tagihan',
      description: 'Surat tagihan formal untuk orang tua',
      icon: Receipt,
      color: 'green'
    },
    {
      id: 'whatsapp-reminder',
      name: 'Pengingat WhatsApp',
      description: 'Template pesan WhatsApp untuk pengingat pembayaran',
      icon: MessageCircle,
      color: 'emerald'
    },
    {
      id: 'expense-proposal',
      name: 'Proposal Pengeluaran',
      description: 'Form proposal untuk pengeluaran kas kelas',
      icon: DollarSign,
      color: 'purple'
    }
  ]

  const generateReport = (templateId: string) => {
    let content = ''
    
    switch (templateId) {
      case 'monthly-report':
        content = ReportTemplates.generateMonthlyReport(dummyReportData)
        break
      case 'payment-notice':
        if (selectedStudent) {
          const whatsappData: WhatsAppData = {
            studentName: selectedStudent.nama,
            parentName: selectedStudent.nama_ortu,
            amount: 25000,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            paymentMethod: 'transfer',
            accountNumber: '1234567890',
            treasurerName: dummyReportData.treasurerName,
            treasurerPhone: '628123456789'
          }
          content = ReportTemplates.generatePaymentNotice(whatsappData)
        } else {
          toast.error('Pilih siswa terlebih dahulu')
          return
        }
        break
      case 'whatsapp-reminder':
        if (selectedStudent) {
          const whatsappData: WhatsAppData = {
            studentName: selectedStudent.nama,
            parentName: selectedStudent.nama_ortu,
            amount: 25000,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            paymentMethod: 'transfer',
            accountNumber: '1234567890',
            treasurerName: dummyReportData.treasurerName,
            treasurerPhone: '628123456789'
          }
          content = ReportTemplates.generateWhatsAppReminder(whatsappData, 'reminder')
        } else {
          toast.error('Pilih siswa terlebih dahulu')
          return
        }
        break
      case 'expense-proposal':
        content = ReportTemplates.generateExpenseProposal({
          title: 'Pembelian Alat Tulis Kelas',
          category: 'Alat Tulis',
          amount: 150000,
          description: 'Pembelian alat tulis untuk kebutuhan pembelajaran kelas',
          items: [
            { name: 'Kertas A4', qty: 2, price: 35000 },
            { name: 'Spidol Board Marker', qty: 6, price: 12000 },
            { name: 'Penghapus Papan', qty: 2, price: 8000 }
          ],
          purpose: 'Menunjang kegiatan pembelajaran dan kreativitas siswa',
          proposedBy: 'Admin Kelas',
          dateNeeded: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          store: 'Toko ATK Gramedia'
        })
        break
      default:
        toast.error('Template tidak ditemukan')
        return
    }

    setGeneratedContent(content)
    setSelectedTemplate(templateId)
    setShowPreview(true)
    toast.success('Template berhasil dibuat!')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent)
    toast.success('Template berhasil disalin!')
  }

  const downloadAsFile = () => {
    const element = document.createElement('a')
    const file = new Blob([generatedContent], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${selectedTemplate}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('File berhasil diunduh!')
  }

  const printReport = () => {
    if (selectedTemplate === 'monthly-report') {
      const printContent = ReportTemplates.generatePrintableReport(dummyReportData)
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(printContent)
        printWindow.document.close()
        printWindow.print()
      }
    } else {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Print</title></head>
            <body style="font-family: Arial, sans-serif; padding: 20px; white-space: pre-wrap;">
              ${generatedContent.replace(/\n/g, '<br>')}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
    toast.success('Dokumen siap dicetak!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Generator Laporan</h2>
          <p className="text-gray-600">Buat laporan dan template dengan mudah</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Pilih Template</h3>
          
          {/* Student Selection (untuk template yang membutuhkan) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pilih Siswa (untuk surat tagihan & WhatsApp)</CardTitle>
            </CardHeader>
            <CardContent>
              <select 
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={selectedStudent?.id || ''}
                onChange={(e) => {
                  const student = dummyReportData.students.find(s => s.id === e.target.value)
                  setSelectedStudent(student)
                }}
              >
                <option value="">Pilih Siswa...</option>
                {dummyReportData.students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.nama} - {student.nama_ortu}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Template Cards */}
          <div className="grid grid-cols-1 gap-3">
            {templates.map((template) => {
              const IconComponent = template.icon
              return (
                <Card 
                  key={template.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => generateReport(template.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 bg-${template.color}-100 rounded-lg`}>
                        <IconComponent className={`w-5 h-5 text-${template.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-500">{template.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Preview & Actions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Preview & Download</h3>
            {generatedContent && (
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={downloadAsFile}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button size="sm" variant="outline" onClick={printReport}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            )}
          </div>

          <Card className="h-96">
            <CardContent className="p-4 h-full">
              {generatedContent ? (
                <div className="h-full overflow-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {generatedContent}
                  </pre>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Eye className="w-12 h-12 mx-auto mb-4" />
                    <p>Pilih template untuk melihat preview</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* WhatsApp Integration */}
          {selectedTemplate === 'whatsapp-reminder' && generatedContent && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kirim WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <WhatsAppSender 
                  message={generatedContent}
                  recipients={selectedStudent ? [{
                    name: selectedStudent.nama_ortu,
                    phone: '628123456789', // Demo phone number
                    studentName: selectedStudent.nama
                  }] : []}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saldo Kas</p>
                <p className="text-xl font-bold text-green-600">
                  Rp {dummyReportData.endBalance.toLocaleString('id-ID')}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Siswa</p>
                <p className="text-xl font-bold text-blue-600">
                  {dummyReportData.students.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pengeluaran Bulan Ini</p>
                <p className="text-xl font-bold text-red-600">
                  Rp {dummyReportData.totalExpense.toLocaleString('id-ID')}
                </p>
              </div>
              <Receipt className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Template Dibuat</p>
                <p className="text-xl font-bold text-purple-600">
                  {selectedTemplate ? '1' : '0'}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ReportGenerator