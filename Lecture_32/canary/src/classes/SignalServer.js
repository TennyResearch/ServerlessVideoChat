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

  socketOnOpen() {
    console.log("SocketServer: onOpen");
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
