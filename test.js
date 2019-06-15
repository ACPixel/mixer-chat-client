const chatSocket = require("./index");

let Chat = new chatSocket("wss://chat.mixer.com:443", 60302);

Chat.on("connect", () => {
  console.log("connected");
});

Chat.on("welcome", () => {
  console.log("Recieved welcome event, shutting down");
  Chat.close();
});

Chat.connect();
