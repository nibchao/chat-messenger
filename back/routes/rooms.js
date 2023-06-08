const express = require("express");
const router = express.Router();
const Room = require("../model/room");
const User = require("../model/user");
// TODO: add rest of the necassary imports

module.exports = router;

// temporary rooms
let rooms = [];

//Get all the rooms
router.get("/all", async (req, res) => {
  let username = req.session.username;

  const user = await User.findOne({ username: username });

  let userRooms = [];
  userRooms = user.rooms;
  if (userRooms.length == 0) {
    res.send(rooms);
  } else {
    res.send(userRooms);
  }
});

router.post("/create", async (req, res) => {
  let name = req.body.roomName;

  const newRoom = new Room({ name: name });

  const existingRoom = await Room.findOne({ name: name });
  if (existingRoom) {
    return res.json({ message: "Room exists", status: false });
  } else {
    try {
      const dataSaved = await newRoom.save();
      res.status(200).json(dataSaved);
      console.log("Room with name " + name + " was created");
    } catch (error) {
      console.log(error);
      res.send("ERROR!");
    }
  }
});

router.post("/join", async (req, res) => {
  let username = req.session.username;
  let room = req.body.roomName;

  const user = await User.findOne({ username: username });

  if (user.rooms.includes(room)) {
    console.log("already joined");
  } else {
    const roomExists = await Room.findOne({ name: room });
    if (!roomExists) {
      console.log(`${room} room does not exist, failed to join`);
    } else {
      try {
        user.rooms.push(room);
        const dataSaved = await user.save();
        console.log("User joined " + room);
        res.status(200).json(dataSaved);
      } catch (error) {
        console.log(error);
        res.send("ERROR!");
      }
    }
  }
});

router.delete("/leave", async (req, res) => {
  let username = req.session.username;
  let room = req.body.roomName;

  const leaveRoom = await Room.findOne({ name: room });

  if (!leaveRoom)
  {
    console.log('room does not exist to delete');
  }
  else
  {
    try {
      const user = await User.findOne({ username: username });
      user.rooms = user.rooms.filter(roomVar => roomVar !== room);
      const dataSaved = await user.save();
      console.log("User left " + room);
      res.status(200).json(dataSaved);
    } catch (error) {
      console.log(error);
      res.send("ERROR!");
    }
  }
});
