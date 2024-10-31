import {BrowserRouter, Route, Routes} from "react-router-dom";
import HomePage from "./Home";
import {BuildType, OktoProvider} from "okto-sdk-react";
import {GoogleOAuthProvider} from "@react-oauth/google";
import AAContextProvider from "./Context/AAContext";
import OktoLoginPage from "./OktoLogin";

function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
  return (
    <>
      <OktoProvider
        apiKey={import.meta.env.VITE_OKTO_APP_SECRET!}
        buildType={BuildType.SANDBOX}
      >
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AAContextProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/oktologin" element={<OktoLoginPage />} />
                <Route path="*" element={<div>Not Found</div>} />
              </Routes>
            </BrowserRouter>
          </AAContextProvider>
        </GoogleOAuthProvider>
      </OktoProvider>
    </>
  );
}

export default App;
