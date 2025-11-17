'use client'

import { useState, useEffect } from 'react'
import VideoUpload from './VideoUpload'

interface AdSubmissionFormProps {
  account: string
  isRegistered: boolean
  setIsRegistered: (registered: boolean) => void
}

export default function AdSubmissionForm({ account, isRegistered, setIsRegistered }: AdSubmissionFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ipfsCid: '',
    funding: '',
    spotId: '0'
  })
  const [registrationData, setRegistrationData] = useState({
    advertiserName: '',
    depositAmount: '100000000' // Default to minimum deposit (0.1 token with 9 decimals)
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  
  // Check registration status on mount
  useEffect(() => {
    async function checkRegistration() {
      try {
        const { checkAdvertiserRegistration } = await import('@/lib/blockchain')
        const registered = await checkAdvertiserRegistration(account)
        setIsRegistered(registered)
      } catch (error) {
        console.error('Error checking registration:', error)
      }
    }
    
    if (account) {
      checkRegistration()
    }
  }, [account])

  const handleRegister = async () => {
    // Validate registration data
    if (!registrationData.advertiserName.trim()) {
      alert('Please enter an advertiser name')
      return
    }

    if (registrationData.advertiserName.length > 50) {
      alert('Advertiser name must be 50 characters or less')
      return
    }

    const deposit = BigInt(registrationData.depositAmount)
    const minDeposit = BigInt('100000000') // Minimum deposit from runtime config
    
    if (deposit < minDeposit) {
      alert(`Deposit amount must be at least ${minDeposit} (0.1 token)`)
      return
    }

    setIsRegistering(true)
    try {
      const { registerAdvertiser } = await import('@/lib/blockchain')
      await registerAdvertiser(
        account,
        registrationData.advertiserName,
        registrationData.depositAmount
      )
      setIsRegistered(true)
      alert('Successfully registered as advertiser!')
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = error?.message || 'Unknown error'
      
      // Check for common connection errors
      if (errorMessage.includes('WebSocket') || errorMessage.includes('connection') || errorMessage.includes('disconnected')) {
        alert('Cannot connect to blockchain node.\n\nTo fix this:\n1. Run: .\\setup-node.ps1 (Windows) or see START_NODE.md\n2. Wait for node to start (10-20 min build time)\n3. Node should show "Listening on 127.0.0.1:9944"\n4. Then try registering again\n\nSee START_NODE.md for detailed instructions.')
      } else if (errorMessage.includes('Blockchain connection disabled')) {
        alert('Blockchain connection is disabled. Set NEXT_PUBLIC_ENABLE_BLOCKCHAIN=true to enable.')
      } else {
        alert(`Failed to register: ${errorMessage}\n\nSee console for details.`)
      }
    }
    setIsRegistering(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isRegistered) {
      alert('Please register as an advertiser first')
      return
    }

    setIsSubmitting(true)
    try {
      const { submitAd } = await import('@/lib/blockchain')
      await submitAd(
        account,
        parseInt(formData.spotId),
        formData.name,
        formData.description,
        formData.ipfsCid,
        formData.funding
      )
      
      alert('Ad submitted successfully!')
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        ipfsCid: '',
        funding: '',
        spotId: '0'
      })
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit ad. See console for details.')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-black mb-6 font-pp-neue tracking-tight">Submit New Ad</h2>
      
      {!isRegistered && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">Register as Advertiser</h3>
          <p className="text-yellow-800 mb-4">
            You need to register as an advertiser before submitting ads. A minimum deposit of 100,000,000 units (0.1 token) is required.
          </p>
          
          <div className="space-y-4">
            {/* Advertiser Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advertiser Name
              </label>
              <input
                type="text"
                value={registrationData.advertiserName}
                onChange={(e) => setRegistrationData({ ...registrationData, advertiserName: e.target.value })}
                placeholder="e.g., MyCompany Ads"
                maxLength={50}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E6007A] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {registrationData.advertiserName.length}/50 characters
              </p>
            </div>

            {/* Deposit Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Amount
              </label>
              <input
                type="number"
                value={registrationData.depositAmount}
                onChange={(e) => setRegistrationData({ ...registrationData, depositAmount: e.target.value })}
                placeholder="100000000"
                min="100000000"
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E6007A] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum: 100,000,000 units (0.1 token). This deposit will be reserved and can be withdrawn when you deregister.
              </p>
            </div>

            <button
              onClick={handleRegister}
              disabled={isRegistering || !registrationData.advertiserName.trim()}
              className="w-full px-4 py-2 bg-[#E6007A] hover:bg-[#c00066] text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegistering ? 'Registering...' : 'Register as Advertiser'}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ad Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ad Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., DeFi Protocol Launch"
            maxLength={100}
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E6007A] focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.name.length}/100 characters</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your ad campaign..."
            maxLength={500}
            rows={4}
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E6007A] focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
        </div>

        {/* Video Upload / IPFS CID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video (IPFS)
          </label>
          <VideoUpload
            onUploadComplete={(cid) => {
              setFormData({ ...formData, ipfsCid: cid })
            }}
            onError={(error) => {
              alert(error)
            }}
            existingCid={formData.ipfsCid}
          />
        </div>

        {/* Funding Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Funding Amount
          </label>
          <input
            type="number"
            value={formData.funding}
            onChange={(e) => setFormData({ ...formData, funding: e.target.value })}
            placeholder="1000000"
            min="1000000"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E6007A] focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum: 1,000,000 units (used to sponsor user transactions)
          </p>
        </div>

        {/* Ad Spot ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ad Spot ID
          </label>
          <input
            type="number"
            value={formData.spotId}
            onChange={(e) => setFormData({ ...formData, spotId: e.target.value })}
            placeholder="0"
            min="0"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E6007A] focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Select an available ad spot (contact admin for available spots)
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isRegistered}
          className="w-full px-6 py-4 bg-[#E6007A] hover:bg-[#c00066] text-white font-bold rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Ad Campaign'}
        </button>
      </form>
    </div>
  )
}
