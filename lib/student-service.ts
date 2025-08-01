'use client'

import { supabase, Student, supabaseHelpers } from '@/lib/supabase'

// Student service for all database operations
export class StudentService {
  private supabase = supabase

  // Get all students
  async getAllStudents(activeOnly = true): Promise<{ data: Student[] | null; error: any }> {
    try {
      const result = await supabaseHelpers.getStudents(this.supabase, activeOnly)
      
      return result
    } catch (error) {
      console.error('Error fetching students:', error)
      return { data: null, error }
    }
  }

  // Get student by ID
  async getStudentById(id: string): Promise<{ data: Student | null; error: any }> {
    try {
      const result = await supabaseHelpers.getStudentById(this.supabase, id)
      return result
    } catch (error) {
      console.error('Error fetching student:', error)
      return { data: null, error }
    }
  }

  // Get student by nomor absen
  async getStudentByNomorAbsen(nomorAbsen: number): Promise<{ data: Student | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('students')
        .select('*')
        .eq('nomor_absen', nomorAbsen)
        .eq('is_active', true)
        .single()
      
      return { data, error }
    } catch (error) {
      console.error('Error fetching student by nomor absen:', error)
      return { data: null, error }
    }
  }

  // Search students
  async searchStudents(query: string): Promise<{ data: Student[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('students')
        .select('*')
        .or(`nama.ilike.%${query}%,nama_ortu.ilike.%${query}%,nomor_hp_ortu.ilike.%${query}%`)
        .eq('is_active', true)
        .order('nomor_absen', { ascending: true })
      
      return { data, error }
    } catch (error) {
      console.error('Error searching students:', error)
      return { data: null, error }
    }
  }

  // Create new student
  async createStudent(studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Student | null; error: any }> {
    try {
      // Check if nomor_absen already exists
      const { data: existing } = await this.supabase
        .from('students')
        .select('id')
        .eq('nomor_absen', studentData.nomor_absen)
        .single()

      if (existing) {
        return { 
          data: null, 
          error: { message: `Nomor absen ${studentData.nomor_absen} sudah digunakan` }
        }
      }

      const result = await supabaseHelpers.createStudent(this.supabase, studentData)
      return result
    } catch (error) {
      console.error('Error creating student:', error)
      return { data: null, error }
    }
  }

  // Update student
  async updateStudent(id: string, updates: Partial<Omit<Student, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Student | null; error: any }> {
    try {
      // If updating nomor_absen, check for duplicates
      if (updates.nomor_absen) {
        const { data: existing } = await this.supabase
          .from('students')
          .select('id')
          .eq('nomor_absen', updates.nomor_absen)
          .neq('id', id)
          .single()

        if (existing) {
          return { 
            data: null, 
            error: { message: `Nomor absen ${updates.nomor_absen} sudah digunakan` }
          }
        }
      }

      const result = await supabaseHelpers.updateStudent(this.supabase, id, updates)
      return result
    } catch (error) {
      console.error('Error updating student:', error)
      return { data: null, error }
    }
  }

  // Soft delete student (set is_active to false)
  async deleteStudent(id: string): Promise<{ data: Student | null; error: any }> {
    try {
      const result = await this.updateStudent(id, { is_active: false })
      return result
    } catch (error) {
      console.error('Error deleting student:', error)
      return { data: null, error }
    }
  }

  // Restore deleted student
  async restoreStudent(id: string): Promise<{ data: Student | null; error: any }> {
    try {
      const result = await this.updateStudent(id, { is_active: true })
      return result
    } catch (error) {
      console.error('Error restoring student:', error)
      return { data: null, error }
    }
  }

  // Bulk operations
  async createMultipleStudents(students: Omit<Student, 'id' | 'created_at' | 'updated_at'>[]): Promise<{ data: Student[] | null; error: any }> {
    try {
      // Check for duplicate nomor_absen within the batch
      const nomorAbsenList = students.map(s => s.nomor_absen)
      const duplicates = nomorAbsenList.filter((item, index) => nomorAbsenList.indexOf(item) !== index)
      
      if (duplicates.length > 0) {
        return {
          data: null,
          error: { message: `Nomor absen duplikat dalam data: ${duplicates.join(', ')}` }
        }
      }

      // Check for existing nomor_absen in database
      const { data: existing } = await this.supabase
        .from('students')
        .select('nomor_absen')
        .in('nomor_absen', nomorAbsenList)

      if (existing && existing.length > 0) {
        const existingNumbers = existing.map((s: any) => s.nomor_absen)
        return {
          data: null,
          error: { message: `Nomor absen sudah ada di database: ${existingNumbers.join(', ')}` }
        }
      }

      const { data, error } = await this.supabase
        .from('students')
        .insert(students)
        .select()

      return { data, error }
    } catch (error) {
      console.error('Error creating multiple students:', error)
      return { data: null, error }
    }
  }

  // Get statistics
  async getStudentStats(): Promise<{
    total: number
    active: number
    inactive: number
    withPhoneNumbers: number
    withEmails: number
  }> {
    try {
      const [totalResult, activeResult, phoneResult, emailResult] = await Promise.all([
        this.supabase.from('students').select('id', { count: 'exact' }),
        this.supabase.from('students').select('id', { count: 'exact' }).eq('is_active', true),
        this.supabase.from('students').select('id', { count: 'exact' }).not('nomor_hp_ortu', 'is', null).neq('nomor_hp_ortu', ''),
        this.supabase.from('students').select('id', { count: 'exact' }).not('email_ortu', 'is', null).neq('email_ortu', '')
      ])

      const total = totalResult.count || 0
      const active = activeResult.count || 0
      const withPhoneNumbers = phoneResult.count || 0
      const withEmails = emailResult.count || 0

      return {
        total,
        active,
        inactive: total - active,
        withPhoneNumbers,
        withEmails
      }
    } catch (error) {
      console.error('Error getting student stats:', error)
      return {
        total: 0,
        active: 0,
        inactive: 0,
        withPhoneNumbers: 0,
        withEmails: 0
      }
    }
  }

  // Validate student data
  validateStudentData(student: Partial<Student>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!student.nama || student.nama.trim().length < 2) {
      errors.push('Nama siswa minimal 2 karakter')
    }

    if (!student.nomor_absen || student.nomor_absen < 1) {
      errors.push('Nomor absen harus lebih dari 0')
    }

    if (!student.nomor_hp_ortu || !this.isValidPhoneNumber(student.nomor_hp_ortu)) {
      errors.push('Nomor HP orang tua tidak valid')
    }

    if (!student.nama_ortu || student.nama_ortu.trim().length < 2) {
      errors.push('Nama orang tua minimal 2 karakter')
    }

    if (student.email_ortu && !this.isValidEmail(student.email_ortu)) {
      errors.push('Format email tidak valid')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Utility functions
  private isValidPhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length >= 10 && cleaned.length <= 15
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Format phone number
  formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1)
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned
    }
    
    return cleaned
  }

  // Format phone for display
  formatPhoneDisplay(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('62')) {
      return '+62 ' + cleaned.substring(2).replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
    }
    return phone
  }
}

// Export singleton instance
export const studentService = new StudentService()
export default studentService