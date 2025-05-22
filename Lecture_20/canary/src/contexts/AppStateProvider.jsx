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
};

function reducer(state, action) {
  switch (action.type) {
    case "audioSource":
      return { ...state, audioSource: action.payload };
    case "videoSource":
      return { ...state, videoSource: action.payload };
    case "availableAudioSources":
      return { ...state, availableAudioSources: action.payload };
    case "availableVideoSources":
      return { ...state, availableVideoSources: action.payload };
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
      availableAudioSources,
      availableVideoSources,
      showRemoteStream,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  return (
    <AppStateContext.Provider
      value={{
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
