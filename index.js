const EventEmitter = require("events");
let WS;

if (typeof window === "undefined") {
  WS = require("ws");
} else {
  WS = window.WebSocket;
}

module.exports = class chatSocket extends EventEmitter {
  constructor(url, channelId, userId = null, authKey = null) {
    super();
    this.url = url;
    this.channelId = channelId;
    this.userId = userId;
    this.authKey = authKey;
    this.onMessage = this.onMessage.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onError = this.onError.bind(this);
    this.onConnect = this.onConnect.bind(this);
    this.id = 0;
    this.reconnect = true;
    this.connected = false;
    this.lastPing = 0;
  }

  onMessage(e) {
    let data = JSON.parse(e.data);
    if (data.event === "ChatMessage") {
      let evt = {};
      evt.message = data.data.message.message;
      evt.username = data.data.user_name;
      evt.level = data.data.user_level;
      evt.roles = data.data.user_roles;
      evt.chatId = data.data.id;
      evt.userId = data.data.user_id;
      evt.channel = data.data.channel;
      evt.meta = data.data.message.meta;
      evt.chatLevel = data.data.user_ascension_level;
      if (data.data.message.meta.whisper === true) {
        this.emit("whisper", evt);
      } else {
        this.emit("msg", evt);
      }
    } else if (data.event === "SkillAttribution") {
      let evt = {
        userId: data.data.user_id,
        username: data.data.user_name,
        cost: data.data.skill.cost,
        currency: data.data.skill.currency,
        message:
          typeof data.data.message === "undefined"
            ? []
            : data.data.message.message,
        meta:
          typeof data.data.message === "undefined"
            ? null
            : data.data.message.meta,
      };

      this.emit("skill", evt);
    } else if (data.event === "ClearMessages") {
      this.emit("clear");
    } else if (data.event === "PurgeMessage") {
      let evt = {};
      evt.userId = data.data.user_id;
      this.emit("purge", evt);
    } else if (data.event === "DeleteMessage") {
      let evt = {};
      evt.chatId = data.data.id;
      this.emit("delete", evt);
    } else if (data.event === "UserJoin") {
      let evt = {};
      evt.id = data.data.id;
      evt.username = data.data.username;
      evt.roles = data.data.roles;
      evt.channel = data.data.channel;
      this.emit("userJoin", evt);
    } else if (data.event === "UserLeave") {
      let evt = {};
      evt.id = data.data.id;
      evt.username = data.data.username;
      evt.channel = data.data.channel;
      this.emit("userLeave", evt);
    } else if (data.event === "PollStart") {
      let evt = {};
      evt.username = data.data.author.user_name;
      evt.userId = data.data.author.user_id;
      evt.question = data.data.q;
      evt.answers = data.data.responses;
      this.emit("PollStart", evt);
    } else if (data.event === "PollEnd") {
      let evt = {};
      evt.username = data.data.author.user_name;
      evt.userId = data.data.author.user_id;
      evt.question = data.data.q;
      evt.answers = data.data.responses;
      this.emit("PollEnd", evt);
    } else if (data.event === "reply") {
      this.emit("reply", data.data);
    } else if (data.event === "WelcomeEvent") {
      this.emit("welcome");
    }
  }

  onClose(e) {
    this.connected = false;
    clearInterval(this.pingInt);
    if (this.reconnect) {
      this.reconInterval = setTimeout(() => {
        this.connect();
      }, 5000);
    }
  }

  onError(e) {}

  ping() {
    this.send("method", "ping");
  }

  onConnect(e) {
    if (this.authKey !== null && this.userId !== null) {
      this.send("method", "auth", [this.channelId, this.userId, this.authKey]);
    } else {
      this.send("method", "auth", [this.channelId]);
    }
    this.emit("connect");
  }

  connect() {
    this.socket = new WS(this.url);
    this.socket.onmessage = this.onMessage;
    this.socket.onclose = this.onClose;
    this.socket.onerror = this.onError;
    this.socket.onopen = this.onConnect;
    this.pingInt = setInterval(() => {
      this.ping();
    }, 15000);
  }

  send(type, method, args = []) {
    return new Promise((resolve, reject) => {
      let toSend = {
        type,
        method,
        arguments: args,
        id: this.id++,
      };
      this.socket.send(JSON.stringify(toSend));
      resolve();
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.reconnect = false;
      clearInterval(this.pingInt);
      this.socket.close();
      resolve();
    });
  }
};
