'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { sendBulkWhatsAppMessages, messageUtils } from '@/lib/starsender'
import { generatePaymentUrl, generateOrderId } from '@/lib/pakasir'
import { Student } from '@/lib/supabase'
import { studentService } from '@/lib/student-service'
import toast from 'react-hot-toast'
import { 
  CreditCard, 
  Receipt, 
  MessageCircle, 
  Users, 
  FileText, 
  Plus,
  Send,
  Download
} from 'lucide-react'

interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<any>
  href: string
  color: string
  bgColor: string
}

const quickActions: QuickAction[] = [
  {
    title: 'Buat Tagihan',
    description: 'Buat tagihan bulanan untuk semua siswa',
    icon: CreditCard,
    href: '/dashboard/payments/create',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 hover:bg-blue-200'
  },
  {
    title: 'Tambah Siswa',
    description: 'Daftarkan siswa baru ke kelas',
    icon: Users,
    href: '/dashboard/students/create',
    color: 'text-green-600',
    bgColor: 'bg-green-100 hover:bg-green-200'
  },
  {
    title: 'Input Pengeluaran',
    description: 'Catat pengeluaran kas kelas',
    icon: Receipt,
    href: '/dashboard/expenses/create',
    color: 'text-red-600',
    bgColor: 'bg-red-100 hover:bg-red-200'
  },
  {
    title: 'Kirim WhatsApp',
    description: 'Kirim pengumuman ke orang tua',
    icon: MessageCircle,
    href: '/dashboard/whatsapp/broadcast',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 hover:bg-purple-200'
  },
  {
    title: 'Buat Laporan',
    description: 'Generate laporan keuangan',
    icon: FileText,
    href: '/dashboard/reports/generate',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 hover:bg-orange-200'
  },
  {
    title: 'Export Data',
    description: 'Download data dalam format Excel',
    icon: Download,
    href: '/dashboard/export',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 hover:bg-indigo-200'
  }
]

const QuickActions: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const router = useRouter()

  // Load students data on component mount
  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      const { data, error } = await studentService.getAllStudents(true) // Only active students
      if (!error && data) {
        setStudents(data)
      }
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  // Function to send monthly payment reminders
  const handleSendMonthlyPayments = async () => {
    setIsLoading(true)
    toast.loading('Mengirim tagihan bulanan...')
    
    try {
      const recipients = students.map(student => {
        const orderId = generateOrderId()
        const paymentLink = generatePaymentUrl(25000, orderId)
        const message = messageUtils.createBillingMessage(
          student.nama,
          'Februari 2024',
          25000,
          '2024-02-28',
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
      
      toast.dismiss()
      toast.success(`Tagihan bulanan berhasil dikirim ke ${successCount} orang tua`)
      
      // Navigate to WhatsApp page to see results
      router.push('/dashboard/whatsapp')
    } catch (error) {
      toast.dismiss()
      toast.error('Gagal mengirim tagihan bulanan')
    } finally {
      setIsLoading(false)
    }
  }

  // Function to send payment reminders
  const handleSendReminders = async () => {
    setIsLoading(true)
    toast.loading('Mengirim reminder pembayaran...')
    
    try {
      // Filter only students with pending payments (sample: first 3)
      const studentsWithPendingPayments = students.slice(0, 3)
      
      const recipients = studentsWithPendingPayments.map(student => {
        const orderId = generateOrderId()
        const paymentLink = generatePaymentUrl(25000, orderId)
        const message = `⏰ *REMINDER PEMBAYARAN*\n\nYth. Orang Tua *${student.nama}*\n\n💳 Tagihan kas kelas bulan Januari masih belum terbayar\n💰 Nominal: Rp 25.000\n📅 Mohon segera diselesaikan\n\n🔗 Bayar sekarang: ${paymentLink}\n\nTerima kasih 🙏`
        
        return {
          phone: student.nomor_hp_ortu,
          message,
          studentId: student.id
        }
      })

      const results = await sendBulkWhatsAppMessages(recipients)
      const successCount = results.filter(r => r.success).length
      
      toast.dismiss()
      toast.success(`Reminder berhasil dikirim ke ${successCount} orang tua`)
      
      router.push('/dashboard/whatsapp')
    } catch (error) {
      toast.dismiss()
      toast.error('Gagal mengirim reminder')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aksi Cepat</CardTitle>
        <p className="text-sm text-gray-600">
          Akses fitur utama dengan sekali klik
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            
            return (
              <Link key={index} href={action.href}>
                <div className="group p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${action.bgColor} transition-colors`}>
                      <Icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Additional quick buttons */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="primary" 
              className="flex-1"
              onClick={handleSendMonthlyPayments}
              disabled={isLoading}
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? 'Mengirim...' : 'Kirim Tagihan Bulanan'}
            </Button>
            
            <Button 
              variant="warning" 
              className="flex-1"
              onClick={handleSendReminders}
              disabled={isLoading}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {isLoading ? 'Mengirim...' : 'Kirim Reminder'}
            </Button>
            
            <Link href="/dashboard/reports" className="flex-1">
              <Button variant="success" className="w-full" disabled={isLoading}>
                <FileText className="w-4 h-4 mr-2" />
                Laporan Bulan Ini
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default QuickActions