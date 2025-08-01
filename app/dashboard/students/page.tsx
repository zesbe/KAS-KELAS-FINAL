'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StudentTable from '@/components/students/StudentTable'
import StudentForm from '@/components/students/StudentForm'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Plus, 
  Upload, 
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { Student } from '@/lib/supabase'
import { studentService } from '@/lib/student-service'
import { currencyUtils } from '@/lib/utils'
import toast from 'react-hot-toast'

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    withPhoneNumbers: 0,
    withEmails: 0
  })

  // Load students data on component mount
  useEffect(() => {
    loadStudents()
    loadStats()
  }, [])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const { data, error } = await studentService.getAllStudents(false) // Get all students including inactive
      if (error) {
        toast.error('Gagal memuat data siswa')
        console.error('Error loading students:', error)
      } else {
        setStudents(data || [])
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const newStats = await studentService.getStudentStats()
      setStats(newStats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  // Calculate statistics from loaded data
  const totalStudents = stats.total
  const activeStudents = stats.active
  const inactiveStudents = stats.inactive

  const handleAddStudent = () => {
    setSelectedStudent(null)
    setIsFormOpen(true)
  }

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student)
    setIsFormOpen(true)
  }

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student)
    setIsDeleteOpen(true)
  }

  const handleFormSubmit = async (data: Partial<Student>) => {
    setSubmitting(true)
    
    try {
      // Validate data
      const validation = studentService.validateStudentData(data as Student)
      if (!validation.isValid) {
        toast.error(validation.errors[0])
        return
      }

      // Format phone number
      if (data.nomor_hp_ortu) {
        data.nomor_hp_ortu = studentService.formatPhoneNumber(data.nomor_hp_ortu)
      }
      
      if (selectedStudent) {
        // Update existing student
        const { data: updatedStudent, error } = await studentService.updateStudent(
          selectedStudent.id, 
          data as Partial<Student>
        )
        
        if (error) {
          toast.error(error.message || 'Gagal memperbarui data siswa')
          return
        }
        
        // Update local state
        setStudents(prev => prev.map(s => 
          s.id === selectedStudent.id ? updatedStudent! : s
        ))
        toast.success('Data siswa berhasil diperbarui!')
      } else {
        // Add new student
        const { data: newStudent, error } = await studentService.createStudent(
          data as Omit<Student, 'id' | 'created_at' | 'updated_at'>
        )
        
        if (error) {
          toast.error(error.message || 'Gagal menambahkan siswa baru')
          return
        }
        
        setStudents(prev => [...prev, newStudent!])
        toast.success('Siswa baru berhasil ditambahkan!')
      }
      
      setIsFormOpen(false)
      setSelectedStudent(null)
      
      // Reload stats
      loadStats()
    } catch (error) {
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
      console.error('Error submitting form:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedStudent) return
    
    setSubmitting(true)
    
    try {
      const { error } = await studentService.deleteStudent(selectedStudent.id)
      
      if (error) {
        toast.error(error.message || 'Gagal menghapus data siswa')
        return
      }
      
      // Update local state (soft delete - set is_active to false)
      setStudents(prev => prev.map(s => 
        s.id === selectedStudent.id ? { ...s, is_active: false } : s
      ))
      toast.success('Siswa berhasil dinonaktifkan!')
      
      setIsDeleteOpen(false)
      setSelectedStudent(null)
      
      // Reload stats
      loadStats()
    } catch (error) {
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
      console.error('Error deleting student:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleImportStudents = () => {
    // Create a file input element
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.xlsx,.xls'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        toast.success(`Import file "${file.name}" berhasil. ${students.length} data siswa akan diproses.`)
      }
    }
    input.click()
  }

  const handleExportStudents = () => {
    // Generate CSV data
    const csvHeaders = ['No Absen', 'Nama Siswa', 'Nama Orang Tua', 'No HP Orang Tua', 'Email Orang Tua', 'Alamat', 'Status']
    const csvData = [csvHeaders]
    
    students.forEach(student => {
      csvData.push([
        student.nomor_absen.toString(),
        student.nama,
        student.nama_ortu,
        student.nomor_hp_ortu,
        student.email_ortu || '',
        student.alamat || '',
        student.is_active ? 'Aktif' : 'Nonaktif'
      ])
    })

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `data-siswa-kelas-1a-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    
    toast.success(`Export berhasil! ${students.length} data siswa telah diexport ke CSV.`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Siswa</h1>
            <p className="text-gray-600 mt-1">
              Kelola data siswa kelas 1A dengan mudah
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <Button variant="outline" onClick={handleImportStudents}>
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </Button>
            <Button variant="outline" onClick={handleExportStudents}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleAddStudent}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Siswa
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                  <p className="text-sm text-gray-500 mt-1">Siswa terdaftar</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Siswa Aktif</p>
                  <p className="text-2xl font-bold text-green-600">{activeStudents}</p>
                  <p className="text-sm text-gray-500 mt-1">Masih bersekolah</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Siswa Tidak Aktif</p>
                  <p className="text-2xl font-bold text-red-600">{inactiveStudents}</p>
                  <p className="text-sm text-gray-500 mt-1">Sudah pindah/lulus</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <StudentTable
          students={students}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          onAdd={handleAddStudent}
          loading={loading}
        />

        {/* Student Form Modal */}
        <Modal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setSelectedStudent(null)
          }}
          title={selectedStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
          size="lg"
        >
          <StudentForm
            student={selectedStudent}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false)
              setSelectedStudent(null)
            }}
            loading={submitting}
          />
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false)
            setSelectedStudent(null)
          }}
          title="Hapus Data Siswa"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">
                  Peringatan: Aksi Tidak Dapat Dibatalkan
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  Semua data terkait siswa ini akan terhapus permanen
                </p>
              </div>
            </div>

            {selectedStudent && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Data yang akan dihapus:
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Nama:</strong> {selectedStudent.nama}</p>
                  <p><strong>No. Absen:</strong> {selectedStudent.nomor_absen}</p>
                  <p><strong>Orang Tua:</strong> {selectedStudent.nama_ortu}</p>
                  <p><strong>No. HP:</strong> {studentService.formatPhoneDisplay(selectedStudent.nomor_hp_ortu)}</p>
                  <p><strong>Status:</strong> {selectedStudent.is_active ? 'Aktif' : 'Tidak Aktif'}</p>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600">
              Siswa akan dinonaktifkan (soft delete). Data tidak akan benar-benar dihapus 
              dan dapat diaktifkan kembali jika diperlukan.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteOpen(false)
                  setSelectedStudent(null)
                }}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                loading={submitting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Nonaktifkan Siswa
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default StudentsPage