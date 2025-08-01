'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { starSenderService, StarSenderMessage } from '@/lib/starsender-service'
import { 
  Send, 
  Users, 
  MessageCircle, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Student {
  id: string
  nama: string
  nomor_absen: number
  nomor_hp_ortu: string
  nama_ortu: string
  email_ortu?: string
  is_active: boolean
}

interface MessageTemplate {
  id: string
  name: string
  template: string
  type: 'reminder' | 'overdue' | 'info' | 'custom'
}

const BulkWhatsApp: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'selected' | 'unselected'>('all')
  const [messageTemplate, setMessageTemplate] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sentCount, setSentCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const messageTemplates: MessageTemplate[] = [
    {
      id: 'reminder',
      name: 'Pengingat Pembayaran',
      template: `🔔 *PENGINGAT KAS KELAS*

Assalamu'alaikum Bapak/Ibu {{NAMA_ORTU}} 🙏

Kami ingatkan bahwa iuran kas kelas atas nama *{{NAMA_SISWA}}* akan jatuh tempo pada {{TANGGAL_JATUH_TEMPO}}.

💰 *Rincian:*
• Jumlah: *Rp 25.000*
• Jatuh Tempo: {{TANGGAL_JATUH_TEMPO}}

🏦 *Cara Bayar:*
• Transfer: 1234567890 (BCA - Ibu Sari)
• Tunai: Serahkan ke bendahara

Mohon konfirmasi setelah pembayaran ya Bapak/Ibu 📸

Terima kasih 🙏
*Bendahara Kelas 1A*`,
      type: 'reminder'
    },
    {
      id: 'overdue',
      name: 'Tagihan Terlambat',
      template: `⚠️ *TAGIHAN TERLAMBAT*

Assalamu'alaikum Bapak/Ibu {{NAMA_ORTU}} 🙏

Iuran kas kelas atas nama *{{NAMA_SISWA}}* sudah melewati jatuh tempo.

💰 *Jumlah:* Rp 25.000
📅 *Status:* TERLAMBAT

Mohon segera melakukan pembayaran ya Bapak/Ibu 🙏
Jika ada kendala, silakan hubungi kami.

*Bendahara Kelas 1A*`,
      type: 'overdue'
    },
    {
      id: 'info',
      name: 'Informasi Kegiatan',
      template: `📢 *INFO KEGIATAN KELAS*

Assalamu'alaikum Bapak/Ibu {{NAMA_ORTU}} 🙏

Kegiatan kelas akan dilaksanakan:
📅 Tanggal: {{TANGGAL_KEGIATAN}}
🕐 Waktu: {{WAKTU_KEGIATAN}}
📍 Tempat: {{TEMPAT_KEGIATAN}}

Mohon doa dan dukungannya 🙏

*Bendahara Kelas 1A*`,
      type: 'info'
    },
    {
      id: 'custom',
      name: 'Pesan Kustom',
      template: '',
      type: 'custom'
    }
  ]

  // Load students from Supabase
  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('is_active', true)
        .order('nomor_absen')

      if (error) {
        console.error('Error loading students:', error)
        toast.error('Gagal memuat data siswa')
        return
      }

      setStudents(data || [])
    } catch (error) {
      console.error('Error loading students:', error)
      toast.error('Terjadi kesalahan saat memuat data siswa')
    } finally {
      setLoading(false)
    }
  }

  // Filter students based on search and filter
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.nama_ortu.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.nomor_hp_ortu.includes(searchTerm)
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'selected' && selectedStudents.includes(student.id)) ||
                         (filterStatus === 'unselected' && !selectedStudents.includes(student.id))
    
    return matchesSearch && matchesFilter
  })

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const selectAll = () => {
    setSelectedStudents(filteredStudents.map(s => s.id))
  }

  const clearAll = () => {
    setSelectedStudents([])
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = messageTemplates.find(t => t.id === templateId)
    if (template) {
      if (template.type === 'custom') {
        setMessageTemplate('')
      } else {
        setMessageTemplate(template.template)
      }
    }
  }

  const generatePersonalizedMessage = (student: Student, template: string): string => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return template
      .replace(/{{NAMA_ORTU}}/g, student.nama_ortu)
      .replace(/{{NAMA_SISWA}}/g, student.nama)
      .replace(/{{TANGGAL_JATUH_TEMPO}}/g, tomorrow.toLocaleDateString('id-ID'))
      .replace(/{{TANGGAL_KEGIATAN}}/g, 'Akan diinformasikan lebih lanjut')
      .replace(/{{WAKTU_KEGIATAN}}/g, 'Akan diinformasikan lebih lanjut')
      .replace(/{{TEMPAT_KEGIATAN}}/g, 'Ruang Kelas 1A')
  }

  const sendBulkMessages = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Pilih minimal 1 siswa')
      return
    }

    const finalTemplate = selectedTemplate === 'custom' ? customMessage : messageTemplate

    if (!finalTemplate.trim()) {
      toast.error('Pesan tidak boleh kosong')
      return
    }

    setSending(true)
    setSentCount(0)

    try {
      // Prepare messages for StarSender API
      const messages: StarSenderMessage[] = selectedStudents
        .map(studentId => {
          const student = students.find(s => s.id === studentId)
          if (!student) return null
          
          const personalizedMessage = generatePersonalizedMessage(student, finalTemplate)
          return {
            to: student.nomor_hp_ortu,
            message: personalizedMessage
          }
        })
        .filter(Boolean) as StarSenderMessage[]

      console.log(`Preparing to send ${messages.length} WhatsApp messages via StarSender API`)
      toast(`Memulai pengiriman ${messages.length} pesan WhatsApp...`, { icon: 'ℹ️' })

      // Send via StarSender API with progress tracking
      const result = await starSenderService.sendBulkMessages(messages, 2000)
      
      // Update sent count as messages are processed
      setSentCount(result.sent)

      if (result.sent > 0) {
        toast.success(`✅ Berhasil mengirim ${result.sent} dari ${result.total} pesan WhatsApp`)
      }
      
      if (result.failed > 0) {
        toast.error(`❌ ${result.failed} pesan gagal dikirim`)
        
        // Log failed messages for debugging
        const failedMessages = result.results.filter(r => !r.success)
        console.error('Failed messages:', failedMessages)
      }

      // Show detailed results
      if (result.total > 5) {
        // For bulk messages, show summary
        toast(`📊 Ringkasan: ${result.sent} berhasil, ${result.failed} gagal dari ${result.total} total`, { icon: 'ℹ️' })
      } else {
        // For small batches, show individual results
        result.results.forEach((r, index) => {
          const student = students.find(s => s.nomor_hp_ortu === r.phone)
          const studentName = student ? student.nama : r.phone
          
          if (r.success) {
            toast.success(`✅ ${studentName}: Pesan terkirim`)
          } else {
            toast.error(`❌ ${studentName}: ${r.message}`)
          }
        })
      }

    } catch (error) {
      console.error('Error sending bulk messages:', error)
      toast.error('Terjadi kesalahan saat mengirim pesan via StarSender API')
    } finally {
      setSending(false)
      setSentCount(0)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data siswa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Broadcast WhatsApp</h2>
          <p className="text-gray-600">Kirim pesan ke multiple orang tua siswa</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {selectedStudents.length} dari {students.length} dipilih
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Pilih Penerima
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama siswa/orang tua/nomor HP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Semua</option>
                  <option value="selected">Dipilih</option>
                  <option value="unselected">Belum Dipilih</option>
                </select>
              </div>

              {/* Bulk Actions */}
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Pilih Semua ({filteredStudents.length})
                </Button>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Hapus Semua
                </Button>
              </div>

              {/* Student List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedStudents.includes(student.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleStudent(student.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">
                          {student.nomor_absen}. {student.nama}
                        </p>
                        {selectedStudents.includes(student.id) && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Ortu: {student.nama_ortu}
                      </p>
                      <p className="text-sm text-gray-500">
                        HP: {student.nomor_hp_ortu}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada siswa yang sesuai dengan filter</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Template */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Template Pesan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Template Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih template pesan...</option>
                  {messageTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Content */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedTemplate === 'custom' ? 'Pesan Kustom' : 'Preview Pesan'}
                </label>
                <textarea
                  value={selectedTemplate === 'custom' ? customMessage : messageTemplate}
                  onChange={(e) => {
                    if (selectedTemplate === 'custom') {
                      setCustomMessage(e.target.value)
                    } else {
                      setMessageTemplate(e.target.value)
                    }
                  }}
                  placeholder={selectedTemplate === 'custom' ? 'Tulis pesan kustom...' : 'Pilih template terlebih dahulu'}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>

              {/* Variables Help */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Variabel Otomatis:</h4>
                <div className="text-xs text-blue-800 space-y-1">
                  <p>• <code>{'{{NAMA_ORTU}}'}</code> → Nama orang tua</p>
                  <p>• <code>{'{{NAMA_SISWA}}'}</code> → Nama siswa</p>
                  <p>• <code>{'{{TANGGAL_JATUH_TEMPO}}'}</code> → Tanggal jatuh tempo</p>
                </div>
              </div>

              {/* Send Button */}
              <Button
                onClick={sendBulkMessages}
                disabled={sending || selectedStudents.length === 0 || (!messageTemplate.trim() && !customMessage.trim())}
                className="w-full bg-green-600 hover:bg-green-700"
                loading={sending}
              >
                <Send className="w-4 h-4 mr-2" />
                {sending 
                  ? `Mengirim... ${sentCount}/${selectedStudents.length}`
                  : `Kirim ke ${selectedStudents.length} Penerima`
                }
              </Button>

              {sending && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center text-yellow-800">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      Mengirim pesan via StarSender API dengan delay 2 detik antar pesan
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardContent className="p-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📱 Cara Kerja Broadcast WhatsApp:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. Pilih siswa yang akan menerima pesan</li>
              <li>2. Pilih template pesan atau buat pesan kustom</li>
              <li>3. Klik "Kirim" - sistem akan mengirim via StarSender API</li>
              <li>4. Pesan akan terpersonalisasi otomatis (nama siswa, orang tua, dll)</li>
              <li>5. Ada delay 2 detik antar pesan untuk menghindari rate limiting</li>
              <li>6. Status pengiriman akan ditampilkan secara real-time</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BulkWhatsApp