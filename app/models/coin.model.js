const mongoose = require("mongoose");

const Coin = mongoose.model(
  "Coin",
  new mongoose.Schema({
    coin_price: {
      type: Number,
      required: true,
    },
    updated_At: {
      type: Date,
      default: Date.now,
    },
  })
);

module.exports = Coin;
