'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import WalletConnect from '@/components/WalletConnect'
import TransactionModule from '@/components/TransactionModule'

export default function TransactionsPage() {
  const [account, setAccount] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* PolkaAds Logo */}
              <div className="flex items-center">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Megaphone triangle */}
                  <path d="M10 12L28 20L10 28V12Z" fill="#E6007A"/>
                  {/* Sound waves */}
                  <circle cx="32" cy="16" r="1.5" fill="#E6007A"/>
                  <circle cx="35" cy="20" r="1.5" fill="#E6007A"/>
                  <circle cx="32" cy="24" r="1.5" fill="#E6007A"/>
                </svg>
                <div className="ml-2">
                  <h1 className="text-2xl font-bold">
                    <span className="text-black">Polka</span>
                    <span className="text-[#E6007A]">Ads</span>
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <WalletConnect account={account} setAccount={setAccount} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        {!account ? (
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">
                Send Sponsored Transactions
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Connect your wallet to send transactions with potentially sponsored fees through PolkaAds.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-[#E6007A] rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Connect Your Wallet</h3>
              <p className="text-gray-600 mb-6">
                Use Polkadot.js extension or SubWallet to connect and start sending transactions.
              </p>
              <WalletConnect account={account} setAccount={setAccount} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#E6007A] rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-semibold text-black mb-2">Connect Wallet</h4>
                <p className="text-gray-600 text-sm">Link your Polkadot/Substrate account</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#E6007A] rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-semibold text-black mb-2">Watch Ad (Optional)</h4>
                <p className="text-gray-600 text-sm">View sponsored ads for fee discounts</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#E6007A] rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-semibold text-black mb-2">Send Transaction</h4>
                <p className="text-gray-600 text-sm">Complete your transaction instantly</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Send Transaction
              </h2>
              <p className="text-lg text-gray-600">
                Send tokens with potentially sponsored transaction fees through PolkaAds.
              </p>
            </div>

            <TransactionModule
              account={account}
              isRegistered={isRegistered}
              setIsRegistered={setIsRegistered}
            />

            {/* Transaction History Placeholder */}
            <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Recent Transactions</h3>
              <div className="text-center text-gray-500 py-8">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <p>No transactions yet</p>
                <p className="text-sm mt-1">Your transaction history will appear here</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
