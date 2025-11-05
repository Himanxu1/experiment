'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import Analytics from '@/components/Analytics'

export default function Home() {
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalysisComplete = (data: any) => {
    setAnalysisData(data)
    setIsAnalyzing(false)
  }

  const handleAnalysisStart = () => {
    setIsAnalyzing(true)
    setAnalysisData(null)
  }

  const handleReset = () => {
    setAnalysisData(null)
    setIsAnalyzing(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Excel Analytics Platform
          </h1>
          <p className="text-gray-600 text-lg">
            Upload your Excel file and get beautiful charts, infographics, and analytics instantly
          </p>
        </div>

        {/* File Upload Section */}
        {!analysisData && !isAnalyzing && (
          <FileUpload
            onAnalysisComplete={handleAnalysisComplete}
            onAnalysisStart={handleAnalysisStart}
          />
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Analyzing your data with e2b sandbox...</p>
            <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
          </div>
        )}

        {/* Analytics Dashboard */}
        {analysisData && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Upload New File
              </button>
            </div>
            <Analytics data={analysisData} />
          </div>
        )}
      </div>
    </main>
  )
}
