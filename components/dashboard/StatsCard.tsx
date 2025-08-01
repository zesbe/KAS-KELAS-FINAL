'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  className?: string
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple'
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  color = 'blue'
}) => {
  const colorStyles = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      icon: 'text-blue-600',
      trend: 'text-blue-600'
    },
    green: {
      bg: 'from-green-500 to-green-600',
      icon: 'text-green-600',
      trend: 'text-green-600'
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      icon: 'text-orange-600',
      trend: 'text-orange-600'
    },
    red: {
      bg: 'from-red-500 to-red-600',
      icon: 'text-red-600',
      trend: 'text-red-600'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      icon: 'text-purple-600',
      trend: 'text-purple-600'
    }
  }

  const styles = colorStyles[color]

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}% {trend.label}
                </span>
              </div>
            )}
          </div>
          
          <div className={cn('p-3 rounded-full bg-gradient-to-r', styles.bg)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default StatsCard