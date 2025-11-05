'use client'

interface StatCardProps {
  title: string
  stats: {
    count: number
    sum: number
    mean: number
    median: number
    min: number
    max: number
  }
}

export default function StatCard({ title, stats }: StatCardProps) {
  const formatNumber = (num: number) => {
    if (Number.isInteger(num)) {
      return num.toLocaleString()
    }
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-lg p-6 border border-blue-100">
      <h4 className="text-lg font-semibold text-gray-800 mb-4 truncate">{title}</h4>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Count:</span>
          <span className="font-semibold text-gray-900">{stats.count}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Mean:</span>
          <span className="font-semibold text-blue-600">{formatNumber(stats.mean)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Median:</span>
          <span className="font-semibold text-purple-600">{formatNumber(stats.median)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Min:</span>
          <span className="font-semibold text-green-600">{formatNumber(stats.min)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Max:</span>
          <span className="font-semibold text-red-600">{formatNumber(stats.max)}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-sm text-gray-600">Sum:</span>
          <span className="font-semibold text-gray-900">{formatNumber(stats.sum)}</span>
        </div>
      </div>
    </div>
  )
}
