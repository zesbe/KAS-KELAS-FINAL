'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { 
  Search, 
  Phone, 
  Users, 
  CheckCircle, 
  Circle,
  User,
  MessageCircle
} from 'lucide-react'
import { Student } from '@/lib/supabase'

interface ContactSelectorProps {
  students: Student[]
  selectedContacts: string[]
  onSelectionChange: (selectedIds: string[]) => void
  onSendMessage: (selectedIds: string[], message: string) => void
  loading?: boolean
}

const ContactSelector: React.FC<ContactSelectorProps> = ({
  students,
  selectedContacts,
  onSelectionChange,
  onSendMessage,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState('')
  const [showCustomMessage, setShowCustomMessage] = useState(false)

  // Filter students based on search
  const filteredStudents = students.filter(student => 
    student.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nama_ortu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nomor_hp_ortu.includes(searchTerm)
  )

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredStudents.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(filteredStudents.map(s => s.id))
    }
  }

  const handleSelectStudent = (studentId: string) => {
    const newSelection = selectedContacts.includes(studentId)
      ? selectedContacts.filter(id => id !== studentId)
      : [...selectedContacts, studentId]
      
    onSelectionChange(newSelection)
  }

  const handleSendMessage = () => {
    if (selectedContacts.length === 0) {
      alert('Pilih minimal 1 kontak')
      return
    }
    
    if (!message.trim()) {
      alert('Tulis pesan terlebih dahulu')
      return
    }

    onSendMessage(selectedContacts, message)
    setMessage('')
    setShowCustomMessage(false)
  }

  const selectedStudents = students.filter(s => selectedContacts.includes(s.id))

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-medium">{students.length} Kontak Total</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium">{selectedContacts.length} Dipilih</span>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
        >
          {selectedContacts.length === filteredStudents.length ? 'Batal Semua' : 'Pilih Semua'}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Cari nama siswa, orang tua, atau nomor HP..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Contact List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pilih Kontak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredStudents.map((student) => {
              const isSelected = selectedContacts.includes(student.id)
              
              return (
                <div
                  key={student.id}
                  onClick={() => handleSelectStudent(student.id)}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="mr-3">
                    {isSelected ? (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{student.nama}</span>
                      <span className="text-sm text-gray-500">#{student.nomor_absen}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{student.nama_ortu}</span>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{student.nomor_hp_ortu}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Tidak ada kontak yang ditemukan</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Contacts Summary */}
      {selectedContacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Kontak Terpilih ({selectedContacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {selectedStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-2 bg-blue-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{student.nama}</span>
                    <span className="text-sm text-gray-600 ml-2">({student.nama_ortu})</span>
                  </div>
                  <button
                    onClick={() => handleSelectStudent(student.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Message Input */}
            {!showCustomMessage ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="text-left justify-start"
                    onClick={() => {
                      setMessage(`📢 *PENGUMUMAN KELAS 1A*

Yth. Orang Tua Siswa

Dengan hormat, kami informasikan bahwa akan ada rapat orang tua pada:

📅 Hari: Sabtu, 10 Februari 2024
⏰ Waktu: 09.00 - 11.00 WIB
📍 Tempat: Ruang Kelas 1A

Mohon kehadiran Bapak/Ibu. Terima kasih 🙏`)
                      setShowCustomMessage(true)
                    }}
                  >
                    📢 Pengumuman Rapat
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="text-left justify-start"
                    onClick={() => {
                      setMessage(`⏰ *REMINDER PEMBAYARAN*

Yth. Orang Tua

Mengingatkan bahwa pembayaran kas kelas bulan ini belum kami terima.

💰 Nominal: Rp 25.000
📅 Mohon segera diselesaikan

Terima kasih 🙏`)
                      setShowCustomMessage(true)
                    }}
                  >
                    💰 Reminder Bayar
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="text-left justify-start"
                    onClick={() => {
                      setMessage('')
                      setShowCustomMessage(true)
                    }}
                  >
                    ✏️ Tulis Sendiri
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pesan WhatsApp
                  </label>
                  <textarea
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tulis pesan WhatsApp di sini..."
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomMessage(false)}
                  >
                    Kembali
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !message.trim()}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {loading ? 'Mengirim...' : `Kirim ke ${selectedContacts.length} Kontak`}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ContactSelector