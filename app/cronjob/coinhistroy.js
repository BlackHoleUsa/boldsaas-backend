const axios = require("axios");
const coin = require("../models/coin.model");
const nodeCron = require("node-cron");

async function coinhistroy() {
  try {
    const price = await coin.find().sort({ _id: -1 }).limit(1);
    console.log("price=>", price);
    const update = await coin.create({
      coin_price: price[0].coin_price,
    });
    console.log("update =>", update);
  } catch (e) {
    console.error(e);
  }
}

module.exports = () => {
  const cron = nodeCron.schedule(" 0 0 0 * * *", () => {
    coinhistroy();
  });
};
