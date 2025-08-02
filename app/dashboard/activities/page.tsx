'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { activityService, Activity } from '@/lib/activity-service'
import { 
  CreditCard, 
  Receipt, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Filter,
  Calendar
} from 'lucide-react'
import { currencyUtils, dateUtils } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'payment' | 'expense' | 'whatsapp'>('all')
  const [dateRange, setDateRange] = useState('24h')

  const loadActivities = async () => {
    try {
      setLoading(true)
      // For now, we'll load more activities
      const fetchedActivities = await activityService.getRecentActivities(50)
      setActivities(fetchedActivities)
    } catch (error) {
      console.error('Error loading activities:', error)
      toast.error('Gagal memuat aktivitas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivities()
  }, [])

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

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aktivitas</h1>
            <p className="text-gray-600 mt-1">
              Riwayat semua aktivitas kas kelas
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadActivities}
            loading={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={filter === 'all' ? 'primary' : 'outline'}
                    onClick={() => setFilter('all')}
                  >
                    Semua
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'payment' ? 'primary' : 'outline'}
                    onClick={() => setFilter('payment')}
                  >
                    Pembayaran
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'expense' ? 'primary' : 'outline'}
                    onClick={() => setFilter('expense')}
                  >
                    Pengeluaran
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'whatsapp' ? 'primary' : 'outline'}
                    onClick={() => setFilter('whatsapp')}
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="24h">24 Jam Terakhir</option>
                  <option value="7d">7 Hari Terakhir</option>
                  <option value="30d">30 Hari Terakhir</option>
                  <option value="all">Semua</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredActivities.length} Aktivitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Memuat aktivitas...</p>
              </div>
            ) : filteredActivities.length > 0 ? (
              <div className="space-y-4">
                {filteredActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type)
                  const colorClasses = getActivityColor(activity.type, activity.status)
                  
                  return (
                    <div 
                      key={activity.id} 
                      className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className={`p-2 rounded-full ${colorClasses}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {activity.description}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {activity.amount && (
                              <span className={`text-sm font-medium ${
                                activity.type === 'payment' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {activity.type === 'payment' ? '+' : '-'}
                                {currencyUtils.format(activity.amount)}
                              </span>
                            )}
                            {getStatusBadge(activity.status)}
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-2">
                          {dateUtils.getRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Tidak ada aktivitas ditemukan</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}