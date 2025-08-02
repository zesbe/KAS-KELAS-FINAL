'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'
import { Send, Users, DollarSign, Calendar, MessageCircle, Download, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateOrderId, generatePaymentUrl } from '@/lib/pakasir'
import { starSenderService } from '@/lib/starsender-service'
import { messageUtils } from '@/lib/starsender'
import { dateUtils } from '@/lib/date-utils'

interface Student {
  id: string
  nama: string
  nomor_hp_ortu: string
  kelas: string
  status: string
}

interface Category {
  id: string
  name: string
  description: string
  is_monthly: boolean
}

export default function BroadcastTagihanPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    due_date: dateUtils.getDefaultDueDate(),
    message_template: 'default',
    custom_message: ''
  })

  const [broadcastResults, setBroadcastResults] = useState<{
    total: number
    sent: number
    failed: number
    results: Array<{
      student_id: string
      student_name: string
      phone: string
      success: boolean
      payment_url: string
      order_id: string
      message: string
    }>
  } | null>(null)

  useEffect(() => {
    fetchStudents()
    fetchCategories()
  }, [])

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('status', 'active')
      .order('nama')

    if (error) {
      toast.error('Gagal memuat data siswa')
      console.error(error)
    } else {
      setStudents(data || [])
    }
  }

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('payment_categories')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      toast.error('Gagal memuat kategori pembayaran')
      console.error(error)
    } else {
      setCategories(data || [])
    }
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(students.map(s => s.id))
    }
  }

  const handleBroadcast = async () => {
    if (!formData.category_id || !formData.amount || selectedStudents.length === 0) {
      toast.error('Lengkapi semua field dan pilih minimal 1 siswa')
      return
    }

    setIsSending(true)
    setBroadcastResults(null)

    try {
      const amount = parseInt(formData.amount)
      const selectedCategory = categories.find(c => c.id === formData.category_id)
      const monthYear = dateUtils.getCurrentMonthYear()
      
      // Generate payment data for each selected student
      const paymentData = selectedStudents.map(studentId => {
        const student = students.find(s => s.id === studentId)!
        const orderId = generateOrderId()
        const paymentUrl = generatePaymentUrl(amount, orderId)
        
        return {
          student_id: studentId,
          student_name: student.nama,
          phone: student.nomor_hp_ortu,
          category_id: formData.category_id,
          amount,
          order_id: orderId,
          payment_url: paymentUrl,
          due_date: formData.due_date,
          status: 'pending'
        }
      })

      // Save payments to database
      const { error: paymentError } = await supabase
        .from('payments')
        .insert(paymentData.map(p => ({
          student_id: p.student_id,
          category_id: p.category_id,
          amount: p.amount,
          order_id: p.order_id,
          pakasir_payment_url: p.payment_url,
          due_date: p.due_date,
          status: p.status
        })))

      if (paymentError) {
        throw new Error('Gagal menyimpan data tagihan')
      }

      // Send WhatsApp messages
      const messages = paymentData.map(payment => {
        let message = ''
        
        if (formData.message_template === 'default') {
          message = messageUtils.createBillingMessage(
            payment.student_name,
            monthYear,
            amount,
            new Date(formData.due_date).toLocaleDateString('id-ID'),
            payment.payment_url
          )
        } else {
          // Custom message with placeholders
          message = formData.custom_message
            .replace('{nama}', payment.student_name)
            .replace('{nominal}', `Rp ${amount.toLocaleString('id-ID')}`)
            .replace('{jatuh_tempo}', new Date(formData.due_date).toLocaleDateString('id-ID'))
            .replace('{link}', payment.payment_url)
            .replace('{order_id}', payment.order_id)
        }
        
        return {
          to: payment.phone,
          message,
          metadata: {
            student_id: payment.student_id,
            student_name: payment.student_name,
            payment_url: payment.payment_url,
            order_id: payment.order_id
          }
        }
      })

      // Send messages with delay
      const results = []
      let sentCount = 0
      let failedCount = 0

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i]
        
        try {
          const result = await starSenderService.sendMessage(msg.to, msg.message)
          
          results.push({
            student_id: msg.metadata.student_id,
            student_name: msg.metadata.student_name,
            phone: msg.to,
            success: result.success,
            payment_url: msg.metadata.payment_url,
            order_id: msg.metadata.order_id,
            message: result.message
          })
          
          if (result.success) {
            sentCount++
          } else {
            failedCount++
          }
        } catch (error) {
          failedCount++
          results.push({
            student_id: msg.metadata.student_id,
            student_name: msg.metadata.student_name,
            phone: msg.to,
            success: false,
            payment_url: msg.metadata.payment_url,
            order_id: msg.metadata.order_id,
            message: 'Gagal mengirim pesan'
          })
        }
        
        // Delay between messages to avoid rate limiting
        if (i < messages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }

      setBroadcastResults({
        total: messages.length,
        sent: sentCount,
        failed: failedCount,
        results
      })

      toast.success(`Berhasil mengirim ${sentCount} dari ${messages.length} tagihan`)
      
      // Reset selection
      setSelectedStudents([])
      
    } catch (error) {
      console.error('Error broadcasting bills:', error)
      toast.error('Gagal mengirim tagihan')
    } finally {
      setIsSending(false)
    }
  }

  const exportResults = () => {
    if (!broadcastResults) return

    const csv = [
      ['Nama Siswa', 'No HP Ortu', 'Order ID', 'Link Pembayaran', 'Status', 'Pesan'],
      ...broadcastResults.results.map(r => [
        r.student_name,
        r.phone,
        r.order_id,
        r.payment_url,
        r.success ? 'Terkirim' : 'Gagal',
        r.message
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `broadcast-tagihan-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Broadcast Tagihan</h1>
          <p className="text-gray-600">Kirim tagihan dengan link pembayaran ke orang tua siswa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Informasi Tagihan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori Pembayaran
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
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
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Contoh: 50000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Jatuh Tempo
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Template Pesan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Template
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="default"
                      checked={formData.message_template === 'default'}
                      onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                      className="mr-2"
                    />
                    <span>Template Default</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="custom"
                      checked={formData.message_template === 'custom'}
                      onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                      className="mr-2"
                    />
                    <span>Pesan Custom</span>
                  </label>
                </div>
              </div>

              {formData.message_template === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pesan Custom
                  </label>
                  <textarea
                    value={formData.custom_message}
                    onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
                    placeholder="Gunakan placeholder: {nama}, {nominal}, {jatuh_tempo}, {link}, {order_id}"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Placeholder yang tersedia: {'{nama}'}, {'{nominal}'}, {'{jatuh_tempo}'}, {'{link}'}, {'{order_id}'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Pilih Siswa
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
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students.map(student => (
                  <label
                    key={student.id}
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents([...selectedStudents, student.id])
                        } else {
                          setSelectedStudents(selectedStudents.filter(id => id !== student.id))
                        }
                      }}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{student.nama}</div>
                      <div className="text-sm text-gray-600">
                        {student.kelas} • {student.nomor_hp_ortu}
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
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Siswa dipilih:</span>
                <span className="font-medium">{selectedStudents.length} siswa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total tagihan:</span>
                <span className="font-medium">
                  {formData.amount ? `Rp ${(parseInt(formData.amount) * selectedStudents.length).toLocaleString('id-ID')}` : 'Rp 0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Biaya per siswa:</span>
                <span className="font-medium">
                  {formData.amount ? `Rp ${parseInt(formData.amount).toLocaleString('id-ID')}` : 'Rp 0'}
                </span>
              </div>

              <Button
                onClick={handleBroadcast}
                disabled={isSending || selectedStudents.length === 0 || !formData.category_id || !formData.amount}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Kirim Tagihan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {broadcastResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Hasil Pengiriman</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportResults}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{broadcastResults.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{broadcastResults.sent}</div>
                    <div className="text-sm text-gray-600">Terkirim</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{broadcastResults.failed}</div>
                    <div className="text-sm text-gray-600">Gagal</div>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {broadcastResults.results.map((result, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center">
                        {result.success ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-red-600 mr-2" />
                        )}
                        <div>
                          <div className="text-sm font-medium">{result.student_name}</div>
                          <div className="text-xs text-gray-600">{result.order_id}</div>
                        </div>
                      </div>
                      <Badge variant={result.success ? 'success' : 'danger'}>
                        {result.success ? 'Terkirim' : 'Gagal'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}