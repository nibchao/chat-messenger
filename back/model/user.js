const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    required: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  rooms: {
    type: Array,
    required: true,
  },
  profileImage: {
    type: String, 
    default: '',
  }
  //updated schema to handle string url for images, might need to encode in binary
});

module.exports = mongoose.model("User", userSchema);

