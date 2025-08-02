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

export interface StarSenderCampaign {
  id?: number
  device_api_key: string
  name: string
  syntax: string
  welcome_message: string
  number: string
}

class StarSenderService {
  private baseUrl = 'https://api.starsender.online/api'
  
  // Get API keys from settings
  async getApiKeys(): Promise<{ accountKey: string; deviceKey: string }> {
    const { data: settings } = await settingsService.getSettingsAsObject([
      'starsender_account_key',
      'starsender_device_key'
    ])
    
    return {
      accountKey: settings?.starsender_account_key || '', // Account API key for campaigns
      deviceKey: settings?.starsender_device_key || '' // Device API key for sending messages
    }
  }

  // Format phone number untuk StarSender (format: 628xxx tanpa @s.whatsapp.net)
  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1)
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned
    }
    
    return cleaned
  }

  // Send single WhatsApp message using the correct API format
  async sendMessage(phone: string, message: string, delay?: number): Promise<StarSenderResponse> {
    try {
      const { deviceKey } = await this.getApiKeys()
      
      if (!deviceKey) {
        return {
          success: false,
          message: 'Device API key tidak ditemukan. Silakan atur di pengaturan.',
          error: 'Missing device API key'
        }
      }

      const formattedPhone = this.formatPhoneNumber(phone)

      console.log('Sending WhatsApp message:', { 
        phone: formattedPhone, 
        message: message.substring(0, 50) + '...',
        delay 
      })

      const payload = {
        messageType: 'text',
        to: formattedPhone,
        body: message,
        delay: delay || 0
      }

      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Authorization': deviceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      // StarSender success response check
      if (data.success === true) {
        console.log('Message sent successfully:', { phone: formattedPhone, response: data })
        return {
          success: true,
          message: data.message || 'Pesan berhasil dikirim',
          data: data.data
        }
      } else {
        console.error('StarSender API error:', data)
        return {
          success: false,
          message: data.message || data.error || 'Gagal mengirim pesan',
          error: data.error
        }
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

  // Send media message
  async sendMediaMessage(
    phone: string, 
    message: string, 
    fileUrl: string, 
    delay?: number
  ): Promise<StarSenderResponse> {
    try {
      const { deviceKey } = await this.getApiKeys()
      
      if (!deviceKey) {
        return {
          success: false,
          message: 'Device API key tidak ditemukan',
          error: 'Missing device API key'
        }
      }

      const formattedPhone = this.formatPhoneNumber(phone)

      const payload = {
        messageType: 'media',
        to: formattedPhone,
        body: message,
        file: fileUrl,
        delay: delay || 0
      }

      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Authorization': deviceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success === true) {
        return {
          success: true,
          message: data.message || 'Media berhasil dikirim',
          data: data.data
        }
      } else {
        return {
          success: false,
          message: data.message || 'Gagal mengirim media',
          error: data.error
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Terjadi kesalahan saat mengirim media',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Create campaign
  async createCampaign(campaign: StarSenderCampaign): Promise<StarSenderResponse> {
    try {
      const { accountKey } = await this.getApiKeys()
      
      if (!accountKey) {
        return {
          success: false,
          message: 'Account API key tidak ditemukan',
          error: 'Missing account API key'
        }
      }

      const response = await fetch(`${this.baseUrl}/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': accountKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaign)
      })

      const data = await response.json()

      if (data.success === true) {
        return {
          success: true,
          message: data.message || 'Campaign berhasil dibuat',
          data: data.data
        }
      } else {
        return {
          success: false,
          message: data.message || 'Gagal membuat campaign',
          error: data.error
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Terjadi kesalahan saat membuat campaign',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Add campaign member
  async addCampaignMember(
    campaignId: number,
    number: string,
    syntax: string,
    welcomeMessage: boolean = true
  ): Promise<StarSenderResponse> {
    try {
      const { accountKey } = await this.getApiKeys()
      
      if (!accountKey) {
        return {
          success: false,
          message: 'Account API key tidak ditemukan',
          error: 'Missing account API key'
        }
      }

      const formattedPhone = this.formatPhoneNumber(number)

      const payload = {
        campaign_id: campaignId,
        number: formattedPhone,
        syntax: syntax,
        welcome_message: welcomeMessage
      }

      const response = await fetch(`${this.baseUrl}/campaigns/users`, {
        method: 'POST',
        headers: {
          'Authorization': accountKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success === true) {
        return {
          success: true,
          message: data.message || 'Anggota campaign berhasil ditambahkan',
          data: data.data
        }
      } else {
        return {
          success: false,
          message: data.message || 'Gagal menambahkan anggota campaign',
          error: data.error
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Terjadi kesalahan saat menambahkan anggota campaign',
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
        // Calculate delay for each message (in seconds for API)
        const delaySeconds = Math.floor((i * delayMs) / 1000)
        const result = await this.sendMessage(to, message, delaySeconds)
        
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
      const { deviceKey } = await this.getApiKeys()
      
      if (!deviceKey) {
        return {
          success: false,
          message: 'Device API key tidak ditemukan. Silakan atur di pengaturan.',
          error: 'Missing device API key'
        }
      }
      
      // Test dengan payload minimal
      const payload = {
        messageType: 'text',
        to: '628123456789', // Dummy number for testing
        body: 'Test connection',
        delay: 0
      }
      
      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Authorization': deviceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      // Check response for API key validation
      if (response.status === 401 || (data.message && data.message.toLowerCase().includes('unauthorized'))) {
        return {
          success: false,
          message: 'Device API Key tidak valid',
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