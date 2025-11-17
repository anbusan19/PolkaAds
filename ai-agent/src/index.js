//! PolkaAds AI Agent
//! Main entry point for the AI agent

require('dotenv').config();

const { ApiPromise, WsProvider } = require('@polkadot/api');

// Configuration
const WS_ENDPOINT = process.env.WS_ENDPOINT || 'ws://127.0.0.1:9944';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY not set. AI features will be disabled.');
}

/**
 * Initialize the AI agent
 */
async function init() {
  console.log('PolkaAds AI Agent');
  console.log('==================');
  console.log(`Connecting to node: ${WS_ENDPOINT}`);
  
  try {
    const provider = new WsProvider(WS_ENDPOINT);
    const api = await ApiPromise.create({ provider });
    
    console.log('Connected to blockchain node');
    console.log(`Chain: ${(await api.rpc.system.chain()).toString()}`);
    
    // TODO: Implement ad matching logic
    // 1. Monitor transaction requests
    // 2. Analyze context using OpenAI
    // 3. Match with available ads
    // 4. Deploy ads on-chain
    
    console.log('AI Agent ready. Waiting for transactions...');
    
    // Keep the process alive
    process.on('SIGINT', async () => {
      console.log('\nShutting down...');
      await api.disconnect();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error initializing AI agent:', error);
    process.exit(1);
  }
}

// Start the agent
init().catch(console.error);


