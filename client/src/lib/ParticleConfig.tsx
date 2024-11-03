import {ConnectKitProvider, createConfig} from "@particle-network/connectkit";
import {authWalletConnectors} from "@particle-network/connectkit/auth";
import {evmWalletConnectors, injected} from "@particle-network/connectkit/evm";
import {EntryPosition, wallet} from "@particle-network/connectkit/wallet";
import {PropsWithChildren} from "react";
import {baseSepolia, sepolia} from "@particle-network/connectkit/chains";

const projectId = import.meta.env.VITE_PARTICLE_PROJECT_ID!;
const clientKey = import.meta.env.VITE_PARTICLE_CLIENT_KEY!;
const appId = import.meta.env.VITE_PARTICLE_APP_ID!;
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID!;

const config = createConfig({
  projectId,
  clientKey,
  appId,
  appearance: {
    // Optional, collection of properties to alter the appearance of the connection modal
    // Optional, label and sort wallets (to be shown in the connection modal)
    recommendedWallets: [
      {walletId: "metaMask", label: "Recommended"},
      // {walletId: "coinbaseWallet", label: "popular"},
    ],
    splitEmailAndPhone: false, // Optional, displays Email and phone number entry separately
    collapseWalletList: false, // Optional, hide wallet list behind a button
    hideContinueButton: false, // Optional, remove "Continue" button underneath Email or phone number entry
    connectorsOrder: ["social"], //  Optional, sort connection methods (index 0 will be placed at the top)
    language: "en-US", // Optional, also supported ja-JP, zh-CN, zh-TW, and ko-KR
    mode: "light", // Optional, changes theme between light, dark, or auto (which will change it based on system settings)
    theme: {
      "--pcm-accent-color": "#ff4d4f",
      // ... other options
    },
    // logo: "https://...",
    // filterCountryCallingCode: (countries) => {
    //   // Optional, whitelist or blacklist phone numbers from specific countries
    //   return countries.filter((item) => item === "US");
    // },
  },
  walletConnectors: [
    evmWalletConnectors({
      metadata: {
        name: "my-projects",
        description: "AppKit Example",
        url: "https://reown.com/appkit", // origin must match your domain & subdomain
      }, // Optional, this is Metadata used by WalletConnect and Coinbase
      walletConnectProjectId: walletConnectProjectId, // optional, retrieved from https://cloud.walletconnect.com
      connectorFns: [injected({target: "metaMask"})],
    }),
    authWalletConnectors({
      // Optional, configure this if you're using social logins
      authTypes: ["github"], // Optional, restricts the types of social logins supported
      fiatCoin: "USD", // Optional, also supports CNY, JPY, HKD, INR, and KRW
      // promptSettingConfig: {
      //   // Optional, changes the frequency in which the user is asked to set a master or payment password
      //   // 0 = Never ask
      //   // 1 = Ask once
      //   // 2 = Ask always, upon every entry
      //   // 3 = Force the user to set this password
      //   promptMasterPasswordSettingWhenLogin: 1,
      //   promptPaymentPasswordSettingWhenSign: 1,
      // },
    }),
    // solanaWalletConnectors(), // Optional, you need to configure it when using Solana
  ],
  plugins: [
    wallet({
      widgetIntegration: "modal", // Optional, enables the wallet modal to be embedded in the page
      // Optional configurations for the attached embedded wallet modal
      entryPosition: EntryPosition.BR, // Alters the position in which the modal button appears upon login
      visible: true, // Dictates whether or not the wallet modal is included/visible or not
    }),
  ],
  chains: [sepolia, baseSepolia],
});

export const ParticleConnectkit = ({children}: PropsWithChildren) => {
  return <ConnectKitProvider config={config}>{children}</ConnectKitProvider>;
};
