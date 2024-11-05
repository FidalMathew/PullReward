import {EIP1193Provider} from "@particle-network/auth-core";
import {useConnect, useEthereum} from "@particle-network/authkit";
import {createContext, ReactNode, useEffect, useState} from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  PublicClient,
  WalletClient,
} from "viem";
import { baseSepolia } from "viem/chains";
import CONTRACT_ABI from '@/lib/abi.json'
import { CONTRACT_ADDRESS } from '@/lib/constants'

export const GlobalContext = createContext({
  walletClient: null as WalletClient | null,
  publicClient: null as PublicClient | null,
  createIssue: (_issueUrl: string, _bountyAmount: bigint) => {},
  getIssueDetails: (_issueId: number) => {},
  transmitDataRequest: (_issueId: number, _inputValue: string) => {},
  getLatestAnswerForIssue: (_issueId: number) => {},
  getAllIssues: () => {},
});

export default function GlobalContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {connectionStatus} = useConnect();
  const {provider, address, switchChain} = useEthereum();

  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);

  const [loggedInAddress, setLoggedInAddress] = useState<string>();


  useEffect(() => {
    if (connectionStatus === "connected" && provider && address) {
      (async function () {
        const publicClient = createPublicClient({
          transport: custom(provider as EIP1193Provider),
        });

        // const bal = await publicClient.getBalance({
        //   address: address as Hex,
        // });

        await switchChain(84532);

        console.log(await publicClient.getChainId(), "chainId");

        setPublicClient(publicClient);

        const walletClient = createWalletClient({
          transport: custom(provider as EIP1193Provider),
        });

        setWalletClient(walletClient);
      })();
    }
  }, [provider, connectionStatus]);


  useEffect(() => {
    if (address) {
      console.log("Address:", address);
      setLoggedInAddress(address);
    }
  }, [address]);


  const createIssue = async (issueUrl: string, bountyAmount: bigint) => {
    try {
      if (publicClient && walletClient) {
        const tx = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "createIssue",
          account: loggedInAddress as `0x${string}`,
          args: [issueUrl],
          value: bountyAmount, // Bounty amount in wei
          chain: baseSepolia,
        });
  
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log("Issue created successfully");
      }
    } catch (error) {
      console.error("Error creating issue:", error);
    }
  };

  const getAllIssues = async () => {
    try {
      if (publicClient) {
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "getAllIssues",
          args: [], // No arguments needed for this function
        });
  
        console.log(data, "All Issues");
        return data as any[]; // Type appropriately based on the expected structure of issues array
      }
    } catch (error) {
      console.error("Error fetching all issues:", error);
    }
  };
  

  const getIssueDetails = async (issueId: number) => {
    try {
      if (publicClient) {
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "getIssueById",
          args: [issueId],
        });
  
        console.log(data, `Issue Details for ID ${issueId}`);
        return data as any; // Type appropriately based on expected result structure
      }
    } catch (error) {
      console.error("Error fetching issue details:", error);
    }
  };

  
  const transmitDataRequest = async (issueId: number, inputValue: string) => {
    try {
      if (publicClient && walletClient) {
        const tx = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "transmit",
          account: loggedInAddress as `0x${string}`,
          args: [issueId, inputValue],
          chain: baseSepolia,
        });
  
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log("Data request transmitted successfully");
      }
    } catch (error) {
      console.error("Error transmitting data request:", error);
    }
  };

  
  const getLatestAnswerForIssue = async (issueId: number) => {
    try {
      if (publicClient) {
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "latestAnswerIssueId",
          args: [issueId],
        });
  
        console.log(data, `Latest answer for issue ID ${issueId}`);
        return data as any; // Type appropriately based on expected result structure
      }
    } catch (error) {
      console.error("Error fetching the latest answer:", error);
    }
  };
  
  

  

  return (
    <GlobalContext.Provider
      value={{
        walletClient,
        publicClient,
        createIssue,
        getIssueDetails,
        transmitDataRequest,
        getLatestAnswerForIssue,
        getAllIssues,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
