'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'
import { 
  CreditCard, 
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { currencyUtils, dateUtils } from '@/lib/utils'

interface RecentPayment {
  id: string
  amount: number
  status: string
  payment_method: string | null
  completed_at: string | null
  created_at: string
  student: {
    nama: string
    kelas: string
  }
  category: {
    name: string
  }
}

const RecentPayments = () => {
  const [payments, setPayments] = useState<RecentPayment[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchRecentPayments()
  }, [])

  const fetchRecentPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          status,
          payment_method,
          completed_at,
          created_at,
          students!payments_student_id_fkey(nama, kelas),
          payment_categories!payments_category_id_fkey(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      // Transform the data to match the expected format
      const transformedData = (data || []).map((payment: any) => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        payment_method: payment.payment_method,
        completed_at: payment.completed_at,
        created_at: payment.created_at,
        student: {
          nama: payment.students?.nama || 'Unknown',
          kelas: payment.students?.kelas || 'Unknown'
        },
        category: {
          name: payment.payment_categories?.name || 'Unknown'
        }
      }))

      setPayments(transformedData)
    } catch (error) {
      console.error('Error fetching recent payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success" size="sm">Lunas</Badge>
      case 'pending':
        return <Badge variant="warning" size="sm">Menunggu</Badge>
      case 'failed':
        return <Badge variant="danger" size="sm">Gagal</Badge>
      case 'cancelled':
        return <Badge variant="secondary" size="sm">Dibatalkan</Badge>
      default:
        return <Badge size="sm">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pembayaran Terbaru</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            {payments.length > 0 
              ? `${payments.filter(p => p.status === 'paid').length} pembayaran hari ini`
              : 'Belum ada pembayaran hari ini'
            }
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/dashboard/payments')}
        >
          Lihat Semua
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Belum ada data pembayaran</p>
            <p className="text-sm text-gray-400 mt-1">Pembayaran akan muncul di sini setelah ada transaksi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div 
                key={payment.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => router.push('/dashboard/payments')}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    {getStatusIcon(payment.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.student?.nama || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {payment.category?.name || 'Pembayaran'} • {dateUtils.getRelativeTime(payment.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {currencyUtils.format(payment.amount)}
                  </p>
                  {getStatusBadge(payment.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentPayments