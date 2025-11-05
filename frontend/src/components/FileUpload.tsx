'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'

interface FileUploadProps {
  onAnalysisComplete: (data: any) => void
  onAnalysisStart: () => void
}

export default function FileUpload({ onAnalysisComplete, onAnalysisStart }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setError(null)
    onAnalysisStart()

    const formData = new FormData()
    formData.append('file', file)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await axios.post(`${apiUrl}/api/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      onAnalysisComplete(response.data)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.response?.data?.message || 'Failed to analyze file. Please try again.')
      onAnalysisComplete(null)
    }
  }, [onAnalysisComplete, onAnalysisStart])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragActive
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center">
          {/* Icon */}
          <svg
            className={`w-20 h-20 mb-4 transition-colors ${
              isDragActive ? 'text-blue-500' : 'text-gray-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          {/* Text */}
          {isDragActive ? (
            <p className="text-xl font-semibold text-blue-600">Drop your Excel file here</p>
          ) : (
            <>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Drag & drop your Excel file here
              </p>
              <p className="text-gray-500 mb-4">or click to browse</p>
              <p className="text-sm text-gray-400">
                Supports .xlsx, .xls, and .csv files (max 10MB)
              </p>
            </>
          )}

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-6 text-left">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white">
                  📊
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Auto Charts</p>
                <p className="text-xs text-gray-500">Multiple chart types</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-500 text-white">
                  🔒
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Secure</p>
                <p className="text-xs text-gray-500">e2b sandboxed</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-500 text-white">
                  ⚡
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Fast</p>
                <p className="text-xs text-gray-500">Instant insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
