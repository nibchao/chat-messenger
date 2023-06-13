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
database.once("open", () => console.log("Connected to Database"));

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
    //console.log("not logged in");
    res.json({ message: "not logged in" });
  }
});

app.use("/api/auth/", auth);

// checking the session before accessing the rooms
app.use((req, res, next) => {
  if (req.session && req.session.authenticated) {
    next();
  } else {
    // next();
    res.status(401).send("Unauthorized");
  }
});

app.use("/api/rooms/", rooms);

// Start the server
server.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});

io.use((socket, next) => {
  console.log("socket io middleware");
  sessionMiddleware(socket.request, {}, next);
});

io.use((socket, next) => {
  if (socket.request.session && socket.request.session.authenticated) {
    next();
  } else {
    console.log("unauthorized");
    next(new Error("unauthorized"));
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
    const { room, text } = data;
    await Promise.all([
      (findUser = await User.findOne({ username: username })),
      (findRoom = await Room.findOne({ name: room })),
    ]);

    const chatMessage = new Messages({
      message: { text: text },
      sender: findUser._id,
      room: findRoom._id,
    });
    const dataSaved = await chatMessage.save();
    io.to(room).emit("chat message", { room, text });
  });

  socket.on("reaction", async (data) => {
    const findRoom = await Room.findOne({ name: data.roomName });
    const findMessage = await Messages.find({
      message: { text: data.messageText },
      sender: data.messageSenderID,
      room: findRoom._id,
    });
    let correctMessage;
    for (let cnt = 0; cnt < findMessage.length; cnt++) {
      if (findMessage[cnt].createdAt.toISOString() == data.createdAtTime) {
        correctMessage = findMessage[cnt];
        break;
      }
    }
    if (!findRoom) {
      console.log("room not found");
    } else if (!correctMessage) {
      console.log("message not found");
    } else {
      let currentMessageReactions = [];
      currentMessageReactions = correctMessage.reactions;
      let reactionExists = false;
      for (let cnt = 0; cnt < currentMessageReactions.length; cnt++) {
        if (currentMessageReactions[cnt] === data.reaction) {
          reactionExists = true;
        }
      }
      if (!reactionExists) {
        currentMessageReactions.push(data.reaction);
        correctMessage.reactions = currentMessageReactions;
        await correctMessage.save();
        io.to(data.roomName).emit("reaction");
      } else {
        let index = currentMessageReactions.indexOf(data.reaction);
        currentMessageReactions.splice(index, 1);
        correctMessage.reactions = currentMessageReactions;
        await correctMessage.save();
        io.to(data.roomName).emit("reaction");
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`${username} disconnected.`);
  });
});
