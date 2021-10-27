const axios = require("axios");
const Token = require("../models/token");
const nodeCron = require("node-cron");

async function tokenGeneration() {
  try {
    const {
      data: { access_token },
    } = await axios({
      url: "https://api.sandbox.paypal.com/v1/oauth2/token",
      method: "post",
      headers: {
        Accept: "application/json",
        "Accept-Language": "en_US",
        "content-type": "application/x-www-form-urlencoded",
      },
      auth: {
        username: process.env.PayPal_Client_Id,
        password: process.env.PayPal_Secret_Id,
      },
      params: {
        grant_type: "client_credentials",
      },
    });

    const findDoc = await Token.findOne({});
    if (findDoc) {
      const find = await Token.findOneAndUpdate(
        { _id: findDoc._id },
        { token: access_token }
      );
    } else {
      const findDoc = await Token.create({ token: access_token });
    }
  } catch (e) {
    console.error(e);
  }
}

module.exports = () => {
  nodeCron.schedule("*/13 * * * *", () => {
    tokenGeneration();
  });
};
