import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Main from "./components/Main";
import About from "./components/About";
import HomePage from "./pages/HomePage";
import PageNotFound from "./pages/PageNotFound";
import { AuthProvider } from "react-oidc-context";
import { AppStateProvider } from "./contexts/AppStateProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Welcome from "./components/Welcome";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_nMxpoJRPq",
  client_id: "4tj2p5qmgtv47ag37qqg2iqns5",
  redirect_uri: "https://localhost:5174",
  response_type: "code",
  scope: "phone openid email",
};

function App() {
  return (
    <AuthProvider {...cognitoAuthConfig}>
      <AppStateProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />}>
              <Route path="/" element={<Welcome />} />
              <Route
                path="main"
                element={
                  <ProtectedRoute>
                    <Main />
                  </ProtectedRoute>
                }
              />
              <Route path="about" element={<About />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      </AppStateProvider>
    </AuthProvider>
  );
}

export default App;
