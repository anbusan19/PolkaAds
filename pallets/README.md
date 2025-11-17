# PolkaAds Pallets

This directory contains the three core Substrate pallets for the PolkaAds platform.

## Pallets Overview

### 1. pallet-ads
**Purpose**: Ad inventory and advertiser management

**Key Features**:
- Create and manage ad spots
- Register advertisers
- Submit ads with metadata (name, description, IPFS CID, funding)
- Track ad status and budget
- Activate/deactivate ads

**Storage**:
- `AdSpots`: Available ad placement slots
- `Ads`: Ad metadata including IPFS CID for video content
- `Advertisers`: Registered advertiser accounts
- `NextAdId`, `NextSpotId`: ID counters

**Dispatchables**:
- `create_ad_spot()`: Create new ad placement (root only)
- `register_advertiser()`: Register as advertiser
- `submit_ad()`: Submit ad with funding
- `deactivate_ad()`: Deactivate an ad

### 2. pallet-fee-sponsorship
**Purpose**: Transaction fee sponsorship logic (similar to ERC-4337 Paymaster)

**Key Features**:
- Request fee sponsorship for transactions
- Verify ad view completion
- Execute fee reimbursement
- Track sponsored amounts per ad

**Storage**:
- `SponsorshipRequests`: Pending and completed sponsorship requests
- `PendingSponsorships`: User's active sponsorship request
- `TotalSponsored`: Total fees sponsored per ad

**Dispatchables**:
- `sponsor_transaction()`: Request fee sponsorship
- `verify_ad_view()`: Verify user watched ad (oracle/root)
- `reimburse_fee()`: Execute fee reimbursement
- `cancel_sponsorship()`: Cancel pending request

### 3. pallet-ad-tracking
**Purpose**: Ad performance tracking and analytics

**Key Features**:
- Record ad views and completions
- Track ad clicks
- Monitor unique viewers
- Generate performance metrics

**Storage**:
- `AdMetricsStorage`: Aggregated metrics per ad
- `ViewRecords`: Individual view records
- `UserViews`: User view history
- `ClickRecords`: Click counts per ad

**Dispatchables**:
- `record_view()`: Log ad view start
- `complete_view()`: Mark view as completed
- `record_click()`: Record ad click
- `get_ad_metrics()`: Query ad performance

## Integration Flow

1. **Advertiser Setup**:
   ```
   register_advertiser() -> submit_ad(name, description, ipfs_cid, funding)
   ```

2. **User Transaction Flow**:
   ```
   sponsor_transaction(ad_id, fee_amount)
   -> User watches ad in MetaMask Snap
   -> record_view(ad_id) -> complete_view(view_id)
   -> verify_ad_view(request_id) [oracle]
   -> reimburse_fee(request_id)
   ```

3. **Analytics**:
   ```
   get_ad_metrics(ad_id) -> Returns views, clicks, unique viewers
   ```

## Building

```bash
# Build all pallets
cargo build --release

# Build specific pallet
cargo build -p pallet-ads --release

# Run tests
cargo test
```

## Configuration

Each pallet needs to be configured in your runtime's `lib.rs`:

```rust
// Example runtime configuration
impl pallet_ads::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type MaxAdNameLength = ConstU32<100>;
    type MaxAdDescriptionLength = ConstU32<500>;
    type MaxCidLength = ConstU32<100>;
}

impl pallet_fee_sponsorship::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type MinSponsorshipAmount = ConstU128<1_000_000>;
}

impl pallet_ad_tracking::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
}
```

## Next Steps

1. Create a custom runtime that includes these pallets
2. Set up RPC endpoints for querying ad data
3. Integrate with Crust Network for IPFS storage
4. Build the AI agent for ad matching
5. Develop MetaMask Snap for ad display

## License

MIT
