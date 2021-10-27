const mongoose = require("mongoose");

const Token = mongoose.model(
  "Token",
  new mongoose.Schema({
    token: {
      type: String,
    },
    updated_At: {
      type: Date,
      default: Date.now,
    },
  })
);

module.exports = Token;
