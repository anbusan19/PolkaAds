//! PolkaAds SubWallet Snap
//! Handles ad display and verification for fee-sponsored transactions

import { ApiPromise, WsProvider } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';

// Configuration
const WS_ENDPOINT = 'ws://127.0.0.1:9944'; // Default to local node
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
const CRUST_GATEWAY = 'https://crustgateway.io/ipfs/';

// State
let api: ApiPromise | null = null;
let currentAd: AdData | null = null;
let viewStartTime: number = 0;
let viewCompleted: boolean = false;

interface AdData {
  adId: number;
  name: string;
  description: string;
  ipfsCid: string;
  advertiser: string;
  funding: string;
  remainingBudget: string;
  videoUrl: string;
}

interface TransactionContext {
  from: string;
  to?: string;
  amount?: string;
  method?: string;
  pallet?: string;
}

/**
 * Initialize API connection
 */
async function initApi(): Promise<ApiPromise> {
  if (api) return api;
  
  const provider = new WsProvider(WS_ENDPOINT);
  api = await ApiPromise.create({ provider });
  return api;
}

/**
 * Fetch a random ad from available active ads
 */
async function fetchRelevantAd(context: TransactionContext): Promise<AdData | null> {
  const apiInstance = await initApi();
  
  try {
    // Get all active ads
    const activeAds: AdData[] = [];
    
    // Query ads (simplified - in production, use proper iteration)
    for (let i = 0; i < 100; i++) {
      try {
        const ad = await apiInstance.query.ads.ads(i);
        if (ad.isSome) {
          const adData = ad.unwrap();
          if (adData.active) {
            // Check if ad has remaining budget
            const remainingBudget = adData.remaining_budget.toString();
            if (parseInt(remainingBudget) > 0) {
              const ipfsCid = Buffer.from(adData.ipfs_cid).toString('utf-8');
              activeAds.push({
                adId: i,
                name: Buffer.from(adData.name).toString('utf-8'),
                description: Buffer.from(adData.description).toString('utf-8'),
                ipfsCid,
                advertiser: adData.advertiser.toString(),
                funding: adData.funding.toString(),
                remainingBudget,
                videoUrl: `${CRUST_GATEWAY}${ipfsCid}`,
              });
            }
          }
        }
      } catch (e) {
        break;
      }
    }
    
    if (activeAds.length === 0) {
      return null;
    }
    
    // Randomly select an ad from available ads
    const randomIndex = Math.floor(Math.random() * activeAds.length);
    const selectedAd = activeAds[randomIndex];
    
    return selectedAd;
  } catch (error) {
    console.error('Error fetching ad:', error);
    return null;
  }
}

/**
 * Record ad view on-chain
 */
async function recordAdView(adId: number, account: string): Promise<boolean> {
  const apiInstance = await initApi();
  
  try {
    // This would be called by the wallet extension
    // For now, return success
    // In production, the extension would sign and submit the transaction
    return true;
  } catch (error) {
    console.error('Error recording ad view:', error);
    return false;
  }
}

/**
 * Verify ad view completion
 */
async function verifyAdView(adId: number, account: string, viewDuration: number): Promise<boolean> {
  const apiInstance = await initApi();
  
  try {
    // Minimum view duration: 5 seconds
    const MIN_VIEW_DURATION = 5000;
    
    if (viewDuration < MIN_VIEW_DURATION) {
      return false;
    }
    
    // In production, this would call the fee-sponsorship pallet
    // to verify and mark the view as complete
    return true;
  } catch (error) {
    console.error('Error verifying ad view:', error);
    return false;
  }
}

/**
 * Request fee sponsorship for a transaction
 */
async function requestFeeSponsorship(
  account: string,
  adId: number,
  feeAmount: string
): Promise<{ requestId: number | null; success: boolean }> {
  const apiInstance = await initApi();
  
  try {
    // This would create a sponsorship request on-chain
    // For now, return a mock request ID
    return {
      requestId: Date.now(),
      success: true,
    };
  } catch (error) {
    console.error('Error requesting fee sponsorship:', error);
    return {
      requestId: null,
      success: false,
    };
  }
}

/**
 * Handle transaction interception for ad display
 */
export async function interceptTransactionForAd(
  extrinsic: any,
  account: string
): Promise<{ shouldShowAd: boolean; ad: AdData | null }> {
  try {
    // Check if transaction qualifies for sponsorship
    const context: TransactionContext = {
      from: account,
      method: extrinsic.method?.method?.toString() || 'transfer',
      pallet: extrinsic.method?.section?.toString() || 'balances',
    }

    console.log('Intercepting transaction for ad:', context)

    // Get relevant ad
    const ad = await fetchRelevantAd(context)

    return {
      shouldShowAd: ad !== null,
      ad: ad,
    }
  } catch (error) {
    console.error('Error intercepting transaction:', error)
    return {
      shouldShowAd: false,
      ad: null,
    }
  }
}

/**
 * Handle RPC requests from the wallet extension
 */
export const onRpcRequest = async ({ origin, request }: any) => {
  switch (request.method) {
    case 'polkaads_getAd':
      // Fetch ad based on transaction context
      const context: TransactionContext = request.params?.context || {};
      const ad = await fetchRelevantAd(context);
      
      if (ad) {
        currentAd = ad;
        viewStartTime = Date.now();
        viewCompleted = false;
      }
      
      return {
        ad,
        success: ad !== null,
      };
      
    case 'polkaads_recordView':
      // Record that user started viewing the ad
      const { adId, account } = request.params || {};
      if (!adId || !account) {
        return { success: false, error: 'Missing parameters' };
      }
      
      const recorded = await recordAdView(adId, account);
      return { success: recorded };
      
    case 'polkaads_completeView':
      // Mark ad view as completed
      const { adId: completeAdId, account: completeAccount } = request.params || {};
      if (!completeAdId || !completeAccount) {
        return { success: false, error: 'Missing parameters' };
      }
      
      const viewDuration = Date.now() - viewStartTime;
      const verified = await verifyAdView(completeAdId, completeAccount, viewDuration);
      
      if (verified) {
        viewCompleted = true;
      }
      
      return {
        verified,
        viewDuration,
        success: verified,
      };
      
    case 'polkaads_requestSponsorship':
      // Request fee sponsorship for a transaction
      const {
        account: sponsorAccount,
        adId: sponsorAdId,
        feeAmount,
      } = request.params || {};
      
      if (!sponsorAccount || sponsorAdId === undefined || !feeAmount) {
        return { success: false, error: 'Missing parameters' };
      }
      
      const sponsorship = await requestFeeSponsorship(
        sponsorAccount,
        sponsorAdId,
        feeAmount
      );
      
      return sponsorship;
      
    case 'polkaads_getAdStatus':
      // Get current ad status
      return {
        hasAd: currentAd !== null,
        ad: currentAd,
        viewStarted: viewStartTime > 0,
        viewCompleted,
        viewDuration: viewStartTime > 0 ? Date.now() - viewStartTime : 0,
      };
      
    case 'polkaads_reset':
      // Reset ad state
      currentAd = null;
      viewStartTime = 0;
      viewCompleted = false;
      return { success: true };

    case 'polkaads_intercept_transaction':
      // Intercept transaction for ad display
      const { extrinsic, account: interceptAccount } = request.params || {};
      return await interceptTransactionForAd(extrinsic, interceptAccount);

    default:
      throw new Error(`Method not found: ${request.method}`);
  }
};

/**
 * Handle transaction interception
 * This would be called by the wallet extension when a transaction is initiated
 */
export async function interceptTransaction(
  extrinsic: SubmittableExtrinsic<'promise'>,
  account: string
): Promise<{ showAd: boolean; ad: AdData | null }> {
  try {
    // Check if user has pending sponsorship
    const apiInstance = await initApi();
    
    // Query pending sponsorships
    const pendingSponsorship = await apiInstance.query.feeSponsorship.pendingSponsorships(account);
    
    if (pendingSponsorship.isSome) {
      // User has pending sponsorship, show ad
      const context: TransactionContext = {
        from: account,
        method: extrinsic.method.method.toString(),
        pallet: extrinsic.method.section.toString(),
      };
      
      const ad = await fetchRelevantAd(context);
      return {
        showAd: ad !== null,
        ad: ad,
      };
    }
    
    // No pending sponsorship
    return {
      showAd: false,
      ad: null,
    };
  } catch (error) {
    console.error('Error intercepting transaction:', error);
    return {
      showAd: false,
      ad: null,
    };
  }
}