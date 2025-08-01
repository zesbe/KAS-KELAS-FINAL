'use client'

// StarSender WhatsApp API Service
import { settingsService } from './settings-service'

export interface StarSenderMessage {
  to: string
  message: string
}

export interface StarSenderResponse {
  success: boolean
  message: string
  data?: any
  error?: string
}

export interface BulkMessageResult {
  total: number
  sent: number
  failed: number
  results: Array<{
    phone: string
    success: boolean
    message: string
  }>
}

class StarSenderService {
  private baseUrl = 'https://starsender.online/api'
  
  // Get API key from settings
  private async getApiKey(): Promise<string> {
    const settings = await settingsService.getWhatsAppSettings()
    return settings.apiKey || '2d8714c0ceb932baf18b44285cb540b294a64871'
  }

  // Format phone number untuk StarSender (harus format 628xxx)
  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1)
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned
    }
    
    return cleaned
  }

  // Send single WhatsApp message
  async sendMessage(phone: string, message: string): Promise<StarSenderResponse> {
    try {
      const apiKey = await this.getApiKey()
      const formattedPhone = this.formatPhoneNumber(phone)

      console.log('Sending WhatsApp message:', { phone: formattedPhone, message: message.substring(0, 50) + '...' })

      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: message,
          type: 'text'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('StarSender API error:', data)
        return {
          success: false,
          message: data.message || 'Gagal mengirim pesan',
          error: data.error
        }
      }

      console.log('Message sent successfully:', { phone: formattedPhone, response: data })

      return {
        success: true,
        message: 'Pesan berhasil dikirim',
        data
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      return {
        success: false,
        message: 'Terjadi kesalahan saat mengirim pesan',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Send bulk WhatsApp messages with delay
  async sendBulkMessages(
    messages: StarSenderMessage[], 
    delayMs: number = 2000
  ): Promise<BulkMessageResult> {
    const results: BulkMessageResult = {
      total: messages.length,
      sent: 0,
      failed: 0,
      results: []
    }

    console.log(`Starting bulk WhatsApp send: ${messages.length} messages with ${delayMs}ms delay`)

    for (let i = 0; i < messages.length; i++) {
      const { to, message } = messages[i]
      
      try {
        const result = await this.sendMessage(to, message)
        
        results.results.push({
          phone: to,
          success: result.success,
          message: result.message
        })

        if (result.success) {
          results.sent++
          console.log(`✅ Message ${i + 1}/${messages.length} sent to ${to}`)
        } else {
          results.failed++
          console.log(`❌ Message ${i + 1}/${messages.length} failed to ${to}: ${result.message}`)
        }

        // Add delay between messages to avoid rate limiting
        if (i < messages.length - 1) {
          console.log(`Waiting ${delayMs}ms before next message...`)
          await new Promise(resolve => setTimeout(resolve, delayMs))
        }
      } catch (error) {
        console.error(`Error sending message ${i + 1} to ${to}:`, error)
        results.failed++
        results.results.push({
          phone: to,
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    console.log('Bulk send completed:', results)
    return results
  }

  // Send payment reminder
  async sendPaymentReminder(
    studentName: string,
    parentName: string,
    parentPhone: string,
    amount: number,
    dueDate: string
  ): Promise<StarSenderResponse> {
    const message = `🔔 *PENGINGAT KAS KELAS*

Assalamu'alaikum Bapak/Ibu ${parentName} 🙏

Kami ingatkan bahwa iuran kas kelas atas nama *${studentName}* akan jatuh tempo pada ${dueDate}.

💰 *Rincian:*
• Jumlah: *Rp ${amount.toLocaleString('id-ID')}*
• Jatuh Tempo: ${dueDate}

🏦 *Cara Bayar:*
• Transfer: 1234567890 (BCA - Ibu Sari)
• Tunai: Serahkan ke bendahara

Mohon konfirmasi setelah pembayaran ya Bapak/Ibu 📸

Terima kasih 🙏
*Bendahara Kelas 1A*`

    return this.sendMessage(parentPhone, message)
  }

  // Send payment confirmation
  async sendPaymentConfirmation(
    studentName: string,
    parentName: string,
    parentPhone: string,
    amount: number,
    paymentDate: string
  ): Promise<StarSenderResponse> {
    const message = `✅ *KONFIRMASI PEMBAYARAN*

Assalamu'alaikum Bapak/Ibu ${parentName} 🙏

Terima kasih! Pembayaran kas kelas atas nama *${studentName}* telah kami terima.

💰 *Detail Pembayaran:*
• Jumlah: *Rp ${amount.toLocaleString('id-ID')}*
• Tanggal: ${paymentDate}
• Status: *LUNAS* ✅

Bukti pembayaran akan dicatat dalam laporan keuangan kelas.

Terima kasih atas kerjasamanya 🙏
*Bendahara Kelas 1A*`

    return this.sendMessage(parentPhone, message)
  }

  // Send overdue notice
  async sendOverdueNotice(
    studentName: string,
    parentName: string,
    parentPhone: string,
    amount: number,
    daysOverdue: number
  ): Promise<StarSenderResponse> {
    const message = `⚠️ *TAGIHAN TERLAMBAT*

Assalamu'alaikum Bapak/Ibu ${parentName} 🙏

Iuran kas kelas atas nama *${studentName}* sudah terlambat ${daysOverdue} hari.

💰 *Jumlah:* Rp ${amount.toLocaleString('id-ID')}
📅 *Status:* TERLAMBAT ${daysOverdue} HARI

Mohon segera melakukan pembayaran ya Bapak/Ibu 🙏
Jika ada kendala, silakan hubungi kami.

*Bendahara Kelas 1A*`

    return this.sendMessage(parentPhone, message)
  }

  // Send class activity info
  async sendActivityInfo(
    parentName: string,
    parentPhone: string,
    activityTitle: string,
    activityDate: string,
    activityTime: string,
    activityLocation: string
  ): Promise<StarSenderResponse> {
    const message = `📢 *INFO KEGIATAN KELAS*

Assalamu'alaikum Bapak/Ibu ${parentName} 🙏

${activityTitle}

📅 Tanggal: ${activityDate}
🕐 Waktu: ${activityTime}
📍 Tempat: ${activityLocation}

Mohon doa dan dukungannya 🙏

*Bendahara Kelas 1A*`

    return this.sendMessage(parentPhone, message)
  }

  // Test API connection
  async testConnection(): Promise<StarSenderResponse> {
    try {
      const apiKey = await this.getApiKey()
      
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: 'Koneksi StarSender gagal',
          error: data.message
        }
      }

      return {
        success: true,
        message: 'Koneksi StarSender berhasil',
        data
      }
    } catch (error) {
      return {
        success: false,
        message: 'Gagal menghubungi StarSender API',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const starSenderService = new StarSenderService()
export default starSenderService