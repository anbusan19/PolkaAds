# PolkaAds Advertiser Dashboard

A Next.js web application for advertisers to manage their ad campaigns on the PolkaAds blockchain.

## Features

- 🔐 Polkadot wallet integration
- 📝 Ad submission form
- 📊 Campaign analytics
- 💰 Budget tracking
- 🎯 IPFS/Crust Network integration

## Prerequisites

- Node.js 18+
- Polkadot.js browser extension
- Running PolkaAds blockchain node

## Installation

```bash
# Install dependencies
npm install

# or
yarn install
```

## Configuration

Update the blockchain connection in `lib/blockchain.ts`:

```typescript
const WS_PROVIDER = 'ws://127.0.0.1:9944' // Your node URL
```

## Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

## Building for Production

```bash
# Build
npm run build

# Start production server
npm start
```

## Usage

### 1. Connect Wallet
- Click "Connect Wallet" button
- Approve connection in Polkadot.js extension
- Select your account

### 2. Register as Advertiser
- Click "Register as Advertiser" button
- Sign the transaction
- Wait for confirmation

### 3. Submit Ad Campaign
- Fill in ad details:
  - **Name**: Your ad campaign name (max 100 chars)
  - **Description**: Campaign description (max 500 chars)
  - **IPFS CID**: Video file CID from Crust Network or IPFS
  - **Funding**: Amount to sponsor user transactions (min 1,000,000)
  - **Spot ID**: Available ad spot (get from admin)
- Click "Submit Ad Campaign"
- Sign the transaction
- Wait for confirmation

### 4. View Your Campaigns
- See all your active campaigns
- Track views and budget
- Monitor performance

## Project Structure

```
web/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── WalletConnect.tsx   # Wallet connection
│   ├── AdSubmissionForm.tsx # Ad submission form
│   └── AdsList.tsx         # Ads list display
├── lib/
│   └── blockchain.ts       # Blockchain interactions
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Blockchain Integration

The app connects to your PolkaAds blockchain and interacts with:

- **pallet-ads**: Register advertiser, submit ads
- **pallet-ad-tracking**: View metrics
- **pallet-fee-sponsorship**: Monitor sponsorships

## Styling

Built with:
- Tailwind CSS
- Custom Polkadot-themed colors
- Glassmorphism design
- Responsive layout

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_WS_PROVIDER=ws://127.0.0.1:9944
```

## Troubleshooting

### Wallet not connecting
- Ensure Polkadot.js extension is installed
- Check if extension has accounts
- Refresh the page

### Transaction fails
- Check if blockchain node is running
- Verify you're registered as advertiser
- Ensure sufficient balance
- Check ad spot availability

### IPFS CID issues
- Verify CID format (starts with Qm or bafy)
- Ensure file is uploaded to IPFS/Crust
- Check CID length (max 100 chars)

## Next Steps

- [ ] Add real-time ad metrics
- [ ] Implement ad editing
- [ ] Add budget top-up feature
- [ ] Create analytics dashboard
- [ ] Add IPFS upload integration
- [ ] Implement ad preview

## License

MIT
