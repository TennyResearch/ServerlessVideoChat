import { useAuth } from "../contexts/AuthProvider";
import { useAppState } from "../contexts/AppStateProvider";
import { useState } from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Login() {
  const { login, isAuthenticated } = useAuth();
  const { connectSignalServer } = useAppState();

  const navigate = useNavigate();

  const [email, setEmail] = useState("jack@example.com");
  const [password, setPassword] = useState("qwerty");

  function doSubmit(e) {
    e.preventDefault();
    login(email, password);
  }

  useEffect(
    function () {
      if (isAuthenticated) {
        connectSignalServer();
        navigate("/app", { replace: true });
      }
    },
    [isAuthenticated, navigate, connectSignalServer],
  );

  return (
    <main className="m-10 px-10">
      <form onSubmit={doSubmit} className="m-32 flex flex-col gap-2 px-8">
        <div className="flex flex-row gap-1">
          <label htmlFor="email" className="px-2">
            Email
          </label>
          <input
            className="border-1 bg-gray-100"
            htmlFor="email"
            type="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>
        <div className="flex flex-row gap-1">
          <label htmlFor="password" className="px-2">
            Password
          </label>
          <input
            className="border-1 bg-gray-100"
            type="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>
        <div>
          <Button enabled={true}>Login</Button>
        </div>
      </form>
    </main>
  );
}

export default Login;
