import { NavLink } from "react-router-dom";
import Button from "./Button";
import { useAppState } from "../contexts/AppStateProvider";
import { useAuth } from "react-oidc-context";

function Header() {
  const { isAuthenticated, signinRedirect } = useAuth();
  const { closeConnections, appStateLogout, signOutRedirect } = useAppState();

  function handleLogout() {
    closeConnections();
    appStateLogout();
    signOutRedirect();
  }

  return (
    <div>
      <nav className="md-text-base flex items-baseline justify-between bg-stone-800 px-4 py-4 text-lg text-stone-200 sm:px-6">
        <NavLink to="/">(logo) Canary</NavLink>
        <div className="mx-2">
          <NavLink to="/about" className="mx-4">
            About
          </NavLink>
          {!isAuthenticated && (
            <Button enabled={true} onClick={() => signinRedirect()}>
              Login
            </Button>
          )}
          {isAuthenticated && (
            <Button enabled={true} onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Header;
