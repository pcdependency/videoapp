const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const EmailToken = new mongoose.Schema({
  token: {
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

module.exports = mongoose.model("EmailToken", EmailToken);
