import { createContext, useContext, useReducer } from "react";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const initialState = { user: null, isAuthenticated: false };

  const [{ user, isAuthenticated }, dispatch] = useReducer(
    reducer,
    initialState,
  );

  function reducer(state, action) {
    switch (action.type) {
      case "login":
        return { ...state, user: action.payload, isAuthenticated: true };
      case "logout":
        return { ...state, user: null, isAuthenticated: false };
      default:
        throw new Error("unknown state");
    }
  }

  function login(email, password) {
    let user = { email: email, password: password };
    dispatch({ type: "login", payload: user });
  }

  function logout() {
    dispatch({ type: "logout" });
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("AuthContext used outside AuthProvider");
  return context;
}

export { AuthProvider, useAuth };
