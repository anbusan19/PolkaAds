# Build polkadot-omni-node for PolkaAds

Write-Host "Building polkadot-omni-node..." -ForegroundColor Green

Set-Location polkadot-sdk
cargo build --release --bin polkadot-omni-node
Set-Location ..

if (Test-Path "polkadot-sdk\target\release\polkadot-omni-node.exe") {
    Write-Host "Build successful!" -ForegroundColor Green
} else {
    Write-Host "Build failed. Check errors above." -ForegroundColor Red
}

