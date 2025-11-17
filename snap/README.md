# PolkaAds SubWallet Snap

SubWallet extension integration for PolkaAds that displays ads during transactions and enables fee sponsorship.

## Features

- **Ad Display**: Shows relevant video ads when users initiate transactions
- **View Tracking**: Tracks ad view duration and completion
- **Fee Sponsorship**: Automatically requests fee sponsorship after ad completion
- **Transaction Interception**: Seamlessly integrates with SubWallet transaction flow
- **IPFS/Crust Support**: Fetches ad videos from decentralized storage

## Architecture

### Components

1. **index.ts**: Main RPC handler and transaction interception
2. **ui.tsx**: React component for ad display UI
3. **wallet-integration.ts**: SubWallet extension integration

### Flow

1. User initiates a transaction in SubWallet
2. Snap intercepts the transaction
3. Checks for available ads with remaining budget
4. Displays ad UI with video player
5. Tracks view duration (minimum 5 seconds)
6. Records ad view completion on-chain
7. Requests fee sponsorship
8. Transaction proceeds with sponsored fees

## Development

### Setup

```bash
npm install
npm run build
```

### Integration with SubWallet

The Snap needs to be integrated into the SubWallet extension. The integration points are:

1. **Transaction Interception**: Hook into SubWallet's transaction signing flow
2. **UI Display**: Render the ad component in a modal/overlay
3. **State Management**: Track ad viewing state

### Configuration

Set environment variables:

```env
WS_ENDPOINT=ws://127.0.0.1:9944
IPFS_GATEWAY=https://ipfs.io/ipfs/
CRUST_GATEWAY=https://crustgateway.io/ipfs/
```

## Usage

### For Wallet Developers

1. Install the Snap package
2. Import and initialize:
```typescript
import { initPolkaAdsIntegration, handleTransactionWithAd } from 'polkaads-snap';

const { extension, accounts } = await initPolkaAdsIntegration();
```

3. Intercept transactions:
```typescript
const proceed = await handleTransactionWithAd(
  api,
  account,
  extrinsic,
  () => {
    // Transaction can proceed
  }
);
```

### For dApp Developers

dApps can trigger ad display by requesting sponsorship:

```typescript
// Request ad for transaction
const result = await wallet.request({
  method: 'polkaads_getAd',
  params: {
    context: {
      from: account.address,
      method: 'transfer',
      pallet: 'balances',
    },
  },
});

if (result.ad) {
  // Show ad UI
  // After completion, transaction is sponsored
}
```

## RPC Methods

- `polkaads_getAd`: Fetch relevant ad based on transaction context
- `polkaads_recordView`: Record ad view start
- `polkaads_completeView`: Mark ad view as completed
- `polkaads_requestSponsorship`: Request fee sponsorship
- `polkaads_getAdStatus`: Get current ad viewing status
- `polkaads_reset`: Reset ad state

## Future Enhancements

- AI-powered ad matching based on transaction context
- Multi-parachain support via XCM
- Advanced analytics and reporting
- A/B testing for ad effectiveness
- User preferences and ad filtering
