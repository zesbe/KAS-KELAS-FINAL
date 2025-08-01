'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Send, Copy, Users, MessageCircle, CheckCircle } from 'lucide-react'
import { starSenderService, StarSenderMessage } from '@/lib/starsender-service'
import toast from 'react-hot-toast'

interface WhatsAppSenderProps {
  message: string
  recipients?: Array<{
    name: string
    phone: string
    studentName?: string
  }>
}

const WhatsAppSender: React.FC<WhatsAppSenderProps> = ({ message, recipients = [] }) => {
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [sending, setSending] = useState(false)

  const copyMessage = () => {
    navigator.clipboard.writeText(message)
    toast.success('Pesan berhasil disalin!')
  }

  const sendToWhatsApp = (phone: string) => {
    const formattedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phone}?text=${formattedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  const sendBulkWhatsApp = async () => {
    setSending(true)
    toast('Memulai pengiriman via StarSender API...', { icon: 'ℹ️' })
    
    try {
      // Prepare messages for StarSender API
      const messages: StarSenderMessage[] = selectedRecipients
        .map(recipientId => {
          const recipient = recipients.find(r => r.phone === recipientId)
          if (!recipient) return null
          
          return {
            to: recipient.phone,
            message: message
          }
        })
        .filter(Boolean) as StarSenderMessage[]

      // Send via StarSender API
      const result = await starSenderService.sendBulkMessages(messages, 2000)
      
      if (result.sent > 0) {
        toast.success(`✅ Berhasil mengirim ${result.sent} dari ${result.total} pesan`)
      }
      
      if (result.failed > 0) {
        toast.error(`❌ ${result.failed} pesan gagal dikirim`)
        
        // Show detailed error for failed messages
        const failedMessages = result.results.filter(r => !r.success)
        failedMessages.forEach(failed => {
          const recipient = recipients.find(r => r.phone === failed.phone)
          toast.error(`Gagal kirim ke ${recipient?.name || failed.phone}: ${failed.message}`)
        })
      }
      
      // Show individual success for small batches
      if (result.total <= 3) {
        result.results.forEach(r => {
          const recipient = recipients.find(rec => rec.phone === r.phone)
          if (r.success) {
            toast.success(`✅ ${recipient?.name}: Pesan terkirim`)
          }
        })
      }
    } catch (error) {
      console.error('Error sending bulk messages:', error)
      toast.error('Terjadi kesalahan saat mengirim pesan')
    } finally {
      setSending(false)
    }
  }

  const toggleRecipient = (phone: string) => {
    setSelectedRecipients(prev => 
      prev.includes(phone) 
        ? prev.filter(p => p !== phone)
        : [...prev, phone]
    )
  }

  const selectAll = () => {
    setSelectedRecipients(recipients.map(r => r.phone))
  }

  const clearAll = () => {
    setSelectedRecipients([])
  }

  return (
    <div className="space-y-4">
      {/* Message Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <MessageCircle className="w-5 h-5 mr-2" />
            Preview Pesan WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {message}
            </pre>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyMessage}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Pesan
            </Button>
            <Button 
              variant="outline" 
              onClick={() => sendToWhatsApp('6281234567890')}
            >
              <Send className="w-4 h-4 mr-2" />
              Test Kirim
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recipients Selection */}
      {recipients.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg">
                <Users className="w-5 h-5 mr-2" />
                Pilih Penerima ({selectedRecipients.length}/{recipients.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Pilih Semua
                </Button>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Hapus Semua
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {recipients.map((recipient) => (
                <div 
                  key={recipient.phone}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRecipients.includes(recipient.phone)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleRecipient(recipient.phone)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{recipient.name}</p>
                    {recipient.studentName && (
                      <p className="text-sm text-gray-600">Orang tua dari {recipient.studentName}</p>
                    )}
                    <p className="text-sm text-gray-500">{recipient.phone}</p>
                  </div>
                  {selectedRecipients.includes(recipient.phone) && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Actions */}
      {selectedRecipients.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Siap mengirim ke {selectedRecipients.length} kontak
                </p>
                <p className="text-sm text-gray-600">
                  Pesan akan dikirim via StarSender API
                </p>
              </div>
              <Button 
                onClick={sendBulkWhatsApp}
                disabled={sending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {sending ? 'Mengirim...' : 'Kirim WhatsApp'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Tips Penggunaan:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Pesan akan dikirim langsung via StarSender API</li>
          <li>• Pastikan nomor HP sudah dalam format internasional (628xxx)</li>
          <li>• Ada delay 2 detik antar pesan untuk menghindari rate limiting</li>
          <li>• Status pengiriman akan ditampilkan secara real-time</li>
          <li>• Copy pesan jika ingin mengirim manual</li>
        </ul>
      </div>
    </div>
  )
}

export default WhatsAppSender