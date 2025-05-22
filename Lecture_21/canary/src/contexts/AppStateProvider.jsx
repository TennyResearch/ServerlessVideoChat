import { createContext, useContext, useReducer } from "react";

const AppStateContext = createContext();

const initialState = {
  localStream: null,
  remoteStream: null,
  videoSource: null,
  audioSource: null,
  availableVideoSources: [],
  availableAudioSources: [],
  showRemoteStream: false,
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "startLocalStream":
      return { ...state, localStream: action.payload };
    case "audioSource":
      return { ...state, audioSource: action.payload };
    case "videoSource":
      return { ...state, videoSource: action.payload };
    case "audioSources":
      return { ...state, availableAudioSources: action.payload };
    case "videoSources":
      return { ...state, availableVideoSources: action.payload };
    case "error":
      return { ...state, error: action.payload };

    default:
      console.log(`Unknown state ${action.type}`);
      throw new Error("unknown state");
  }
}

function AppStateProvider({ children }) {
  const [
    {
      videoSource,
      audioSource,
      localStream,
      remoteStream,
      availableAudioSources,
      availableVideoSources,
      showRemoteStream,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  async function startLocalStream() {
    try {
      const appLocalStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      dispatch({ type: "startLocalStream", payload: appLocalStream });
      return true;
    } catch (err) {
      console.log(err);
      dispatch({ type: "error", payload: err });
    }
  }

  async function getAvailableDevices() {
    try {
      await startLocalStream();
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioSources = devices.filter((d) => d.kind === "audioinput");
      const videoSources = devices.filter((d) => d.kind === "videoinput");
      dispatch({ type: "audioSources", payload: audioSources });
      dispatch({ type: "videoSources", payload: videoSources });
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <AppStateContext.Provider
      value={{
        getAvailableDevices,
        localStream,
        remoteStream,
        audioSource,
        videoSource,
        availableAudioSources,
        availableVideoSources,
        showRemoteStream,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("AppStateContext used outside of AppStateProvider");
  }
  return context;
}

export { AppStateProvider, useAppState };
