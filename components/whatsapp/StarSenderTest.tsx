'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { starSenderService } from '@/lib/starsender-service'
import { CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react'
import toast from 'react-hot-toast'

const StarSenderTest: React.FC = () => {
  const [testing, setTesting] = useState(false)
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [testPhone, setTestPhone] = useState('628123456789')
  const [testMessage, setTestMessage] = useState('Test pesan dari KAS KELAS via StarSender API')
  const [sendResult, setSendResult] = useState<any>(null)

  const testConnection = async () => {
    setTesting(true)
    setConnectionResult(null)
    
    try {
      toast('Menguji koneksi ke StarSender API...', { icon: 'ℹ️' })
      const result = await starSenderService.testConnection()
      setConnectionResult(result)
      
      if (result.success) {
        toast.success('✅ Koneksi StarSender berhasil!')
      } else {
        toast.error(`❌ Koneksi StarSender gagal: ${result.message}`)
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      setConnectionResult({
        success: false,
        message: 'Terjadi kesalahan saat menguji koneksi',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      toast.error('Terjadi kesalahan saat menguji koneksi')
    } finally {
      setTesting(false)
    }
  }

  const sendTestMessage = async () => {
    if (!testPhone.trim() || !testMessage.trim()) {
      toast.error('Nomor HP dan pesan harus diisi')
      return
    }

    setTesting(true)
    setSendResult(null)
    
    try {
      toast('Mengirim pesan test via StarSender...', { icon: 'ℹ️' })
      const result = await starSenderService.sendMessage(testPhone, testMessage)
      setSendResult(result)
      
      if (result.success) {
        toast.success('✅ Pesan test berhasil dikirim!')
      } else {
        toast.error(`❌ Pesan test gagal: ${result.message}`)
      }
    } catch (error) {
      console.error('Error sending test message:', error)
      setSendResult({
        success: false,
        message: 'Terjadi kesalahan saat mengirim pesan',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      toast.error('Terjadi kesalahan saat mengirim pesan')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Test Koneksi StarSender API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Uji koneksi ke StarSender API untuk memastikan konfigurasi benar
            </p>
            
            <Button 
              onClick={testConnection}
              disabled={testing}
              className="w-full"
            >
              {testing ? 'Menguji Koneksi...' : 'Test Koneksi API'}
            </Button>

            {connectionResult && (
              <div className={`p-4 rounded-lg border ${
                connectionResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center">
                  {connectionResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      connectionResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {connectionResult.message}
                    </p>
                    {connectionResult.error && (
                      <p className="text-sm text-red-700 mt-1">
                        Error: {connectionResult.error}
                      </p>
                    )}
                    {connectionResult.data && (
                      <div className="mt-2 text-sm text-gray-600">
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(connectionResult.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Send Test Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="w-5 h-5 mr-2" />
            Test Kirim Pesan WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor HP Test (format: 628xxx)
              </label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="628123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pesan Test
              </label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Tulis pesan test..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <Button 
              onClick={sendTestMessage}
              disabled={testing || !testPhone.trim() || !testMessage.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {testing ? 'Mengirim Pesan...' : 'Kirim Pesan Test'}
            </Button>

            {sendResult && (
              <div className={`p-4 rounded-lg border ${
                sendResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center">
                  {sendResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      sendResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {sendResult.message}
                    </p>
                    {sendResult.error && (
                      <p className="text-sm text-red-700 mt-1">
                        Error: {sendResult.error}
                      </p>
                    )}
                    {sendResult.data && (
                      <div className="mt-2 text-sm text-gray-600">
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(sendResult.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi StarSender API</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📝 Catatan Penting:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• API Key diambil dari pengaturan sistem (settings table)</li>
              <li>• Nomor HP harus dalam format internasional (628xxx)</li>
              <li>• StarSender API endpoint: https://starsender.online/api</li>
              <li>• Jika test gagal, periksa API key dan koneksi internet</li>
              <li>• Rate limiting: 2 detik delay antar pesan untuk bulk sending</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StarSenderTest