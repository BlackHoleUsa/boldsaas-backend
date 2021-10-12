const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },

    password: String,

    is_Admin: {
      type: Boolean,
      default: false,
    },

    is_Blocked: {
      type: Boolean,
      default: false,
    },
    is_Purchased: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      unique: true,
    },
    Created_date: {
      type: Date,
      default: Date.now,
    },
  })
);

module.exports = User;
