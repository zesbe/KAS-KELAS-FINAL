'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'
import { starSenderService } from '@/lib/starsender-service'
import { messageUtils } from '@/lib/starsender'
import { dateUtils } from '@/lib/date-utils'
import { generateOrderId, generatePaymentUrl } from '@/lib/pakasir'
import DashboardLayout from '@/components/layout/DashboardLayout'
import toast from 'react-hot-toast'
import { 
  Send, 
  Users, 
  DollarSign, 
  Calendar, 
  MessageCircle, 
  Download, 
  CheckCircle2, 
  CreditCard,
  AlertCircle,
  Loader2,
  FileText,
  Plus,
  Megaphone,
  XCircle,
  RefreshCw
} from 'lucide-react'

interface Student {
  id: string
  nama: string
  nomor_hp_ortu: string
  nama_ortu?: string
  kelas: string
  status: string
}

interface Category {
  id: string
  name: string
  description: string
  is_monthly: boolean
}

interface MessageTemplate {
  id: string
  name: string
  content: string
  variables: string[]
}

interface SendResult {
  student_id: string
  student_name: string
  phone: string
  success: boolean
  payment_url?: string
  order_id?: string
  message: string
  retryCount?: number
}

export default function WhatsAppTagihanPage() {
  const [activeTab, setActiveTab] = useState<'tagihan' | 'broadcast'>('tagihan')
  const [students, setStudents] = useState<Student[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendResults, setSendResults] = useState<SendResult[] | null>(null)
  
  // Form data for tagihan
  const [tagihanForm, setTagihanForm] = useState({
    category_id: '',
    amount: '',
    due_date: dateUtils.getDefaultDueDate(),
    message_template: 'default',
    custom_message: ''
  })

  // Form data for broadcast
  const [broadcastForm, setBroadcastForm] = useState({
    message: '',
    template_id: '',
    broadcast_type: 'direct' as 'direct' | 'campaign',
    campaign_name: ''
  })

  useEffect(() => {
    fetchStudents()
    fetchCategories()
    fetchTemplates()
  }, [])

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('status', 'active')
        .order('nama')

      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Gagal memuat data siswa')
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_categories')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Gagal memuat kategori pembayaran')
    }
  }

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(students.map(s => s.id))
    }
  }

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId)
      } else {
        return [...prev, studentId]
      }
    })
  }

  // Send message with retry mechanism
  const sendMessageWithRetry = async (
    phone: string, 
    message: string, 
    maxRetries: number = 3
  ): Promise<{ success: boolean; message: string; retryCount: number }> => {
    let retryCount = 0
    let lastError = ''

    while (retryCount < maxRetries) {
      try {
        const result = await starSenderService.sendMessage(phone, message)
        
        if (result.success) {
          return { success: true, message: result.message, retryCount }
        }
        
        lastError = result.message || 'Gagal mengirim pesan'
        retryCount++
        
        if (retryCount < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)))
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'
        retryCount++
        
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)))
        }
      }
    }

    return { success: false, message: lastError, retryCount }
  }

  const handleSendTagihan = async () => {
    if (!tagihanForm.category_id || !tagihanForm.amount || selectedStudents.length === 0) {
      toast.error('Lengkapi semua field dan pilih minimal 1 siswa')
      return
    }

    setIsSending(true)
    setSendResults(null)

    try {
      const amount = parseInt(tagihanForm.amount)
      const selectedCategory = categories.find(c => c.id === tagihanForm.category_id)
      const monthYear = dateUtils.getCurrentMonthYear()
      
      const results: SendResult[] = []
      
      for (const studentId of selectedStudents) {
        const student = students.find(s => s.id === studentId)!
        const orderId = generateOrderId()
        const paymentUrl = generatePaymentUrl(amount, orderId)
        
        // Save payment to database
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            student_id: studentId,
            category_id: tagihanForm.category_id,
            amount,
            order_id: orderId,
            pakasir_payment_url: paymentUrl,
            due_date: tagihanForm.due_date,
            status: 'pending'
          })

        if (paymentError) {
          results.push({
            student_id: studentId,
            student_name: student.nama,
            phone: student.nomor_hp_ortu,
            success: false,
            message: 'Gagal menyimpan data tagihan'
          })
          continue
        }

        // Prepare message
        let message = ''
        if (tagihanForm.message_template === 'default') {
          message = messageUtils.createBillingMessage(
            student.nama,
            monthYear,
            amount,
            new Date(tagihanForm.due_date).toLocaleDateString('id-ID'),
            paymentUrl
          )
        } else {
          message = tagihanForm.custom_message
            .replace('{nama}', student.nama)
            .replace('{nominal}', `Rp ${amount.toLocaleString('id-ID')}`)
            .replace('{jatuh_tempo}', new Date(tagihanForm.due_date).toLocaleDateString('id-ID'))
            .replace('{link}', paymentUrl)
            .replace('{order_id}', orderId)
        }

        // Send message with retry
        const sendResult = await sendMessageWithRetry(student.nomor_hp_ortu, message)
        
        results.push({
          student_id: studentId,
          student_name: student.nama,
          phone: student.nomor_hp_ortu,
          success: sendResult.success,
          payment_url: paymentUrl,
          order_id: orderId,
          message: sendResult.message,
          retryCount: sendResult.retryCount
        })

        // Log to database
        await supabase.from('whatsapp_messages').insert({
          student_id: studentId,
          message_type: 'billing',
          message_content: message,
          status: sendResult.success ? 'sent' : 'failed',
          error_message: sendResult.success ? null : sendResult.message,
          sent_at: new Date().toISOString()
        })
      }

      setSendResults(results)
      
      const successCount = results.filter(r => r.success).length
      const failedCount = results.filter(r => !r.success).length
      
      if (successCount > 0) {
        toast.success(`Berhasil mengirim ${successCount} dari ${results.length} tagihan`)
      }
      if (failedCount > 0) {
        toast.error(`Gagal mengirim ${failedCount} tagihan`)
      }
      
      // Reset selection
      setSelectedStudents([])
      
    } catch (error) {
      console.error('Error sending tagihan:', error)
      toast.error('Terjadi kesalahan saat mengirim tagihan')
    } finally {
      setIsSending(false)
    }
  }

  const handleSendBroadcast = async () => {
    if (selectedStudents.length === 0 || !broadcastForm.message.trim()) {
      toast.error('Pilih minimal 1 siswa dan isi pesan')
      return
    }

    setIsSending(true)
    setSendResults(null)

    try {
      const results: SendResult[] = []
      
      for (const studentId of selectedStudents) {
        const student = students.find(s => s.id === studentId)!
        
        const message = broadcastForm.message
          .replace('{nama_siswa}', student.nama)
          .replace('{nama_ortu}', student.nama_ortu || 'Bapak/Ibu')

        // Send message with retry
        const sendResult = await sendMessageWithRetry(student.nomor_hp_ortu, message)
        
        results.push({
          student_id: studentId,
          student_name: student.nama,
          phone: student.nomor_hp_ortu,
          success: sendResult.success,
          message: sendResult.message,
          retryCount: sendResult.retryCount
        })

        // Log to database
        await supabase.from('whatsapp_messages').insert({
          student_id: studentId,
          message_type: 'broadcast',
          message_content: message,
          status: sendResult.success ? 'sent' : 'failed',
          error_message: sendResult.success ? null : sendResult.message,
          sent_at: new Date().toISOString()
        })
      }

      setSendResults(results)
      
      const successCount = results.filter(r => r.success).length
      const failedCount = results.filter(r => !r.success).length
      
      if (successCount > 0) {
        toast.success(`Berhasil mengirim ${successCount} dari ${results.length} pesan`)
      }
      if (failedCount > 0) {
        toast.error(`Gagal mengirim ${failedCount} pesan`)
      }
      
      // Reset
      setSelectedStudents([])
      setBroadcastForm({ ...broadcastForm, message: '' })
      
    } catch (error) {
      console.error('Error sending broadcast:', error)
      toast.error('Terjadi kesalahan saat mengirim broadcast')
    } finally {
      setIsSending(false)
    }
  }

  const retryFailedMessages = async () => {
    if (!sendResults) return

    const failedResults = sendResults.filter(r => !r.success)
    if (failedResults.length === 0) {
      toast.info('Tidak ada pesan yang gagal')
      return
    }

    setIsSending(true)

    try {
      const updatedResults = [...sendResults]
      
      for (const failed of failedResults) {
        const index = updatedResults.findIndex(r => r.student_id === failed.student_id)
        const student = students.find(s => s.id === failed.student_id)!
        
        // Recreate message based on tab
        let message = ''
        if (activeTab === 'tagihan' && failed.payment_url) {
          const amount = parseInt(tagihanForm.amount)
          const monthYear = dateUtils.getCurrentMonthYear()
          message = messageUtils.createBillingMessage(
            student.nama,
            monthYear,
            amount,
            new Date(tagihanForm.due_date).toLocaleDateString('id-ID'),
            failed.payment_url
          )
        } else {
          message = broadcastForm.message
            .replace('{nama_siswa}', student.nama)
            .replace('{nama_ortu}', student.nama_ortu || 'Bapak/Ibu')
        }

        const sendResult = await sendMessageWithRetry(student.nomor_hp_ortu, message)
        
        updatedResults[index] = {
          ...failed,
          success: sendResult.success,
          message: sendResult.message,
          retryCount: (failed.retryCount || 0) + sendResult.retryCount
        }
      }

      setSendResults(updatedResults)
      
      const newSuccessCount = updatedResults.filter(r => r.success).length - sendResults.filter(r => r.success).length
      if (newSuccessCount > 0) {
        toast.success(`Berhasil mengirim ulang ${newSuccessCount} pesan`)
      }
      
    } catch (error) {
      console.error('Error retrying messages:', error)
      toast.error('Gagal mengirim ulang pesan')
    } finally {
      setIsSending(false)
    }
  }

  const exportResults = () => {
    if (!sendResults) return

    const csv = [
      ['Nama Siswa', 'No HP Ortu', activeTab === 'tagihan' ? 'Order ID' : '', activeTab === 'tagihan' ? 'Link Pembayaran' : '', 'Status', 'Percobaan', 'Pesan'],
      ...sendResults.map(r => {
        const row = [
          r.student_name,
          r.phone,
          activeTab === 'tagihan' ? r.order_id || '' : '',
          activeTab === 'tagihan' ? r.payment_url || '' : '',
          r.success ? 'Terkirim' : 'Gagal',
          (r.retryCount || 0).toString(),
          r.message
        ]
        return activeTab === 'tagihan' ? row : row.filter((_, i) => i !== 2 && i !== 3)
      })
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `whatsapp-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">WhatsApp & Tagihan</h1>
            <p className="text-gray-600">Kirim tagihan dan broadcast pesan ke orang tua siswa</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('tagihan')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'tagihan'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <DollarSign className="w-4 h-4 inline mr-2" />
            Kirim Tagihan
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'broadcast'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Megaphone className="w-4 h-4 inline mr-2" />
            Broadcast Pesan
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Info {activeTab === 'tagihan' ? 'Tagihan' : 'Broadcast'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center">
                    <Badge variant="primary" className="mr-3">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      WhatsApp API
                    </Badge>
                    <span className="text-sm text-gray-600">StarSender</span>
                  </div>
                  {activeTab === 'tagihan' ? (
                    <>
                      <p className="text-sm text-gray-700">
                        Kirim tagihan dengan link pembayaran otomatis
                      </p>
                      <div className="flex items-center text-sm text-green-700">
                        <CreditCard className="w-4 h-4 mr-1" />
                        <span className="font-medium">Payment Gateway: Pakasir</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-700">
                      Kirim pesan broadcast ke orang tua siswa yang dipilih
                    </p>
                  )}
                  <div className="flex items-center text-sm text-orange-700">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span>Pesan gagal akan dicoba ulang otomatis (max 3x)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Card */}
            {activeTab === 'tagihan' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Tagihan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori Pembayaran
                    </label>
                    <select
                      value={tagihanForm.category_id}
                      onChange={(e) => setTagihanForm({ ...tagihanForm, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih kategori</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} {cat.is_monthly && '(Bulanan)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nominal Tagihan
                    </label>
                    <input
                      type="number"
                      value={tagihanForm.amount}
                      onChange={(e) => setTagihanForm({ ...tagihanForm, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: 50000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jatuh Tempo
                    </label>
                    <input
                      type="date"
                      value={tagihanForm.due_date}
                      onChange={(e) => setTagihanForm({ ...tagihanForm, due_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Pesan
                    </label>
                    <select
                      value={tagihanForm.message_template}
                      onChange={(e) => setTagihanForm({ ...tagihanForm, message_template: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="default">Template Default</option>
                      <option value="custom">Pesan Custom</option>
                    </select>
                  </div>

                  {tagihanForm.message_template === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pesan Custom
                      </label>
                      <textarea
                        value={tagihanForm.custom_message}
                        onChange={(e) => setTagihanForm({ ...tagihanForm, custom_message: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={6}
                        placeholder="Variabel: {nama}, {nominal}, {jatuh_tempo}, {link}, {order_id}"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Tulis Pesan</span>
                    <select
                      value={broadcastForm.template_id}
                      onChange={(e) => {
                        const template = templates.find(t => t.id === e.target.value)
                        if (template) {
                          setBroadcastForm({ ...broadcastForm, message: template.content, template_id: e.target.value })
                        }
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Pilih Template</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                    placeholder="Ketik pesan Anda di sini...

Variabel yang tersedia:
{nama_siswa} - Nama siswa
{nama_ortu} - Nama orang tua"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={8}
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    {broadcastForm.message.length} karakter
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Student Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Pilih Penerima ({selectedStudents.length}/{students.length})
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedStudents.length === students.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {students.map(student => (
                    <label
                      key={student.id}
                      className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{student.nama}</div>
                        <div className="text-sm text-gray-500">
                          {student.nama_ortu || 'Orang tua'} - {student.nomor_hp_ortu}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Section */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeTab === 'tagihan' && tagihanForm.amount && (
                  <div>
                    <p className="text-sm text-gray-600">Total tagihan:</p>
                    <p className="text-2xl font-bold text-blue-600">
                      Rp {(parseInt(tagihanForm.amount || '0') * selectedStudents.length).toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedStudents.length} siswa × Rp {parseInt(tagihanForm.amount || '0').toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-600">Penerima:</p>
                  <p className="text-lg font-semibold">{selectedStudents.length} siswa</p>
                </div>

                <Button
                  variant="primary"
                  onClick={activeTab === 'tagihan' ? handleSendTagihan : handleSendBroadcast}
                  disabled={isSending || selectedStudents.length === 0}
                  className="w-full"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Kirim {activeTab === 'tagihan' ? 'Tagihan' : 'Broadcast'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Card */}
            {sendResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Hasil Pengiriman</span>
                    <div className="flex space-x-2">
                      {sendResults.some(r => !r.success) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={retryFailedMessages}
                          disabled={isSending}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Coba Ulang
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportResults}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {sendResults.filter(r => r.success).length}
                      </div>
                      <div className="text-sm text-gray-500">Berhasil</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {sendResults.filter(r => !r.success).length}
                      </div>
                      <div className="text-sm text-gray-500">Gagal</div>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {sendResults.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border border-gray-200 rounded"
                      >
                        <div className="flex items-center flex-1">
                          {result.success ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{result.student_name}</div>
                            <div className="text-xs text-gray-500">{result.phone}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          {result.retryCount && result.retryCount > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {result.retryCount}x
                            </Badge>
                          )}
                          <Badge variant={result.success ? "success" : "danger"} className="text-xs">
                            {result.success ? 'Terkirim' : 'Gagal'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}