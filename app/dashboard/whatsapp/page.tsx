'use client'

import React, { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import BulkWhatsApp from '@/components/whatsapp/BulkWhatsApp'
import StarSenderTest from '@/components/whatsapp/StarSenderTest'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'
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
  AlertCircle,
  FileText,
  Save
} from 'lucide-react'

interface WhatsAppMessage {
  id: string
  type: 'payment_reminder' | 'payment_confirmation' | 'general_announcement' | 'custom'
  recipient_phone: string
  recipient_name: string
  message: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  sent_at?: string
  scheduled_at?: string
  student_id?: string
  payment_id?: string
  created_by?: string
  created_at: string
}

interface MessageTemplate {
  id: string
  name: string
  type: string
  content: string
  variables: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

interface MessageStats {
  total: number
  sent: number
  delivered: number
  failed: number
  pending: number
}

const WhatsAppPage = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [stats, setStats] = useState<MessageStats>({
    total: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    pending: 0
  })
  const [activeTab, setActiveTab] = useState<'messages' | 'templates' | 'broadcast' | 'selective' | 'settings' | 'test'>('messages')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'payment_reminder',
    content: '',
    variables: [] as string[]
  })

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select(`
          *,
          student:students(nama),
          payment:payments(order_id, amount)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Gagal memuat riwayat pesan')
    }
  }

  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      // If no templates exist, create default ones
      if (!data || data.length === 0) {
        await createDefaultTemplates()
        fetchTemplates()
      } else {
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMessages()
    fetchTemplates()
    fetchStats()
  }, [fetchTemplates])

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('status')

      if (error) throw error

      const stats = (data || []).reduce((acc: MessageStats, msg: any) => {
        acc.total++
        if (msg.status === 'sent') acc.sent++
        else if (msg.status === 'delivered') acc.delivered++
        else if (msg.status === 'failed') acc.failed++
        else if (msg.status === 'pending') acc.pending++
        return acc
      }, {
        total: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        pending: 0
      })

      setStats(stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const createDefaultTemplates = async () => {
    const defaultTemplates = [
      {
        name: 'Reminder Pembayaran',
        type: 'payment_reminder',
        content: '🏫 *KAS KELAS - {school_name}*\n\nYth. {parent_name}\n\n📋 Tagihan: {payment_category}\n💰 Nominal: Rp {amount}\n📅 Jatuh Tempo: {due_date}\n\n🔗 *BAYAR SEKARANG*\n{payment_link}\n\nTerima kasih 🙏',
        variables: ['school_name', 'parent_name', 'payment_category', 'amount', 'due_date', 'payment_link'],
        is_active: true,
        created_by: user?.id
      },
      {
        name: 'Konfirmasi Pembayaran',
        type: 'payment_confirmation',
        content: '✅ *PEMBAYARAN BERHASIL*\n\nYth. {parent_name}\n\nPembayaran {payment_category} atas nama *{student_name}* telah diterima:\n\n💰 Nominal: Rp {amount}\n📅 Tanggal: {payment_date}\n🆔 ID: {transaction_id}\n\nTerima kasih! 🙏',
        variables: ['parent_name', 'student_name', 'payment_category', 'amount', 'payment_date', 'transaction_id'],
        is_active: true,
        created_by: user?.id
      },
      {
        name: 'Pengumuman Umum',
        type: 'general_announcement',
        content: '📢 *PENGUMUMAN {class_name}*\n\n🏫 {school_name}\n\nYth. Bapak/Ibu Orang Tua Siswa\n\n{announcement_content}\n\nTerima kasih 🙏',
        variables: ['class_name', 'school_name', 'announcement_content'],
        is_active: true,
        created_by: user?.id
      }
    ]

    try {
      const { error } = await supabase
        .from('message_templates')
        .insert(defaultTemplates)

      if (error) throw error
    } catch (error) {
      console.error('Error creating default templates:', error)
    }
  }

  const saveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast.error('Nama dan isi template harus diisi')
      return
    }

    try {
      // Extract variables from content (text between curly braces)
      const variables = newTemplate.content.match(/\{([^}]+)\}/g)?.map(v => v.slice(1, -1)) || []

      const { error } = await supabase
        .from('message_templates')
        .insert({
          name: newTemplate.name,
          type: newTemplate.type,
          content: newTemplate.content,
          variables,
          is_active: true,
          created_by: user?.id
        })

      if (error) throw error

      toast.success('Template berhasil disimpan')
      setIsCreatingTemplate(false)
      setNewTemplate({
        name: '',
        type: 'payment_reminder',
        content: '',
        variables: []
      })
      fetchTemplates()
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Gagal menyimpan template')
    }
  }

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus template ini?')) return

    try {
      const { error } = await supabase
        .from('message_templates')
        .update({ is_active: false })
        .eq('id', templateId)

      if (error) throw error

      toast.success('Template berhasil dihapus')
      fetchTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Gagal menghapus template')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="primary">Terkirim</Badge>
      case 'delivered':
        return <Badge variant="success">Diterima</Badge>
      case 'read':
        return <Badge variant="success">Dibaca</Badge>
      case 'failed':
        return <Badge variant="danger">Gagal</Badge>
      case 'pending':
        return <Badge variant="warning">Menunggu</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment_reminder':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'payment_confirmation':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'general_announcement':
        return <Bell className="w-4 h-4 text-blue-600" />
      default:
        return <MessageCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '-'
    // Format: +62 812-3456-7890
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length >= 10) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9)}`
    }
    return phone
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Gateway</h1>
            <p className="text-gray-600 mt-1">
              Kelola pesan WhatsApp dan template komunikasi
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Pesan</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Terkirim</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
                </div>
                <Send className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Diterima</p>
                  <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Gagal</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Menunggu</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'messages', label: 'Riwayat Pesan', icon: MessageCircle },
              { id: 'templates', label: 'Template', icon: FileText },
              { id: 'broadcast', label: 'Broadcast', icon: Users },
              { id: 'selective', label: 'Kirim Selektif', icon: Send },
              { id: 'test', label: 'Test API', icon: Zap },
              { id: 'settings', label: 'Pengaturan', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    py-2 px-1 border-b-2 font-medium text-sm flex items-center
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'messages' && (
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pesan WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Tipe</th>
                      <th className="text-left p-2">Penerima</th>
                      <th className="text-left p-2">Pesan</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-left p-2">Waktu</th>
                      <th className="text-center p-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-gray-500">
                          Belum ada pesan yang dikirim
                        </td>
                      </tr>
                    ) : (
                      messages.map((message) => (
                        <tr key={message.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="flex items-center">
                              {getTypeIcon(message.type)}
                            </div>
                          </td>
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{message.recipient_name}</p>
                              <p className="text-xs text-gray-600">
                                {formatPhoneNumber(message.recipient_phone)}
                              </p>
                            </div>
                          </td>
                          <td className="p-2 max-w-md">
                            <p className="text-sm text-gray-700 truncate">
                              {message.message}
                            </p>
                          </td>
                          <td className="p-2 text-center">
                            {getStatusBadge(message.status)}
                          </td>
                          <td className="p-2">
                            <p className="text-sm">
                              {formatDate(message.sent_at || message.created_at)}
                            </p>
                          </td>
                          <td className="p-2 text-center">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Template Pesan</h3>
              <Button onClick={() => setIsCreatingTemplate(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Buat Template
              </Button>
            </div>

            {isCreatingTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle>Buat Template Baru</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Template
                    </label>
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipe Template
                    </label>
                    <select
                      value={newTemplate.type}
                      onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="payment_reminder">Reminder Pembayaran</option>
                      <option value="payment_confirmation">Konfirmasi Pembayaran</option>
                      <option value="general_announcement">Pengumuman Umum</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Isi Template
                    </label>
                    <textarea
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Gunakan {variable} untuk variabel dinamis"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Contoh variabel: {'{nama}'}, {'{nominal}'}, {'{tanggal}'}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Button onClick={saveTemplate}>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreatingTemplate(false)}>
                      Batal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge>{template.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {template.content}
                    </pre>
                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        Variabel: {template.variables.join(', ')}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'broadcast' && (
          <BulkWhatsApp />
        )}

        {activeTab === 'selective' && (
          <Card>
            <CardHeader>
              <CardTitle>Kirim Pesan Selektif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Fitur kirim pesan selektif akan segera hadir
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'test' && (
          <StarSenderTest />
        )}

        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <p className="text-sm text-blue-900">
                      Konfigurasi WhatsApp API dapat diatur di menu Pengaturan → Integrasi
                    </p>
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

export default WhatsAppPage