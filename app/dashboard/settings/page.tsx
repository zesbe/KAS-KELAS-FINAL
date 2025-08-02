'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import toast from 'react-hot-toast'
import { settingsService } from '@/lib/settings-service'
import { starSenderService } from '@/lib/starsender-service'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { 
  Settings, 
  User, 
  School, 
  CreditCard,
  MessageCircle,
  Bell,
  Shield,
  Database,
  Download,
  Upload,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Key,
  Smartphone,
  Mail,
  Globe,
  Users,
  X
} from 'lucide-react'

const SettingsPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'notifications' | 'security' | 'backup'>('general')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showApiKeys, setShowApiKeys] = useState(false)
  
  // Settings states
  const [systemSettings, setSystemSettings] = useState({
    school_name: '',
    class_name: '',
    teacher_name: '',
    phone_number: '',
    email: '',
    default_payment_amount: '25000',
    payment_due_day: '5',
    currency: 'IDR',
    timezone: 'Asia/Jakarta'
  })

  const [integrationSettings, setIntegrationSettings] = useState({
    pakasir_api_key: '',
    pakasir_slug: '',
    wapanels_app_key: '',
    wapanels_auth_key: ''
  })

  const [notificationSettings, setNotificationSettings] = useState({
    whatsapp_auto_reminders: false,
    whatsapp_auto_confirmations: false,
    whatsapp_reminder_days_before: 3,
    email_notifications: false,
    parent_portal_notifications: false
  })

  const [connectionStatus, setConnectionStatus] = useState({
    pakasir: false,
    starsender: false,
    supabase: true
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      // Load all settings
      const settings = await settingsService.getAllSettings()
      
      // Map settings to state
      if (settings.data) {
        const settingsData = settings.data as any
        // System settings
        setSystemSettings({
          school_name: settingsData.school_name || '',
          class_name: settingsData.class_name || '',
          teacher_name: settingsData.teacher_name || '',
          phone_number: settingsData.phone_number || '',
          email: settingsData.email || '',
          default_payment_amount: settingsData.default_payment_amount || '25000',
          payment_due_day: settingsData.payment_due_day || '5',
          currency: settingsData.currency || 'IDR',
          timezone: settingsData.timezone || 'Asia/Jakarta'
        })

        // Integration settings
        setIntegrationSettings({
          pakasir_api_key: settingsData.pakasir_api_key || '',
          pakasir_slug: settingsData.pakasir_slug || '',
          wapanels_app_key: settingsData.wapanels_app_key || '',
          wapanels_auth_key: settingsData.wapanels_auth_key || ''
        })

        // Notification settings
        setNotificationSettings({
          whatsapp_auto_reminders: settingsData.whatsapp_auto_reminders === 'true',
          whatsapp_auto_confirmations: settingsData.whatsapp_auto_confirmations === 'true',
          whatsapp_reminder_days_before: parseInt(settingsData.whatsapp_reminder_days_before || '3'),
          email_notifications: settingsData.email_notifications === 'true',
          parent_portal_notifications: settingsData.parent_portal_notifications === 'true'
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Gagal memuat pengaturan')
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async (section: string) => {
    setIsSaving(true)
    
    try {
      let updates: Array<{ key: string; value: string }> = []
      
      switch (section) {
        case 'general':
          updates = Object.entries(systemSettings).map(([key, value]) => ({
            key,
            value: value.toString()
          }))
          break
          
        case 'integration':
          updates = Object.entries(integrationSettings).map(([key, value]) => ({
            key,
            value: value.toString()
          }))
          break
          
        case 'notification':
          updates = Object.entries(notificationSettings).map(([key, value]) => ({
            key,
            value: value.toString()
          }))
          break
      }
      
      const { error } = await settingsService.bulkUpdateSettings(updates, user?.id)
      
      if (error) throw error
      
      toast.success('Pengaturan berhasil disimpan')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Gagal menyimpan pengaturan')
    } finally {
      setIsSaving(false)
    }
  }

  const testConnection = async (service: string) => {
    const loadingToast = toast.loading(`Menguji koneksi ${service}...`)
    
    try {
      switch (service) {
        case 'Pakasir':
          // Test Pakasir connection
          const pakasirResponse = await fetch('https://api.pakasir.com/v1/test', {
            headers: {
              'Authorization': `Bearer ${integrationSettings.pakasir_api_key}`
            }
          })
          
          if (pakasirResponse.ok) {
            setConnectionStatus(prev => ({ ...prev, pakasir: true }))
            toast.success('Koneksi Pakasir berhasil', { id: loadingToast })
          } else {
            throw new Error('Koneksi Pakasir gagal')
          }
          break
          
        case 'StarSender':
          const result = await starSenderService.testConnection()
          
          if (result.success) {
            setConnectionStatus(prev => ({ ...prev, starsender: true }))
            toast.success('Koneksi StarSender berhasil', { id: loadingToast })
          } else {
            throw new Error(result.message)
          }
          break
      }
    } catch (error) {
      toast.error(`Koneksi ${service} gagal`, { id: loadingToast })
      console.error(`Error testing ${service} connection:`, error)
    }
  }

  const exportData = async () => {
    const loadingToast = toast.loading('Mengekspor data...')
    
    try {
      // Export all data from various tables
      const [students, payments, expenses, categories] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('payment_categories').select('*')
      ])

      const exportData = {
        exported_at: new Date().toISOString(),
        students: students.data || [],
        payments: payments.data || [],
        expenses: expenses.data || [],
        categories: categories.data || [],
        settings: {
          system: systemSettings,
          notifications: notificationSettings
        }
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `kas-kelas-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('Data berhasil diekspor', { id: loadingToast })
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Gagal mengekspor data', { id: loadingToast })
    }
  }

  const handleSystemSettingsChange = (field: string, value: string) => {
    setSystemSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleIntegrationSettingsChange = (field: string, value: string) => {
    setIntegrationSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleNotificationSettingsChange = (field: string, value: boolean | number) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }))
  }

  const tabs = [
    { id: 'general', label: 'Umum', icon: Settings },
    { id: 'integrations', label: 'Integrasi', icon: Globe },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'security', label: 'Keamanan', icon: Shield },
    { id: 'backup', label: 'Backup', icon: Database }
  ]

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-gray-600 mt-1">
            Kelola pengaturan aplikasi dan integrasi
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    py-2 px-1 border-b-2 font-medium text-sm flex items-center
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <School className="w-5 h-5 mr-2" />
                  Informasi Sekolah
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Sekolah
                  </label>
                  <input
                    type="text"
                    value={systemSettings.school_name}
                    onChange={(e) => handleSystemSettingsChange('school_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Kelas
                  </label>
                  <input
                    type="text"
                    value={systemSettings.class_name}
                    onChange={(e) => handleSystemSettingsChange('class_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Wali Kelas
                  </label>
                  <input
                    type="text"
                    value={systemSettings.teacher_name}
                    onChange={(e) => handleSystemSettingsChange('teacher_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pengaturan Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nominal Default
                  </label>
                  <input
                    type="number"
                    value={systemSettings.default_payment_amount}
                    onChange={(e) => handleSystemSettingsChange('default_payment_amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Jatuh Tempo (Hari)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.payment_due_day}
                    onChange={(e) => handleSystemSettingsChange('payment_due_day', e.target.value)}
                    min="1"
                    max="31"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mata Uang
                  </label>
                  <select
                    value={systemSettings.currency}
                    onChange={(e) => handleSystemSettingsChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="IDR">IDR - Rupiah</option>
                    <option value="USD">USD - Dollar</option>
                  </select>
                </div>
                <Button 
                  onClick={() => saveSettings('general')}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan Pengaturan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Integration Settings */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            {/* Integration Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Database className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <h3 className="font-medium">Supabase</h3>
                        <p className="text-sm text-gray-600">Database</p>
                      </div>
                    </div>
                    <Badge variant={connectionStatus.supabase ? "success" : "danger"}>
                      {connectionStatus.supabase ? "Terhubung" : "Terputus"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="w-8 h-8 text-green-600 mr-3" />
                      <div>
                        <h3 className="font-medium">Pakasir</h3>
                        <p className="text-sm text-gray-600">Payment Gateway</p>
                      </div>
                    </div>
                    <Badge variant={connectionStatus.pakasir ? "success" : "danger"}>
                      {connectionStatus.pakasir ? "Terhubung" : "Terputus"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageCircle className="w-8 h-8 text-green-600 mr-3" />
                      <div>
                        <h3 className="font-medium">StarSender</h3>
                        <p className="text-sm text-gray-600">WhatsApp Gateway</p>
                      </div>
                    </div>
                    <Badge variant={connectionStatus.starsender ? "success" : "danger"}>
                      {connectionStatus.starsender ? "Terhubung" : "Terputus"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Integration Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pengaturan Pakasir
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKeys ? "text" : "password"}
                        value={integrationSettings.pakasir_api_key}
                        onChange={(e) => handleIntegrationSettingsChange('pakasir_api_key', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKeys(!showApiKeys)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showApiKeys ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={integrationSettings.pakasir_slug}
                      onChange={(e) => handleIntegrationSettingsChange('pakasir_slug', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => testConnection('Pakasir')}
                    disabled={isLoading}
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Test Koneksi
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Pengaturan StarSender
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKeys ? "text" : "password"}
                        value={integrationSettings.wapanels_app_key}
                        onChange={(e) => handleIntegrationSettingsChange('wapanels_app_key', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKeys(!showApiKeys)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showApiKeys ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API URL
                    </label>
                    <input
                      type="text"
                      value="https://starsender.online/api/sendText"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => testConnection('StarSender')}
                    disabled={isLoading}
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Test Koneksi
                  </Button>
                  <Button 
                    onClick={() => saveSettings('integration')}
                    disabled={isSaving}
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Simpan Pengaturan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Pengaturan Notifikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">WhatsApp Notifications</h3>
                
                <label className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.whatsapp_auto_reminders}
                      onChange={(e) => handleNotificationSettingsChange('whatsapp_auto_reminders', e.target.checked)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">Reminder Otomatis</p>
                      <p className="text-sm text-gray-600">Kirim reminder pembayaran otomatis via WhatsApp</p>
                    </div>
                  </div>
                </label>

                {notificationSettings.whatsapp_auto_reminders && (
                  <div className="ml-7">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kirim reminder berapa hari sebelum jatuh tempo
                    </label>
                    <input
                      type="number"
                      value={notificationSettings.whatsapp_reminder_days_before}
                      onChange={(e) => handleNotificationSettingsChange('whatsapp_reminder_days_before', parseInt(e.target.value))}
                      min="1"
                      max="30"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <label className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.whatsapp_auto_confirmations}
                      onChange={(e) => handleNotificationSettingsChange('whatsapp_auto_confirmations', e.target.checked)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">Konfirmasi Pembayaran Otomatis</p>
                      <p className="text-sm text-gray-600">Kirim konfirmasi otomatis setelah pembayaran diterima</p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Other Notifications</h3>
                
                <label className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.email_notifications}
                      onChange={(e) => handleNotificationSettingsChange('email_notifications', e.target.checked)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Terima notifikasi via email</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.parent_portal_notifications}
                      onChange={(e) => handleNotificationSettingsChange('parent_portal_notifications', e.target.checked)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">Portal Orang Tua</p>
                      <p className="text-sm text-gray-600">Tampilkan notifikasi di portal orang tua</p>
                    </div>
                  </div>
                </label>
              </div>

              <Button 
                onClick={() => saveSettings('notification')}
                disabled={isSaving}
              >
                {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Simpan Pengaturan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Keamanan Akun
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium">Two-Factor Authentication</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Lindungi akun Anda dengan verifikasi dua langkah
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Aktifkan 2FA
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Login Terakhir</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Smartphone className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium">Chrome - Windows</p>
                          <p className="text-xs text-gray-500">Jakarta, Indonesia</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">2 jam yang lalu</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  API Keys
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Kelola API keys untuk integrasi dengan aplikasi lain
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Public API Key</p>
                      <p className="text-xs text-gray-500 font-mono">pk_live_xxxxxxxxxxxxx</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Regenerate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Backup Settings */}
        {activeTab === 'backup' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Export Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Export semua data aplikasi dalam format JSON untuk backup atau migrasi
                </p>
                <Button onClick={exportData} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Semua Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Import Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Import data dari file backup JSON
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Drag & drop file JSON atau klik untuk browse
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    id="import-file"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => document.getElementById('import-file')?.click()}
                  >
                    Pilih File
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

export default SettingsPage