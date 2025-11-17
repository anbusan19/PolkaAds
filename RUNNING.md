# How to Run PolkaAds

This guide explains how to run the PolkaAds project in development mode.

## Prerequisites

- **Rust** (latest stable) - [Install Rust](https://www.rust-lang.org/tools/install)
- **Node.js** 18+ - [Install Node.js](https://nodejs.org/)
- **Polkadot.js Extension** - [Install Extension](https://polkadot.js.org/extension/)
- **Git** - For cloning dependencies

## Quick Start

### 1. Install Dependencies

```bash
# Install Rust dependencies (this will take 10-20 minutes on first build)
cargo build --release

# Install frontend dependencies
cd web
npm install
cd ..
```

### 2. Running the Blockchain Node

**Note**: The current node implementation is a placeholder. You have two options:

#### Option A: Use Substrate Node Template (Recommended)

1. Clone the Substrate node template:
```bash
git clone https://github.com/substrate-developer-hub/substrate-node-template.git temp-node
cd temp-node
```

2. Replace the template's runtime with PolkaAds runtime:
   - Copy `runtime/` from PolkaAds to `temp-node/runtime/`
   - Update `temp-node/runtime/Cargo.toml` to use PolkaAds pallets
   - Update `temp-node/node/Cargo.toml` to reference the runtime

3. Build and run:
```bash
cargo build --release
./target/release/node-template --dev
```

#### Option B: Build Runtime Only (For Testing)

The runtime can be built independently:

```bash
cd runtime
cargo build --release
```

This builds the WASM runtime but doesn't provide a running node. You'll need a Substrate node to interact with it.

### 3. Running the Frontend

```bash
cd web
npm run dev
```

The frontend will start on `http://localhost:3000`

**Important**: The frontend expects a Substrate node running on `ws://127.0.0.1:9944`

### 4. Connect to the Node

1. Open `http://localhost:3000` in your browser
2. Install Polkadot.js Extension if not already installed
3. Click "LOG IN" to connect your wallet
4. The frontend will attempt to connect to the blockchain node

## Development Workflow

### Terminal Setup

You'll need multiple terminals:

**Terminal 1 - Blockchain Node:**
```bash
# If using Option A above
./target/release/node-template --dev

# Node should show: "Listening on 127.0.0.1:9944"
```

**Terminal 2 - Frontend:**
```bash
cd web
npm run dev
```

**Terminal 3 - AI Agent (Optional):**
```bash
cd ai-agent
npm install  # First time only
npm start
```

## Configuration

### Frontend Environment Variables

Create `web/.env.local`:

```env
NEXT_PUBLIC_WS_ENDPOINT=ws://127.0.0.1:9944
NEXT_PUBLIC_ENABLE_BLOCKCHAIN=true
```

### AI Agent Environment Variables

Create `ai-agent/.env`:

```env
WS_ENDPOINT=ws://127.0.0.1:9944
OPENAI_API_KEY=your_openai_api_key_here
```

## Common Issues

### "Cannot connect to blockchain node"

**Solution**: 
1. Make sure the Substrate node is running
2. Check that it's listening on `ws://127.0.0.1:9944`
3. Wait for the node to fully start (can take 1-2 minutes)

### "Blockchain connection disabled"

**Solution**: 
Set `NEXT_PUBLIC_ENABLE_BLOCKCHAIN=true` in `web/.env.local`

### Build Errors

**Rust build fails:**
- Ensure you have the latest stable Rust: `rustup update stable`
- Clean and rebuild: `cargo clean && cargo build --release`

**Node.js build fails:**
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

### Node Won't Start

If using the placeholder node:
- The placeholder node in `node/src/main.rs` is just a stub
- You need to use Option A (Substrate template) or another Substrate node

## Testing the Application

1. **Start the node** (Terminal 1)
2. **Start the frontend** (Terminal 2)
3. **Open browser** to `http://localhost:3000`
4. **Connect wallet** using Polkadot.js Extension
5. **Register as advertiser**:
   - Enter advertiser name
   - Set deposit amount (minimum: 100000000)
   - Click "Register as Advertiser"
6. **Submit an ad**:
   - Fill in ad details
   - Enter IPFS CID (or use a test CID)
   - Set funding amount
   - Click "Submit Ad Campaign"

## Next Steps

- **Full Node Implementation**: Complete the node in `node/src/` using Substrate node template
- **AI Agent**: Implement semantic matching logic in `ai-agent/src/index.js`
- **MetaMask Snap**: Complete RPC handlers in `snap/src/index.ts`
- **Testing**: Add unit tests and integration tests
- **Deployment**: Set up for Rococo testnet deployment

## Additional Resources

- [Substrate Documentation](https://docs.substrate.io/)
- [Polkadot.js Documentation](https://polkadot.js.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)

