'use client'

import { useState, useRef } from 'react'
import { uploadToIPFS, isValidVideoFile, formatFileSize, isValidCID } from '@/lib/ipfs'

interface VideoUploadProps {
  onUploadComplete: (cid: string) => void
  onError?: (error: string) => void
  existingCid?: string
}

export default function VideoUpload({ onUploadComplete, onError, existingCid }: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [cid, setCid] = useState(existingCid || '')
  const [manualCid, setManualCid] = useState('')
  const [useManualCid, setUseManualCid] = useState(!!existingCid)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!isValidVideoFile(selectedFile)) {
      onError?.('Please select a valid video file (MP4, WebM, OGG, MOV, AVI)')
      return
    }

    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (selectedFile.size > maxSize) {
      onError?.(`File size exceeds 100MB limit. Your file is ${formatFileSize(selectedFile.size)}`)
      return
    }

    setFile(selectedFile)
    setUseManualCid(false)
    setCid('')
  }

  const handleUpload = async () => {
    if (!file) {
      onError?.('Please select a video file')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress (in real implementation, track actual upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const uploadedCid = await uploadToIPFS(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      setCid(uploadedCid)
      onUploadComplete(uploadedCid)
    } catch (error: any) {
      console.error('Upload error:', error)
      onError?.(error.message || 'Failed to upload video to IPFS')
    } finally {
      setUploading(false)
    }
  }

  const handleManualCid = () => {
    if (!manualCid.trim()) {
      onError?.('Please enter a valid IPFS CID')
      return
    }

    if (!isValidCID(manualCid.trim())) {
      onError?.('Invalid CID format. CID should start with Qm (v0) or bafy (v1)')
      return
    }

    setCid(manualCid.trim())
    setUseManualCid(true)
    onUploadComplete(manualCid.trim())
  }

  const handleClear = () => {
    setFile(null)
    setCid('')
    setManualCid('')
    setUseManualCid(false)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* File Upload Section */}
      {!useManualCid && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Video File
          </label>
          <div className="flex items-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className={`flex-1 px-4 py-3 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                uploading
                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                  : 'border-gray-300 hover:border-[#E6007A] hover:bg-pink-50'
              }`}
            >
              <div className="text-center">
                {file ? (
                  <div>
                    <p className="text-sm font-medium text-black">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600">Click to select video file</p>
                    <p className="text-xs text-gray-400 mt-1">MP4, WebM, OGG, MOV, AVI (max 100MB)</p>
                  </div>
                )}
              </div>
            </label>
            {file && !uploading && (
              <button
                onClick={handleUpload}
                className="px-6 py-3 bg-[#E6007A] hover:bg-[#c00066] text-white font-semibold rounded-md transition-colors"
              >
                Upload to IPFS
              </button>
            )}
            {file && (
              <button
                onClick={handleClear}
                disabled={uploading}
                className="px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md transition-colors disabled:opacity-50"
              >
                Clear
              </button>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Uploading to IPFS...</span>
                <span className="text-xs text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#E6007A] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* CID Display */}
          {cid && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-xs text-green-800 mb-1">Upload successful!</p>
              <div className="flex items-center space-x-2">
                <code className="text-xs text-green-900 font-mono bg-white px-2 py-1 rounded border border-green-300">
                  {cid}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(cid)}
                  className="text-xs text-green-700 hover:text-green-900"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual CID Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Or Enter IPFS CID Manually
          </label>
          {useManualCid && (
            <button
              onClick={() => {
                setUseManualCid(false)
                setManualCid('')
                setCid('')
              }}
              className="text-xs text-[#E6007A] hover:underline"
            >
              Switch to Upload
            </button>
          )}
        </div>
        {!useManualCid && (
          <button
            onClick={() => setUseManualCid(true)}
            className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            I already have an IPFS CID
          </button>
        )}
        {useManualCid && (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={manualCid}
              onChange={(e) => setManualCid(e.target.value)}
              placeholder="QmX... or bafy..."
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E6007A] focus:border-transparent"
            />
            <button
              onClick={handleManualCid}
              className="px-6 py-3 bg-[#E6007A] hover:bg-[#c00066] text-white font-semibold rounded-md transition-colors"
            >
              Use CID
            </button>
          </div>
        )}
        {useManualCid && cid && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800">Using CID: <code className="font-mono">{cid}</code></p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> Videos are stored on IPFS (InterPlanetary File System) for decentralized storage.
          You can use services like Pinata, web3.storage, or Crust Network for reliable pinning.
        </p>
      </div>
    </div>
  )
}

