import { useAppState } from "../contexts/AppStateProvider";
import { useEffect, useRef } from "react";

function LocalStream() {
  const { localStream } = useAppState();
  const videoRef = useRef(null);

  useEffect(() => {
    let current = videoRef.current;
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
    return () => {
      if (current) {
        current.srcObject = null;
      }
    };
  }, [localStream]);

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

export default LocalStream;
