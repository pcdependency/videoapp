const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Number,
    required: true,
    default: 0,
  },
  views: {
    type: Number,
    required: true,
    default: 0,
  },
  sizes: {
    type: Number,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  author: {
    type: ObjectId,
    required: true,
  },
});

module.exports = mongoose.model("Video", VideoSchema);
