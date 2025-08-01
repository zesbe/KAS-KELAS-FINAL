'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { sendWhatsAppMessage, sendBulkWhatsAppMessages, messageUtils } from '@/lib/starsender'
import { generatePaymentUrl, generateOrderId } from '@/lib/pakasir'
import { Student } from '@/lib/supabase'
import { studentService } from '@/lib/student-service'
import ContactSelector from '@/components/whatsapp/ContactSelector'
import toast from 'react-hot-toast'
import { 
  MessageCircle, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  Bell,
  Settings,
  Plus,
  Eye,
  Calendar,
  Phone,
  Zap,
  AlertCircle
} from 'lucide-react'

interface WhatsAppMessage {
  id: string
  type: 'payment_reminder' | 'payment_confirmation' | 'general_announcement'
  recipient: string
  recipient_name: string
  message: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  sent_at?: string
  scheduled_at?: string
  student_name?: string
}

interface MessageTemplate {
  id: string
  name: string
  type: string
  content: string
  variables: string[]
}

// Sample data
const sampleMessages: WhatsAppMessage[] = [
  {
    id: '1',
    type: 'payment_reminder',
    recipient: '628123456789',
    recipient_name: 'Budi Santoso',
    student_name: 'Ahmad Rizki Pratama',
    message: '🏫 *KAS KELAS 1A - SD INDONESIA*\n\nYth. Bapak/Ibu Budi Santoso\n\n📋 Tagihan: Kas Bulanan Februari 2024\n💰 Nominal: Rp 25.000\n📅 Jatuh Tempo: 5 Februari 2024\n\n🔗 *BAYAR SEKARANG (KLIK LINK)*\nhttps://pakasir.zone.id/pay/abc123\n\n✅ *Metode Pembayaran:*\n🏦 Transfer Bank | 💳 E-Wallet | 📱 QRIS\n\nTerima kasih 🙏',
    status: 'delivered',
    sent_at: '2024-01-20T08:00:00Z'
  },
  {
    id: '2',
    type: 'payment_confirmation',
    recipient: '628234567890',
    recipient_name: 'Sari Dewi',
    student_name: 'Siti Nurhaliza',
    message: '✅ *PEMBAYARAN BERHASIL*\n\n🏫 KAS KELAS 1A - SD INDONESIA\n\nYth. Ibu Sari Dewi\n\nPembayaran kas bulanan atas nama *Siti Nurhaliza* telah berhasil diterima:\n\n💰 Nominal: Rp 25.000\n📅 Tanggal: 18 Januari 2024\n🆔 ID Transaksi: TRX123456\n\nTerima kasih atas pembayarannya! 🙏',
    status: 'read',
    sent_at: '2024-01-18T14:30:00Z'
  },
  {
    id: '3',
    type: 'general_announcement',
    recipient: 'broadcast',
    recipient_name: 'Semua Orang Tua',
    message: '📢 *PENGUMUMAN KELAS 1A*\n\n🏫 SD INDONESIA\n\nYth. Bapak/Ibu Orang Tua Siswa\n\nDengan hormat, kami informasikan bahwa:\n\n📅 **Rapat Orang Tua**\nHari: Sabtu, 3 Februari 2024\nWaktu: 09.00 - 11.00 WIB\nTempat: Ruang Kelas 1A\n\n📋 **Agenda:**\n• Laporan keuangan kas kelas\n• Program kegiatan semester 2\n• Persiapan study tour\n\nMohon kehadiran Bapak/Ibu. Terima kasih 🙏',
    status: 'pending',
    scheduled_at: '2024-02-01T07:00:00Z'
  }
]

const messageTemplates: MessageTemplate[] = [
  {
    id: '1',
    name: 'Reminder Pembayaran',
    type: 'payment_reminder',
    content: '🏫 *KAS KELAS 1A - SD INDONESIA*\n\nYth. {parent_name}\n\n📋 Tagihan: {payment_category}\n💰 Nominal: {amount}\n📅 Jatuh Tempo: {due_date}\n\n🔗 *BAYAR SEKARANG*\n{payment_link}\n\nTerima kasih 🙏',
    variables: ['parent_name', 'payment_category', 'amount', 'due_date', 'payment_link']
  },
  {
    id: '2',
    name: 'Konfirmasi Pembayaran',
    type: 'payment_confirmation',
    content: '✅ *PEMBAYARAN BERHASIL*\n\nYth. {parent_name}\n\nPembayaran {payment_category} atas nama *{student_name}* telah diterima:\n\n💰 Nominal: {amount}\n📅 Tanggal: {payment_date}\n🆔 ID: {transaction_id}\n\nTerima kasih! 🙏',
    variables: ['parent_name', 'student_name', 'payment_category', 'amount', 'payment_date', 'transaction_id']
  }
]

const WhatsAppPage = () => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>(sampleMessages)
  const [activeTab, setActiveTab] = useState<'messages' | 'templates' | 'broadcast' | 'selective' | 'settings'>('messages')
  const [selectedMessages, setSelectedMessages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)

  // Load students data on component mount
  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    setLoadingStudents(true)
    try {
      const { data, error } = await studentService.getAllStudents(true) // Only active students
      if (error) {
        console.error('Error loading students:', error)
        toast.error('Gagal memuat data siswa')
      } else {
        setStudents(data || [])
      }
    } catch (error) {
      console.error('Error loading students:', error)
      toast.error('Terjadi kesalahan saat memuat data')
    } finally {
      setLoadingStudents(false)
    }
  }


  const statusStats = {
    total: messages.length,
    sent: messages.filter(m => m.status === 'sent' || m.status === 'delivered' || m.status === 'read').length,
    pending: messages.filter(m => m.status === 'pending').length,
    failed: messages.filter(m => m.status === 'failed').length
  }

  // Function to send payment reminders
  const handleSendPaymentReminders = async () => {
    setIsLoading(true)
    toast.loading('Mengirim reminder pembayaran...')
    
    try {
      const recipients = students.map(student => {
        const orderId = generateOrderId()
        const paymentLink = generatePaymentUrl(25000, orderId)
        const message = messageUtils.createBillingMessage(
          student.nama,
          'Februari 2024',
          25000,
          '2024-02-05',
          paymentLink
        )
        
        return {
          phone: student.nomor_hp_ortu,
          message,
          studentId: student.id
        }
      })

      const results = await sendBulkWhatsAppMessages(recipients)
      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length
      
      // Update messages state with new sent messages
      const newMessages = results.map((result, index) => ({
        id: Date.now().toString() + index,
        type: 'payment_reminder' as const,
        recipient: recipients[index].phone,
        recipient_name: students[index].nama_ortu,
        student_name: students[index].nama,
        message: recipients[index].message,
        status: result.success ? 'sent' as const : 'failed' as const,
        sent_at: new Date().toISOString()
      }))
      
      setMessages(prev => [...newMessages, ...prev])
      
      toast.dismiss()
      toast.success(`Berhasil kirim ${successCount} pesan, ${failCount} gagal`)
    } catch (error) {
      toast.dismiss()
      toast.error('Gagal mengirim reminder pembayaran')
    } finally {
      setIsLoading(false)
    }
  }

  // Function to send broadcast message
  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim() || !broadcastTitle.trim()) {
      toast.error('Judul dan pesan harus diisi')
      return
    }

    setIsLoading(true)
    toast.loading('Mengirim broadcast...')
    
    try {
      const message = messageUtils.createBroadcastMessage(broadcastTitle, broadcastMessage)
      const recipients = students.map(student => ({
        phone: student.nomor_hp_ortu,
        message,
        studentId: student.id
      }))

      const results = await sendBulkWhatsAppMessages(recipients)
      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length
      
      // Add broadcast message to history
      const newMessage: WhatsAppMessage = {
        id: Date.now().toString(),
        type: 'general_announcement',
        recipient: 'broadcast',
        recipient_name: 'Semua Orang Tua',
        message,
        status: successCount > 0 ? 'sent' : 'failed',
        sent_at: new Date().toISOString()
      }
      
      setMessages(prev => [newMessage, ...prev])
      setBroadcastMessage('')
      setBroadcastTitle('')
      
      toast.dismiss()
      toast.success(`Broadcast terkirim ke ${successCount} kontak`)
      setActiveTab('messages')
    } catch (error) {
      toast.dismiss()
      toast.error('Gagal mengirim broadcast')
    } finally {
      setIsLoading(false)
    }
  }

  // Function to send selective messages
  const handleSendSelectiveMessage = async (selectedIds: string[], message: string) => {
    setIsLoading(true)
    toast.loading('Mengirim pesan ke kontak terpilih...')
    
    try {
      const targetStudents = students.filter(student => selectedIds.includes(student.id))
      
      const recipients = targetStudents.map(student => ({
        phone: student.nomor_hp_ortu,
        message,
        studentId: student.id
      }))

      const results = await sendBulkWhatsAppMessages(recipients)
      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length
      
      // Add messages to history
      const newMessages = results.map((result, index) => ({
        id: Date.now().toString() + index,
        type: 'general_announcement' as const,
        recipient: recipients[index].phone,
        recipient_name: targetStudents[index].nama_ortu || 'Orang Tua',
        student_name: targetStudents[index].nama,
        message,
        status: result.success ? 'sent' as const : 'failed' as const,
        sent_at: new Date().toISOString()
      }))
      
      setMessages(prev => [...newMessages, ...prev])
      setSelectedContacts([])
      
      toast.dismiss()
      toast.success(`Pesan berhasil dikirim ke ${successCount} kontak${failCount > 0 ? `, ${failCount} gagal` : ''}`)
      setActiveTab('messages')
    } catch (error) {
      toast.dismiss()
      toast.error('Gagal mengirim pesan selektif')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="primary" className="flex items-center gap-1"><Send className="w-3 h-3" /> Terkirim</Badge>
      case 'delivered':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Sampai</Badge>
      case 'read':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Dibaca</Badge>
      case 'pending':
        return <Badge variant="warning" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Menunggu</Badge>
      case 'failed':
        return <Badge variant="danger" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Gagal</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'payment_reminder':
        return <Bell className="w-4 h-4 text-yellow-600" />
      case 'payment_confirmation':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'general_announcement':
        return <MessageCircle className="w-4 h-4 text-blue-600" />
      default:
        return <MessageCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Gateway</h1>
            <p className="text-gray-600 mt-1">
              Kelola dan pantau pesan WhatsApp otomatis
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Pengaturan
            </Button>
            <Button onClick={() => setActiveTab('selective')}>
              <Plus className="w-4 h-4 mr-2" />
              Pesan Baru
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Pesan</p>
                  <p className="text-2xl font-bold text-gray-900">{statusStats.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Terkirim</p>
                  <p className="text-2xl font-bold text-green-600">{statusStats.sent}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Menunggu</p>
                  <p className="text-2xl font-bold text-yellow-600">{statusStats.pending}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Gagal</p>
                  <p className="text-2xl font-bold text-red-600">{statusStats.failed}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'messages', label: 'Riwayat Pesan', icon: MessageCircle },
              { id: 'selective', label: 'Kirim Selektif', icon: Users },
              { id: 'broadcast', label: 'Broadcast', icon: Bell },
              { id: 'templates', label: 'Template Pesan', icon: Settings },
              { id: 'settings', label: 'Pengaturan', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
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

        {/* Tab Content */}
        {activeTab === 'messages' && (
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pesan WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getMessageTypeIcon(message.type)}
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {message.recipient === 'broadcast' ? 'Broadcast ke Semua' : message.recipient_name}
                            {message.student_name && (
                              <span className="text-sm text-gray-600 ml-2">({message.student_name})</span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {message.recipient !== 'broadcast' && (
                              <span className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {message.recipient}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(message.status)}
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                        {message.message.length > 150 
                          ? message.message.substring(0, 150) + '...'
                          : message.message
                        }
                      </pre>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {message.sent_at && (
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Dikirim: {formatDateTime(message.sent_at)}
                          </span>
                        )}
                        {message.scheduled_at && (
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Dijadwalkan: {formatDateTime(message.scheduled_at)}
                          </span>
                        )}
                      </span>
                      <span className="capitalize">{message.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'selective' && (
          <Card>
            <CardHeader>
              <CardTitle>Kirim Pesan ke Kontak Tertentu</CardTitle>
              <p className="text-sm text-gray-600">
                Pilih kontak spesifik yang ingin menerima pesan WhatsApp
              </p>
            </CardHeader>
            <CardContent>
              <ContactSelector
                students={students}
                selectedContacts={selectedContacts}
                onSelectionChange={setSelectedContacts}
                onSendMessage={handleSendSelectiveMessage}
                loading={isLoading}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'templates' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Template Pesan</CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {messageTemplates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <Badge variant="secondary">{template.type.replace('_', ' ')}</Badge>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                        {template.content}
                      </pre>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">Variabel yang tersedia:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable) => (
                          <span key={variable} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {`{${variable}}`}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Gunakan</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'broadcast' && (
          <Card>
            <CardHeader>
              <CardTitle>Kirim Pesan Broadcast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-blue-900">Broadcast ke Semua Orang Tua</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Pesan akan dikirim ke {students.length} orang tua siswa aktif
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Pengumuman
                  </label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
                    placeholder="Contoh: Rapat Orang Tua"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pesan
                  </label>
                  <textarea
                    rows={8}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tulis pesan broadcast di sini..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jadwalkan Pengiriman (Opsional)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="time"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" disabled={isLoading}>Preview</Button>
                  <Button onClick={handleSendBroadcast} disabled={isLoading}>
                    <Send className="w-4 h-4 mr-2" />
                    {isLoading ? 'Mengirim...' : 'Kirim Broadcast'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan WhatsApp Gateway</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-2xl space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-green-900">Status Koneksi</h4>
                      <p className="text-sm text-green-700">Terhubung dengan StarSender API</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      value="2d8714c0ceb932baf18b44285cb540b294a64871"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API URL
                    </label>
                    <input
                      type="text"
                      value="https://starsender.online/api/sendText"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Pengaturan Otomatis</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="ml-3 text-sm text-gray-700">Kirim reminder pembayaran otomatis</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="ml-3 text-sm text-gray-700">Kirim konfirmasi pembayaran otomatis</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-3 text-sm text-gray-700">Reminder H-3 sebelum jatuh tempo</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Simpan Pengaturan</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default WhatsAppPage