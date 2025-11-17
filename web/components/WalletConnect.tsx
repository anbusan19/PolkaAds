'use client'

import { useState, useEffect } from 'react'

interface WalletConnectProps {
  account: string | null
  setAccount: (account: string | null) => void
}

export default function WalletConnect({ account, setAccount }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      // Check if Polkadot extension is installed
      const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp')
      
      const extensions = await web3Enable('PolkaAds Dashboard')
      
      if (extensions.length === 0) {
        alert('Please install Polkadot.js extension')
        setIsConnecting(false)
        return
      }

      const accounts = await web3Accounts()
      
      if (accounts.length > 0) {
        setAccount(accounts[0].address)
      } else {
        alert('No accounts found. Please create an account in Polkadot.js extension')
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('Failed to connect wallet')
    }
    setIsConnecting(false)
  }

  const disconnectWallet = () => {
    setAccount(null)
  }

  if (account) {
    return (
      <div className="flex items-center space-x-3">
        <div className="bg-gray-50 rounded-md px-4 py-2 border border-gray-200">
          <p className="text-xs text-gray-500">Connected</p>
          <p className="text-sm text-black font-mono">
            {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        </div>
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 bg-white hover:bg-gray-50 text-black rounded-md transition-colors border border-gray-300"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="px-6 py-2 bg黑 hover:bg-gray-800 text-white font-medium rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isConnecting ? 'Connecting...' : 'LOG IN'}
    </button>
  )
}
