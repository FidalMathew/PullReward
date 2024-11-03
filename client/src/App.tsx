import {BrowserRouter, Route, Routes} from "react-router-dom";
import HomePage from "./Home";
import {BuildType, OktoProvider} from "okto-sdk-react";
import {GoogleOAuthProvider} from "@react-oauth/google";
import GlobalContextProvider from "./Context/GlobalContext";
import OktoLoginPage from "./OktoLogin";
import {ParticleConnectkit} from "./lib/ParticleConfig";
import Connect from "./connect";

function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
  return (
    <>
      <OktoProvider
        apiKey={import.meta.env.VITE_OKTO_APP_SECRET!}
        buildType={BuildType.SANDBOX}
      >
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <ParticleConnectkit>
            <GlobalContextProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/oktologin" element={<OktoLoginPage />} />
                  <Route path="/connect" element={<Connect />} />
                  <Route path="*" element={<div>Not Found</div>} />
                </Routes>
              </BrowserRouter>
            </GlobalContextProvider>
          </ParticleConnectkit>
        </GoogleOAuthProvider>
      </OktoProvider>
    </>
  );
}

export default App;
