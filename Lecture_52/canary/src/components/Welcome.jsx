import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppState } from "../contexts/AppStateProvider";
import { useSearchParams } from "react-router-dom";

function Welcome() {
  const { isAuthenticated, user, isLoading, error } = useAuth();
  const { connectSignalServer } = useAppState();
  const navigate = useNavigate();
  const { removeUser } = useAuth();

  const [searchParams] = useSearchParams();
  const state = searchParams.get("state");
  const code = searchParams.get("code");

  useEffect(
    function () {
      if (state === "logout") {
        console.log("In logout");
        removeUser();
        navigate("/", { replace: true });
        return;
      }
      if (isAuthenticated && code) {
        console.log(
          "In Welcome component, redirecting because we are authenticated",
        );

        connectSignalServer(user.id_token);
        navigate("/main", { replace: true });
      }
    },
    [
      isAuthenticated,
      navigate,
      connectSignalServer,
      state,
      code,
      removeUser,
      user,
    ],
  );

  return (
    <div>
      {!isAuthenticated && <div>You are not logged in, please log in</div>}
      {isAuthenticated && <div>Redirecting...</div>}
      {isLoading && <div>Is loading...</div>}
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}

export default Welcome;
