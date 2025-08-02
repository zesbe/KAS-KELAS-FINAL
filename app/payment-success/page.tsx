'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Home, FileText } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [paymentData, setPaymentData] = useState<any>(null)

  useEffect(() => {
    // Get order_id from URL params
    const orderId = searchParams.get('order_id')
    if (orderId) {
      // In production, you would verify the payment here
      setPaymentData({
        order_id: orderId,
        status: 'success'
      })
    }
    setLoading(false)
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pembayaran Berhasil!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Terima kasih atas pembayaran Anda. Notifikasi telah dikirim melalui WhatsApp.
            </p>

            {paymentData?.order_id && (
              <div className="bg-gray-100 rounded-lg p-4 mb-8">
                <p className="text-sm text-gray-600">ID Transaksi</p>
                <p className="text-lg font-mono font-medium text-gray-900">
                  {paymentData.order_id}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Link href="/dashboard" className="block">
                <Button variant="primary" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Kembali ke Dashboard
                </Button>
              </Link>
              
              <Link href="/dashboard/laporan-keuangan" className="block">
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Lihat Riwayat Pembayaran
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Ada masalah? Hubungi bendahara kelas atau{' '}
            <Link href="/dashboard/profile" className="text-blue-600 hover:underline">
              lihat kontak
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}