const express = require("express");
const router = express.Router();
const Room = require("../model/room");
const User = require("../model/user");
const Messages = require("../model/messages");
var ObjectId = require("mongoose").Types.ObjectId;
const path = require('path');
const multer = require('multer');

module.exports = router;


router.put('/profile', (req, res) => {
    upload(req, res, async (err) => {
        if(err){
            res.sendStatus(500);
        }

        const user = await User.findById(req.body.userId);
        user.username = req.body.username;
        if(req.file){
            user.profileIMage = req.file.filename;
        }
        await user.save();

        req.app.get('socket.io').emit('userUpdated', user);

        res.send(user);
    });
});

// router.get("/profile", async (req, res) => {
//     let username = req.session.username;
  
//     const user = await User.findOne({ username: username });
  
//     let userRooms = [];
//     userRooms = user.rooms;
//     if (userRooms.length == 0) {
//       res.send(rooms);
//     } else {
//       res.send(userRooms);
//     }
//   });
