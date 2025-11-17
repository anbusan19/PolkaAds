//! IPFS Storage Integration
//! Handles uploading ad videos to IPFS and retrieving them

// IPFS Gateway URLs
export const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
];

// Crust Network Gateway
export const CRUST_GATEWAY = 'https://crustgateway.io/ipfs/';

/**
 * Upload file to IPFS using web3.storage (or similar service)
 * For production, you can use:
 * - web3.storage
 * - Pinata
 * - NFT.Storage
 * - Crust Network SDK
 */
export async function uploadToIPFS(file: File): Promise<string> {
  try {
    // Option 1: Using web3.storage (requires API key)
    if (process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN) {
      return await uploadViaWeb3Storage(file);
    }

    // Option 2: Using Pinata (requires API key)
    if (process.env.NEXT_PUBLIC_PINATA_JWT) {
      return await uploadViaPinata(file);
    }

    // Option 3: Using local IPFS node (if available)
    if (process.env.NEXT_PUBLIC_IPFS_NODE) {
      return await uploadViaLocalNode(file);
    }

    // Fallback: Return mock CID for development
    console.warn('No IPFS service configured. Using mock CID.');
    return 'QmMockCID' + Date.now();
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
}

/**
 * Upload via web3.storage
 */
async function uploadViaWeb3Storage(file: File): Promise<string> {
  const { Web3Storage } = await import('web3.storage');
  const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN!;

  const client = new Web3Storage({ token });
  const cid = await client.put([file], {
    wrapWithDirectory: false,
  });

  return cid;
}

/**
 * Upload via Pinata
 */
async function uploadViaPinata(file: File): Promise<string> {
  const JWT = process.env.NEXT_PUBLIC_PINATA_JWT!;
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${JWT}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Pinata upload failed');
  }

  const data = await response.json();
  return data.IpfsHash;
}

/**
 * Upload via local IPFS node
 */
async function uploadViaLocalNode(file: File): Promise<string> {
  const ipfsNode = process.env.NEXT_PUBLIC_IPFS_NODE!;
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${ipfsNode}/api/v0/add`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Local IPFS node upload failed');
  }

  const data = await response.json();
  return data.Hash;
}

/**
 * Get IPFS URL from CID
 */
export function getIPFSUrl(cid: string, useCrust: boolean = false): string {
  if (useCrust) {
    return `${CRUST_GATEWAY}${cid}`;
  }
  // Use first available gateway
  return `${IPFS_GATEWAYS[0]}${cid}`;
}

/**
 * Get video URL with fallback gateways
 */
export function getVideoUrl(cid: string, useCrust: boolean = false): string {
  if (useCrust) {
    return `${CRUST_GATEWAY}${cid}`;
  }
  // Try Crust first, then fallback to IPFS gateways
  return `${CRUST_GATEWAY}${cid}`;
}

/**
 * Verify CID format
 */
export function isValidCID(cid: string): boolean {
  // Basic CID validation (starts with Qm for v0 or bafy for v1)
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cid) || /^bafy[a-z0-9]+$/.test(cid);
}

/**
 * Upload to Crust Network (requires Crust SDK)
 * This is a placeholder - implement with actual Crust SDK
 */
export async function uploadToCrust(file: File): Promise<string> {
  // TODO: Implement Crust Network upload
  // This would use @crustio/crust-pin or similar SDK
  // For now, upload to IPFS and return CID
  const cid = await uploadToIPFS(file);
  
  // In production, you would:
  // 1. Upload to IPFS
  // 2. Place storage order on Crust Network
  // 3. Wait for replication confirmation
  // 4. Return CID
  
  return cid;
}

/**
 * Check if file is a valid video format
 */
export function isValidVideoFile(file: File): boolean {
  const validTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo', // .avi
  ];
  
  const validExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  const fileName = file.name.toLowerCase();
  
  return (
    validTypes.includes(file.type) ||
    validExtensions.some(ext => fileName.endsWith(ext))
  );
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

