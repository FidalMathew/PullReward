import {EIP1193Provider} from "@particle-network/auth-core";
import {useAuthCore, useConnect, useEthereum} from "@particle-network/authkit";
import {createContext, ReactNode, useEffect, useState} from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  parseUnits,
  PublicClient,
  WalletClient,
} from "viem";
import {baseSepolia} from "viem/chains";
import CONTRACT_ABI from "@/lib/abi.json";
import {CONTRACT_ADDRESS} from "@/lib/constants";
import axios from "axios";
import {toast} from "sonner";

export const GlobalContext = createContext({
  walletClient: null as WalletClient | null,
  publicClient: null as PublicClient | null,
  createIssue: (_issueUrl: string, _bountyAmount: string) => {},
  getIssueDetails: (_issueId: number) => {},
  transmitDataRequest: (_issueId: number, _inputValue: string) => {},
  getLatestAnswerForIssue: (_issueId: number) => {},
  getAllIssues: () => {},
  executeVerifyPRFunction: (_issueId: number, _inputValue: string) =>
    Promise.resolve(),
  shouldGiveBountyState: {
    verifyPROwnerLoading: false,
    verifyPROwnerError: null as string | null,
    verifyPROwnerSuccess: null as string | null,

    prAndIssueMatchingLoading: false,
    prAndIssueMatchingError: null as string | null,
    prAndIssueMatchingSuccess: null as string | null,

    isClaimableLoading: false,
    isClaimableError: null as string | null,
    isClaimableSuccess: null as string | null,
  },

  setShouldGiveBountyState: (_shouldGiveBountyState: any) => {},
  step: 0,
  setStep: (_step: number) => {},
  createIssueLoading: false,

  executeWithValidAnswer: (_issueId: number) => Promise.resolve(),
});

export default function GlobalContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {connectionStatus} = useConnect();
  const {provider, address, switchChain} = useEthereum();
  const {userInfo} = useAuthCore();
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);

  const [loggedInAddress, setLoggedInAddress] = useState<string>();

  const [shouldGiveBountyState, setShouldGiveBountyState] = useState<{
    verifyPROwnerLoading: boolean;
    verifyPROwnerError: string | null;
    verifyPROwnerSuccess: string | null;

    prAndIssueMatchingLoading: boolean;
    prAndIssueMatchingError: string | null;
    prAndIssueMatchingSuccess: string | null;

    isClaimableLoading: boolean;
    isClaimableError: string | null;
    isClaimableSuccess: string | null;
  }>({
    verifyPROwnerLoading: false,
    verifyPROwnerError: null,
    verifyPROwnerSuccess: null,

    prAndIssueMatchingLoading: false,
    prAndIssueMatchingError: null,
    prAndIssueMatchingSuccess: null,

    isClaimableLoading: false,
    isClaimableError: null,
    isClaimableSuccess: null,
  });

  const [step, setStep] = useState(0);

  console.log(step, "step");

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

  const [createIssueLoading, setCreateIssueLoading] = useState(false);
  const createIssue = async (issueUrl: string, bountyAmount: string) => {
    try {
      setCreateIssueLoading(true);
      const bountyAmountInWei = parseUnits(bountyAmount, 18);

      if (publicClient && walletClient) {
        const tx = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "createIssue",
          account: loggedInAddress as `0x${string}`,
          args: [issueUrl],
          value: bountyAmountInWei, // Bounty amount in wei
          chain: baseSepolia,
        });

        await publicClient.waitForTransactionReceipt({hash: tx});
        console.log("Issue created successfully");
      }
    } catch (error) {
      console.error("Error creating issue:", error);
      return [];
    } finally {
      setCreateIssueLoading(false);
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

  function parseGitHubPRUrl(url: string | URL) {
    // Remove the base GitHub URL part
    const pathParts = new URL(url).pathname.split("/");

    const owner = pathParts[1]; // "mui"
    const repo = pathParts[2]; // "material-ui"
    const prNumber = pathParts[4]; // "44130"

    return {owner, repo, prNumber};
  }

  const transmitDataRequest = async (issueId: number, inputValue: string) => {
    // inputValue = prUrl#issueUrl"

    try {
      setShouldGiveBountyState({
        ...shouldGiveBountyState,
        prAndIssueMatchingLoading: true,
      });

      if (publicClient && walletClient) {
        const tx = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "transmit",
          account: loggedInAddress as `0x${string}`,
          args: [issueId, inputValue],
          chain: baseSepolia,
        });

        await publicClient.waitForTransactionReceipt({hash: tx});

        setShouldGiveBountyState({
          ...shouldGiveBountyState,
          prAndIssueMatchingLoading: false,
          prAndIssueMatchingSuccess: "Data request transmitted successfully",
        });
        console.log("Data request transmitted successfully");
      }
    } catch (error: any) {
      console.error("Error transmitting data request:", error);
      setShouldGiveBountyState({
        ...shouldGiveBountyState,
        prAndIssueMatchingLoading: false,
        prAndIssueMatchingError: "Error transmitting data request",
      });
    }
  };

  async function pollForValidAnswer(issueId: number): Promise<bigint> {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const pollingInterval = 10000; // 3 seconds

    while (true) {
      try {
        if (publicClient && walletClient && loggedInAddress) {
          const data: unknown = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "latestAnswerIssueId",
            args: [issueId],
          });

          if (typeof data === "bigint") {
            return data;
          }
        }
      } catch (error) {
        console.log("Polling error, retrying in 3 seconds:", error);
      }

      await delay(pollingInterval);
    }
  }

  const getLatestAnswerForIssue = async (issueId: number): Promise<any> => {
    try {
      toast.loading("Fetching latest answer for issue ID");

      if (publicClient && walletClient && loggedInAddress) {
        const tx = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "latestAnswerIssueId",
          args: [issueId],
          chain: baseSepolia,
          account: loggedInAddress as `0x${string}`,
        });

        await publicClient.waitForTransactionReceipt({hash: tx});

        // console.log(data, `Latest answer for issue ID ${issueId}`);
        toast.success("Latest answer fetched successfully");
        // return data;
      }
    } catch (error) {
      console.error("Error fetching the latest answer:", error);
      toast.error("Error fetching the latest answer");
    } finally {
      toast.dismiss();
    }
  };

  // Usage
  async function executeWithValidAnswer(issueId: number) {
    try {
      toast.loading("Waiting for valid answer");
      const validAnswer = await pollForValidAnswer(issueId);

      if (validAnswer) {
        await getLatestAnswerForIssue(issueId);
        toast.success("Valid answer received");
      }
    } catch (error) {
      console.error("Error during execution:", error);
      toast.error("Error during execution");
    } finally {
      toast.dismiss();
    }
  }

  const executeVerifyPRFunction = async (
    issueId: number,
    inputValue: string
  ) => {
    try {
      // Step 1
      setShouldGiveBountyState((prevState) => ({
        ...prevState,
        verifyPROwnerLoading: true,
      }));

      const {prNumber, owner, repo} = parseGitHubPRUrl(
        inputValue.split("#")[0]
      );

      const {data} = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      const {data: data1} = await axios.get(
        `https://api.github.com/user/${userInfo?.github_id}`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      if (data && data1) {
        if (data.user.login === data1.login) {
          console.log("PR owner matches logged in user");

          // Update Step 1 success message
          setShouldGiveBountyState((prevState) => ({
            ...prevState,
            verifyPROwnerLoading: false,
            verifyPROwnerSuccess: "PR owner matches logged in user",
          }));

          // Step 2 with delay
          setTimeout(async () => {
            try {
              setShouldGiveBountyState((prevState) => ({
                ...prevState,
                prAndIssueMatchingLoading: true,
              }));

              console.log(
                Number(issueId),
                inputValue,
                "issueId, inputValue before passing to transmit"
              );

              if (publicClient && walletClient) {
                const tx = await walletClient.writeContract({
                  address: CONTRACT_ADDRESS,
                  abi: CONTRACT_ABI,
                  functionName: "transmit",
                  account: loggedInAddress as `0x${string}`,
                  args: [Number(issueId), inputValue],
                  chain: baseSepolia,
                });

                await publicClient.waitForTransactionReceipt({hash: tx});

                // Step 3:
                try {
                  setTimeout(async () => {
                    setStep(2);

                    setShouldGiveBountyState((prevState) => ({
                      ...prevState,
                      isClaimableLoading: true,
                    }));
                    const result = await pollForValidAnswer(issueId);
                    console.log(result, "result");
                    if (Number(result) === 5) {
                      setShouldGiveBountyState((prevState) => ({
                        ...prevState,
                        isClaimableLoading: false,
                        isClaimableSuccess: "Bounty is claimable",
                      }));
                    } else {
                      setShouldGiveBountyState((prevState) => ({
                        ...prevState,
                        isClaimableLoading: false,
                        isClaimableError: "Bounty is not claimable",
                      }));
                    }
                  }, 2000);
                } catch (error: any) {
                  console.error("Error during execution:", error);
                  setShouldGiveBountyState((prevState) => ({
                    ...prevState,
                    isClaimableLoading: false,
                    isClaimableError: error.message,
                  }));
                }

                setShouldGiveBountyState((prevState) => ({
                  ...prevState,
                  prAndIssueMatchingLoading: false,
                  prAndIssueMatchingSuccess:
                    "Data request transmitted successfully",
                }));
                console.log("Data request transmitted successfully");
              }
            } catch (error: any) {
              console.error("Error transmitting data request:", error);
              setShouldGiveBountyState((prevState) => ({
                ...prevState,
                prAndIssueMatchingLoading: false,
                prAndIssueMatchingError: error.message,
              }));
            }
          }, 2000); // Delay of 2 seconds
        } else {
          setShouldGiveBountyState((prevState) => ({
            ...prevState,
            verifyPROwnerLoading: false,
            verifyPROwnerError: "PR owner does not match logged in user",
          }));

          throw new Error("PR owner does not match logged in user");
        }
      } else {
        setShouldGiveBountyState((prevState) => ({
          ...prevState,
          verifyPROwnerLoading: false,
          verifyPROwnerError: "Error verifying PR owner",
        }));
      }
    } catch (error: any) {
      console.error("Error verifying PR owner:", error);
      setShouldGiveBountyState((prevState) => ({
        ...prevState,
        verifyPROwnerLoading: false,
        verifyPROwnerError: error.message,
      }));
    }
  };

  // const getLatestAnswerForIssue = async (issueId: number) => {
  //   try {
  //     toast.loading("Fetching latest answer for issue ID");

  //     if (publicClient && walletClient && loggedInAddress) {
  //       const data = await walletClient.writeContract({
  //         address: CONTRACT_ADDRESS,
  //         abi: CONTRACT_ABI,
  //         functionName: "latestAnswerIssueId",
  //         args: [issueId],
  //         chain: baseSepolia,
  //         account: loggedInAddress as `0x${string}`,
  //       });

  //       console.log(data, `Latest answer for issue ID ${issueId}`);
  //       toast.success("Latest answer fetched successfully");
  //       return data as any; // Type appropriately based on expected result structure
  //     }
  //   } catch (error) {
  //     console.error("Error fetching the latest answer:", error);
  //     toast.error("Error fetching the latest answer");
  //   } finally {
  //     toast.dismiss();
  //   }
  // };

  // async function fetchIssues(
  //   owner = "shadcn-ui",
  //   repo = "next-template",
  //   issueNumber: number
  // ) {
  //   try {
  //     const {data} = await axios.get(
  //       `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
  //       {
  //         headers: {
  //           Accept: "application/vnd.github+json",
  //           Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
  //           "X-GitHub-Api-Version": "2022-11-28",
  //         },
  //       }
  //     );

  //     if (data) {
  //       const data1 = data.filter(
  //         (issues: any) => !issues.hasOwnProperty("pull_request")
  //       );

  //       console.log(data1, "data1");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

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
        executeVerifyPRFunction,
        shouldGiveBountyState,
        setShouldGiveBountyState,
        step,
        setStep,
        createIssueLoading,
        executeWithValidAnswer,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
