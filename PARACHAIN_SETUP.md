# PolkaAds Parachain Setup

## Quick Start (Windows)

```powershell
# 1. Build omninode
.\scripts\build-omninode.ps1

# 2. Build PolkaAds runtime
cargo build --release -p polkaads-runtime

# 3. Start parachain (requires relay chain running)
.\scripts\start-parachain.ps1 rococo 2000 //Alice
```

## Current Status

The PolkaAds runtime is currently configured as a **solochain** (standalone blockchain). To run it as a **parachain** using the omninode, you need to:

## Required Changes

### 1. Add Cumulus Dependencies

The runtime needs Cumulus pallets for parachain functionality:

```toml
# Add to runtime/Cargo.toml
cumulus-pallet-parachain-system = { git = "https://github.com/paritytech/polkadot-sdk.git", branch = "stable2409", default-features = false }
cumulus-pallet-xcmp-queue = { git = "https://github.com/paritytech/polkadot-sdk.git", branch = "stable2409", default-features = false }
cumulus-pallet-dmp-queue = { git = "https://github.com/paritytech/polkadot-sdk.git", branch = "stable2409", default-features = false }
```

### 2. Convert Runtime to Parachain Runtime

The runtime needs to implement `GetRuntimeBlockType` and use Cumulus pallets.

### 3. Create Parachain Node

The node needs to be configured as a collator with:
- Parachain ID
- Relay chain connection
- Collator key

## Quick Start (Using Existing Setup)

For now, you can run PolkaAds as a **standalone chain** (not a parachain):

```bash
# Build the runtime
cargo build --release -p polkaads-runtime

# The node implementation is a placeholder
# Use Substrate node template or wait for full implementation
```

## Using Polkadot Omni Node

The omninode can run multiple chains. To use it with PolkaAds:

1. **Build omninode:**
```bash
cd polkadot-sdk
cargo build --release --bin polkadot-omni-node
```

2. **Run as standalone (current setup):**
```bash
# This won't work yet - need full node implementation
./target/release/polkadot-omni-node --chain=polkaads --dev
```

3. **For parachain mode:**
   - First convert runtime to parachain (see above)
   - Then use zombienet or manual setup

## Next Steps

1. ✅ Runtime is built and functional
2. ⏳ Add Cumulus pallets to runtime
3. ⏳ Create full node implementation
4. ⏳ Configure as parachain
5. ⏳ Test with relay chain

## Alternative: Use Substrate Parachain Template

For faster setup, consider:
1. Clone Substrate parachain template
2. Replace template runtime with PolkaAds runtime
3. Configure chain spec
4. Run as parachain

See `RUNNING.md` for more details.

