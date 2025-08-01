'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface PaymentChartProps {
  data?: any[]
  type?: 'bar' | 'pie'
  title: string
  description?: string
}

// Sample data for development
const sampleBarData = [
  { month: 'Jan', pemasukan: 2500000, pengeluaran: 400000 },
  { month: 'Feb', pemasukan: 2600000, pengeluaran: 450000 },
  { month: 'Mar', pemasukan: 2700000, pengeluaran: 380000 },
  { month: 'Apr', pemasukan: 2550000, pengeluaran: 420000 },
  { month: 'Mei', pemasukan: 2800000, pengeluaran: 390000 },
  { month: 'Jun', pemasukan: 2750000, pengeluaran: 460000 }
]

const samplePieData = [
  { name: 'Lunas', value: 22, color: '#10B981' },
  { name: 'Belum Bayar', value: 3, color: '#F59E0B' },
  { name: 'Terlambat', value: 1, color: '#EF4444' }
]

const PaymentChart: React.FC<PaymentChartProps> = ({
  data,
  type = 'bar',
  title,
  description
}) => {
  const chartData = data || (type === 'bar' ? sampleBarData : samplePieData)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">
            {data.name}: {data.value} siswa
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="pemasukan" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]}
                  name="Pemasukan"
                />
                <Bar 
                  dataKey="pengeluaran" 
                  fill="#EF4444" 
                  radius={[4, 4, 0, 0]}
                  name="Pengeluaran"
                />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        {type === 'pie' && (
          <div className="flex justify-center mt-4">
            <div className="flex flex-wrap gap-4">
              {chartData.map((entry: any, index: number) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PaymentChart