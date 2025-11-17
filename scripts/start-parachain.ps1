# Start PolkaAds Parachain Node (PowerShell)
# Usage: .\scripts\start-parachain.ps1 [relay-chain] [parachain-id] [collator-key]

param(
    [string]$RelayChain = "rococo",
    [int]$ParachainId = 2000,
    [string]$CollatorKey = "//Alice"
)

Write-Host "Starting PolkaAds Parachain" -ForegroundColor Green
Write-Host "Relay Chain: $RelayChain"
Write-Host "Parachain ID: $ParachainId"
Write-Host "Collator: $CollatorKey"
Write-Host ""

# Check if omninode is built
$omninodePath = "polkadot-sdk\target\release\polkadot-omni-node.exe"
if (-not (Test-Path $omninodePath)) {
    Write-Host "Building polkadot-omni-node..." -ForegroundColor Yellow
    Set-Location polkadot-sdk
    cargo build --release --bin polkadot-omni-node
    Set-Location ..
}

# Create data directories
New-Item -ItemType Directory -Force -Path "data\parachain" | Out-Null
New-Item -ItemType Directory -Force -Path "data\relay" | Out-Null

# Run the parachain node
& $omninodePath `
    --chain=$RelayChain `
    --collator `
    --parachain-id=$ParachainId `
    --collator-key=$CollatorKey `
    --base-path=.\data\parachain `
    --port=30333 `
    --rpc-port=9944 `
    --ws-port=9945 `
    -- `
    --chain=$RelayChain `
    --execution=wasm `
    --base-path=.\data\relay

