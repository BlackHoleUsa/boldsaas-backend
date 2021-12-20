const axios = require("axios");
const coin = require("../models/coin.model");
const nodeCron = require("node-cron");

async function coinhistroy() {
  try {
    const price = await coin.find().sort({ _id: -1 }).limit(1);
    await coin.create({
      coin_price: price[0].coin_price,
    });
  } catch (e) {
    console.error(e);
  }
}

module.exports = () => {
  const cron = nodeCron.schedule(" 59 23 * * *", () => {
    coinhistroy();
  });
};
