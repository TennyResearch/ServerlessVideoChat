import { useAppState } from "../contexts/AppStateProvider";
import LocalStream from "./LocalStream";
import RemoteStream from "./RemoteStream";
import { useEffect } from "react";

function Main() {
  const { showRemoteStream, getAvailableDevices } = useAppState();

  useEffect(function () {
    getAvailableDevices();
  }, []);

  return (
    <div className="mx-5 my-5 overflow-scroll">
      <main>
        <div className="flex flex-row gap-8 py-2">
          <LocalStream />
          {showRemoteStream && <RemoteStream />}
        </div>
      </main>
    </div>
  );
}

export default Main;
