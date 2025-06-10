import { createContext, useContext, useReducer } from "react";
import SignalServer from "../classes/SignalServer";
import { useAuth } from "react-oidc-context";

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
  answerPending: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "partyHungup":
      return { ...state, partyHungup: true, inCall: false };

    case "callDeclined":
      return {
        ...state,
        callDeclined: true,
        answerDeclined: false,
        inCall: false,
        answerPending: false,
        waitingForAnswer: false,
        inCallWith: callSetup.calleeEmail,
      };

    case "hangUp":
      return {
        ...state,
        readyToCall: true,
        answerPending: false,
        inCall: false,
        incomingCall: false,
        declinedCall: false,
        waitingForAnswer: false,
      };

    case "endRemoteStream":
      return { ...state, showRemoteStream: false, remoteStream: null };

    case "answerDeclined":
      return {
        ...state,
        callDeclined: false,
        answerDeclined: true,
        answerPending: false,
        waitingForAnswer: false,
        inCallWith: callSetup.callerEmail,
        inCall: false,
        readyToCall: true,
      };

    case "inCall":
      return {
        ...state,
        inCall: true,
        showRemoteStream: true,
        incomingCall: false,
        readyToCall: false,
        answerPending: false,
        waitingForAnswer: false,
        inCallWith: iAmTheCaller
          ? callSetup.calleeEmail
          : callSetup.callerEmail,
      };
    case "startRemoteStream":
      return { ...state, remoteStream: action.payload };

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

    case "offerSent":
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
      answerPending,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  const { user } = useAuth();

  const signOutRedirect = () => {
    const clientId = "4tj2p5qmgtv47ag37qqg2iqns5";
    const logoutUri = "https://localhost:5173?state=logout";
    const cognitoDomain =
      "https://us-east-2nmxpojrpq.auth.us-east-2.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  function initCallDirection(caller, callee) {
    iAmTheCaller = caller;
    iAmTheCallee = callee;
  }

  function declineAnswer() {
    console.log("Decline to answer the call from ", callSetup.callerEmail);
    signalServer.sendDecline();
    dispatch({ type: "answerDeclined" });
    cleanUpCall();
  }

  function cleanUpCall() {
    endRemoteStream();
    resetPeerConnection();
    dispatch({ type: "hangUp" });
  }

  function endRemoteStream() {
    if (appRemoteStream) {
      appRemoteStream.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped track in remote stream");
      });
    }
    dispatch({ type: "endRemoteStream" });
  }

  function resetPeerConnection() {
    if (peerConnection) peerConnection.close();
  }

  function hangUp() {
    signalServer.sendHangup();
    cleanUpCall();
  }

  async function answerCall() {
    console.log("Answer call from ", callSetup.callerEmail);
    initCallDirection(false, true);

    createPeerConnection();
    try {
      peerConnection.setRemoteDescription(callSetup.offer);
      const answer = await peerConnection.createAnswer();
      peerConnection.setLocalDescription(answer);
      callSetup.answer = answer;
      signalServer.sendAnswer(answer);
    } catch (err) {
      console.log(err);
      dispatch({ type: "error", payload: "Failed to create the answer" });
      initCallDirection(false, false);
      callSetup = initCallSetup();
      return;
    }
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
      signalServer.sendOffer(user.profile.email, toEmail, offer);
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

      peerConnection.addEventListener("icecandidate", async (e) => {
        if (e.candidate) {
          ICECandidates.push(e.candidate);
          console.log("Received my ICE candidate");
        }
      });

      peerConnection.addEventListener("track", (e) => {
        console.log("Got a track from the remote user");
        e.streams[0].getTracks().forEach((track) => {
          appRemoteStream.addTrack(track, appRemoteStream);
        });
        dispatch({ type: "inCall" });
        dispatch({ type: "startRemoteStream", payload: appRemoteStream });
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

  function onAnswerHandler(cs) {
    console.log("Answer received");
    callSetup.answer = cs.answer;
    peerConnection.setRemoteDescription(cs.answer);
    signalServer.sendICECandidates(ICECandidates);
  }

  function onAnswerSentHandler() {
    console.log("Answer sent");
  }

  function onDeclineHandler() {
    console.log("Decline received");
    declineCall();
  }

  function declineCall() {
    cleanUpCall();
    dispatch({ type: "callDeclined" });
  }

  function onDeclineSentHandler() {
    console.log("Decline sent");
  }

  function onICECandidatesHandler(candidates) {
    console.log(`${candidates.length} ICE candidates received`);
    candidates.map((c) => {
      peerConnection.addIceCandidate(c);
    });
    if (iAmTheCallee) {
      signalServer.sendICECandidates(ICECandidates);
    }
  }

  function onHangupHandler() {
    console.log("Received hangup");
    cleanUpCall();
    dispatch({
      type: "partyHungup",
      payload: iAmTheCaller ? callSetup.calleeEmail : callSetup.callerEmail,
    });
  }

  function onHangupSentHandler() {
    console.log("Hangup sent");
  }

  function connectSignalServer(id_token) {
    signalServer.connect(SOCKERSERVER_URL, user.profile.email);
    signalServer.onUsers = onUserHandler;
    signalServer.onOffer = onOfferHandler;
    signalServer.onOfferSent = onOfferSentHandler;
    signalServer.onError = onErrorHandler;
    signalServer.onAnswer = onAnswerHandler;
    signalServer.onAnswerSent = onAnswerSentHandler;
    signalServer.onDecline = onDeclineHandler;
    signalServer.onDeclineSent = onDeclineSentHandler;
    signalServer.onICECandidates = onICECandidatesHandler;
    signalServer.onHangup = onHangupHandler;
    signalServer.onHangupSent = onHangupSentHandler;
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
        answerCall,
        declineAnswer,
        hangUp,
        signOutRedirect,
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
        answerPending,
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
