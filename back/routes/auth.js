const express = require("express");
const User = require("../model/user");
const router = express.Router();

module.exports = router;

router.post("/login", async (req, res) => {
  const { session } = req;
  const { username, password } = req.body;

  // check if user in database
  const user = await User.findOne({ username });

  if (!user) return res.json({ message: "Incorrect Username ", status: false });
  else if (user.password !== password)
    return res.json({ message: "Incorrect Password", status: false });
  else {
    session.authenticated = true;
    session.username = username;
    res.json({ message: "Logged in", status: true });
  }
});

router.post("/register", async (req, res) => {
  const { username, password, name, rooms } = req.body;
  const user = new User({
    username: username,
    password: password,
    name: name,
    rooms: rooms,
  });

  const dupeUserCheck = await User.findOne({ username });

  if (dupeUserCheck) {
    console.log("Account with username " + username + " already exists");
  } else {
    try {
      const dataSaved = await user.save();
      res.status(200).json(dataSaved);
      console.log("Account with username " + username + " was created");
    } catch (error) {
      console.log(error);
      res.send("ERROR!");
    }
  }
});

// Set up a route for the logout page
router.get("/logout", (req, res) => {
  // Clear the session data and redirect to the home page
  req.session.destroy();
  res.send({ message: "Logged out", status: true });
});

// extra feature for final project: add route that lets user edit account information
// Allow users to have profile pictures and edit their name or profile picture: 5%.
