import { useAppState } from "../contexts/AppStateProvider";
import LocalStream from "./LocalStream";
import RemoteStream from "./RemoteStream";
import { useEffect } from "react";
import VideoInputSelector from "./VideoInputSelector";
import AudioInputSelector from "./AudioInputSelector";

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
