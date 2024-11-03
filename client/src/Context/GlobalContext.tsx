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

export const GlobalContext = createContext({
  walletClient: null as WalletClient | null,
  publicClient: null as PublicClient | null,
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

  return (
    <GlobalContext.Provider
      value={{
        walletClient,
        publicClient,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
