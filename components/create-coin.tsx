import * as React from "react";
import { useWriteContract } from "wagmi";
import { Button } from "./ui/button";
import { createCoinCall } from "@zoralabs/coins-sdk";
import { Address, parseAbi } from "viem";
import { useEffect, useState } from "react";

interface CoinParams {
  name: string;
  symbol: string;
  uri: string;
  payoutRecipient: Address;
  platformReferrer: Address;
}

interface CreateCoinButtonProps {
  coinParams: CoinParams;
  onComplete?: () => void;
}

export function CreateCoinButton({ coinParams, onComplete }: CreateCoinButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [contractParams, setContractParams] = useState<any>(null);
  const { writeContractAsync } = useWriteContract();
  
  // Load contract params when coinParams changes
  useEffect(() => {
    const loadContractParams = async () => {
      try {

        const params = await createCoinCall(coinParams);
        setContractParams(params);
      } catch (error) {
        console.error("Error preparing contract call:", error);
      }
    };
    
    loadContractParams();
  }, [coinParams]);
  
  const handleCreateCoin = async () => {
    if (!contractParams) return;
    
    try {
      setIsPending(true);
      await writeContractAsync({
        address: contractParams.address,
        abi: contractParams.abi,
        functionName: contractParams.functionName,
        args: contractParams.args
      });
      
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error creating coin:", error);
    } finally {
      setIsPending(false);
    }
  };
  
  return (
    <Button 
      disabled={!contractParams || isPending} 
      onClick={handleCreateCoin}
      className="w-full"
    >
      {isPending ? "Creating..." : `Create ${coinParams.name} (${coinParams.symbol})`}
    </Button>
  );
}

export default CreateCoinButton;
export type { CoinParams }; 