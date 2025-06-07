export default class SignalServer {
  // instance fields
  socketServerURL;
  socket;
  email;
  remoteUserEmail;
  remoteUserConnectionId;
  localUserConnectionId;

  constructor() {
    this.socketServerURL = null;
    this.socket = null;
    this.email = null;
    this.remoteUserConnectionId = null;
    this.localUserConnectionId = null;
  }

  get accessToken() {
    return this._access_token;
  }
  set accessToken(token) {
    this._access_token = token;
  }

  get onUsers() {
    if (this._onusers) return this._onusers;
    return () => {};
  }
  set onUsers(handler) {
    this._onusers = handler;
  }

  get onError() {
    if (this._onerror) return this._onerror;
    return () => {};
  }
  set onError(handler) {
    this._onerror = handler;
  }

  get onOffer() {
    if (this._onoffer) return this._onoffer;
    return () => {};
  }
  set onOffer(handler) {
    this._onoffer = handler;
  }

  get onOfferSent() {
    if (this._onoffersent) return this._onoffersent;
    return () => {};
  }
  set onOfferSent(handler) {
    this._onoffersent = handler;
  }

  get onAnswer() {
    if (this._onanswer) return this._onanswer;
    return () => {};
  }
  set onAnswer(handler) {
    this._onanswer = handler;
  }

  get onAnswerSent() {
    if (this._onanswersent) return this._onanswersent;
    return () => {};
  }
  set onAnswerSent(handler) {
    this._onanswersent = handler;
  }

  get onDecline() {
    if (this._ondecline) return this._ondecline;
    return () => {};
  }
  set onDecline(handler) {
    this._ondecline = handler;
  }

  get onDeclineSent() {
    if (this._ondeclinesent) return this._ondeclinesent;
    return () => {};
  }
  set onDeclineSent(handler) {
    this._ondeclinesent = handler;
  }

  get onICECandidates() {
    if (this._onicecandidates) return this._onicecandidates;
    return () => {};
  }
  set onICECandidates(handler) {
    this._onicecandidates = handler;
  }

  get onHangup() {
    if (this._onhangup) return this._onhangup;
    return () => {};
  }
  set onHangup(handler) {
    this._onhangup = handler;
  }

  get onHangupSent() {
    if (this._onhanhupsent) return this._onhangupsent;
    return () => {};
  }
  set onHangupSent(handler) {
    this.onhangupsent = handler;
  }

  socketOnOpen() {
    console.log("SocketServer: onOpen");
    this.sendSetup();
  }

  socketOnClose() {
    console.log("SocketServer: onClose");
  }

  socketOnError(event) {
    console.log("SocketServer: onError", event);
    this.onError("Failed to connect to the SignalServer");
  }

  socketOnMessage(event) {
    const msg = JSON.parse(event.data);
    console.log("SocketServer: onMessage()", msg);

    switch (msg.type) {
      case "setupComplete":
        console.log("setupComplete received");
        break;

      // either party can get this
      case "users":
        console.log("users received:", msg.connections);
        this.onUsers(msg.connections);
        break;

      // only the caller receives this msg
      case "offerSent":
        console.log("offerSent");
        this.localUserConnectionId = msg.callSetup.callerConnectionId;
        this.remoteUserConnectionId = msg.callSetup.calleeConnectionId;
        this.onOfferSent(msg.callSetup);
        break;

      // only the callee receives this msg
      case "offer":
        console.log("offer received");
        this.remoteUserConnectionId = msg.callSetup.callerConnectionId;
        this.localUserConnectionId = msg.callSetup.calleeConnectionId;
        this.remoteUserEmail = msg.callSetup.callerEmail;
        console.log("Remote email address: ", this.remoteUserEmail);
        this.onOffer(msg.callSetup);
        break;

      // only caller gets this msg
      case "answer":
        console.log("answer received");
        this.onAnswer(msg.callSetup);
        break;

      // only the callee gets this msg
      case "answerSent":
        console.log("answerSent received");
        this.onAnswerSent();
        break;

      case "decline":
        console.log("decline received");
        this.onDecline();
        break;

      case "declineSent":
        console.log("decline sent");
        this.onDeclineSent();
        break;

      case "ice_candidates":
        console.log("ice_candidataes received");
        this.onICECandidates(msg.ice_candidates);
        break;

      case "hangup":
        console.log("hangup received");
        this.onHangup();
        break;

      case "hangupSent":
        console.log("hangup sent");
        this.onHangupSent();
        break;

      // either party can get this
      case "error":
        this.onError("Received error:", msg.error);
        break;

      default:
        this.onError(`Unknown message received from socket: ${event.data}`);
    }
  }

  initCallSetup() {
    return {
      callerEmail: null,
      callerConnectionId: null,
      offer: null,
      calleeEmail: null,
      calleeConnectionId: null,
      answer: null,
    };
  }

  sendSetup() {
    console.log("In sendSetup()");
    const msg = {
      action: "setup",
      user: { name: "", email: this.email },
    };
    this.socket.send(JSON.stringify(msg));
  }

  sendTearDown() {
    console.log("In sendTearDown()");
    const msg = {
      action: "teardown",
      user: { name: "", email: this.email },
    };
    this.socket.send(JSON.stringify(msg));
  }

  sendOffer(fromEmail, toEmail, offer) {
    console.log("sendOffer");
    const callSetup = this.initCallSetup();
    callSetup.offer = offer;
    callSetup.calleeEmail = toEmail;
    callSetup.callerEmail = fromEmail;

    const msg = {
      action: "send_offer",
      callSetup: callSetup,
    };
    this.socket.send(JSON.stringify(msg));
  }

  sendAnswer(answer) {
    console.log("sendAnswer()");
    const callSetup = this.initCallSetup();
    callSetup.callerConnectionId = this.remoteUserConnectionId;
    callSetup.answer = answer;

    const msg = {
      action: "send_answer",
      callSetup: callSetup,
    };
    this.socket.send(JSON.stringify(msg));
  }

  sendDecline() {
    console.log("sendDecline()");
    const callSetup = this.initCallSetup();
    callSetup.callerConnectionId = this.remoteUserConnectionId;

    const msg = {
      action: "send_decline",
      callSetup: callSetup,
    };
    this.socket.send(JSON.stringify(msg));
  }

  sendICECandidates(candidates) {
    console.log("sendICECandidates");
    const msg = {
      action: "send_ice_candidates",
      ice_info: {
        connectionId: this.remoteUserConnectionId,
        candidates: candidates,
      },
    };
    this.socket.send(JSON.stringify(msg));
  }

  sendHangup() {
    console.log("sendHangup");
    const msg = {
      action: "send_hangup",
      connectionId: this.remoteUserConnectionId,
    };
    this.socket.send(JSON.stringify(msg));
  }

  connect(url, email, token) {
    console.log("SignalServer: connect", email);
    this.socketServerURL = url;
    this.email = email;
    this.socket = new WebSocket(`${this.socketServerURL}?token=${token}`);
    this.socket.onopen = () => {
      this.socketOnOpen();
    };
    this.socket.onclose = (event) => {
      this.socketOnClose(event);
    };
    this.socket.onerror = (event) => {
      this.socketOnError(event);
    };
    this.socket.onmessage = (event) => {
      this.socketOnMessage(event);
    };
  }
}
