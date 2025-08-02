'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'
import toast from 'react-hot-toast'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  Camera,
  Shield,
  Key,
  Bell,
  Settings,
  Award,
  Clock,
  Users,
  X,
  Upload
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone: string
  role: string
  school_name: string
  class_name: string
  address: string
  created_at: string
  avatar_url?: string
}

interface AppSettings {
  [key: string]: {
    value: string
    description: string
    type: string
  }
}

interface Activity {
  id: string
  action: string
  description: string
  created_at: string
  type: string
}

const ProfilePage = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [settings, setSettings] = useState<AppSettings>({})
  const [isEditingSettings, setIsEditingSettings] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchActivities()
      fetchSettings()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Gagal memuat profil')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchActivities = async () => {
    try {
      // Fetch recent activities from various tables
      const [payments, students, expenses] = await Promise.all([
        supabase
          .from('payments')
          .select('id, created_at, amount, status')
          .eq('created_by', user?.id)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('students')
          .select('id, created_at, nama')
          .eq('created_by', user?.id)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('expenses')
          .select('id, created_at, description, amount')
          .eq('created_by', user?.id)
          .order('created_at', { ascending: false })
          .limit(3)
      ])

      const allActivities: Activity[] = []

      // Process payments
      if (payments.data) {
        payments.data.forEach((p: any) => {
          allActivities.push({
            id: `payment-${p.id}`,
            action: p.status === 'paid' ? 'Pembayaran diterima' : 'Membuat tagihan',
            description: `Rp ${p.amount.toLocaleString('id-ID')}`,
            created_at: p.created_at,
            type: 'payment'
          })
        })
      }

      // Process students
      if (students.data) {
        students.data.forEach((s: any) => {
          allActivities.push({
            id: `student-${s.id}`,
            action: 'Menambah siswa',
            description: s.nama,
            created_at: s.created_at,
            type: 'student'
          })
        })
      }

      // Process expenses
      if (expenses.data) {
        expenses.data.forEach((e: any) => {
          allActivities.push({
            id: `expense-${e.id}`,
            action: 'Mencatat pengeluaran',
            description: e.description,
            created_at: e.created_at,
            type: 'expense'
          })
        })
      }

      // Sort by date and take top 5
      const sortedActivities = allActivities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      setActivities(sortedActivities)
    } catch (error) {
      console.error('Error fetching activities:', error)
    }
  }

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value, description, type')

      if (error) throw error

      // Convert array to object for easier access
      const settingsObj: AppSettings = {}
      data?.forEach(setting => {
        settingsObj[setting.key] = {
          value: setting.value,
          description: setting.description || '',
          type: setting.type || 'text'
        }
      })

      setSettings(settingsObj)
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const updateSettings = async () => {
    if (profile?.role !== 'bendahara' && profile?.role !== 'admin') {
      toast.error('Hanya bendahara atau admin yang dapat mengubah pengaturan')
      return
    }

    setIsSaving(true)
    try {
      // Update each setting
      const updates = Object.entries(settings).map(([key, setting]) => ({
        key,
        value: setting.value,
        updated_by: profile?.full_name || user?.email,
        updated_at: new Date().toISOString()
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .update({
            value: update.value,
            updated_by: update.updated_by,
            updated_at: update.updated_at
          })
          .eq('key', update.key)

        if (error) throw error
      }

      toast.success('Pengaturan berhasil diperbarui')
      setIsEditingSettings(false)
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Gagal memperbarui pengaturan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (profile) {
      setProfile({ ...profile, [field]: value })
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          school_name: profile.school_name,
          class_name: profile.class_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id)

      if (error) throw error

      toast.success('Profil berhasil diperbarui')
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Gagal memperbarui profil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Password baru tidak cocok')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      toast.success('Password berhasil diubah')
      setIsChangingPassword(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Gagal mengubah password')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <Award className="w-4 h-4 text-green-600" />
      case 'student':
        return <Users className="w-4 h-4 text-blue-600" />
      case 'expense':
        return <Clock className="w-4 h-4 text-red-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffDays > 0) return `${diffDays} hari yang lalu`
    if (diffHours > 0) return `${diffHours} jam yang lalu`
    if (diffMinutes > 0) return `${diffMinutes} menit yang lalu`
    return 'Baru saja'
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Profil tidak ditemukan</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profil Pengguna</h1>
            <p className="text-gray-600 mt-1">
              Kelola informasi profil dan pengaturan akun Anda
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            {isEditing ? (
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Batal
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profil
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Informasi Profil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </span>
                      </div>
                      {isEditing && (
                        <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                          <Camera className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{profile.full_name || 'Nama Pengguna'}</h3>
                      <p className="text-gray-600">{profile.role || 'Bendahara'}</p>
                      <Badge variant="primary" className="mt-2">
                        {profile.school_name || 'Sekolah'} - {profile.class_name || 'Kelas'}
                      </Badge>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.full_name || ''}
                          onChange={(e) => handleInputChange('full_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <User className="w-4 h-4 text-gray-400 mr-3" />
                          <span>{profile.full_name || '-'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <span>{profile.email}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Telepon
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-4 h-4 text-gray-400 mr-3" />
                          <span>{profile.phone || '-'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Peran
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Shield className="w-4 h-4 text-gray-400 mr-3" />
                        <span>{profile.role || 'Bendahara'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Sekolah
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.school_name || ''}
                          onChange={(e) => handleInputChange('school_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Award className="w-4 h-4 text-gray-400 mr-3" />
                          <span>{profile.school_name || '-'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kelas
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.class_name || ''}
                          onChange={(e) => handleInputChange('class_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Users className="w-4 h-4 text-gray-400 mr-3" />
                          <span>{profile.class_name || '-'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat
                    </label>
                    {isEditing ? (
                      <textarea
                        value={profile.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-4 h-4 text-gray-400 mr-3 mt-0.5" />
                        <span>{profile.address || '-'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bergabung Sejak
                    </label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                      <span>{formatDate(profile.created_at)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Quick Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Pengaturan Cepat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setIsChangingPassword(true)}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Ubah Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="w-4 h-4 mr-2" />
                  Pengaturan Notifikasi
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Keamanan Akun
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Aktivitas Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="bg-gray-100 p-2 rounded-full">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {getRelativeTime(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Belum ada aktivitas
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* App Settings - Only for bendahara/admin */}
            {(profile?.role === 'bendahara' || profile?.role === 'admin') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Pengaturan Aplikasi
                    </span>
                    {isEditingSettings ? (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditingSettings(false)
                            fetchSettings() // Reset to original values
                          }}
                        >
                          Batal
                        </Button>
                        <Button
                          size="sm"
                          onClick={updateSettings}
                          disabled={isSaving}
                        >
                          {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingSettings(true)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Aplikasi
                    </label>
                    {isEditingSettings ? (
                      <input
                        type="text"
                        value={settings.app_name?.value || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          app_name: { ...settings.app_name, value: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{settings.app_name?.value || '-'}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{settings.app_name?.description}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Kelas
                    </label>
                    {isEditingSettings ? (
                      <input
                        type="text"
                        value={settings.class_name?.value || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          class_name: { ...settings.class_name, value: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{settings.class_name?.value || '-'}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{settings.class_name?.description}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Iuran Bulanan Default
                    </label>
                    {isEditingSettings ? (
                      <input
                        type="number"
                        value={settings.monthly_fee?.value || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          monthly_fee: { ...settings.monthly_fee, value: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">
                        Rp {parseInt(settings.monthly_fee?.value || '0').toLocaleString('id-ID')}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{settings.monthly_fee?.description}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Bendahara
                    </label>
                    {isEditingSettings ? (
                      <input
                        type="text"
                        value={settings.treasurer_name?.value || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          treasurer_name: { ...settings.treasurer_name, value: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{settings.treasurer_name?.value || '-'}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{settings.treasurer_name?.description}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      No. HP Bendahara
                    </label>
                    {isEditingSettings ? (
                      <input
                        type="text"
                        value={settings.treasurer_phone?.value || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          treasurer_phone: { ...settings.treasurer_phone, value: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{settings.treasurer_phone?.value || '-'}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{settings.treasurer_phone?.description}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Change Password Modal */}
        {isChangingPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    Ubah Password
                  </span>
                  <button
                    onClick={() => setIsChangingPassword(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan ulang password baru"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsChangingPassword(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    disabled={isSaving || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="flex-1"
                  >
                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ProfilePage