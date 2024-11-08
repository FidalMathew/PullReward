import {useAuthCore, useConnect} from "@particle-network/authkit";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useNavigate} from "react-router-dom";

export default function Navbar() {
  const {userInfo} = useAuthCore();
  const {connected, disconnect} = useConnect();
  const navigate = useNavigate();

  const handleDisconnect = async () => {
    if (connected) {
      await disconnect();
      navigate("/connect");
    }
  };

  return (
    <div className="w-full h-[70px] border-b flex justify-between items-center px-6">
      <div>
        <b>PullRewards</b>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <p className="font-semibold">
            {/* {userInfo?.wallets[0].chain_name === "evm_chain" &&
              userInfo?.wallets[0].public_address?.slice(0, 6) +
                "..." +
                userInfo?.wallets[0].public_address?.slice(-4)} */}

            {userInfo?.wallets
              .find((wallet) => wallet.chain_name === "evm_chain")
              ?.public_address?.slice(0, 6) +
              "..." +
              userInfo?.wallets
                .find((wallet) => wallet.chain_name === "evm_chain")
                ?.public_address?.slice(-4)}
          </p>
        </div>

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage
                  src={userInfo?.avatar || "https://github.com/shadcn.png"}
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={handleDisconnect}
                className="text-red-500"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
