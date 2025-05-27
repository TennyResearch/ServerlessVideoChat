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

  socketOnOpen() {
    console.log("SocketServer: onOpen");
    this.sendSetup();
  }

  socketOnClose() {
    console.log("SocketServer: onClose");
  }

  socketOnError() {
    console.log("SocketServer: onError");
  }

  socketOnMessage(event) {
    const msg = JSON.parse(event.data);
    console.log("SocketServer: onMessage()", msg);

    switch (msg.type) {
      case "users":
        console.log("users received:", msg.connections);
        this.onUsers(msg.connections);
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

  connect(url, email) {
    console.log("SignalServer: connect", email);
    this.socketServerURL = url;
    this.email = email;
    this.socket = new WebSocket(this.socketServerURL);
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
