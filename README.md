# Mixer Chat Client

This is a simple, bare-bones, and fast javascript chat client for Mixer.com.

It works on both front-end ad back-end javascript/node projects.

It is currently in use powering every chat connection over at https://pixel.chat

## Installation:

With yarn:

```bash
yarn add mixer-chat-client
```

With npm:

```bash
npm i mixer-chat-client --save
```

## Usage:

```js
const chatClient = require("mixer-chat-client");

// You will have to get the correct chat server yourself from the mixer API

//Arguments are: Chat server URI, channelID, userID(optional), authToken(optional)
let Chat = new chatClient("wss://chat.mixer.com:443", 60302, 85878, "asdf1234");

Chat.on("connect", () => {
  console.log("connected");
});

Chat.on("welcome", () => {
  console.log("Recieved welcome event, shutting down");
  Chat.close();
});

Chat.connect();
```

## Events:

| Event        | Data                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------- |
| msg, whisper | {message: [], username: "", level: 00, roles: [], chatId: "", userId: 00, meta: {}, chatLevel: 00} |
| clear        | {}                                                                                                 |
| purge        | {userId: 00}                                                                                       |
| delete       | {chatId: ""}                                                                                       |
| userJoin     | {username: "", roles: [], channel: 00, id: 00}                                                     |
| userJLeav    | {username: "", roles: [], channel: 00, id: 00}                                                     |
| welcome      | {}                                                                                                 |

## Methods:

| Method  | args                 |
| ------- | -------------------- |
| connect |                      |
| send    | type, method, args[] |
| close   |                      |
