'use client'

import { useState, useEffect } from 'react'
import { getWsEndpoint } from '@/lib/blockchain'

export default function BlockchainStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      const { getApi } = await import('@/lib/blockchain')
      await getApi()
      setIsConnected(true)
    } catch (error) {
      setIsConnected(false)
    }
    setIsChecking(false)
  }

  if (isChecking) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-lg px-4 py-2">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm text-blue-300">Checking blockchain...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 backdrop-blur-sm border rounded-lg px-4 py-3 ${
      isConnected 
        ? 'bg-green-500/20 border-green-500/30' 
        : 'bg-yellow-500/20 border-yellow-500/30'
    }`}>
      <div className="flex items-center justify-between space-x-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          <div>
            <p className={`text-sm font-medium ${
              isConnected ? 'text-green-300' : 'text-yellow-300'
            }`}>
              {isConnected ? 'Blockchain Connected' : 'Blockchain Offline'}
            </p>
            <p className="text-xs text-white/70">Endpoint: {getWsEndpoint()}</p>
            {!isConnected && (
              <p className="text-xs text-yellow-200">
                Start your node to enable transactions
              </p>
            )}
          </div>
        </div>
        <button
          onClick={checkConnection}
          className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
