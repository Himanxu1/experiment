'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import StatCard from './StatCard'

interface AnalyticsProps {
  data: any
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

export default function Analytics({ data }: AnalyticsProps) {
  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data.statistics) return []

    const numericColumns = Object.keys(data.statistics).slice(0, 5)
    const maxLength = Math.max(
      ...numericColumns.map(col => data.statistics[col]?.data?.length || 0)
    )

    const result = []
    for (let i = 0; i < Math.min(maxLength, 20); i++) {
      const point: any = { index: i + 1 }
      numericColumns.forEach(col => {
        if (data.statistics[col]?.data?.[i] !== undefined) {
          point[col] = data.statistics[col].data[i]
        }
      })
      result.push(point)
    }

    return result
  }, [data])

  // Prepare pie chart data
  const pieData = useMemo(() => {
    if (!data.statistics) return []

    const numericColumns = Object.keys(data.statistics).slice(0, 6)
    return numericColumns.map(col => ({
      name: col,
      value: Math.abs(data.statistics[col]?.sum || 0),
    }))
  }, [data])

  // Get statistics cards
  const statsCards = useMemo(() => {
    if (!data.statistics) return []

    return Object.entries(data.statistics).slice(0, 4).map(([key, stats]: [string, any]) => ({
      title: key,
      stats: stats,
    }))
  }, [data])

  if (!data) {
    return <div>No data available</div>
  }

  return (
    <div className="space-y-6">
      {/* File Info */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">File Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Filename</p>
            <p className="font-semibold">{data.filename}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sheet</p>
            <p className="font-semibold">{data.sheetName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Rows</p>
            <p className="font-semibold">{data.dimensions?.rows}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Columns</p>
            <p className="font-semibold">{data.dimensions?.columns}</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {statsCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map(({ title, stats }) => (
            <StatCard key={title} title={title} stats={stats} />
          ))}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Bar Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(data.statistics).slice(0, 3).map((key, index) => (
                  <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Line Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Line Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(data.statistics).slice(0, 3).map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Area Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Area Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(data.statistics).slice(0, 3).map((key, index) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stackId="1"
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Distribution (Pie Chart)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Data Table Preview */}
      {data.sampleData && data.sampleData.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">Data Preview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {data.headers?.map((header: string, index: number) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.sampleData.slice(0, 10).map((row: any[], rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.map((cell: any, cellIndex: number) => (
                      <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cell !== undefined && cell !== null ? String(cell) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
