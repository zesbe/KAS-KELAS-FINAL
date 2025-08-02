'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  ArrowRight,
  RefreshCw
} from 'lucide-react'
import { currencyUtils, dateUtils } from '@/lib/utils'
import { activityService, Activity } from '@/lib/activity-service'
import toast from 'react-hot-toast'

interface RecentActivitiesProps {
  limit?: number
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({
  limit = 5
}) => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [activityCount, setActivityCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadActivities = async () => {
    try {
      setLoading(true)
      const [fetchedActivities, count] = await Promise.all([
        activityService.getRecentActivities(limit),
        activityService.getActivityCount()
      ])
      setActivities(fetchedActivities)
      setActivityCount(count)
    } catch (error) {
      console.error('Error loading activities:', error)
      toast.error('Gagal memuat aktivitas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivities()
  }, [limit])

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

  const handleViewAll = () => {
    // Navigate to activities page
    router.push('/dashboard/activities')
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            {activityCount} aktivitas dalam 24 jam terakhir
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadActivities}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleViewAll}
          >
            Lihat Semua
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Memuat aktivitas...</p>
            </div>
          ) : activities.length > 0 ? (
            activities.map((activity) => {
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
            })
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Belum ada aktivitas</p>
            </div>
          )}
        </div>

        {activities.length > 0 && activityCount > limit && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={handleViewAll}
            >
              Lihat {activityCount - limit} aktivitas lainnya
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentActivities