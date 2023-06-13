const express = require("express");
const router = express.Router();
const Room = require("../model/room");
const User = require("../model/user");
const Messages = require("../model/messages");
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = router;

//Get all the rooms
router.get("/all", async (req, res) => {
  let username = req.session.username;

  const user = await User.findOne({ username: username });

  let userRooms = [];
  userRooms = user.rooms;
  res.send(userRooms);
});

router.post("/create", async (req, res) => {
  const roomName = req.body.roomName;

  const newRoom = new Room({ name: roomName });

  const existingRoom = await Room.findOne({ name: roomName });
  if (existingRoom) {
    return res.json({
      message: `Failed to create "${roomName}" room, it already exists.`,
    });
  } else {
    try {
      const dataSaved = await newRoom.save();
      res.status(200).json(dataSaved);
      console.log(`Created room with "${roomName}" name!`);
    } catch (error) {
      console.log(error);
      res.send("ERROR!");
    }
  }
});

router.post("/join", async (req, res) => {
  const username = req.session.username;
  const roomName = req.body.roomName;

  const user = await User.findOne({ username: username });

  if (user.rooms.includes(roomName)) {
    return res.json({ message: `Already joined "${roomName}" room!` });
  } else {
    const roomExists = await Room.findOne({ name: roomName });
    if (!roomExists) {
      return res.json({
        message: `Failed to join "${roomName}" room, it does not exist.`,
      });
    } else {
      try {
        user.rooms.push(roomName);
        const dataSaved = await user.save();
        res.status(200).json({ dataSaved, room: roomName });
        console.log(`${username} joined the "${roomName} room.`);
      } catch (error) {
        console.log(error);
        res.send("ERROR!");
      }
    }
  }
});

router.delete("/leave", async (req, res) => {
  const username = req.session.username;
  const roomName = req.body.roomName;

  const leaveRoom = await Room.findOne({ name: roomName });

  if (!leaveRoom) {
    return res.json({
      message: `Failed to leave "${roomName}" room, it does not exist.`,
    });
  } else {
    try {
      const user = await User.findOne({ username: username });
      user.rooms = user.rooms.filter((roomVar) => roomVar !== roomName);
      const dataSaved = await user.save();
      res.status(200).json({ dataSaved, room: roomName });
      console.log(`${username} left the "${roomName} room.`);
    } catch (error) {
      console.log(error);
      res.send("ERROR!");
    }
  }
});

router.post("/messages", async (req, res) => {
  const roomName = req.body.roomName;

  const allRooms = await Room.find({});
  const filterRoomByName = allRooms.find((x) => x["name"] === roomName);

  if (!filterRoomByName) {
    console.log(
      `Failed to load "${roomName}" room message history, it does not exist.`
    );
  } else {
    const roomID = filterRoomByName._id;
    try {
      const messageHistory = await Messages.find({ room: roomID });
      res.status(200).json(messageHistory);
    } catch (error) {
      console.log(error);
      res.send("ERROR!");
    }
  }
});

router.post("/getUsernames", async (req, res) => {
  let userIDArray = req.body.userIDArray;
  let usernameArray = [];

  for (let cnt = 0; cnt < userIDArray.length; cnt++) {
    let user = await User.findById({ _id: userIDArray[cnt] });
    usernameArray[cnt] = user.username;
  }
  res.status(200).json(usernameArray);
});
