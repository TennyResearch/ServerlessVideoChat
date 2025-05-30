import { useAuth } from "../contexts/AuthProvider";
import { useAppState } from "../contexts/AppStateProvider";

function Status() {
  const { isAuthenticated, user } = useAuth();
  const { onlineUsers, waitingForAnswer, notOnline, incomingCall, inCallWith } =
    useAppState();

  return (
    <div>
      <div className="flex flex-row bg-emerald-200 text-sm text-gray-800">
        {isAuthenticated && (
          <div className="px-2">
            [<span className="font-bold">{user.email}]</span>
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
