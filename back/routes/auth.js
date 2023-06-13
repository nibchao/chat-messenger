const express = require("express");
const User = require("../model/user");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const dotenv = require("dotenv");
dotenv.config("../.env");

const saltRounds = 10; // referenced https://heynode.com/blog/2020-04/salt-and-hash-passwords-bcrypt/

module.exports = router;

router.post("/login", async (req, res) => {
  const { session } = req;
  const username = req.body.username;

  const user = await User.findOne({ username });

  if (!user) return res.json({ message: "Incorrect Username ", status: false });
  // else if (!(await bcrypt.compare(req.body.password, user.password)))
  //   return res.json({ message: "Incorrect Password", status: false });
  // else if (user.email !== req.body.email)
  // {
  //   return res.json({ message: "Incorrect Email", status: false });
  // }
  // COMMENTED OUT TO MAKE LOGGING IN LESS ANNOYING
  // else if (req.body.otpToken !== req.body.generatedOTPToken) {
  //   return res.json({ message: "Incorrect OTP Token", status: false });
  // }
  else {
    session.authenticated = true;
    session.username = username;
    res.json({ message: "Logged in", status: true });
  }
});

router.post("/otptoken", async (req, res) => {
  // COMMENTED OUT TO MAKE LOGGING IN LESS ANNOYING
  // const secret = speakeasy.generateSecret();
  // const OTP = speakeasy.totp({ secret: secret.base32, encoding: "base32" });
  // const userEmail = req.body.email;
  // const sendEmail = async () => {
  //   // referenced https://nodemailer.com/about/
  //   const transporter = nodemailer.createTransport({
  //     service: "Gmail",
  //     port: 465,
  //     secure: true,
  //     auth: {
  //       user: process.env.USER_EMAIL,
  //       pass: process.env.USER_EMAIL_PASSWORD,
  //     },
  //   });
  //   if (userEmail === "") {
  //     console.log("error");
  //   } else {
  //     let info = await transporter.sendMail({
  //       from: process.env.USER_EMAIL, // sender address
  //       to: userEmail, // list of receivers
  //       subject: "One-time Password (OTP) for Login", // Subject line
  //       text: `Enter this code into the OTP field to login: ${OTP}`,
  //     });
  //     console.log(`Email with OTP sent to ${userEmail}.`);
  //     return nodemailer.getTestMessageUrl(info);
  //   }
  // };
  // if (userEmail !== "") {
  //   const dataSaved = { messageURL: await sendEmail(), generatedOTP: OTP };
  //   res.status(200).json(dataSaved);
  // } else {
  //   console.log("error");
  // }
});

router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

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
