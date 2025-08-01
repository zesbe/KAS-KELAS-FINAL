'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CreatePaymentForm from '@/components/payments/CreatePaymentForm'
import { Student, PaymentCategory } from '@/lib/supabase'
import { createBulkPayments } from '@/lib/pakasir'
import toast from 'react-hot-toast'
import { CreditCard, Users, MessageCircle } from 'lucide-react'

interface CreatePaymentData {
  category_id: string
  amount: number
  due_date: string
  selected_students: string[]
  send_whatsapp: boolean
  notes?: string
}

// Sample data - in real app, this would come from Supabase
const sampleStudents: Student[] = [
  {
    id: '1',
    nama: 'Ahmad Rizki Pratama',
    nomor_absen: 1,
    nomor_hp_ortu: '628123456789',
    nama_ortu: 'Budi Santoso',
    email_ortu: 'budi.santoso@email.com',
    is_active: true,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z'
  },
  {
    id: '2',
    nama: 'Siti Nurhaliza',
    nomor_absen: 2,
    nomor_hp_ortu: '628234567890',
    nama_ortu: 'Sari Dewi',
    email_ortu: 'sari.dewi@email.com',
    is_active: true,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z'
  },
  {
    id: '3',
    nama: 'Muhammad Fajar',
    nomor_absen: 3,
    nomor_hp_ortu: '628345678901',
    nama_ortu: 'Andi Wijaya',
    email_ortu: 'andi.wijaya@email.com',
    is_active: true,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z'
  },
  {
    id: '4',
    nama: 'Aisyah Putri',
    nomor_absen: 4,
    nomor_hp_ortu: '628456789012',
    nama_ortu: 'Indah Permata',
    email_ortu: 'indah.permata@email.com',
    is_active: true,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z'
  },
  {
    id: '5',
    nama: 'Rizky Ramadhan',
    nomor_absen: 5,
    nomor_hp_ortu: '628567890123',
    nama_ortu: 'Agus Setiawan',
    email_ortu: 'agus.setiawan@email.com',
    is_active: true,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z'
  },
  {
    id: '6',
    nama: 'Fatimah Zahra',
    nomor_absen: 6,
    nomor_hp_ortu: '628678901234',
    nama_ortu: 'Rina Marlina',
    email_ortu: 'rina.marlina@email.com',
    is_active: true,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z'
  },
  {
    id: '7',
    nama: 'Bayu Aji',
    nomor_absen: 7,
    nomor_hp_ortu: '628789012345',
    nama_ortu: 'Dedi Kurniawan',
    email_ortu: 'dedi.kurniawan@email.com',
    is_active: true,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z'
  },
  {
    id: '8',
    nama: 'Nabila Azzahra',
    nomor_absen: 8,
    nomor_hp_ortu: '628890123456',
    nama_ortu: 'Maya Sari',
    email_ortu: 'maya.sari@email.com',
    is_active: true,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z'
  },
  {
    id: '9',
    nama: 'Arief Budiman',
    nomor_absen: 9,
    nomor_hp_ortu: '628901234567',
    nama_ortu: 'Hendra Pratama',
    email_ortu: 'hendra.pratama@email.com',
    is_active: true,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z'
  },
  {
    id: '10',
    nama: 'Zahra Aulia',
    nomor_absen: 10,
    nomor_hp_ortu: '628012345678',
    nama_ortu: 'Dewi Lestari',
    email_ortu: 'dewi.lestari@email.com',
    is_active: true,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z'
  }
]

const sampleCategories: PaymentCategory[] = [
  {
    id: '1',
    name: 'Kas Bulanan',
    description: 'Iuran kas bulanan siswa',
    default_amount: 25000,
    is_active: true,
    created_at: '2024-01-15T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'Kas Tambahan',
    description: 'Iuran tambahan untuk kegiatan khusus',
    default_amount: 50000,
    is_active: true,
    created_at: '2024-01-15T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'Kas Kegiatan',
    description: 'Iuran untuk kegiatan sekolah tertentu',
    default_amount: 75000,
    is_active: true,
    created_at: '2024-01-15T00:00:00.000Z'
  }
]

const CreatePaymentPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: CreatePaymentData) => {
    setLoading(true)
    
    try {
      // Create payments with Pakasir integration
      const payments = createBulkPayments(
        data.selected_students,
        data.category_id,
        data.amount,
        data.due_date
      )

      console.log('Creating payments:', payments)
      
      // Simulate API call to create payments in Supabase
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Send WhatsApp notifications if requested
      if (data.send_whatsapp) {
        console.log('Sending WhatsApp notifications to:', data.selected_students.length, 'students')
        
        // Simulate WhatsApp sending
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        toast.success(
          `${data.selected_students.length} tagihan berhasil dibuat dan notifikasi WhatsApp terkirim!`,
          { duration: 5000 }
        )
      } else {
        toast.success(
          `${data.selected_students.length} tagihan berhasil dibuat!`,
          { duration: 4000 }
        )
      }

      // Redirect to payments page
      router.push('/dashboard/payments')
      
    } catch (error) {
      console.error('Error creating payments:', error)
      toast.error('Terjadi kesalahan saat membuat tagihan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Buat Tagihan Baru</h1>
            <p className="text-gray-600 mt-1">
              Buat tagihan pembayaran untuk siswa dengan integrasi Pakasir dan WhatsApp otomatis
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  Pembayaran Digital
                </h3>
                <p className="text-xs text-blue-700 mt-1">
                  Link Pakasir otomatis untuk setiap siswa
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-900">
                  WhatsApp Otomatis
                </h3>
                <p className="text-xs text-green-700 mt-1">
                  Notifikasi langsung ke orang tua
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-purple-900">
                  {sampleStudents.filter(s => s.is_active).length} Siswa Aktif
                </h3>
                <p className="text-xs text-purple-700 mt-1">
                  Siap untuk ditagih
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <CreatePaymentForm
          students={sampleStudents}
          categories={sampleCategories}
          onSubmit={handleSubmit}
          loading={loading}
        />

        {/* Help Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            📚 Panduan Membuat Tagihan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Langkah-langkah:</h4>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Pilih kategori pembayaran yang sesuai</li>
                <li>Tentukan jumlah dan tanggal jatuh tempo</li>
                <li>Pilih siswa yang akan ditagih</li>
                <li>Review dan konfirmasi tagihan</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Fitur Otomatis:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Link pembayaran Pakasir otomatis dibuat</li>
                <li>WhatsApp dikirim ke semua orang tua</li>
                <li>Status pembayaran ter-update real-time</li>
                <li>Reminder otomatis untuk yang terlambat</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default CreatePaymentPage