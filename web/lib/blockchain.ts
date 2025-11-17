const WS_ENDPOINT = process.env.NEXT_PUBLIC_WS_ENDPOINT || 'ws://127.0.0.1:9944'
// Set to false to disable blockchain connection (for UI testing without a node)
const ENABLE_BLOCKCHAIN = process.env.NEXT_PUBLIC_ENABLE_BLOCKCHAIN !== 'false'
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1500

let api: any = null

async function connectOnce() {
  const { ApiPromise, WsProvider } = await import('@polkadot/api')
  const provider = new WsProvider(WS_ENDPOINT)
  const instance = await ApiPromise.create({ provider })
  instance.on('disconnected', () => {
    api = null
  })
  return instance
}

export async function getApi() {
  if (typeof window === 'undefined') {
    throw new Error('API can only be used in browser')
  }
  if (!ENABLE_BLOCKCHAIN) {
    throw new Error('Blockchain connection disabled. To enable, set NEXT_PUBLIC_ENABLE_BLOCKCHAIN=true and start a Substrate node.')
  }
  if (api) return api
  let lastError: any = null
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      api = await connectOnce()
      return api
    } catch (e) {
      lastError = e
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
    }
  }
  throw lastError || new Error('Failed to connect to node')
}

export function getWsEndpoint() {
  return WS_ENDPOINT
}

export async function registerAdvertiser(
  accountAddress: string,
  name: string,
  depositAmount: string
) {
  const api = await getApi()
  const { web3FromAddress } = await import('@polkadot/extension-dapp')
  const injector = await web3FromAddress(accountAddress)

  // Convert deposit amount to BigInt (same as funding in submitAd)
  const deposit = BigInt(depositAmount)

  return new Promise((resolve, reject) => {
    api.tx.ads
      .registerAdvertiser(name, deposit)
      .signAndSend(accountAddress, { signer: injector.signer }, ({ status, events }) => {
        if (status.isInBlock) {
          console.log(`Transaction included in block ${status.asInBlock}`)
        }
        
        if (status.isFinalized) {
          console.log(`Transaction finalized in block ${status.asFinalized}`)
          
          // Check for errors
          events.forEach(({ event }) => {
            if (api.events.system.ExtrinsicFailed.is(event)) {
              reject(new Error('Transaction failed'))
            }
          })
          
          resolve(status.asFinalized)
        }
      })
      .catch(reject)
  })
}

export async function submitAd(
  accountAddress: string,
  spotId: number,
  name: string,
  description: string,
  ipfsCid: string,
  funding: string
) {
  const api = await getApi()
  const { web3FromAddress } = await import('@polkadot/extension-dapp')
  const injector = await web3FromAddress(accountAddress)

  // Convert funding to proper format
  const fundingAmount = BigInt(funding)

  return new Promise((resolve, reject) => {
    api.tx.ads
      .submitAd(
        spotId,
        name,
        description,
        ipfsCid,
        fundingAmount
      )
      .signAndSend(accountAddress, { signer: injector.signer }, ({ status, events }) => {
        if (status.isInBlock) {
          console.log(`Transaction included in block ${status.asInBlock}`)
        }
        
        if (status.isFinalized) {
          console.log(`Transaction finalized in block ${status.asFinalized}`)
          
          // Check for errors
          events.forEach(({ event }) => {
            if (api.events.system.ExtrinsicFailed.is(event)) {
              reject(new Error('Transaction failed'))
            }
          })
          
          resolve(status.asFinalized)
        }
      })
      .catch(reject)
  })
}

export async function getAdvertiserAds(accountAddress: string) {
  const api = await getApi()
  
  // Query all ads and filter by advertiser
  // This is a simplified version - you'd need to implement proper querying
  const ads = []
  
  return ads
}

export async function getAdMetrics(adId: number) {
  const api = await getApi()
  
  // Query ad tracking metrics
  const metrics = await api.query.adTracking.adMetrics(adId)
  
  return metrics.toJSON()
}
