// Get your WalletConnect project ID from https://cloud.walletconnect.com/
// This is needed for WalletConnect v2 to work properly
export const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "YOUR_PROJECT_ID"

// Common chains to support
export const SUPPORTED_CHAIN_IDS = [1, 11155111] // mainnet, sepolia 