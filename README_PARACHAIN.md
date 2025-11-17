# Running PolkaAds as a Parachain with Omninode

## Overview

PolkaAds can run as a parachain using the `polkadot-omni-node` from the Polkadot SDK. The omninode supports running multiple chains including relay chains and parachains.

## Prerequisites

1. **Built omninode:**
   ```powershell
   .\scripts\build-omninode.ps1
   ```

2. **Built PolkaAds runtime:**
   ```powershell
   cargo build --release -p polkaads-runtime
   ```

3. **Relay chain access** (Rococo, Westend, or local)

## Running as Parachain

### Step 1: Start Relay Chain

In Terminal 1:
```powershell
polkadot-sdk\target\release\polkadot-omni-node.exe --chain=rococo --dev
```

### Step 2: Start Parachain Collator

In Terminal 2:
```powershell
.\scripts\start-parachain.ps1 rococo 2000 //Alice
```

This will:
- Start a collator node for PolkaAds
- Connect to the relay chain (Rococo)
- Use parachain ID 2000
- Run with //Alice as collator

### Step 3: Register Parachain

Register the parachain on the relay chain using:
- Polkadot.js Apps UI
- CLI tools
- Sudo call (for testnets)

## Configuration

### Ports
- **Parachain RPC**: `9944`
- **Parachain WS**: `9945`  
- **Parachain P2P**: `30333`
- **Relay RPC**: `9946`
- **Relay WS**: `9947`
- **Relay P2P**: `30334`

### Parachain ID
Default: `2000`
Change in `scripts/start-parachain.ps1`

### Data Directories
- Parachain: `.\data\parachain`
- Relay: `.\data\relay`

## Using Zombienet (Recommended)

For easier testing, use zombienet:

1. Install zombienet:
```bash
npm install -g zombienet
```

2. Run:
```bash
zombienet spawn zombienet.toml
```

This automatically sets up relay chain + parachain.

## Important Notes

⚠️ **Current Limitation**: The PolkaAds runtime is currently a **solochain runtime**, not a parachain runtime. To fully work as a parachain, you need to:

1. Add Cumulus pallets to the runtime
2. Implement parachain system integration
3. Configure XCM for cross-chain messaging

See `PARACHAIN_SETUP.md` for detailed conversion steps.

## Troubleshooting

- **Port conflicts**: Change ports in `start-parachain.ps1`
- **Connection fails**: Ensure relay chain is running first
- **Build errors**: Run `cargo clean` and rebuild
- **Registration fails**: Verify parachain ID is available

## Development Mode

For local development without relay chain:

```powershell
# Run as standalone (not a parachain)
cargo run --release -p polkaads-node -- --dev
```

Note: This requires a full node implementation (currently placeholder).

