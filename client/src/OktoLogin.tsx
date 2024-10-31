import {useEffect, useState} from "react";
import {OktoContextType, PortfolioData, useOkto, User} from "okto-sdk-react";
import {GoogleLogin} from "@react-oauth/google";
import {Button} from "./components/ui/button";
import {encodeFunctionData} from "viem";

function OktoLoginPage() {
  const [authToken, setAuthToken] = useState(null);
  const {
    authenticate,
    isLoggedIn,
    logOut,
    getUserDetails,
    getPortfolio,
    getSupportedNetworks,
    getWallets,
    executeRawTransaction,
    // executeRawTransactionWithJobStatus,
    // getNftOrderDetails,
    // getRawTransactionStatus,
    // transferNft,
    // transferNftWithJobStatus,
    // transferTokens,
    // transferTokensWithJobStatus,
  } = useOkto() as OktoContextType;

  const handleGoogleLogin = async (credentialResponse: any) => {
    console.log("Google login response:", credentialResponse);
    const idToken = credentialResponse.credential;
    console.log("google idtoken: ", idToken);
    authenticate(idToken, async (authResponse, error) => {
      if (authResponse) {
        console.log("Authentication check: ", authResponse);
        setAuthToken(authResponse.auth_token);
        console.log("auth token received", authToken);
      }
      if (error) {
        console.error("Authentication error:", error);
      }
    });
  };

  const onLogoutClick = () => {
    try {
      logOut();
    } catch (error) {
      console.log("Error logging out", error);
    }
  };

  console.log(authToken, "auth token");

  const [user, setUser] = useState<User>();
  const [userPortfolio, setUserPortfolio] = useState<PortfolioData>();
  const [wallets, setWallets] = useState<string>();

  useEffect(() => {
    (async function () {
      try {
        if (isLoggedIn) {
          const user = await getUserDetails();
          const portfolio = await getPortfolio();
          setUserPortfolio(portfolio);
          setUser(user);
        }

        const wallets = await getWallets();
        console.log("Wallets", wallets);
        if (wallets.wallets.length > 0) {
          const neededWallet = wallets.wallets.filter(
            (wallet: any) => wallet.network_name === "POLYGON_TESTNET_AMOY"
          );
          setWallets(neededWallet[0].address);
        }

        const networks = await getSupportedNetworks();
        console.log("Networks", networks);

        const wallet = await getWallets();
        console.log("Wallet", wallet);

        console.log("Wallet", wallet);
      } catch (error) {
        console.log("Error fetching user details", error);
      }
    })();
  }, [isLoggedIn]);

  console.log("User", user);

  const [txId, setTxId] = useState<any | null>(null);

  const abi = [
    {
      inputs: [],
      name: "increment",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getCounterValue",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  const transactions = async () => {
    try {
      if (wallets !== undefined) {
        const tx = await executeRawTransaction({
          network_name: "POLYGON_TESTNET_AMOY",
          transaction: {
            // token_address: "0xAfDC14a8b51Fd564cF2e592e3fDbD0a972F501df",
            // recipient_address: "0x10AbbDc83E8e33974650cB897b16250E07979CBa",
            // data: "0x",
            // quantity: "0x100000",
            from: wallets,
            to: "0x5Eb09C227CA7C2c7Cf16d05Ef62388a989F7e0Fa",
            // value: "0x100000",
            data: encodeFunctionData({
              abi: abi,
              functionName: "increment",
              args: [],
            }),
            value: "0x0",
          },
        });
        // const tx = await transferTokens({
        //   network_name: "POLYGON_TESTNET_AMOY",
        //   token_address: "0x2f7b97837f2d14ba2ed3a4b2282e259126a9b848",
        //   recipient_address: "0x10AbbDc83E8e33974650cB897b16250E07979CBa",
        //   quantity: "1",
        // });

        console.log(tx, "tx");

        setTxId(tx);
      }
    } catch (error) {
      console.log("Error executing transaction", error);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center">
      {!isLoggedIn ? (
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      ) : (
        <div className="text-black">
          <Button onClick={onLogoutClick}>Authenticated, Logout</Button>
          <pre>
            <code>{JSON.stringify(user, null, 2)}</code>
          </pre>
          <pre>
            <code>{JSON.stringify(userPortfolio, null, 2)}</code>
          </pre>
        </div>
      )}

      <Button onClick={transactions}>Send Tx</Button>

      {txId && (
        <div>
          <pre>
            <code>{JSON.stringify(txId, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

export default OktoLoginPage;
