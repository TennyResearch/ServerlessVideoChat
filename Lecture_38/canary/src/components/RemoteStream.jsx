import { useAppState } from "../contexts/AppStateProvider";
import { useEffect, useRef } from "react";

function RemoteStream() {
  const { remoteStream } = useAppState();
  const videoRef = useRef(null);

  useEffect(() => {
    let current = videoRef.current;
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
    return () => {
      if (current) {
        current.srcObject = null;
      }
    };
  }, [remoteStream]);

  return (
    <video
      className="h-auto w-96"
      ref={videoRef}
      autoPlay
      playsInline
      controls
    />
  );
}

export default RemoteStream;
