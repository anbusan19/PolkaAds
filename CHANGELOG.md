# Changelog

All notable changes to the PolkaAds project will be documented in this file.

## [Unreleased] - 2024

### Added
- **Node Implementation**: Created basic node structure with `node/Cargo.toml` and `node/src/main.rs`
- **AI Agent**: Added `ai-agent/` directory with package.json, README, and basic index.js
- **MetaMask Snap**: Created `snap/` directory with TypeScript setup and basic RPC handlers
- **Frontend Enhancements**:
  - `AdsList` component now fetches ads from blockchain
  - `AdSubmissionForm` auto-checks advertiser registration status
  - Added `checkAdvertiserRegistration()` and `getAvailableAdSpots()` to blockchain.ts
- **Pallet Integration**: Fee-sponsorship pallet now references Ads pallet via trait bound

### Fixed
- WalletConnect component: Fixed CSS class typo (`bg黑` → `bg-black`)
- Fee-sponsorship pallet: Added Ads pallet reference for future budget checking
- Runtime config: Added `AdsPallet` type to fee-sponsorship config

### Changed
- `getAdvertiserAds()`: Implemented blockchain querying with proper error handling
- Ad submission form: Added automatic registration status checking on mount

### Notes
- Node implementation is a placeholder - full implementation requires Substrate node template integration
- AI agent and Snap are scaffolded with basic structure - core functionality pending
- All pallets compile and integrate correctly with runtime


