const { boolean } = require("joi");
const mongoose = require("mongoose");

const Coin = mongoose.model(
  "Coin",
  new mongoose.Schema({
    coin_price: {
      type: Number,
      required: true,
    },

    flag: {
      type: Boolean,
      required: false,
      default: false,
    },
    updated_At: {
      type: Date,
      default: Date.now,
    },
    Created_At: {
      type: Date,
      default: Date.now,
    },
  })
);

module.exports = Coin;
