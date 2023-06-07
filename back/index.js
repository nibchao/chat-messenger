const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

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

io.on("connection", (socket) => {
  console.log("user connected");
  let room = undefined;
  let username = undefined;

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  // socket.on("chat message", (data) => {
  //   console.log("chat message was: ", data);
  //   io.to(room).emit("chat message: ", data);
  // });

    // Event listener for chat messages
    socket.on("chat message", (message) => {
      console.log("Received message:", message);
      // Broadcast the message to all connected clients
      io.emit("chat message", message);
    });

  socket.on("join", (data) => {
    socket.join(data.room);
    room = data.room;
    username = data.username;
    console.log(`${username} joined the room ${room}`);
    //socket.to(room).emit(room.messages);
  });

  socket.emit("starting data", {
    text: "testing connection io on index.js server",
  });
  // new from week 7/8: first time user joins room, load past message history
});
