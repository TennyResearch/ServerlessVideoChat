import { useAppState } from "../contexts/AppStateProvider";
import LocalStream from "./LocalStream";
import RemoteStream from "./RemoteStream";
import { useEffect } from "react";
import VideoInputSelector from "./VideoInputSelector";
import AudioInputSelector from "./AudioInputSelector";
import WaitingForUsers from "./WaitingForUsers";
import CallSelectorButton from "./CallSelectionButton";

function Main() {
  const { showRemoteStream, getAvailableDevices, readyToCall, onlineUsers } =
    useAppState();

  function handleUserSelection() {}

  useEffect(function () {
    getAvailableDevices();
  }, []);

  return (
    <div className="mx-5 my-5 overflow-scroll">
      <main>
        <div className="flex flex-row gap-3 py-2">
          {readyToCall && onlineUsers.length <= 1 && <WaitingForUsers />}
          {readyToCall && onlineUsers.length > 1 && (
            <CallSelectorButton
              enabled={true}
              handleUserSelection={handleUserSelection}
            />
          )}
        </div>
        <div className="flex flex-row gap-8 py-2">
          <LocalStream />
          {showRemoteStream && <RemoteStream />}
        </div>
        <div className="py-2">
          <div className="py-3">
            <VideoInputSelector />
          </div>
          <div className="py-3">
            <AudioInputSelector />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Main;
