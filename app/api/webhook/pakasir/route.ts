import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendWhatsAppMessage } from '@/lib/starsender'
import { currencyUtils } from '@/lib/utils'

// Webhook payload dari Pakasir
interface PakasirWebhookPayload {
  amount: number
  order_id: string
  project: string
  status: 'completed' | 'failed' | 'pending'
  payment_method: string
  completed_at: string
}

// Verify webhook dari Pakasir
async function verifyPakasirWebhook(payload: PakasirWebhookPayload): Promise<boolean> {
  try {
    // Verify dengan API Pakasir
    const apiKey = process.env.PAKASIR_API_KEY || 'u8e0CphRmRVuNwDyqnfNoeOwHa6UBpLg'
    const slug = process.env.PAKASIR_SLUG || 'uangkasalhusna'
    
    const verifyUrl = `https://pakasir.zone.id/api/transactiondetail?project=${slug}&amount=${payload.amount}&order_id=${payload.order_id}&api_key=${apiKey}`
    
    const response = await fetch(verifyUrl)
    if (!response.ok) {
      console.error('Failed to verify Pakasir webhook:', response.status)
      return false
    }
    
    const data = await response.json()
    
    // Verify transaction details match
    return data.transaction && 
           data.transaction.amount === payload.amount &&
           data.transaction.order_id === payload.order_id &&
           data.transaction.status === payload.status
  } catch (error) {
    console.error('Error verifying Pakasir webhook:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: PakasirWebhookPayload = await request.json()
    
    console.log('Received Pakasir webhook:', payload)
    
    // Verify webhook authenticity
    const isValid = await verifyPakasirWebhook(payload)
    if (!isValid) {
      console.error('Invalid webhook payload')
      return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
    }
    
    // Only process completed payments
    if (payload.status !== 'completed') {
      return NextResponse.json({ message: 'Payment not completed' }, { status: 200 })
    }
    
    // Find payment by order_id
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        student:students(
          nama,
          nomor_hp_ortu
        ),
        category:payment_categories(name)
      `)
      .eq('id', payload.order_id)
      .single()
    
    if (paymentError || !payment) {
      console.error('Payment not found:', payload.order_id)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    
    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        payment_method: payload.payment_method,
        completed_at: payload.completed_at,
        updated_at: new Date().toISOString()
      })
      .eq('id', payload.order_id)
    
    if (updateError) {
      console.error('Failed to update payment:', updateError)
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
    }
    
    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: payment.student_id,
      action: 'payment_completed',
      entity_type: 'payment',
      entity_id: payment.id,
      details: {
        amount: payload.amount,
        payment_method: payload.payment_method,
        completed_at: payload.completed_at
      }
    })
    
    // Send WhatsApp confirmation to parent
    if (payment.student?.nomor_hp_ortu) {
      const confirmMessage = `✅ *PEMBAYARAN BERHASIL*

Terima kasih Orang Tua *${payment.student.nama}*!

💰 Jumlah: ${currencyUtils.format(payload.amount)}
📋 Tagihan: ${payment.category?.name || 'Kas Kelas'}
💳 Via: ${payload.payment_method.toUpperCase()}
📅 Tanggal: ${new Date(payload.completed_at).toLocaleDateString('id-ID')}
🆔 ID: ${payload.order_id}

📊 Cek status kas: https://kas-kelas-final.vercel.app
Terima kasih atas pembayaran tepat waktu 🙏`

      try {
        await sendWhatsAppMessage(payment.student.nomor_hp_ortu, confirmMessage)
        console.log('WhatsApp confirmation sent to:', payment.student.nomor_hp_ortu)
      } catch (whatsappError) {
        console.error('Failed to send WhatsApp confirmation:', whatsappError)
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Payment processed successfully',
      order_id: payload.order_id
    })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}