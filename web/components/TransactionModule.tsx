'use client'

import { useState, useEffect } from 'react'
import { getApi, getRandomAd } from '@/lib/blockchain'
import { getAdVideoUrl } from '@/lib/blockchain'

interface TransactionData {
  recipient: string
  amount: string
  memo?: string
}

interface AdData {
  adId: number
  name: string
  description: string
  videoUrl: string
  advertiser: string
  remainingBudget: string
}

export default function TransactionModule() {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [formData, setFormData] = useState<TransactionData>({
    recipient: '',
    amount: '',
    memo: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentAd, setCurrentAd] = useState<AdData | null>(null)
  const [showAd, setShowAd] = useState(false)
  const [adCompleted, setAdCompleted] = useState(false)
  const [viewStartTime, setViewStartTime] = useState<number>(0)
  const [viewDuration, setViewDuration] = useState(0)
  const [sponsorshipRequested, setSponsorshipRequested] = useState(false)

  // Check wallet connection on mount
  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    try {
      const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp')

      const extensions = await web3Enable('PolkaAds Transaction')
      if (extensions.length === 0) {
        console.warn('Polkadot extension not found')
        return
      }

      const accounts = await web3Accounts()
      if (accounts.length > 0) {
        setAccount(accounts[0].address)
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  const connectWallet = async () => {
    try {
      const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp')

      const extensions = await web3Enable('PolkaAds Transaction')
      if (extensions.length === 0) {
        alert('Please install Polkadot.js extension')
        return
      }

      const accounts = await web3Accounts()
      if (accounts.length > 0) {
        setAccount(accounts[0].address)
        setIsConnected(true)
      } else {
        alert('No accounts found. Please create an account in Polkadot.js extension')
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('Failed to connect wallet')
    }
  }

  const handleSendTransaction = async () => {
    if (!account) {
      alert('Please connect your wallet first')
      return
    }

    if (!formData.recipient || !formData.amount) {
      alert('Please fill in recipient and amount')
      return
    }

    // Validate amount
    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setIsSubmitting(true)

    try {
      // Trigger SubWallet snap for ad display
      await triggerSnapForTransaction()

      // If ad is completed, proceed with transaction
      if (adCompleted) {
        await executeSponsoredTransaction()
      }
    } catch (error) {
      console.error('Transaction error:', error)
      alert('Transaction failed. See console for details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const triggerSnapForTransaction = async () => {
    try {
      // Fetch a random ad from the blockchain
      console.log('Fetching random ad from blockchain...')
      
      const randomAd = await getRandomAd()
      
      if (!randomAd) {
        alert('No active ads available at the moment. Transaction will proceed without sponsorship.')
        // Proceed with transaction without ad
        await executeSponsoredTransaction()
        return
      }

      console.log('Random ad selected:', randomAd)

      const adData: AdData = {
        adId: randomAd.adId,
        name: randomAd.name,
        description: randomAd.description,
        videoUrl: randomAd.videoUrl,
        advertiser: randomAd.advertiser,
        remainingBudget: randomAd.remainingBudget,
      }

      setCurrentAd(adData)
      setShowAd(true)
      setViewStartTime(Date.now())

    } catch (error) {
      console.error('Error fetching ad:', error)
      alert('Failed to fetch ad. Transaction will proceed without sponsorship.')
      // Proceed with transaction without ad
      await executeSponsoredTransaction()
    }
  }

  const executeSponsoredTransaction = async () => {
    try {
      const api = await getApi()
      const { web3FromAddress } = await import('@polkadot/extension-dapp')
      const injector = await web3FromAddress(account!)

      // Convert amount to proper units (assuming 9 decimals)
      const amount = BigInt(formData.amount) * BigInt(10 ** 9)

      console.log('Executing sponsored transaction...')

      // Execute the transfer transaction
      await new Promise((resolve, reject) => {
        api.tx.balances
          .transfer(formData.recipient, amount)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .signAndSend(account!, { signer: injector.signer }, ({ status, events }: any) => {
            if (status.isInBlock) {
              console.log(`Transaction included in block ${status.asInBlock}`)
            }

            if (status.isFinalized) {
              console.log(`Transaction finalized in block ${status.asFinalized}`)

              // Check for errors
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              events.forEach(({ event }: any) => {
                if (api.events.system.ExtrinsicFailed.is(event)) {
                  reject(new Error('Transaction failed'))
                }
              })

              resolve(status.asFinalized)
            }
          })
          .catch(reject)
      })

      alert('Transaction completed successfully! Fees were sponsored.')

      // Reset form
      setFormData({ recipient: '', amount: '', memo: '' })
      setCurrentAd(null)
      setShowAd(false)
      setAdCompleted(false)
      setSponsorshipRequested(false)

    } catch (error) {
      console.error('Transaction execution error:', error)
      throw error
    }
  }

  const handleAdComplete = () => {
    setAdCompleted(true)
    setViewDuration(Date.now() - viewStartTime)
  }

  const handleSkipAd = () => {
    setShowAd(false)
    setCurrentAd(null)
    alert('Ad skipped. Transaction will not be sponsored.')
  }

  if (showAd && currentAd) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-black mb-2">Sponsored Transaction</h3>
          <p className="text-gray-600">Watch this ad to get your transaction fees covered</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="mb-4">
            <h4 className="font-semibold text-black mb-2">{currentAd.name}</h4>
            <p className="text-gray-600 text-sm mb-4">{currentAd.description}</p>
            <p className="text-xs text-gray-500">Advertiser: {currentAd.advertiser}</p>
          </div>

          <div className="bg-black rounded-lg overflow-hidden mb-4">
            <video
              src={currentAd.videoUrl}
              controls
              autoPlay
              muted
              className="w-full h-48 object-contain"
              onEnded={() => handleAdComplete()}
            />
          </div>

          <div className="text-center">
            {adCompleted ? (
              <div className="text-green-600 font-medium">
                ✓ Ad completed! Your transaction fees will be sponsored.
              </div>
            ) : (
              <div className="text-gray-600">
                Watch the ad to continue with sponsored fees
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleAdComplete}
            disabled={!adCompleted}
            className="flex-1 px-6 py-3 bg-[#E6007A] hover:bg-[#c00066] disabled:bg-gray-400 text-white font-semibold rounded-md transition-colors disabled:cursor-not-allowed"
          >
            {adCompleted ? 'Continue with Sponsored Transaction' : 'Watching Ad...'}
          </button>
          <button
            onClick={handleSkipAd}
            className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md transition-colors"
          >
            Skip (Pay Fees)
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-black mb-2 font-pp-neue tracking-tight">Send Transaction</h3>
        <p className="text-gray-600">
          Fill in the details below. When you send, you'll have the option to watch an ad for sponsored fees.
        </p>
      </div>

      {/* Wallet Connection */}
      {!isConnected && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 mb-3">Connect your wallet to send transactions</p>
          <button
            onClick={connectWallet}
            className="px-6 py-2 bg-black hover:bg-gray-800 text-white font-semibold rounded-md transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {isConnected && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 font-medium">Wallet Connected</p>
              <p className="text-green-700 text-sm font-mono">
                {account!.slice(0, 6)}...{account!.slice(-4)}
              </p>
            </div>
            <button
              onClick={() => {
                setAccount(null)
                setIsConnected(false)
              }}
              className="px-4 py-2 border border-green-300 hover:bg-green-100 text-green-700 rounded-md transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Transaction Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendTransaction(); }} className="space-y-6">
        {/* Recipient */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={formData.recipient}
            onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
            placeholder="5ABC...XYZ"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E6007A] focus:border-transparent"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (in tokens)
          </label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="100"
            min="0.000000001"
            step="0.000000001"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E6007A] focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum: 0.000000001 tokens
          </p>
        </div>

        {/* Memo (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Memo (Optional)
          </label>
          <input
            type="text"
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            placeholder="Payment for services..."
            maxLength={128}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E6007A] focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isConnected}
          className="w-full px-6 py-4 bg-[#E6007A] hover:bg-[#c00066] disabled:bg-gray-400 text-white font-bold rounded-md transition-all disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Processing...' : 'Send Transaction (with Ad Option)'}
        </button>
      </form>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Fill in transaction details</li>
          <li>2. Click "Send Transaction"</li>
          <li>3. Watch a quick ad to get sponsored fees</li>
          <li>4. Your transaction executes without paying fees</li>
        </ol>
      </div>
    </div>
  )
}
