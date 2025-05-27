import { useAppState } from "../contexts/AppStateProvider";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthProvider";

function CallSelectorButton({ enabled, handleUserSelection }) {
  const [email, setEmail] = useState("");
  const [onlineExceptMe, setOnlineExceptMe] = useState([]);

  const { user } = useAuth();
  const { onlineUsers } = useAppState();

  const onlineNowMsg = "--- online now ---";

  function handleSubmit(e) {
    e.preventDefault();
    console.log("email submitted:", email);
    handleUserSelection(email);
  }

  function handleOnChange(e) {
    if (e.target.value != onlineNowMsg) {
      setEmail(e.target.value);
    }
  }

  useEffect(() => {
    setOnlineExceptMe(onlineUsers.filter((u) => u.email !== user.email));
  }, [onlineUsers, user]);

  return (
    <form className="grid w-48 grid-cols-3 gap-2" onSubmit={handleSubmit}>
      <button
        type="submit"
        disabled={!enabled}
        className="inline-block rounded-full bg-yellow-400 px-2 py-1 text-xs font-semibold tracking-wide text-stone-800 uppercase transition-colors duration-300 hover:bg-yellow-300 focus:bg-yellow-300 focus:ring focus:ring-yellow-300 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-500"
      >
        Call
      </button>
      <div className="flex gap-3">
        <div>
          <input
            className="block w-3xs rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            type="email"
            placeholder="email"
            id="email"
            name="email"
            value={email}
            readOnly
          />
        </div>
        <div>
          <select
            className="block w-3xs rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            onChange={handleOnChange}
          >
            <option>{onlineNowMsg}</option>
            {onlineExceptMe.map((u) => (
              <option value={u.email} key={u.email}>
                {u.email}
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
}

export default CallSelectorButton;
