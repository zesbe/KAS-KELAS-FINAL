// StarSender WhatsApp Gateway Integration
// Configuration from environment variables

export const STARSENDER_CONFIG = {
  apiUrl: 'https://starsender.online/api/sendText',
  apiKey: process.env.STARSENDER_API_KEY || '2d8714c0ceb932baf18b44285cb540b294a64871'
}

// WhatsApp message templates
export interface MessageTemplateData {
  nama_siswa: string
  bulan_tahun: string
  nominal: number
  amount: number
  jatuh_tempo: string
  order_id: string
  payment_method?: string
  completed_at?: string
  hari_telat?: number
  payment_link?: string
}

// Template pesan tagihan bulanan dengan payment link
export const tagihanTemplate = (data: MessageTemplateData): string => {
  return `🏫 *KAS KELAS 1A - SD INDONESIA*

Yth. Orang Tua *${data.nama_siswa}*

📋 Tagihan Bulan: ${data.bulan_tahun}
💰 Nominal: Rp ${data.nominal.toLocaleString('id-ID')}
📅 Jatuh Tempo: ${data.jatuh_tempo}

🔗 *BAYAR SEKARANG (KLIK LINK)*
${data.payment_link}

✅ *Metode Pembayaran:*
🏦 Transfer Bank | 💳 E-Wallet | 📱 QRIS

⚡ *Otomatis terkonfirmasi setelah bayar*

📊 Cek status: https://berbagiakun.com
Terima kasih 🙏`
}

// Template reminder terlambat
export const reminderTemplate = (data: MessageTemplateData): string => {
  return `⏰ *REMINDER PEMBAYARAN*

Yth. Orang Tua *${data.nama_siswa}*

💳 Tagihan: Rp ${data.nominal.toLocaleString('id-ID')}
📅 Telat: ${data.hari_telat} hari
🔗 Bayar: ${data.payment_link}

Mohon segera diselesaikan 🙏`
}

// Template konfirmasi pembayaran berhasil
export const confirmTemplate = (data: MessageTemplateData): string => {
  return `✅ *PEMBAYARAN BERHASIL*

Terima kasih *${data.nama_siswa}*!

💰 Jumlah: Rp ${data.amount.toLocaleString('id-ID')}
📅 Tanggal: ${data.completed_at}
💳 Via: ${data.payment_method?.toUpperCase()}
🆔 ID: ${data.order_id}

📊 Status kas: https://berbagiakun.com
Terima kasih 🙏`
}

// Template broadcast pengumuman
export const broadcastTemplate = (title: string, message: string): string => {
  return `🏫 *KAS KELAS 1A - SD INDONESIA*

📢 *${title.toUpperCase()}*

${message}

📊 Info lengkap: https://berbagiakun.com
Terima kasih 🙏`
}

// Template laporan bulanan
export const monthlyReportTemplate = (
  bulan: string,
  totalPemasukan: number,
  totalPengeluaran: number,
  saldoAkhir: number
): string => {
  return `📊 *LAPORAN KAS BULAN ${bulan.toUpperCase()}*

💰 *Ringkasan Keuangan:*
📈 Pemasukan: Rp ${totalPemasukan.toLocaleString('id-ID')}
📉 Pengeluaran: Rp ${totalPengeluaran.toLocaleString('id-ID')}
💼 Saldo Akhir: Rp ${saldoAkhir.toLocaleString('id-ID')}

📄 Laporan lengkap: https://berbagiakun.com/laporan

Terima kasih atas kepercayaan Anda 🙏`
}

// Format phone number for StarSender API (requires @s.whatsapp.net suffix)
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '')
  
  // Handle Indonesian phone numbers
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1)
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned
  }
  
  return cleaned + '@s.whatsapp.net'
}

// Send WhatsApp message via StarSender API
export const sendWhatsAppMessage = async (
  phoneNumber: string,
  message: string
): Promise<any> => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber)
    
    const url = `${STARSENDER_CONFIG.apiUrl}?message=${encodeURIComponent(message)}&tujuan=${encodeURIComponent(formattedPhone)}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': STARSENDER_CONFIG.apiKey,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // StarSender success response check
    if (data.status === true || data.success === true) {
      return {
        success: true,
        data,
        message: 'Message sent successfully'
      }
    } else {
      return {
        success: false,
        data,
        message: data.message || data.error || 'Failed to send message'
      }
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to send WhatsApp message'
    }
  }
}

// Send bulk WhatsApp messages
export const sendBulkWhatsAppMessages = async (
  recipients: Array<{ phone: string; message: string; studentId?: string }>
): Promise<Array<{ phone: string; success: boolean; response?: any; error?: string }>> => {
  const results = []
  
  // Send messages with delay to avoid rate limiting
  for (const recipient of recipients) {
    try {
      const result = await sendWhatsAppMessage(recipient.phone, recipient.message)
      results.push({
        phone: recipient.phone,
        success: result.success,
        response: result.data,
        error: result.success ? undefined : result.message
      })
      
      // Add delay between messages (1 second)
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      results.push({
        phone: recipient.phone,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  return results
}

// Send payment reminder based on due date status
export const sendPaymentReminder = async (
  phoneNumber: string,
  studentName: string,
  amount: number,
  dueDate: string,
  paymentLink: string,
  reminderType: 'before_due' | 'on_due' | 'after_due_3' | 'after_due_7'
) => {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  let message = ''
  
  switch (reminderType) {
    case 'before_due':
      message = `⏰ *REMINDER PEMBAYARAN*

Yth. Orang Tua *${studentName}*

📋 Tagihan kas kelas akan jatuh tempo dalam ${Math.abs(diffDays)} hari
💰 Nominal: Rp ${amount.toLocaleString('id-ID')}
📅 Jatuh Tempo: ${new Date(dueDate).toLocaleDateString('id-ID')}

🔗 Bayar sekarang: ${paymentLink}

Terima kasih 🙏`
      break
      
    case 'on_due':
      message = `🔔 *HARI TERAKHIR PEMBAYARAN*

Yth. Orang Tua *${studentName}*

📋 Tagihan kas kelas jatuh tempo HARI INI
💰 Nominal: Rp ${amount.toLocaleString('id-ID')}

🔗 Bayar sekarang: ${paymentLink}

Hindari denda dengan bayar hari ini 🙏`
      break
      
    case 'after_due_3':
      message = `⚠️ *PEMBAYARAN TERLAMBAT*

Yth. Orang Tua *${studentName}*

📋 Tagihan telah terlambat 3 hari
💰 Nominal: Rp ${amount.toLocaleString('id-ID')}
💸 Denda keterlambatan mungkin berlaku

🔗 Bayar sekarang: ${paymentLink}

Mohon segera diselesaikan 🙏`
      break
      
    case 'after_due_7':
      message = `🚨 *PEMBAYARAN SANGAT TERLAMBAT*

Yth. Orang Tua *${studentName}*

📋 Tagihan telah terlambat 7 hari
💰 Nominal: Rp ${amount.toLocaleString('id-ID')}
💸 Denda keterlambatan berlaku

🔗 Bayar sekarang: ${paymentLink}

Harap segera menghubungi bendahara kelas 📞`
      break
  }
  
  return await sendWhatsAppMessage(phoneNumber, message)
}

// WhatsApp message types for logging
export const MESSAGE_TYPES = {
  TAGIHAN: 'tagihan',
  REMINDER: 'reminder',
  KONFIRMASI: 'konfirmasi',
  BROADCAST: 'broadcast',
  LAPORAN: 'laporan'
} as const

// Message status for tracking
export const MESSAGE_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed'
} as const

// Utility functions for message management
export const messageUtils = {
  // Create message for monthly billing
  createBillingMessage: (studentName: string, month: string, amount: number, dueDate: string, paymentLink: string) => {
    return tagihanTemplate({
      nama_siswa: studentName,
      bulan_tahun: month,
      nominal: amount,
      amount,
      jatuh_tempo: new Date(dueDate).toLocaleDateString('id-ID'),
      order_id: '',
      payment_link: paymentLink
    })
  },
  
  // Create confirmation message
  createConfirmationMessage: (studentName: string, amount: number, orderId: string, paymentMethod: string) => {
    return confirmTemplate({
      nama_siswa: studentName,
      bulan_tahun: '',
      nominal: amount,
      amount,
      jatuh_tempo: '',
      order_id: orderId,
      payment_method: paymentMethod,
      completed_at: new Date().toLocaleDateString('id-ID')
    })
  },
  
  // Create broadcast announcement
  createBroadcastMessage: (title: string, content: string) => {
    return broadcastTemplate(title, content)
  },
  
  // Validate phone number format
  isValidPhoneNumber: (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length >= 10 && cleaned.length <= 15
  },
  
  // Get message preview (first 100 characters)
  getMessagePreview: (message: string): string => {
    return message.length > 100 ? message.substring(0, 100) + '...' : message
  }
}

// Export all configurations and utilities
const starsenderUtils = {
  config: STARSENDER_CONFIG,
  templates: {
    tagihan: tagihanTemplate,
    reminder: reminderTemplate,
    confirm: confirmTemplate,
    broadcast: broadcastTemplate,
    monthlyReport: monthlyReportTemplate
  },
  formatPhoneNumber,
  sendWhatsAppMessage,
  sendBulkWhatsAppMessages,
  sendPaymentReminder,
  MESSAGE_TYPES,
  MESSAGE_STATUS,
  utils: messageUtils
}

export default starsenderUtils