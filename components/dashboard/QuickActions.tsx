'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Student } from '@/lib/supabase'
import { studentService } from '@/lib/student-service'
import { starSenderService } from '@/lib/starsender-service'
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
    title: 'WhatsApp & Tagihan',
    description: 'Kirim tagihan atau broadcast pesan',
    icon: MessageCircle,
    href: '/dashboard/whatsapp-tagihan',
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

  // Function to send monthly payment reminders via StarSender API
  const handleSendMonthlyPayments = async () => {
    if (students.length === 0) {
      toast.error('Tidak ada data siswa')
      return
    }

    setIsLoading(true)
    toast('Memulai pengiriman tagihan bulanan via StarSender...', { icon: 'ℹ️' })
    
    try {
      const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 7) // 7 days from now
      
      let successCount = 0
      let failedCount = 0
      
      for (const student of students) {
        try {
          const result = await starSenderService.sendPaymentReminder(
            student.nama,
            student.nama_ortu,
            student.nomor_hp_ortu,
            25000,
            dueDate.toLocaleDateString('id-ID')
          )
          
          if (result.success) {
            successCount++
            console.log(`✅ Tagihan terkirim ke ${student.nama}`)
          } else {
            failedCount++
            console.log(`❌ Gagal kirim ke ${student.nama}: ${result.message}`)
          }
          
          // Delay between messages
          await new Promise(resolve => setTimeout(resolve, 2000))
        } catch (error) {
          failedCount++
          console.error(`Error sending to ${student.nama}:`, error)
        }
      }
      
      if (successCount > 0) {
        toast.success(`✅ Berhasil mengirim ${successCount} tagihan bulanan`)
      }
      if (failedCount > 0) {
        toast.error(`❌ ${failedCount} tagihan gagal dikirim`)
      }
      
      // Navigate to WhatsApp & Tagihan page
      setTimeout(() => {
        router.push('/dashboard/whatsapp-tagihan')
      }, 1000)
    } catch (error) {
      console.error('Error sending monthly payments:', error)
      toast.error('Gagal mengirim tagihan bulanan')
    } finally {
      setIsLoading(false)
    }
  }

  // Function to send payment reminders via StarSender API
  const handleSendReminders = async () => {
    if (students.length === 0) {
      toast.error('Tidak ada data siswa')
      return
    }

    setIsLoading(true)
    toast('Mengirim reminder pembayaran via StarSender...', { icon: 'ℹ️' })
    
    try {
      // Filter students for reminder (sample: first 5 for demo)
      const studentsForReminder = students.slice(0, Math.min(5, students.length))
      
      let successCount = 0
      let failedCount = 0
      
      for (const student of studentsForReminder) {
        try {
          const result = await starSenderService.sendOverdueNotice(
            student.nama,
            student.nama_ortu,
            student.nomor_hp_ortu,
            25000,
            5 // 5 days overdue
          )
          
          if (result.success) {
            successCount++
            console.log(`✅ Reminder terkirim ke ${student.nama}`)
          } else {
            failedCount++
            console.log(`❌ Gagal kirim reminder ke ${student.nama}: ${result.message}`)
          }
          
          // Delay between messages
          await new Promise(resolve => setTimeout(resolve, 2000))
        } catch (error) {
          failedCount++
          console.error(`Error sending reminder to ${student.nama}:`, error)
        }
      }
      
      if (successCount > 0) {
        toast.success(`✅ Berhasil mengirim ${successCount} reminder`)
      }
      if (failedCount > 0) {
        toast.error(`❌ ${failedCount} reminder gagal dikirim`)
      }
      
      setTimeout(() => {
        router.push('/dashboard/whatsapp-tagihan')
      }, 1000)
    } catch (error) {
      console.error('Error sending reminders:', error)
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