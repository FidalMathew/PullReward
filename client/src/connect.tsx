import {useConnect} from "@particle-network/authkit";
import {Button} from "./components/ui/button";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";

export default function Connect() {
  // Handle user login
  const {connect, connected} = useConnect();
  const handleLogin = async () => {
    if (!connected) {
      await connect({});
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (connected) {
      navigate("/");
    }
  }, [connected]);

  return (
    <div className="h-screen w-full flex justify-center items-center">
      <Button onClick={() => handleLogin()}>Connect</Button>
    </div>
  );
}
