import { useAppState } from "../contexts/AppStateProvider";
import LocalStream from "./LocalStream";
import RemoteStream from "./RemoteStream";
import { useEffect } from "react";
import VideoInputSelector from "./VideoInputSelector";
import AudioInputSelector from "./AudioInputSelector";
import WaitingForUsers from "./WaitingForUsers";
import CallSelectorButton from "./CallSelectionButton";
import ActionButton from "./ActionButton";

function Main() {
  const {
    showRemoteStream,
    getAvailableDevices,
    readyToCall,
    onlineUsers,
    startCall,
    incomingCall,
    answerCall,
    declineAnswer,
    inCall,
    hangUp,
  } = useAppState();

  function handleUserSelection(toEmail) {
    startCall(toEmail);
  }

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
          {incomingCall && (
            <ActionButton enabled={true} onClick={answerCall}>
              Answer
            </ActionButton>
          )}
          {incomingCall && (
            <ActionButton enabled={true} onClick={declineAnswer}>
              Decline
            </ActionButton>
          )}
          {inCall && (
            <ActionButton enabled={true} onClick={hangUp}>
              Hang Up
            </ActionButton>
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
