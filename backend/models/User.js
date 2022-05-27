const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    minlength: 1,
    maxLength: 14,
  },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
  validated: {
    type: Boolean,
    required: true,
    default: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minLength: 5,
    maxLength: 350,
  },
  password: {
    type: String,
    required: true,
    minLength: 60,
    maxLength: 60,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  followers: {
    type: Array,
    required: true,
    default: [],
  },
  following: {
    type: Array,
    required: true,
    default: [],
  },
  likedVideos: {
    type: Array,
    required: true,
    default: [],
  },
});

module.exports = mongoose.model("User", UserSchema);
