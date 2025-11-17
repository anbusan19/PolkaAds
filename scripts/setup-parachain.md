# Running PolkaAds as a Parachain

This guide explains how to run PolkaAds as a parachain using the polkadot-omni-node.

## Prerequisites

1. Built polkadot-omni-node (included in polkadot-sdk)
2. Built PolkaAds runtime
3. Access to a relay chain (Rococo, Westend, or local)

## Quick Start

### Option 1: Using Zombienet (Recommended for Testing)

1. Install zombienet:
```bash
npm install -g zombienet
```

2. Create a zombienet config file (see `zombienet.toml`)

3. Run:
```bash
zombienet spawn zombienet.toml
```

### Option 2: Manual Setup

1. **Build the runtime:**
```bash
cargo build --release -p polkaads-runtime
```

2. **Export the chain spec:**
```bash
# This requires a node implementation
# For now, use a template chain spec
```

3. **Start relay chain node:**
```bash
# In terminal 1
polkadot-sdk/target/release/polkadot-omni-node --chain=rococo --dev
```

4. **Start parachain collator:**
```bash
# In terminal 2
./scripts/start-parachain.sh rococo 2000 //Alice
```

5. **Register parachain:**
```bash
# Use Polkadot.js Apps or CLI to register
# Parachain ID: 2000
# Genesis: (from chain spec)
```

## Configuration

### Parachain ID
Default: `2000`
Change in `scripts/start-parachain.sh`

### Ports
- Parachain RPC: `9944`
- Parachain WS: `9945`
- Parachain P2P: `30333`
- Relay RPC: `9946`
- Relay WS: `9947`
- Relay P2P: `30334`

### Data Directories
- Parachain: `./data/parachain`
- Relay: `./data/relay`

## Development Mode

For local development without relay chain:

```bash
# Run as standalone (not a parachain)
cargo run --release -p polkaads-node -- --dev
```

## Troubleshooting

- **Port conflicts**: Change ports in start script
- **Build errors**: Ensure all dependencies are built
- **Connection issues**: Check relay chain is running first
- **Registration fails**: Verify parachain ID is available

## Next Steps

1. Complete node implementation for full parachain support
2. Add Cumulus pallets to runtime
3. Configure XCM for cross-chain messaging
4. Set up governance for parachain upgrades

