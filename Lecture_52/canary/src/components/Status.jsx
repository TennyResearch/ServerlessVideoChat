import { useAuth } from "react-oidc-context";
import { useAppState } from "../contexts/AppStateProvider";

function Status() {
  const { isAuthenticated, user } = useAuth();
  const {
    onlineUsers,
    waitingForAnswer,
    notOnline,
    incomingCall,
    inCallWith,
    inCall,
    callDeclined,
    answerDeclined,
    error,
  } = useAppState();

  return (
    <div>
      <div className="flex flex-row bg-emerald-200 text-sm text-gray-800">
        {isAuthenticated && (
          <div className="px-2">
            [<span className="font-bold">{user.profile.email}]</span>
          </div>
        )}
        {!isAuthenticated && <div className="px-2">[Not logged in]</div>}

        {isAuthenticated && (
          <div className="px-2">{onlineUsers.length} users online</div>
        )}

        {waitingForAnswer && (
          <div className="px-2">
            Waiting for answer from{" "}
            <span className="font-bold">{inCallWith}</span>
          </div>
        )}

        {callDeclined && (
          <div className="px-2">
            <span className="font-bold">{inCallWith}</span> has{" "}
            <span className="font-bold text-red-700">declined</span> to answer
            your call
          </div>
        )}

        {answerDeclined && (
          <div className="px-2">
            You <span className="font-bold text-red-700">declined</span> to
            answer the call from <span className="font-bold">{inCallWith}</span>
          </div>
        )}

        {inCall && (
          <div className="px-2">
            In call with <span className="font-bold">{inCallWith}</span>
          </div>
        )}

        {notOnline && (
          <div className="px-2">
            <span className="font-bold">{inCallWith}</span> is not online
          </div>
        )}

        {incomingCall && (
          <div className="px-2">
            Incoming call from <span className="font-bold">{incomingCall}</span>
          </div>
        )}
        {error && (
          <div className="px-2">
            <span className="font-bold text-red-700">Error: </span>
            {error}
          </div>
        )}
      </div>
      <footer className="flex items-baseline justify-end bg-amber-50 px-4 text-xs text-gray-950">
        <p>
          &copy; Copyright {new Date().getFullYear()} by Your name goes here.
        </p>
      </footer>
    </div>
  );
}

export default Status;
