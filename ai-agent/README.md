# PolkaAds AI Agent

AI-powered agent for automatic ad matching and placement using semantic similarity.

## Overview

The AI agent analyzes ad descriptions and transaction contexts to select the best matching ad spots using NLP and semantic similarity algorithms.

## Features

- Semantic similarity analysis using OpenAI GPT-4o
- Automatic ad placement based on transaction context
- Integration with Covalent AI Agent SDK
- On-chain ad deployment via RPC calls

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your OpenAI API key and other settings
```

3. Run the agent:
```bash
npm start
```

## Configuration

- `OPENAI_API_KEY`: Your OpenAI API key
- `WS_ENDPOINT`: WebSocket endpoint for Substrate node (default: ws://127.0.0.1:9944)
- `COVALENT_API_KEY`: Covalent API key (if using Covalent SDK)

## Architecture

The agent:
1. Monitors transaction requests
2. Analyzes transaction context using NLP
3. Matches with available ads using semantic similarity
4. Deploys selected ads on-chain
5. Tracks ad performance

## Future Enhancements

- Real-time ad matching
- Multi-chain support via XCM
- Advanced analytics and reporting
- A/B testing capabilities


