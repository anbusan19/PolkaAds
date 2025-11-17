'use client'

import { useState } from 'react'
import Image from 'next/image'
import WalletConnect from '@/components/WalletConnect'
import AdSubmissionForm from '@/components/AdSubmissionForm'
import AdsList from '@/components/AdsList'


export default function Home() {
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
          <div className="max-w-5xl mx-auto">
            {/* Hero Section */}
            <div className="text-left mb-16">
              <div className="inline-block mb-6">
                <span className="text-sm font-medium text-gray-600 tracking-wide">● VISION</span>
              </div>
              <h2 className="text-6xl md:text-7xl font-bold text-black mb-8 leading-tight">
                Decentralized Ad<br />Platform
              </h2>
              <p className="text-xl text-gray-600 mb-6 max-w-2xl">
                The only advertising platform that works everywhere you do.
              </p>
              <p className="text-lg text-gray-500 mb-12 max-w-2xl">
                From blockchain to Web3 - manage complete ad campaigns with gasless transactions, 
                real-time analytics, and decentralized control without changing your tools, models, or workflow.
              </p>
              
              <div className="flex items-center space-x-4">
                <button className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium">
                  MACOS / LINUX
                </button>
                <button className="px-6 py-3 border border-gray-300 text-black rounded-md hover:bg-gray-50 transition-colors font-medium">
                  WINDOWS
                </button>
              </div>

              {/* Terminal-like code block */}
              <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-xl">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <code className="text-sm text-gray-700 font-mono">
                  <span className="text-gray-500">&gt;</span> curl -fsSL https://app.polkaads.ai/cli | sh
                </code>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
              <div>
                <div className="text-[#E6007A] mb-3">✓</div>
                <h3 className="font-semibold text-black mb-2">Decentralized ad management</h3>
                <p className="text-gray-600 text-sm">Full control over your campaigns on the blockchain</p>
              </div>
              <div>
                <div className="text-[#E6007A] mb-3">✓</div>
                <h3 className="font-semibold text-black mb-2">Gasless transactions for users</h3>
                <p className="text-gray-600 text-sm">Fee sponsorship for seamless user experience</p>
              </div>
              <div>
                <div className="text-[#E6007A] mb-3">✓</div>
                <h3 className="font-semibold text-black mb-2">Real-time analytics</h3>
                <p className="text-gray-600 text-sm">Track impressions and engagement instantly</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Ad Submission */}
            <div className="lg:col-span-2">
              <AdSubmissionForm account={account} isRegistered={isRegistered} setIsRegistered={setIsRegistered} />
            </div>

            {/* Right Column - Stats & Ads List */}
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Your Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Ads</span>
                    <span className="text-2xl font-bold text-black">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Views</span>
                    <span className="text-2xl font-bold text-black">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="text-2xl font-bold text-black">0</span>
                  </div>
                </div>
              </div>

              {/* Registration Status */}
              <div className={`rounded-lg p-4 border ${
                isRegistered 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isRegistered ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-sm text-black font-medium">
                    {isRegistered ? 'Registered Advertiser' : 'Not Registered'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ads List */}
        {account && (
          <div className="mt-8">
            <AdsList account={account} />
          </div>
        )}
      </div>
    </main>
  )
}
