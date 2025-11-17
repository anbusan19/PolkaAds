'use client'

import { useState } from 'react'
import Image from 'next/image'
import TransactionModule from '@/components/TransactionModule'

export default function TransactionPage() {
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">
              Send Transaction
            </h2>
            <p className="text-xl text-gray-600 mb-4">
              Experience gasless transactions with sponsored fees
            </p>
            <p className="text-lg text-gray-500">
              Watch a quick ad to have your transaction fees covered
            </p>
          </div>

          <TransactionModule />
        </div>
      </div>
    </main>
  )
}

