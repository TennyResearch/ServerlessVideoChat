import { useAuth } from "../contexts/AuthProvider";

function Status() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      <div className="flex flex-row bg-emerald-200 text-sm text-gray-800">
        {isAuthenticated && (
          <div className="px-2">
            [<span className="font-bold">{user.email}]</span>
          </div>
        )}
        {!isAuthenticated && <div className="px-2">[Not logged in]</div>}
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
