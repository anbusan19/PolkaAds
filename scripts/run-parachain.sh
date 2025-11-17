#!/bin/bash
# Run PolkaAds as a parachain using polkadot-omni-node

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}PolkaAds Parachain Setup${NC}"
echo "=========================="
echo ""

# Check if polkadot-omni-node is built
if [ ! -f "polkadot-sdk/target/release/polkadot-omni-node" ]; then
    echo -e "${YELLOW}Building polkadot-omni-node...${NC}"
    cd polkadot-sdk
    cargo build --release --bin polkadot-omni-node
    cd ..
fi

# Build the runtime
echo -e "${YELLOW}Building PolkaAds runtime...${NC}"
cargo build --release -p polkaads-runtime

# Export the chain spec
echo -e "${YELLOW}Exporting chain spec...${NC}"
# This will be done via the node once it's set up

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "To run the parachain:"
echo "1. Start a relay chain node (Rococo/Westend)"
echo "2. Register the parachain with the relay chain"
echo "3. Run: ./scripts/start-parachain.sh"
echo ""
echo "For development, you can use zombienet or a local test setup."

