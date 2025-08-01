'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  Calendar,
  CreditCard,
  Users,
  MessageCircle,
  CheckCircle,
  Plus
} from 'lucide-react'
import { Student, PaymentCategory } from '@/lib/supabase'
import { currencyUtils, dateUtils, validationUtils } from '@/lib/utils'
import { createBulkPayments, generatePaymentUrl, generateOrderId } from '@/lib/pakasir'
import { sendBulkWhatsAppMessages, messageUtils } from '@/lib/starsender'
import { studentService } from '@/lib/student-service'
import toast from 'react-hot-toast'

interface CreatePaymentFormProps {
  students: Student[]
  categories: PaymentCategory[]
  onSubmit: (data: CreatePaymentData) => void
  loading?: boolean
}

interface CreatePaymentData {
  category_id: string
  amount: number
  due_date: string
  selected_students: string[]
  send_whatsapp: boolean
  notes?: string
}

interface FormData {
  category_id: string
  amount: string
  due_date: string
  send_whatsapp: boolean
  notes: string
  payment_type: 'all' | 'selected'
}

interface FormErrors {
  category_id?: string
  amount?: string
  due_date?: string
  selected_students?: string
}


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
  }
]

const CreatePaymentForm: React.FC<CreatePaymentFormProps> = ({
  students: propStudents,
  categories = sampleCategories,
  onSubmit,
  loading = false
}) => {
  const [students, setStudents] = useState<Student[]>(propStudents || [])
  const [loadingStudents, setLoadingStudents] = useState(!propStudents)

  // Load students if not provided via props
  useEffect(() => {
    if (!propStudents) {
      loadStudents()
    } else {
      setStudents(propStudents)
      setLoadingStudents(false)
    }
  }, [propStudents])

  const loadStudents = async () => {
    setLoadingStudents(true)
    try {
      const { data, error } = await studentService.getAllStudents(true)
      if (!error && data) {
        setStudents(data)
      }
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoadingStudents(false)
    }
  }
  const [formData, setFormData] = useState<FormData>({
    category_id: '',
    amount: '',
    due_date: '',
    send_whatsapp: true,
    notes: '',
    payment_type: 'all'
  })

  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [step, setStep] = useState(1) // 1: Basic Info, 2: Student Selection, 3: Review

  const activeStudents = students.filter(s => s.is_active)

  // Set default due date to next month 5th
  useEffect(() => {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    nextMonth.setDate(5)
    
    setFormData(prev => ({
      ...prev,
      due_date: dateUtils.formatDateInput(nextMonth)
    }))
  }, [])

  // Update amount when category changes
  useEffect(() => {
    if (formData.category_id) {
      const category = categories.find(c => c.id === formData.category_id)
      if (category?.default_amount) {
        setFormData(prev => ({
          ...prev,
          amount: category.default_amount!.toString()
        }))
      }
    }
  }, [formData.category_id, categories])

  // Update selected students when payment type changes
  useEffect(() => {
    if (formData.payment_type === 'all') {
      setSelectedStudents(activeStudents.map(s => s.id))
    } else {
      setSelectedStudents([])
    }
  }, [formData.payment_type, activeStudents])

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {}

    if (!validationUtils.isRequired(formData.category_id)) {
      newErrors.category_id = 'Kategori pembayaran wajib dipilih'
    }

    const amount = parseInt(formData.amount)
    if (!validationUtils.isRequired(formData.amount)) {
      newErrors.amount = 'Jumlah pembayaran wajib diisi'
    } else if (!validationUtils.isPositiveNumber(amount)) {
      newErrors.amount = 'Jumlah harus lebih dari 0'
    } else if (amount < 1000) {
      newErrors.amount = 'Jumlah minimal Rp 1.000'
    }

    if (!validationUtils.isRequired(formData.due_date)) {
      newErrors.due_date = 'Tanggal jatuh tempo wajib diisi'
    } else if (!validationUtils.isValidDate(formData.due_date)) {
      newErrors.due_date = 'Format tanggal tidak valid'
    } else {
      const dueDate = new Date(formData.due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (dueDate <= today) {
        newErrors.due_date = 'Tanggal jatuh tempo harus di masa depan'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {}

    if (selectedStudents.length === 0) {
      newErrors.selected_students = 'Minimal pilih 1 siswa untuk ditagih'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep1() || !validateStep2()) {
      return
    }

    const targetStudents = formData.payment_type === 'all' ? activeStudents : activeStudents.filter(s => selectedStudents.includes(s.id))
    const amount = parseInt(formData.amount)
    
    toast.loading('Membuat tagihan pembayaran...')
    
    try {
      // Create payment records with Pakasir integration
      const paymentPromises = targetStudents.map(student => {
        const orderId = generateOrderId()
        const paymentUrl = generatePaymentUrl(amount, orderId)
        
        return {
          student_id: student.id,
          category_id: formData.category_id,
          amount,
          order_id: orderId,
          pakasir_payment_url: paymentUrl,
          due_date: formData.due_date,
          status: 'pending' as const,
          student: student
        }
      })

      // If WhatsApp is enabled, send messages
      if (formData.send_whatsapp) {
        const selectedCategory = categories.find(c => c.id === formData.category_id)
        const monthYear = dateUtils.getCurrentMonthYear()
        
        const recipients = paymentPromises.map(payment => {
          const message = messageUtils.createBillingMessage(
            payment.student.nama,
            monthYear,
            amount,
            new Date(formData.due_date).toLocaleDateString('id-ID'),
            payment.pakasir_payment_url
          )
          
          return {
            phone: payment.student.nomor_hp_ortu,
            message,
            studentId: payment.student.id
          }
        })

        const whatsappResults = await sendBulkWhatsAppMessages(recipients)
        const successCount = whatsappResults.filter(r => r.success).length
        
        toast.dismiss()
        toast.success(`Tagihan berhasil dibuat dan dikirim ke ${successCount} orang tua`)
      } else {
        toast.dismiss()
        toast.success(`Tagihan berhasil dibuat untuk ${targetStudents.length} siswa`)
      }

      // Reset form
      setFormData({
        category_id: '',
        amount: '',
        due_date: '',
        send_whatsapp: true,
        notes: '',
        payment_type: 'all'
      })
      setSelectedStudents([])
      setStep(1)
      
      // Call the original onSubmit if provided
      if (onSubmit) {
        const submitData: CreatePaymentData = {
          category_id: formData.category_id,
          amount,
          due_date: formData.due_date,
          selected_students: targetStudents.map(s => s.id),
          send_whatsapp: formData.send_whatsapp,
          notes: formData.notes.trim() || undefined
        }
        onSubmit(submitData)
      }
      
    } catch (error) {
      toast.dismiss()
      toast.error('Gagal membuat tagihan pembayaran')
      console.error('Payment creation error:', error)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId)
      } else {
        return [...prev, studentId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === activeStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(activeStudents.map(s => s.id))
    }
  }

  const selectedCategory = categories.find(c => c.id === formData.category_id)
  const selectedStudentData = activeStudents.filter(s => selectedStudents.includes(s.id))
  const totalAmount = selectedStudents.length * parseInt(formData.amount || '0')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step > stepNum ? <CheckCircle className="w-5 h-5" /> : stepNum}
            </div>
            <div className="ml-2 text-sm">
              {stepNum === 1 && 'Info Dasar'}
              {stepNum === 2 && 'Pilih Siswa'}
              {stepNum === 3 && 'Review'}
            </div>
            {stepNum < 3 && (
              <div
                className={`w-16 h-1 mx-4 ${
                  step > stepNum ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Informasi Pembayaran
              </CardTitle>
              <p className="text-sm text-gray-600">
                Tentukan kategori, jumlah, dan tanggal jatuh tempo pembayaran
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Pembayaran *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        formData.category_id === category.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('category_id', category.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">
                            {currencyUtils.format(category.default_amount || 0)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.category_id && (
                  <p className="text-sm text-red-600 mt-1">{errors.category_id}</p>
                )}
              </div>

              {/* Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Jumlah Pembayaran *"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  error={errors.amount}
                  hint="Masukkan jumlah dalam Rupiah"
                  placeholder="25000"
                  min="1000"
                  leftIcon={<span className="text-gray-500">Rp</span>}
                />

                <Input
                  label="Tanggal Jatuh Tempo *"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                  error={errors.due_date}
                  hint="Siswa wajib bayar sebelum tanggal ini"
                  leftIcon={<Calendar className="w-4 h-4" />}
                />
              </div>

              {/* Payment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tagih ke Siswa
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment_type"
                      value="all"
                      checked={formData.payment_type === 'all'}
                      onChange={(e) => handleInputChange('payment_type', e.target.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-900">
                      Semua siswa aktif ({activeStudents.length} siswa)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment_type"
                      value="selected"
                      checked={formData.payment_type === 'selected'}
                      onChange={(e) => handleInputChange('payment_type', e.target.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-900">
                      Pilih siswa tertentu saja
                    </span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-none"
                  placeholder="Tambahkan catatan untuk pembayaran ini..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Student Selection */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Pilih Siswa
              </CardTitle>
              <p className="text-sm text-gray-600">
                Pilih siswa yang akan ditagih untuk pembayaran {selectedCategory?.name}
              </p>
            </CardHeader>
            <CardContent>
              {/* Select All */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === activeStudents.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Pilih semua siswa aktif
                  </span>
                </label>
                <Badge variant="primary">
                  {selectedStudents.length} dari {activeStudents.length} siswa
                </Badge>
              </div>

              {/* Student List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedStudents.includes(student.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleStudentToggle(student.id)}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentToggle(student.id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-primary-700">
                              {student.nomor_absen}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {student.nama}
                            </p>
                            <p className="text-xs text-gray-500">
                              {student.nama_ortu}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {errors.selected_students && (
                <p className="text-sm text-red-600 mt-2">{errors.selected_students}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Review Pembayaran
              </CardTitle>
              <p className="text-sm text-gray-600">
                Periksa kembali detail pembayaran sebelum dibuat
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Kategori</p>
                    <p className="text-lg font-semibold text-blue-900">
                      {selectedCategory?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Jumlah per Siswa</p>
                    <p className="text-lg font-semibold text-blue-900">
                      {currencyUtils.format(parseInt(formData.amount))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Tagihan</p>
                    <p className="text-lg font-semibold text-blue-900">
                      {currencyUtils.format(totalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Detail Pembayaran</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jatuh Tempo:</span>
                      <span className="font-medium">{dateUtils.formatDate(formData.due_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jumlah Siswa:</span>
                      <span className="font-medium">{selectedStudents.length} siswa</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kirim WhatsApp:</span>
                      <span className="font-medium">
                        {formData.send_whatsapp ? 'Ya' : 'Tidak'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Siswa yang Ditagih ({selectedStudents.length})
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {selectedStudentData.map((student) => (
                      <div key={student.id} className="flex items-center text-sm">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium">{student.nomor_absen}</span>
                        </div>
                        <span>{student.nama}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* WhatsApp Preview */}
              {formData.send_whatsapp && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Preview Pesan WhatsApp</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-green-800 whitespace-pre-line">
                      {`🏫 *KAS KELAS 1A - SD INDONESIA*

Yth. Orang Tua *[Nama Siswa]*

📋 Tagihan: ${selectedCategory?.name}
💰 Nominal: ${currencyUtils.format(parseInt(formData.amount))}
📅 Jatuh Tempo: ${dateUtils.formatDate(formData.due_date)}

🔗 *BAYAR SEKARANG (KLIK LINK)*
[Payment Link Pakasir]

✅ *Metode Pembayaran:*
🏦 Transfer Bank | 💳 E-Wallet | 📱 QRIS

⚡ *Otomatis terkonfirmasi setelah bayar*

📊 Cek status: https://berbagiakun.com
Terima kasih 🙏`}
                    </div>
                  </div>
                </div>
              )}

              {/* WhatsApp Option */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="send_whatsapp"
                  checked={formData.send_whatsapp}
                  onChange={(e) => handleInputChange('send_whatsapp', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="send_whatsapp" className="text-sm font-medium text-gray-700">
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  Kirim notifikasi WhatsApp otomatis ke orang tua
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <div>
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                Kembali
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {step < 3 ? (
              <Button type="button" onClick={handleNext}>
                Lanjut
              </Button>
            ) : (
              <Button type="submit" loading={loading}>
                <Plus className="w-4 h-4 mr-2" />
                Buat Tagihan ({selectedStudents.length} siswa)
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreatePaymentForm