'use client'

import { useState, useEffect } from 'react'

interface Ad {
  id: number
  name: string
  description: string
  ipfsCid: string
  funding: string
  remainingBudget: string
  views: number
  active: boolean
}

interface AdsListProps {
  account: string
}

export default function AdsList({ account }: AdsListProps) {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch ads from blockchain
    // For now, show empty state
    setLoading(false)
  }, [account])

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="text-center text-gray-500">Loading your ads...</div>
      </div>
    )
  }

  if (ads.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-black mb-2 font-pp-neue tracking-tight">No Ads Yet</h3>
          <p className="text-gray-600">
            Submit your first ad campaign to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-black mb-6 font-pp-neue tracking-tight">Your Ad Campaigns</h2>
      
      <div className="space-y-4">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-[#E6007A] transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-black mb-1 font-pp-neue tracking-tight">{ad.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{ad.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                ad.active 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-gray-200 text-gray-700 border border-gray-300'
              }`}>
                {ad.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Views</p>
                <p className="text-lg font-semibold text-black">{ad.views}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Budget</p>
                <p className="text-lg font-semibold text-black">{ad.funding}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Remaining</p>
                <p className="text-lg font-semibold text-black">{ad.remainingBudget}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>IPFS:</span>
              <code className="bg-white px-2 py-1 rounded font-mono border border-gray-200">
                {ad.ipfsCid.slice(0, 10)}...{ad.ipfsCid.slice(-6)}
              </code>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
