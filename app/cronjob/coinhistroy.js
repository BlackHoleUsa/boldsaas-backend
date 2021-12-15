const axios = require("axios");
const coin = require("../models/coin.model");
const nodeCron = require("node-cron");

async function coinhistroy() {
  try {
    const price = await coin.find().sort({ _id: -1 }).limit(2);
    if (price[0].coin_price == price[1].coin_price) {
      await coin.create({
        coin_price: price[0].coin_price,
      });
    } else {
      const price2 = await coin.find().sort({ _id: -1 }).limit(1);
      await coin.create({
        coin_price: price2[0].coin_price,
      });
    }
  } catch (e) {
    console.error(e);
  }
}

module.exports = () => {
  const cron = nodeCron.schedule("* * * * */1", () => {
    coinhistroy();
  });
};
