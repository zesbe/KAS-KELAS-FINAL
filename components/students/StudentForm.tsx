'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Student } from '@/lib/supabase'
import { validationUtils } from '@/lib/utils'

interface StudentFormProps {
  student?: Student | null
  onSubmit: (data: Partial<Student>) => void
  onCancel: () => void
  loading?: boolean
}

interface FormData {
  nama: string
  nomor_absen: string
  nomor_hp_ortu: string
  nama_ortu: string
  email_ortu: string
  alamat: string
  is_active: boolean
}

interface FormErrors {
  nama?: string
  nomor_absen?: string
  nomor_hp_ortu?: string
  nama_ortu?: string
  email_ortu?: string
  alamat?: string
}

const StudentForm: React.FC<StudentFormProps> = ({
  student,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    nama: '',
    nomor_absen: '',
    nomor_hp_ortu: '',
    nama_ortu: '',
    email_ortu: '',
    alamat: '',
    is_active: true
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Initialize form with student data if editing
  useEffect(() => {
    if (student) {
      setFormData({
        nama: student.nama || '',
        nomor_absen: student.nomor_absen?.toString() || '',
        nomor_hp_ortu: student.nomor_hp_ortu || '',
        nama_ortu: student.nama_ortu || '',
        email_ortu: student.email_ortu || '',
        alamat: student.alamat || '',
        is_active: student.is_active
      })
    }
  }, [student])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate nama siswa
    if (!validationUtils.isRequired(formData.nama)) {
      newErrors.nama = 'Nama siswa wajib diisi'
    } else if (formData.nama.length < 2) {
      newErrors.nama = 'Nama siswa minimal 2 karakter'
    }

    // Validate nomor absen
    if (!validationUtils.isRequired(formData.nomor_absen)) {
      newErrors.nomor_absen = 'Nomor absen wajib diisi'
    } else {
      const absen = parseInt(formData.nomor_absen)
      if (isNaN(absen) || absen < 1 || absen > 50) {
        newErrors.nomor_absen = 'Nomor absen harus antara 1-50'
      }
    }

    // Validate nomor HP orang tua
    if (!validationUtils.isRequired(formData.nomor_hp_ortu)) {
      newErrors.nomor_hp_ortu = 'Nomor HP orang tua wajib diisi'
    } else if (!validationUtils.isValidPhoneNumber(formData.nomor_hp_ortu)) {
      newErrors.nomor_hp_ortu = 'Format nomor HP tidak valid (contoh: 08123456789)'
    }

    // Validate nama orang tua
    if (!validationUtils.isRequired(formData.nama_ortu)) {
      newErrors.nama_ortu = 'Nama orang tua wajib diisi'
    } else if (formData.nama_ortu.length < 2) {
      newErrors.nama_ortu = 'Nama orang tua minimal 2 karakter'
    }

    // Validate email (optional)
    if (formData.email_ortu && !validationUtils.isValidEmail(formData.email_ortu)) {
      newErrors.email_ortu = 'Format email tidak valid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const submitData: Partial<Student> = {
      nama: formData.nama.trim(),
      nomor_absen: parseInt(formData.nomor_absen),
      nomor_hp_ortu: formData.nomor_hp_ortu.trim(),
      nama_ortu: formData.nama_ortu.trim(),
      email_ortu: formData.email_ortu.trim() || undefined,
      alamat: formData.alamat.trim() || undefined,
      is_active: formData.is_active
    }

    onSubmit(submitData)
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '')
    
    // Format as Indonesian phone number
    if (cleaned.startsWith('62')) {
      return cleaned
    } else if (cleaned.startsWith('0')) {
      return '62' + cleaned.substring(1)
    } else if (cleaned.length > 0) {
      return '62' + cleaned
    }
    
    return value
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nama Siswa */}
        <Input
          label="Nama Lengkap Siswa *"
          value={formData.nama}
          onChange={(e) => handleInputChange('nama', e.target.value)}
          error={errors.nama}
          hint="Masukkan nama lengkap siswa"
          placeholder="contoh: Ahmad Rizki Pratama"
        />

        {/* Nomor Absen */}
        <Input
          label="Nomor Absen *"
          type="number"
          value={formData.nomor_absen}
          onChange={(e) => handleInputChange('nomor_absen', e.target.value)}
          error={errors.nomor_absen}
          hint="Nomor urut absen di kelas"
          placeholder="1"
          min="1"
          max="50"
        />

        {/* Nama Orang Tua */}
        <Input
          label="Nama Orang Tua/Wali *"
          value={formData.nama_ortu}
          onChange={(e) => handleInputChange('nama_ortu', e.target.value)}
          error={errors.nama_ortu}
          hint="Nama ayah/ibu/wali siswa"
          placeholder="contoh: Budi Santoso"
        />

        {/* Nomor HP Orang Tua */}
        <Input
          label="Nomor HP Orang Tua *"
          value={formData.nomor_hp_ortu}
          onChange={(e) => {
            const formatted = formatPhoneNumber(e.target.value)
            handleInputChange('nomor_hp_ortu', formatted)
          }}
          error={errors.nomor_hp_ortu}
          hint="Untuk WhatsApp reminder (format: 628123456789)"
          placeholder="628123456789"
        />

        {/* Email Orang Tua */}
        <Input
          label="Email Orang Tua (Opsional)"
          type="email"
          value={formData.email_ortu}
          onChange={(e) => handleInputChange('email_ortu', e.target.value)}
          error={errors.email_ortu}
          hint="Email untuk portal orang tua"
          placeholder="budi.santoso@email.com"
        />

        {/* Status Aktif */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => handleInputChange('is_active', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Siswa Aktif
          </label>
        </div>
      </div>

      {/* Alamat */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alamat Lengkap (Opsional)
        </label>
        <textarea
          value={formData.alamat}
          onChange={(e) => handleInputChange('alamat', e.target.value)}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-none"
          placeholder="Alamat rumah siswa untuk keperluan administrasi"
        />
        <p className="text-xs text-gray-500 mt-1">
          Alamat lengkap untuk keperluan administrasi dan komunikasi
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Batal
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {student ? 'Update Siswa' : 'Tambah Siswa'}
        </Button>
      </div>

      {/* Form Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          💡 Tips Pengisian Form
        </h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Pastikan nomor HP orang tua aktif untuk WhatsApp</li>
          <li>• Email orang tua akan digunakan untuk akses portal</li>
          <li>• Nomor absen harus unik untuk setiap siswa</li>
          <li>• Centang &quot;Siswa Aktif&quot; untuk siswa yang masih bersekolah</li>
        </ul>
      </div>
    </form>
  )
}

export default StudentForm