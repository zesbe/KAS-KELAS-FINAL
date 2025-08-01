'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
// import { toast } from 'react-hot-toast'
// import { settingsService } from '@/lib/services/settingsService'
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
  Users
} from 'lucide-react'

interface SystemSettings {
  school_name: string
  class_name: string
  teacher_name: string
  phone_number: string
  email: string
  default_payment_amount: number
  payment_due_day: number
  currency: string
  timezone: string
}

interface IntegrationSettings {
  supabase_connected: boolean
  pakasir_connected: boolean
  wapanels_connected: boolean
  pakasir_api_key: string
  pakasir_slug: string
  wapanels_app_key: string
  wapanels_auth_key: string
}

interface NotificationSettings {
  auto_payment_reminder: boolean
  auto_payment_confirmation: boolean
  reminder_days_before: number
  email_notifications: boolean
  whatsapp_notifications: boolean
  parent_portal_notifications: boolean
}

// Sample data
const initialSystemSettings: SystemSettings = {
  school_name: 'SD Indonesia',
  class_name: 'Kelas 1A',
  teacher_name: 'Ibu Sari Wijaya',
  phone_number: '628123456789',
  email: 'sari.wijaya@sdindonesia.sch.id',
  default_payment_amount: 25000,
  payment_due_day: 5,
  currency: 'IDR',
  timezone: 'Asia/Jakarta'
}

const initialIntegrationSettings: IntegrationSettings = {
  supabase_connected: true,
  pakasir_connected: true,
  wapanels_connected: true,
  pakasir_api_key: 'pakasir_live_xxxxxxxxxxxxxxxx',
  pakasir_slug: 'kas-kelas-1a',
  wapanels_app_key: 'wapanels_xxxxxxxxxxxxxxxxx',
  wapanels_auth_key: 'auth_xxxxxxxxxxxxxxxxxxxxx'
}

const initialNotificationSettings: NotificationSettings = {
  auto_payment_reminder: true,
  auto_payment_confirmation: true,
  reminder_days_before: 3,
  email_notifications: true,
  whatsapp_notifications: true,
  parent_portal_notifications: false
}

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'notifications' | 'security' | 'backup'>('general')
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(initialSystemSettings)
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>(initialIntegrationSettings)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotificationSettings)
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSystemSettingsChange = (field: keyof SystemSettings, value: string | number) => {
    setSystemSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleIntegrationSettingsChange = (field: keyof IntegrationSettings, value: string | boolean) => {
    setIntegrationSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleNotificationSettingsChange = (field: keyof NotificationSettings, value: boolean | number) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }))
  }

  const saveSettings = async (type: string) => {
    setIsLoading(true)
    
    try {
      // TODO: Implement service calls when settingsService is available
      console.log(`Saving ${type} settings...`)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // if (type === 'system') {
      //   const { error } = await settingsService.updateAppSettings({
      //     schoolName: systemSettings.school_name,
      //     className: systemSettings.class_name,
      //     teacherName: systemSettings.teacher_name,
      //     teacherPhone: systemSettings.phone_number,
      //     teacherEmail: systemSettings.email,
      //     monthlyFee: systemSettings.default_payment_amount
      //   }, 'admin')
      //   
      //   if (error) {
      //     toast.error('Gagal menyimpan pengaturan sistem')
      //     return
      //   }
      //   
      //   toast.success('Pengaturan sistem berhasil disimpan!')
      // }
      
      alert(`Pengaturan ${type} berhasil disimpan!`)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Terjadi kesalahan saat menyimpan pengaturan')
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async (service: string) => {
    setIsLoading(true)
    alert(`Testing ${service} connection...`)
    
    try {
      // Simulate API test call
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert(`${service} connection test successful!`)
    } catch (error) {
      alert(`${service} connection test failed!`)
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = (type: string) => {
    alert(`Exporting ${type} data...`)
  }

  const importData = (type: string) => {
    alert(`Importing ${type} data...`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
            <p className="text-gray-600 mt-1">
              Kelola konfigurasi dan pengaturan aplikasi
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Simpan Semua
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'general', label: 'Umum', icon: Settings },
              { id: 'integrations', label: 'Integrasi', icon: Globe },
              { id: 'notifications', label: 'Notifikasi', icon: Bell },
              { id: 'security', label: 'Keamanan', icon: Shield },
              { id: 'backup', label: 'Backup', icon: Database }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <School className="w-5 h-5 mr-2" />
                  Informasi Sekolah & Kelas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="text"
                    value={systemSettings.phone_number}
                    onChange={(e) => handleSystemSettingsChange('phone_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={systemSettings.email}
                    onChange={(e) => handleSystemSettingsChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                    <Button onClick={() => saveSettings('system')} disabled={isLoading}>
                      {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Simpan Pengaturan
                    </Button>
                  </div>
                )}
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
                    Jumlah Kas Default
                  </label>
                  <input
                    type="number"
                    value={systemSettings.default_payment_amount}
                    onChange={(e) => handleSystemSettingsChange('default_payment_amount', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formatCurrency(systemSettings.default_payment_amount)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Jatuh Tempo (setiap bulan)
                  </label>
                  <select
                    value={systemSettings.payment_due_day}
                    onChange={(e) => handleSystemSettingsChange('payment_due_day', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>Tanggal {day}</option>
                    ))}
                  </select>
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
                    <option value="IDR">Indonesian Rupiah (IDR)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zona Waktu
                  </label>
                  <select
                    value={systemSettings.timezone}
                    onChange={(e) => handleSystemSettingsChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
                    <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
                    <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-6">
            {/* Connection Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <Badge variant={integrationSettings.supabase_connected ? "success" : "danger"}>
                      {integrationSettings.supabase_connected ? "Terhubung" : "Terputus"}
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
                    <Badge variant={integrationSettings.pakasir_connected ? "success" : "danger"}>
                      {integrationSettings.pakasir_connected ? "Terhubung" : "Terputus"}
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
                    <Badge variant={integrationSettings.wapanels_connected ? "success" : "danger"}>
                      {integrationSettings.wapanels_connected ? "Terhubung" : "Terputus"}
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
                    disabled={isLoading}
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Simpan Pengaturan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Pengaturan Notifikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Notifikasi Otomatis</h4>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-700">Reminder Pembayaran Otomatis</span>
                      <p className="text-sm text-gray-600">Kirim reminder WhatsApp sebelum jatuh tempo</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.auto_payment_reminder}
                      onChange={(e) => handleNotificationSettingsChange('auto_payment_reminder', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-700">Konfirmasi Pembayaran Otomatis</span>
                      <p className="text-sm text-gray-600">Kirim konfirmasi ketika pembayaran berhasil</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.auto_payment_confirmation}
                      onChange={(e) => handleNotificationSettingsChange('auto_payment_confirmation', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kirim Reminder Berapa Hari Sebelum Jatuh Tempo
                    </label>
                    <select
                      value={notificationSettings.reminder_days_before}
                      onChange={(e) => handleNotificationSettingsChange('reminder_days_before', parseInt(e.target.value))}
                      className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={1}>1 hari sebelum</option>
                      <option value={2}>2 hari sebelum</option>
                      <option value={3}>3 hari sebelum</option>
                      <option value={5}>5 hari sebelum</option>
                      <option value={7}>7 hari sebelum</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Channel Notifikasi</h4>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <span className="font-medium text-gray-700">Email Notifikasi</span>
                        <p className="text-sm text-gray-600">Terima notifikasi via email</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.email_notifications}
                      onChange={(e) => handleNotificationSettingsChange('email_notifications', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Smartphone className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <span className="font-medium text-gray-700">WhatsApp Notifikasi</span>
                        <p className="text-sm text-gray-600">Terima notifikasi via WhatsApp</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.whatsapp_notifications}
                      onChange={(e) => handleNotificationSettingsChange('whatsapp_notifications', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Globe className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <span className="font-medium text-gray-700">Portal Orang Tua</span>
                        <p className="text-sm text-gray-600">Notifikasi di portal orang tua</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.parent_portal_notifications}
                      onChange={(e) => handleNotificationSettingsChange('parent_portal_notifications', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </label>
                </div>
              </div>

              <Button onClick={() => saveSettings('notification')} disabled={isLoading}>
                {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Simpan Pengaturan Notifikasi
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Keamanan Akses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-green-900">Keamanan Aktif</h4>
                      <p className="text-sm text-green-700">Sistem menggunakan enkripsi end-to-end</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Pengaturan Password</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password Saat Ini
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Masukkan password saat ini"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password Baru
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Masukkan password baru"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Konfirmasi Password Baru
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Konfirmasi password baru"
                      />
                    </div>
                    <Button variant="outline" className="w-full">
                      Update Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Log Aktivitas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: 'Login berhasil', time: '2024-01-20 08:30:15', ip: '192.168.1.100' },
                    { action: 'Export laporan', time: '2024-01-20 07:45:22', ip: '192.168.1.100' },
                    { action: 'Update pengaturan', time: '2024-01-19 16:20:11', ip: '192.168.1.100' },
                    { action: 'Kirim WhatsApp broadcast', time: '2024-01-19 14:15:33', ip: '192.168.1.100' }
                  ].map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.action}</p>
                        <p className="text-xs text-gray-600">{log.time}</p>
                      </div>
                      <span className="text-xs text-gray-500">{log.ip}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Lihat Semua Log
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

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
                <p className="text-gray-600">
                  Export data untuk backup atau migrasi ke sistem lain.
                </p>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => exportData('students')}>
                    <Users className="w-4 h-4 mr-2" />
                    Export Data Siswa
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => exportData('payments')}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Export Data Pembayaran
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => exportData('expenses')}>
                    <Database className="w-4 h-4 mr-2" />
                    Export Data Pengeluaran
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => exportData('all')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Semua Data
                  </Button>
                </div>
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
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Peringatan</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Import data akan mengganti data yang sudah ada. Pastikan Anda telah membuat backup.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Import Data Siswa
                    </label>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.json"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Import Data Pembayaran
                    </label>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.json"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <Button onClick={() => importData('selected')}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
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