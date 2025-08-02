'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'
import { starSenderService } from '@/lib/starsender-service'
import { 
  Send, 
  Users, 
  MessageCircle, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Loader2,
  FileText,
  Plus,
  Megaphone
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Student {
  id: string
  nama: string
  nomor_hp_ortu: string
  nama_ortu: string
}

interface MessageTemplate {
  id: string
  name: string
  content: string
  variables: string[]
}

interface BulkResult {
  total: number
  sent: number
  failed: number
  results: Array<{
    phone: string
    success: boolean
    message: string
  }>
}

const BulkWhatsApp = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendResults, setSendResults] = useState<BulkResult | null>(null)
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '' })
  const [broadcastType, setBroadcastType] = useState<'direct' | 'campaign'>('direct')
  const [campaignName, setCampaignName] = useState('')

  useEffect(() => {
    fetchStudents()
    fetchTemplates()
  }, [])

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('is_active', true)
        .order('nama')

      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Gagal memuat data siswa')
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

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setMessage(template.content)
      setSelectedTemplate(templateId)
    }
  }

  const saveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast.error('Nama dan isi template harus diisi')
      return
    }

    try {
      const { error } = await supabase
        .from('message_templates')
        .insert({
          name: newTemplate.name,
          content: newTemplate.content,
          variables: [],
          is_active: true
        })

      if (error) throw error

      toast.success('Template berhasil disimpan')
      setNewTemplate({ name: '', content: '' })
      setShowTemplateForm(false)
      fetchTemplates()
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Gagal menyimpan template')
    }
  }

  const handleSendBroadcast = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Pilih minimal satu siswa')
      return
    }

    if (!message.trim()) {
      toast.error('Pesan tidak boleh kosong')
      return
    }

    if (broadcastType === 'campaign' && !campaignName.trim()) {
      toast.error('Nama campaign harus diisi')
      return
    }

    setIsSending(true)
    setSendResults(null)

    try {
      const selectedStudentData = students.filter(s => selectedStudents.includes(s.id))
      
      if (broadcastType === 'campaign') {
        // Create campaign first
        const { deviceKey } = await starSenderService.getApiKeys()
        const campaignData = {
          device_api_key: deviceKey,
          name: campaignName,
          syntax: 'Broadcast',
          welcome_message: message,
          number: selectedStudentData[0]?.nomor_hp_ortu || '628123456789'
        }

        const campaignResult = await starSenderService.createCampaign(campaignData)
        
        if (!campaignResult.success) {
          throw new Error(campaignResult.message)
        }

        const campaignId = campaignResult.data?.id

        // Add all selected students to campaign
        for (const student of selectedStudentData) {
          await starSenderService.addCampaignMember(
            campaignId,
            student.nomor_hp_ortu,
            'Broadcast',
            true
          )
        }

        toast.success(`Campaign "${campaignName}" berhasil dibuat dengan ${selectedStudentData.length} anggota`)
        
        // Reset form
        setSelectedStudents([])
        setMessage('')
        setCampaignName('')
        setSendResults({
          total: selectedStudentData.length,
          sent: selectedStudentData.length,
          failed: 0,
          results: selectedStudentData.map(s => ({
            phone: s.nomor_hp_ortu,
            success: true,
            message: 'Ditambahkan ke campaign'
          }))
        })
      } else {
        // Direct broadcast
        const messages = selectedStudentData.map(student => ({
          to: student.nomor_hp_ortu,
          message: message.replace('{nama_siswa}', student.nama)
            .replace('{nama_ortu}', student.nama_ortu || 'Bapak/Ibu')
        }))

        const results = await starSenderService.sendBulkMessages(messages, 2000)
        setSendResults(results)

        // Log to database
        for (let i = 0; i < results.results.length; i++) {
          const result = results.results[i]
          const student = selectedStudentData[i]
          
          await supabase.from('whatsapp_messages').insert({
            student_id: student.id,
            message_type: 'broadcast',
            message_content: messages[i].message,
            status: result.success ? 'sent' : 'failed',
            error_message: result.success ? null : result.message,
            sent_at: new Date().toISOString()
          })
        }

        if (results.sent > 0) {
          toast.success(`Berhasil mengirim ${results.sent} dari ${results.total} pesan`)
        }
        if (results.failed > 0) {
          toast.error(`Gagal mengirim ${results.failed} pesan`)
        }
      }
    } catch (error) {
      console.error('Error sending broadcast:', error)
      toast.error('Terjadi kesalahan saat mengirim broadcast')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Broadcast Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Megaphone className="w-5 h-5 mr-2" />
            Tipe Broadcast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="direct"
                checked={broadcastType === 'direct'}
                onChange={(e) => setBroadcastType(e.target.value as 'direct' | 'campaign')}
                className="mr-2"
              />
              <span>Kirim Langsung</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="campaign"
                checked={broadcastType === 'campaign'}
                onChange={(e) => setBroadcastType(e.target.value as 'direct' | 'campaign')}
                className="mr-2"
              />
              <span>Buat Campaign</span>
            </label>
          </div>
          {broadcastType === 'campaign' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Campaign
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contoh: Info Kegiatan Kelas"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Compose */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Tulis Pesan
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Pilih Template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateForm(!showTemplateForm)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showTemplateForm && (
            <div className="p-4 border border-gray-200 rounded-lg space-y-3">
              <input
                type="text"
                placeholder="Nama template"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                placeholder="Isi template"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowTemplateForm(false)
                    setNewTemplate({ name: '', content: '' })
                  }}
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={saveTemplate}
                >
                  Simpan
                </Button>
              </div>
            </div>
          )}
          
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ketik pesan Anda di sini...

Variabel yang tersedia:
{nama_siswa} - Nama siswa
{nama_ortu} - Nama orang tua"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={6}
            />
            <div className="mt-2 text-sm text-gray-500">
              {message.length} karakter
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Send Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSendBroadcast}
          disabled={isSending || selectedStudents.length === 0 || !message.trim()}
          className="flex items-center"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {broadcastType === 'campaign' ? 'Buat Campaign' : 'Kirim Broadcast'}
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {sendResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Hasil Pengiriman
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{sendResults.total}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{sendResults.sent}</div>
                <div className="text-sm text-gray-500">Berhasil</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{sendResults.failed}</div>
                <div className="text-sm text-gray-500">Gagal</div>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {sendResults.results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border border-gray-200 rounded"
                >
                  <div className="flex items-center">
                    {result.success ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    <span className="text-sm">{result.phone}</span>
                  </div>
                  <Badge variant={result.success ? "success" : "danger"}>
                    {result.message}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BulkWhatsApp