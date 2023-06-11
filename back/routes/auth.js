const express = require("express");
const User = require("../model/user");
const router = express.Router();
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')

const saltRounds = 10 // referenced https://heynode.com/blog/2020-04/salt-and-hash-passwords-bcrypt/

module.exports = router;

router.post("/login", async (req, res) => {
  const { session } = req;
  const username = req.body.username;

  // check if user in database
  const user = await User.findOne({ username });

  if (!user) return res.json({ message: "Incorrect Username ", status: false });
  else if (!(await bcrypt.compare(req.body.password, user.password)))
    return res.json({ message: "Incorrect Password", status: false });
  else {
    const test = async function main() { // referenced https://nodemailer.com/about/
      let testAccount = await nodemailer.createTestAccount();

      let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });

      let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "bar@example.com, baz@example.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
      });

      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    await test();
    // session.authenticated = true;
    // session.username = username;
    // res.json({ message: "Logged in", status: true });
  }
});

router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username: username,
    password: hashedPassword,
    email: email,
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
