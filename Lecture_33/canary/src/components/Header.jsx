import { useAuth } from "../contexts/AuthProvider";
import { NavLink } from "react-router-dom";
import Button from "./Button";

function Header() {
  const { logout, isAuthenticated } = useAuth();

  function handleLogout() {
    logout();
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
            <NavLink
              to="/login"
              className="inline-block rounded-4xl bg-yellow-400 px-4 py-1 font-semibold -tracking-normal text-stone-800 transition-colors duration-300 hover:bg-yellow-300 focus:bg-yellow-300 focus:ring focus:ring-yellow-300 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed"
            >
              Login
            </NavLink>
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
