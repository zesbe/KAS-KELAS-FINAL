'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MoreVertical,
  Filter,
  Download,
  MessageCircle
} from 'lucide-react'
import { Student } from '@/lib/supabase'
import { currencyUtils } from '@/lib/utils'

interface StudentTableProps {
  students: Student[]
  onEdit: (student: Student) => void
  onDelete: (student: Student) => void
  onAdd: () => void
  loading?: boolean
}

// Sample data for development
const sampleStudents: Student[] = [
  {
    id: '1',
    nama: 'Ahmad Rizki Pratama',
    nomor_absen: 1,
    nomor_hp_ortu: '628123456789',
    nama_ortu: 'Budi Santoso',
    email_ortu: 'budi.santoso@email.com',
    alamat: 'Jl. Merdeka No. 123, Jakarta',
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
    alamat: 'Jl. Kebon Jeruk No. 45, Jakarta',
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
    alamat: 'Jl. Sudirman No. 67, Jakarta',
    is_active: false,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z'
  }
]

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onEdit,
  onDelete,
  onAdd,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  // Filter students based on search and status
  const filteredStudents = (students || []).filter(student => {
    const matchesSearch = 
      student.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nama_ortu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nomor_absen.toString().includes(searchTerm)
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && student.is_active) ||
      (filterStatus === 'inactive' && !student.is_active)
    
    return matchesSearch && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map(s => s.id))
    } else {
      setSelectedStudents([])
    }
  }

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId])
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId))
    }
  }

  const handleBulkWhatsApp = () => {
    const selectedStudentData = students.filter(s => selectedStudents.includes(s.id))
    console.log('Send WhatsApp to:', selectedStudentData)
  }

  const handleExport = () => {
    console.log('Export students data')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Data Siswa</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {filteredStudents.length} dari {students?.length || 0} siswa
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Siswa
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Cari nama siswa, orang tua, atau nomor absen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
            
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800">
                {selectedStudents.length} siswa dipilih
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="primary" size="sm" onClick={handleBulkWhatsApp}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Kirim WhatsApp
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedStudents([])}>
                  Batal
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Memuat data siswa...</span>
          </div>
        )}

        {/* Table */}
        {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  No. Absen
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Nama Siswa
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Orang Tua
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Kontak
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={(e) => handleSelectStudent(student.id, e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700">
                        {student.nomor_absen}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {student.nama}
                      </p>
                      {student.alamat && (
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                          {student.alamat}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-900">{student.nama_ortu}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-gray-600">
                        <Phone className="w-3 h-3 mr-1" />
                        {student.nomor_hp_ortu}
                      </div>
                      {student.email_ortu && (
                        <div className="flex items-center text-xs text-gray-600">
                          <Mail className="w-3 h-3 mr-1" />
                          {student.email_ortu}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={student.is_active ? 'success' : 'secondary'}>
                      {student.is_active ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(student)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(student)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'Tidak ada siswa yang sesuai dengan pencarian' : 'Belum ada data siswa'}
              </p>
            </div>
          )}
        </div>
        )}

        {/* Pagination */}
        {filteredStudents.length > 10 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-700">
              Menampilkan 1 - {Math.min(10, filteredStudents.length)} dari {filteredStudents.length} siswa
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Sebelumnya
              </Button>
              <Button variant="outline" size="sm">
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StudentTable