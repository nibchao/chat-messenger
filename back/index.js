const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const Messages = require("./model/messages");
const User = require("./model/user");
const Room = require("./model/room");

const app = express();
const server = http.createServer(app);

// cors to allow cross origin requests
const io = socketIO(server, {
  cors: {
    origin: "*",
  },
});
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to the database
mongoose.connect(process.env.MONGO_URL);
const database = mongoose.connection;

database.on("error", (error) => console.error(error));
database.once("open", () => console.log("Connected to Database!"));

// Set up the session
const sessionMiddleware = session({
  resave: false, // Whether to save the session to the store on every request
  saveUninitialized: false, // Whether to save uninitialized sessions to the store
  secret: process.env.SESSION_SECRET,
});

app.use(sessionMiddleware);

const auth = require("./routes/auth");
const rooms = require("./routes/rooms");
const { networkInterfaces } = require("os");

app.get("/", (req, res) => {
  if (req.session && req.session.authenticated) {
    res.json({ message: "logged in" });
  } else {
    res.json({ message: "not logged in" });
  }
});

app.use("/api/auth/", auth);

// checking the session before accessing the rooms
app.use((req, res, next) => {
  if (req.session && req.session.authenticated) {
    next();
  } else {
    res
      .status(401)
      .send("Unauthorized to access room, refresh the page and login again.");
  }
});

app.use("/api/rooms/", rooms);

// Start the server
server.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}.`);
});

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

io.use((socket, next) => {
  if (socket.request.session && socket.request.session.authenticated) {
    next();
  } else {
    next(new Error("Unauthorized in socket."));
  }
});

// Handle socket.io connections
io.on("connection", (socket) => {
  let username = socket.request.session.username;
  console.log(`${username} connected.`);

  socket.on("join", (data) => {
    const { room } = data;
    socket.join(room);
    console.log(`${username} joined room ${room}.`);
  });

  socket.on("leave", (data) => {
    const { room } = data;
    socket.leave(room);
    console.log(`${username} left room ${room}.`);
  });

  socket.on("chat message", async (data) => {
    const roomName = data.room;
    const messageText = data.text;

    await Promise.all([
      (findUser = await User.findOne({ username: username })),
      (findRoom = await Room.findOne({ name: roomName })),
    ]);

    const chatMessage = new Messages({
      message: { text: messageText },
      sender: findUser._id,
      room: findRoom._id,
    });
    await chatMessage.save();

    io.to(roomName).emit("chat message", {
      room: roomName,
      messageText: messageText,
    });
  });

  socket.on("reaction", async (data) => {
    const roomName = data.roomName;
    const messageText = data.messageText;
    const messageSenderID = data.messageSenderID;
    const messageCreatedAtTimestamp = data.createdAtTime;
    const messageReactions = data.reaction;

    const findRoom = await Room.findOne({ name: roomName });
    const roomObjectID = findRoom._id;
    const findMessageArray = await Messages.find({
      message: { text: messageText },
      sender: messageSenderID,
      room: roomObjectID,
    });

    let correctMessage;
    for (let cnt = 0; cnt < findMessageArray.length; cnt++) {
      if (
        findMessageArray[cnt].createdAt.toISOString() ==
        messageCreatedAtTimestamp
      ) {
        correctMessage = findMessageArray[cnt];
        break;
      }
    }
    if (!findRoom) {
      console.log(`"${roomName}" room was not found, failed to add reaction.`);
    } else if (!correctMessage) {
      console.log(
        `"${messageText}" message was not found, failed to add reaction.`
      );
    } else {
      let currentMessageReactions = [];
      currentMessageReactions = correctMessage.reactions;
      let reactionExists = false;
      for (let cnt = 0; cnt < currentMessageReactions.length; cnt++) {
        if (currentMessageReactions[cnt] === messageReactions) {
          reactionExists = true;
          break;
        }
      }
      if (!reactionExists) {
        currentMessageReactions.push(messageReactions);
      } else {
        let index = currentMessageReactions.indexOf(messageReactions);
        currentMessageReactions.splice(index, 1);
      }
      correctMessage.reactions = currentMessageReactions;
      await correctMessage.save();
      io.to(roomName).emit("reaction");
    }
  });

  socket.on("disconnect", () => {
    console.log(`${username} disconnected.`);
  });
});
