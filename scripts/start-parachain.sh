#!/bin/bash
# Start PolkaAds parachain node

set -e

RELAY_CHAIN=${1:-rococo}
PARACHAIN_ID=${2:-2000}
COLLATOR_KEY=${3:-//Alice}

echo "Starting PolkaAds Parachain"
echo "Relay Chain: $RELAY_CHAIN"
echo "Parachain ID: $PARACHAIN_ID"
echo "Collator: $COLLATOR_KEY"
echo ""

# Build if needed
if [ ! -f "polkadot-sdk/target/release/polkadot-omni-node" ]; then
    echo "Building polkadot-omni-node..."
    cd polkadot-sdk
    cargo build --release --bin polkadot-omni-node
    cd ..
fi

# Run the parachain node
polkadot-sdk/target/release/polkadot-omni-node \
    --chain=rococo \
    --collator \
    --parachain-id=$PARACHAIN_ID \
    --collator-key=$COLLATOR_KEY \
    --base-path=./data/parachain \
    --port=30333 \
    --rpc-port=9944 \
    --ws-port=9945 \
    -- \
    --chain=rococo \
    --execution=wasm \
    --base-path=./data/relay

