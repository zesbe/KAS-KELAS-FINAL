import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center rounded-full font-medium'
    
    const variants = {
      default: 'bg-gray-100 text-gray-800',
      primary: 'bg-blue-100 text-blue-800',
      secondary: 'bg-gray-100 text-gray-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800'
    }
    
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm'
    }

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

// Status badge for payments
interface StatusBadgeProps {
  status: 'pending' | 'completed' | 'failed' | 'expired' | 'overdue'
  className?: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const statusConfig = {
    pending: { variant: 'warning' as const, text: 'Menunggu', icon: '⏳' },
    completed: { variant: 'success' as const, text: 'Lunas', icon: '✅' },
    failed: { variant: 'danger' as const, text: 'Gagal', icon: '❌' },
    expired: { variant: 'secondary' as const, text: 'Kedaluwarsa', icon: '⏰' },
    overdue: { variant: 'danger' as const, text: 'Terlambat', icon: '🚨' }
  }
  
  const config = statusConfig[status]
  
  return (
    <Badge variant={config.variant} className={className}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </Badge>
  )
}

export { Badge, StatusBadge }
export type { BadgeProps, StatusBadgeProps }