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

  const inputtedUsername = req.body.Username;
  const inputtedPassword = req.body.Password;
  const inputtedEmail = req.body.Email;
  const inputtedOTPToken = req.body.OTPToken;
  const userGeneratedOTPToken = req.body.generatedOTPToken;

  const user = await User.findOne({ username: inputtedUsername });

  if (!user) return res.json({ message: "Incorrect Username! " });
  // COMMENTED OUT TO MAKE LOGGING IN LESS ANNOYING
  // else if (!(await bcrypt.compare(inputtedPassword, user.password)))
  //   return res.json({ message: "Incorrect Password!" });
  // else if (user.email !== inputtedEmail) {
  //   return res.json({ message: "Incorrect Email!" });
  // }
  // else if (inputtedOTPToken !== userGeneratedOTPToken) {
  //   return res.json({ message: "Incorrect OTP Token!" });
  // }
  else {
    session.authenticated = true;
    session.username = inputtedUsername;
    res.json({ message: "Logged in", status: true });
  }
});

router.post("/otptoken", async (req, res) => {
  // COMMENTED OUT TO MAKE LOGGING IN LESS ANNOYING
  const inputtedEmail = req.body.Email;
  if (inputtedEmail === "") {
    return res.json({ message: "No email was provided!" });
  } else {
    const secret = speakeasy.generateSecret();
    const OTP = speakeasy.totp({ secret: secret.base32, encoding: "base32" });
    const inputtedEmail = req.body.Email;
    const sendEmail = async () => {
      // referenced https://nodemailer.com/about/
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        port: 465,
        secure: true,
        auth: {
          user: process.env.USER_EMAIL,
          pass: process.env.USER_EMAIL_PASSWORD,
        },
      });
      let info = await transporter.sendMail({
        from: process.env.USER_EMAIL,
        to: inputtedEmail,
        subject: "One-time Password (OTP) for CS110 Project Login",
        text: `Enter this code into the OTP field to login: ${OTP}.`,
      });
      console.log(`Email with OTP sent to ${inputtedEmail}.`);
      return nodemailer.getTestMessageUrl(info);
    };
    try {
      const dataSaved = { messageURL: await sendEmail(), generatedOTP: OTP };
      res.status(200).json({
        message: `Check your "${inputtedEmail}" email for the OTP code to login.`,
        dataSaved: dataSaved,
      });
    } catch (error) {
      console.log(error);
      res.send("ERROR!");
    }
  }
});

router.post("/register", async (req, res) => {
  const inputtedUsername = req.body.Username;
  const inputtedPassword = req.body.Password;
  const inputtedEmail = req.body.Email;

  const hashedPassword = await bcrypt.hash(inputtedPassword, saltRounds);

  const user = new User({
    username: inputtedUsername,
    password: hashedPassword,
    email: inputtedEmail,
  });

  const dupeUserCheck = await User.findOne({ username: inputtedUsername });

  if (dupeUserCheck) {
    console.log(`Account with username, ${inputtedUsername}, already exists.`);
  } else {
    try {
      const dataSaved = await user.save();
      res.status(200).json(dataSaved);
      console.log(`Account with username, ${inputtedUsername} was created!`);
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
