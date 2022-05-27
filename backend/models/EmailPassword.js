const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const EmailPassword = new mongoose.Schema({
  password: {
    type: String,
    required: true,
  },
  user_id: {
    type: ObjectId,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

module.exports = mongoose.model("EmailPassword", EmailPassword);
