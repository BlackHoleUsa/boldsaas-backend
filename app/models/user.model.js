const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
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
    token: String,
    Created_date: {
      type: Date,
      default: Date.now,
    },
  })
);

module.exports = User;
