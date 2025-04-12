import { getCoinsTopVolume24h, getCoinsTopGainers } from "@zoralabs/coins-sdk";

// Define a type for the Coin data we expect
export type ZoraCoin = {
  id: string; // Usually contract address or similar unique ID
  name: string | null;
  symbol: string | null;
  image: string | null; // Will try to extract an image URL
  volume24h: number | null;
  marketCap: number | null;
  uniqueHolders: number | null;
  marketCapDelta24h: number | null; // Percentage change
};

/**
 * Helper to safely parse numeric values from the API response.
 */
const parseNumber = (value: any): number | null => {
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

/**
 * Fetches top coins by 24h trading volume.
 * @param count - Number of coins to fetch.
 * @param after - Cursor for pagination.
 * @returns Array of ZoraCoin objects or null if error.
 */
export async function fetchTopVolumeCoins(count: number = 15, after?: string): Promise<ZoraCoin[] | null> {
  try {
    const response = await getCoinsTopVolume24h({ count, after });
    const edges = response.data?.exploreList?.edges;

    if (!edges) {
      console.error("Failed to fetch top volume coins: No edges found in response");
      return null;
    }

    const tokens = edges.map((edge: any): ZoraCoin => {
      const node = edge.node;
      return {
        id: node.id ?? `${node.address}-${node.networkInfo?.chainId}`,
        name: node.name,
        symbol: node.symbol,
        // Prioritize mediaContent.previewImage, then other fallbacks
        image: node.mediaContent?.previewImage?.medium ?? 
               node.mediaContent?.previewImage ?? 
               node.image ?? 
               node.contractMetadata?.image ?? 
               node.metadata?.image ?? 
               '/placeholder.svg', 
        volume24h: parseNumber(node.volume24h),
        marketCap: parseNumber(node.marketCap),
        uniqueHolders: parseNumber(node.uniqueHolders),
        marketCapDelta24h: parseNumber(node.marketCapDelta24h)
      };
    });

    return tokens;
  } catch (error) {
    console.error("Error fetching top volume coins:", error);
    return null;
  }
}

/**
 * Fetches top coins by 24h price gain.
 * @param count - Number of coins to fetch.
 * @param after - Cursor for pagination.
 * @returns Array of ZoraCoin objects or null if error.
 */
export async function fetchTopGainersCoins(count: number = 15, after?: string): Promise<ZoraCoin[] | null> {
  try {
    const response = await getCoinsTopGainers({ count, after });
    const edges = response.data?.exploreList?.edges;

    if (!edges) {
      console.error("Failed to fetch top gainers coins: No edges found in response");
      return null;
    }

    const tokens = edges.map((edge: any): ZoraCoin => {
      const node = edge.node;
      return {
        id: node.id ?? `${node.address}-${node.networkInfo?.chainId}`,
        name: node.name,
        symbol: node.symbol,
        // Prioritize mediaContent.previewImage, then other fallbacks
        image: node.mediaContent?.previewImage ?? 
               node.image ?? 
               node.contractMetadata?.image ?? 
               node.metadata?.image ?? 
               '/placeholder.svg', 
        volume24h: parseNumber(node.volume24h),
        marketCap: parseNumber(node.marketCap),
        uniqueHolders: parseNumber(node.uniqueHolders),
        marketCapDelta24h: parseNumber(node.marketCapDelta24h)
      };
    });

    return tokens;
  } catch (error) {
    console.error("Error fetching top gainers coins:", error);
    return null;
  }
} 