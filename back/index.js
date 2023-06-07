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

// Handle socket.io connections
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join", (data) => {
    const { room } = data;
    socket.join(room);
    console.log(`User joined room ${room}`);
  });

  socket.on("leave", (data) => {
    const { room } = data;
    socket.leave(room);
    console.log(`User left room ${room}`);
  });

  socket.on("chat message", (data) => {
    const { room, text } = data;
    io.to(room).emit("chat message", { room, text });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});