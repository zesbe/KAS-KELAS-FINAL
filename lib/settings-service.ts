'use client'

import { createSupabaseClient, Settings, supabaseHelpers } from '@/lib/supabase'

// Settings service for all database operations
export class SettingsService {
  private supabase = createSupabaseClient()

  // Get all settings
  async getAllSettings(): Promise<{ data: Settings[] | null; error: any }> {
    try {
      const result = await supabaseHelpers.getSettings(this.supabase)
      return result
    } catch (error) {
      console.error('Error fetching settings:', error)
      return { data: null, error }
    }
  }

  // Get setting by key
  async getSettingByKey(key: string): Promise<{ data: Settings | null; error: any }> {
    try {
      const result = await supabaseHelpers.getSettingByKey(this.supabase, key)
      return result
    } catch (error) {
      console.error('Error fetching setting:', error)
      return { data: null, error }
    }
  }

  // Get multiple settings by keys
  async getSettingsByKeys(keys: string[]): Promise<{ data: Settings[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('settings')
        .select('*')
        .in('key', keys)
        .order('key')
      
      return { data, error }
    } catch (error) {
      console.error('Error fetching settings by keys:', error)
      return { data: null, error }
    }
  }

  // Update setting value
  async updateSetting(key: string, value: string, updatedBy?: string): Promise<{ data: Settings | null; error: any }> {
    try {
      const result = await supabaseHelpers.updateSetting(this.supabase, key, value, updatedBy)
      return result
    } catch (error) {
      console.error('Error updating setting:', error)
      return { data: null, error }
    }
  }

  // Create new setting
  async createSetting(setting: Omit<Settings, 'id' | 'updated_at'>): Promise<{ data: Settings | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('settings')
        .insert({
          ...setting,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      return { data, error }
    } catch (error) {
      console.error('Error creating setting:', error)
      return { data: null, error }
    }
  }

  // Delete setting
  async deleteSetting(key: string): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase
        .from('settings')
        .delete()
        .eq('key', key)
      
      return { error }
    } catch (error) {
      console.error('Error deleting setting:', error)
      return { error }
    }
  }

  // Bulk update settings
  async bulkUpdateSettings(updates: Array<{ key: string; value: string }>, updatedBy?: string): Promise<{ data: Settings[] | null; error: any }> {
    try {
      const promises = updates.map(update => 
        this.updateSetting(update.key, update.value, updatedBy)
      )
      
      const results = await Promise.all(promises)
      const errors = results.filter(r => r.error)
      
      if (errors.length > 0) {
        return { data: null, error: errors[0].error }
      }
      
      const data = results.map(r => r.data).filter(Boolean) as Settings[]
      return { data, error: null }
    } catch (error) {
      console.error('Error bulk updating settings:', error)
      return { data: null, error }
    }
  }

  // Get settings as key-value object
  async getSettingsAsObject(keys?: string[]): Promise<{ data: Record<string, string> | null; error: any }> {
    try {
      let query = this.supabase
        .from('settings')
        .select('key, value')
      
      if (keys && keys.length > 0) {
        query = query.in('key', keys)
      }
      
      const { data, error } = await query
      
      if (error) {
        return { data: null, error }
      }
      
      const settingsObj = data?.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, string>) || {}
      
      return { data: settingsObj, error: null }
    } catch (error) {
      console.error('Error getting settings as object:', error)
      return { data: null, error }
    }
  }

  // Application-specific setting helpers
  async getAppSettings(): Promise<{
    schoolName: string
    className: string
    teacherName: string
    teacherPhone: string
    teacherEmail: string
    schoolAddress: string
    bankAccount: string
    bankName: string
    monthlyFee: number
  }> {
    const { data } = await this.getSettingsAsObject([
      'school_name',
      'class_name', 
      'teacher_name',
      'teacher_phone',
      'teacher_email',
      'school_address',
      'bank_account',
      'bank_name',
      'monthly_fee'
    ])

    return {
      schoolName: data?.school_name || 'SD Indonesia',
      className: data?.class_name || 'Kelas 1A',
      teacherName: data?.teacher_name || 'Bu Sari',
      teacherPhone: data?.teacher_phone || '628123456789',
      teacherEmail: data?.teacher_email || 'teacher@school.com',
      schoolAddress: data?.school_address || 'Jl. Pendidikan No. 123',
      bankAccount: data?.bank_account || '1234567890',
      bankName: data?.bank_name || 'Bank Mandiri',
      monthlyFee: parseInt(data?.monthly_fee || '25000')
    }
  }

  async updateAppSettings(settings: {
    schoolName?: string
    className?: string
    teacherName?: string
    teacherPhone?: string
    teacherEmail?: string
    schoolAddress?: string
    bankAccount?: string
    bankName?: string
    monthlyFee?: number
  }, updatedBy?: string): Promise<{ error: any }> {
    const updates: Array<{ key: string; value: string }> = []

    if (settings.schoolName !== undefined) {
      updates.push({ key: 'school_name', value: settings.schoolName })
    }
    if (settings.className !== undefined) {
      updates.push({ key: 'class_name', value: settings.className })
    }
    if (settings.teacherName !== undefined) {
      updates.push({ key: 'teacher_name', value: settings.teacherName })
    }
    if (settings.teacherPhone !== undefined) {
      updates.push({ key: 'teacher_phone', value: settings.teacherPhone })
    }
    if (settings.teacherEmail !== undefined) {
      updates.push({ key: 'teacher_email', value: settings.teacherEmail })
    }
    if (settings.schoolAddress !== undefined) {
      updates.push({ key: 'school_address', value: settings.schoolAddress })
    }
    if (settings.bankAccount !== undefined) {
      updates.push({ key: 'bank_account', value: settings.bankAccount })
    }
    if (settings.bankName !== undefined) {
      updates.push({ key: 'bank_name', value: settings.bankName })
    }
    if (settings.monthlyFee !== undefined) {
      updates.push({ key: 'monthly_fee', value: settings.monthlyFee.toString() })
    }

    if (updates.length === 0) {
      return { error: null }
    }

    const { error } = await this.bulkUpdateSettings(updates, updatedBy)
    return { error }
  }

  // WhatsApp settings helpers
  async getWhatsAppSettings(): Promise<{
    apiKey: string
    autoReminders: boolean
    autoConfirmations: boolean
    reminderDaysBefore: number
  }> {
    const { data } = await this.getSettingsAsObject([
      'wapanels_app_key',
      'whatsapp_auto_reminders',
      'whatsapp_auto_confirmations',
      'whatsapp_reminder_days_before'
    ])

    return {
      apiKey: data?.wapanels_app_key || '2d8714c0ceb932baf18b44285cb540b294a64871',
      autoReminders: data?.whatsapp_auto_reminders === 'true',
      autoConfirmations: data?.whatsapp_auto_confirmations === 'true',
      reminderDaysBefore: parseInt(data?.whatsapp_reminder_days_before || '3')
    }
  }

  async updateWhatsAppSettings(settings: {
    apiKey?: string
    autoReminders?: boolean
    autoConfirmations?: boolean
    reminderDaysBefore?: number
  }, updatedBy?: string): Promise<{ error: any }> {
    const updates: Array<{ key: string; value: string }> = []

    if (settings.apiKey !== undefined) {
      updates.push({ key: 'wapanels_app_key', value: settings.apiKey })
    }
    if (settings.autoReminders !== undefined) {
      updates.push({ key: 'whatsapp_auto_reminders', value: settings.autoReminders.toString() })
    }
    if (settings.autoConfirmations !== undefined) {
      updates.push({ key: 'whatsapp_auto_confirmations', value: settings.autoConfirmations.toString() })
    }
    if (settings.reminderDaysBefore !== undefined) {
      updates.push({ key: 'whatsapp_reminder_days_before', value: settings.reminderDaysBefore.toString() })
    }

    if (updates.length === 0) {
      return { error: null }
    }

    const { error } = await this.bulkUpdateSettings(updates, updatedBy)
    return { error }
  }

  // Payment settings helpers
  async getPaymentSettings(): Promise<{
    pakasirSlug: string
    pakasirApiKey: string
    pakasirBaseUrl: string
    pakasirRedirectUrl: string
  }> {
    const { data } = await this.getSettingsAsObject([
      'pakasir_slug',
      'pakasir_api_key',
      'pakasir_base_url',
      'pakasir_redirect_url'
    ])

    return {
      pakasirSlug: data?.pakasir_slug || 'uangkasalhusna',
      pakasirApiKey: data?.pakasir_api_key || 'u8e0CphRmRVuNwDyqnfNoeOwHa6UBpLg',
      pakasirBaseUrl: data?.pakasir_base_url || 'https://pakasir.zone.id',
      pakasirRedirectUrl: data?.pakasir_redirect_url || 'https://berbagiakun.com'
    }
  }

  // Validation helpers
  validateSettingValue(type: string, value: string): { isValid: boolean; error?: string } {
    switch (type) {
      case 'text':
        return { isValid: true }
      
      case 'number':
        const num = parseFloat(value)
        if (isNaN(num)) {
          return { isValid: false, error: 'Nilai harus berupa angka' }
        }
        return { isValid: true }
      
      case 'boolean':
        if (value !== 'true' && value !== 'false') {
          return { isValid: false, error: 'Nilai harus true atau false' }
        }
        return { isValid: true }
      
      case 'json':
        try {
          JSON.parse(value)
          return { isValid: true }
        } catch {
          return { isValid: false, error: 'Format JSON tidak valid' }
        }
      
      default:
        return { isValid: true }
    }
  }

  // Initialize default settings
  async initializeDefaultSettings(): Promise<{ error: any }> {
    const defaultSettings: Array<Omit<Settings, 'id' | 'updated_at'>> = [
      {
        key: 'school_name',
        value: 'SD Indonesia',
        description: 'Nama sekolah',
        type: 'text',
        updated_by: 'system'
      },
      {
        key: 'class_name',
        value: 'Kelas 1A',
        description: 'Nama kelas',
        type: 'text',
        updated_by: 'system'
      },
      {
        key: 'teacher_name',
        value: 'Bu Sari',
        description: 'Nama guru/wali kelas',
        type: 'text',
        updated_by: 'system'
      },
      {
        key: 'teacher_phone',
        value: '628123456789',
        description: 'Nomor HP guru',
        type: 'text',
        updated_by: 'system'
      },
      {
        key: 'teacher_email',
        value: 'teacher@school.com',
        description: 'Email guru',
        type: 'text',
        updated_by: 'system'
      },
      {
        key: 'monthly_fee',
        value: '25000',
        description: 'Biaya kas bulanan (Rupiah)',
        type: 'number',
        updated_by: 'system'
      },
      {
        key: 'whatsapp_api_key',
        value: '2d8714c0ceb932baf18b44285cb540b294a64871',
        description: 'API Key StarSender WhatsApp',
        type: 'text',
        updated_by: 'system'
      },
      {
        key: 'whatsapp_auto_reminders',
        value: 'true',
        description: 'Kirim reminder otomatis',
        type: 'boolean',
        updated_by: 'system'
      },
      {
        key: 'whatsapp_auto_confirmations',
        value: 'true',
        description: 'Kirim konfirmasi pembayaran otomatis',
        type: 'boolean',
        updated_by: 'system'
      },
      {
        key: 'whatsapp_reminder_days_before',
        value: '3',
        description: 'Hari sebelum jatuh tempo untuk reminder',
        type: 'number',
        updated_by: 'system'
      }
    ]

    try {
      // Check existing settings
      const { data: existingSettings } = await this.getAllSettings()
      const existingKeys = existingSettings?.map(s => s.key) || []

      // Insert only missing settings
      const newSettings = defaultSettings.filter(s => !existingKeys.includes(s.key))
      
      if (newSettings.length > 0) {
        const { error } = await this.supabase
          .from('settings')
          .insert(newSettings.map(s => ({
            ...s,
            updated_at: new Date().toISOString()
          })))

        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Error initializing default settings:', error)
      return { error }
    }
  }
}

// Export singleton instance
export const settingsService = new SettingsService()
export default settingsService