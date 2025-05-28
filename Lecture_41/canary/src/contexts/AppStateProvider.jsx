import { createContext, useContext, useReducer } from "react";
import SignalServer from "../classes/SignalServer";
import { useAuth } from "./AuthProvider";

const SOCKERSERVER_URL =
  "wss://0i527y6g3m.execute-api.us-east-2.amazonaws.com/V1/";

const signalServer = new SignalServer();

const AppStateContext = createContext();

let peerConnection = null;
let appLocalStream = null;
let appRemoteStream = null;
let iAmTheCaller = false;
let iAmTheCallee = false;
let ICECandidates = [];

let callSetup = initCallSetup();

let peerConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
    },
  ],
};

const initialState = {
  readyToCall: true,
  localStream: null,
  remoteStream: null,
  videoSource: null,
  audioSource: null,
  availableVideoSources: [],
  availableAudioSources: [],
  showRemoteStream: false,
  onlineUsers: [],
  error: "",
  notOnline: false,
  incomingCall: null,
  callDeclined: false,
  inCall: false,
  waitingForAnswer: false,
  answerDeclined: false,
  partyHungup: false,
  inCallWith: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "incomingCall":
      return {
        ...state,
        readyToCall: false,
        callDeclined: false,
        answerDeclined: false,
        partyHungup: false,
        incomingCall: action.payload,
      };

    case "notOnline":
      return { ...state, notOnline: true, inCallWith: action.payload };

    case "offSent":
      return {
        ...state,
        waitingForAnswer: true,
        callDeclined: false,
        partyHungup: false,
        inCallWith: action.payload,
      };

    case "logout":
      return initialState;

    case "updateOnlineUsers":
      return { ...state, onlineUsers: action.payload };

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
      onlineUsers,
      readyToCall,
      notOnline,
      incomingCall,
      callDeclined,
      inCall,
      waitingForAnswer,
      answerDeclined,
      partyHungup,
      inCallWith,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  const { user } = useAuth();

  function initCallDirection(caller, callee) {
    iAmTheCaller = caller;
    iAmTheCallee = callee;
  }

  function initCallSetup() {
    ICECandidates = [];
    return {
      callerEmail: null,
      callerConnectionId: null,
      calleeEmail: null,
      calleeConnectionId: null,
      offer: null,
      answer: null,
    };
  }

  async function startCall(toEmail) {
    console.log("Starting a video chat with:", toEmail);
    initCallDirection(true, false);
    callSetup = initCallSetup();
    callSetup.callerEmail = user["email"];
    callSetup.calleeEmail = toEmail;

    // setup the peer connection
    createPeerConnection();

    try {
      console.log(`Creating offer for ${toEmail}`);
      const offer = await peerConnection.createOffer();
      peerConnection.setLocalDescription(offer);
      callSetup.offer = offer;
      signalServer.sendOffer(user.email, toEmail, offer);
    } catch (err) {
      console.log(err);
      dispatch({ type: "error", payload: "Failed to create the offer" });
      initCallDirection(false, false);
      callSetup = initCallSetup();
      return;
    }
  }

  function createPeerConnection() {
    try {
      peerConnection = new RTCPeerConnection(peerConfiguration);
      appRemoteStream = new MediaStream();
      appLocalStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, appLocalStream);
      });

      peerConnection.addEventListener("icecandiate", async (e) => {
        if (e.candidate) {
          ICECandidates.push(e.candidate);
          console.log("Received my ICE candidate");
        }
      });

      peerConnection.addEventListener("track", (e) => {
        console.log("Got a track from the remote user");
      });
    } catch (err) {
      console.log(err);
      dispatch({ type: "error", payload: "Failed to create peer connection" });
      initCallDirection(false, false);
      return;
    }
  }

  function closeConnections() {
    signalServer.sendTearDown();
  }

  function appStateLogout() {
    dispatch({ type: "logout" });
  }

  function onUserHandler(connections) {
    dispatch({ type: "updateOnlineUsers", payload: connections });
  }

  function onOfferHandler(cs) {
    console.log("In onOfferHandler");
    ICECandidates = [];
    callSetup.callerConnectionId = cs.callerConnectionId;
    callSetup.calleeConnectionId = cs.calleeConnectionId;
    callSetup.callerEmail = cs.callerEmail;
    callSetup.calleeEmail = cs.calleeEmail;
    callSetup.offer = cs.offer;
    dispatch({ type: "incomingCall", payload: cs.callerEmail });
  }

  function onOfferSentHandler(cs) {
    console.log("offerSent msg received");
    callSetup.callerConnectionId = cs.callerConnectionId;
    callSetup.calleeConnectionId = cs.calleeConnectionId;
    if (callSetup.calleeConnectionId) {
      dispatch({ type: "offerSent", payload: callSetup.calleeEmail });
    } else {
      dispatch({ type: "notOnline", payload: callSetup.calleeEmail });
      callSetup = initCallSetup();
    }
  }

  function onErrorHandler(errorMsg) {
    dispatch({ type: "error", payload: errorMsg });
  }

  function connectSignalServer() {
    signalServer.connect(SOCKERSERVER_URL, user.email);
    signalServer.onUsers = onUserHandler;
    signalServer.onOffer = onOfferHandler;
    signalServer.onOfferSent = onOfferSentHandler;
    signalServer.onError = onErrorHandler;
  }

  function buildMediaConstraints(vs, as) {
    let videoConstraints = true;
    let audioConstraints = true;
    const minWidth = 200;
    const minHeight = 200;

    if (vs) {
      videoConstraints = {
        deviceId: vs.deviceId,
        width: { min: minWidth },
        height: { min: minHeight },
      };
    }
    if (as) {
      audioConstraints = {
        deviceId: as.deviceId,
      };
    }
    const constraints = { audio: audioConstraints, video: videoConstraints };
    console.log("Current media constraints:", constraints);
    return constraints;
  }

  async function startLocalStream(vsource, asource) {
    try {
      appLocalStream = await navigator.mediaDevices.getUserMedia(
        buildMediaConstraints(vsource, asource),
      );
      dispatch({ type: "startLocalStream", payload: appLocalStream });
      return true;
    } catch (err) {
      console.log(err);
      dispatch({ type: "error", payload: err });
    }
  }

  function updateVideoSource(source) {
    startLocalStream(source, audioSource);
    dispatch({ type: "videoSource", payload: source });
  }

  function updateAudioSource(source) {
    startLocalStream(videoSource, source);
    dispatch({ type: "audioSource", payload: source });
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
        updateVideoSource,
        updateAudioSource,
        connectSignalServer,
        closeConnections,
        appStateLogout,
        startCall,
        localStream,
        remoteStream,
        audioSource,
        videoSource,
        availableAudioSources,
        availableVideoSources,
        showRemoteStream,
        onlineUsers,
        readyToCall,
        notOnline,
        incomingCall,
        callDeclined,
        inCall,
        waitingForAnswer,
        answerDeclined,
        partyHungup,
        inCallWith,
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
