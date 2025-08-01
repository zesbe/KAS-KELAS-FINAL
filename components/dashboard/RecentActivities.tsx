'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  CreditCard, 
  Receipt, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowRight 
} from 'lucide-react'
import { currencyUtils, dateUtils } from '@/lib/utils'

interface Activity {
  id: string
  type: 'payment' | 'expense' | 'whatsapp' | 'reminder'
  title: string
  description: string
  amount?: number
  timestamp: string
  status?: 'success' | 'pending' | 'failed'
  studentName?: string
}

interface RecentActivitiesProps {
  activities?: Activity[]
  limit?: number
}

// Sample data for development
const sampleActivities: Activity[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Pembayaran Diterima',
    description: 'Ahmad Rizki - Kas Bulan Agustus',
    amount: 25000,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    status: 'success',
    studentName: 'Ahmad Rizki'
  },
  {
    id: '2',
    type: 'whatsapp',
    title: 'WhatsApp Terkirim',
    description: 'Reminder pembayaran ke 3 orang tua',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: 'success'
  },
  {
    id: '3',
    type: 'expense',
    title: 'Pengeluaran Baru',
    description: 'Pembelian ATK untuk kelas',
    amount: 75000,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    status: 'pending'
  },
  {
    id: '4',
    type: 'payment',
    title: 'Pembayaran Diterima',
    description: 'Siti Nurhaliza - Kas Bulan Agustus',
    amount: 25000,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    status: 'success',
    studentName: 'Siti Nurhaliza'
  },
  {
    id: '5',
    type: 'reminder',
    title: 'Reminder Terjadwal',
    description: 'Reminder H-3 untuk 5 siswa',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    status: 'success'
  }
]

const RecentActivities: React.FC<RecentActivitiesProps> = ({
  activities = sampleActivities,
  limit = 5
}) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'payment':
        return CreditCard
      case 'expense':
        return Receipt
      case 'whatsapp':
        return MessageCircle
      case 'reminder':
        return Clock
      default:
        return CheckCircle
    }
  }

  const getActivityColor = (type: Activity['type'], status?: Activity['status']) => {
    if (status === 'failed') return 'text-red-600 bg-red-100'
    if (status === 'pending') return 'text-orange-600 bg-orange-100'
    
    switch (type) {
      case 'payment':
        return 'text-green-600 bg-green-100'
      case 'expense':
        return 'text-red-600 bg-red-100'
      case 'whatsapp':
        return 'text-blue-600 bg-blue-100'
      case 'reminder':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusBadge = (status?: Activity['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="success">Berhasil</Badge>
      case 'pending':
        return <Badge variant="warning">Menunggu</Badge>
      case 'failed':
        return <Badge variant="danger">Gagal</Badge>
      default:
        return null
    }
  }

  const displayedActivities = activities.slice(0, limit)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            {activities.length} aktivitas dalam 24 jam terakhir
          </p>
        </div>
        <Link href="/dashboard/activities">
          <Button variant="ghost" size="sm">
            Lihat Semua
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type)
            const colorClasses = getActivityColor(activity.type, activity.status)
            
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-full ${colorClasses}`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      {activity.amount && (
                        <span className={`text-xs font-medium ${
                          activity.type === 'payment' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {activity.type === 'payment' ? '+' : '-'}
                          {currencyUtils.format(activity.amount)}
                        </span>
                      )}
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {activity.description}
                  </p>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {dateUtils.getRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            )
          })}

          {displayedActivities.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Belum ada aktivitas</p>
            </div>
          )}
        </div>

        {activities.length > limit && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link href="/dashboard/activities">
              <Button variant="ghost" className="w-full">
                Lihat {activities.length - limit} aktivitas lainnya
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentActivities