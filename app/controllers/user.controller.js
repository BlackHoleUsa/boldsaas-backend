const coin = require("../models/coin.model");
const userService = require("../utils/users");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
require("dotenv").config();
const axios = require("axios");
const Token = require("../models/token");

const stripe = require("stripe")(process.env.Private_Api_Key);

const paypal = require("@paypal/checkout-server-sdk");
const { updateLedger } = require("../contractInfo/Sample");

//for test
// const Environment =
//   process.env.NODE_ENV === "development"
//     ? paypal.core.LiveEnvironment
//     : paypal.core.SandboxEnvironment;
// const client = new paypal.core.PayPalHttpClient(
//   new Environment(process.env.PayPal_Client_Id, process.env.PayPal_Secret_Id)
// );

//for live
const Environment = paypal.core.LiveEnvironment;
const client = new paypal.core.PayPalHttpClient(
  new Environment(process.env.PayPal_Client_Id, process.env.PayPal_Secret_Id)
);

exports.coinPriceHistroy = async (req, res) => {
  const price = await coin.find().sort({ _id: -1 }).limit(7);

  if (!price) {
    res.status(404).json({ message: "Price is get " });
  }
  res.status(200).json({ messege: price });
};

exports.stripePayment = async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.price,
    currency: "usd",
    receipt_email: req.body.email,
  });

  res.status(200).json(paymentIntent);
};

exports.stripePaymentSuccessBlockChain = async (req, res) => {
  let token = req.headers["x-access-token"];
  // console.log("tokem =>", token);
  let userId;

  if (!token) {
    return res.status(403).json({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    userId = decoded.id;
  });
  const user = await User.findOne({ _id: userId }).lean();
  console.log("User =>", user);
  const price = await coin.find().sort({ _id: -1 }).limit(1);
  const coinPrice = price[0].coin_price;
  console.log("done");
  try {
    const intent = await stripe.paymentIntents.retrieve(req.body.id);
    // console.log("INtent =>", intent);
    if (intent.status === "succeeded") {
      const total = parseInt(intent.amount);
      console.log("totoal =>", total);

      const amount = total / 100;
      console.log("amount =>", amount);

      const amount2 = amount - 1.25;
      console.log("amount2 =>", amount2);

      const final = amount2 / coinPrice;
      // const share = final - 1.25; //  deduct the price
      console.log("final =>", final);

      const blockchain = await updateLedger(
        final,
        user.email,
        coinPrice * 1000
      );
      if (blockchain) {
        res.status(200).json({ messege: "Success" });
      }
    } else {
      res.status(500).json({ error: "Payment gateway error" }).end();
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.payPal = async (req, res) => {
  let request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: req.body.totalPrice,
        },
      },
    ],
  });

  try {
    const order = await client.execute(request);
    res.status(200).json({ id: order.result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.payPalPaymentSuccees = async (req, res) => {
  let token = req.headers["x-access-token"];
  let userId;

  if (!token) {
    return res.status(403).json({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    userId = decoded.id;
  });

  const user = await User.findOne({ _id: userId }).lean();
  // console.log("user => ", user);
  // console.log("user => ", user.email);

  const price = await coin.find().sort({ _id: -1 }).limit(1);
  const latestPrice = parseInt(price[0].coin_price);
  const clientToken = await Token.findOne({});

  const configs = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${clientToken.token}`,
    },
  };
  try {
    // for live
    const resposne = await axios(
      `https://api-m.paypal.com/v1/checkout/orders/${req.params.id}`,
      configs
    );
    //for testing
    // const resposne = await axios(
    //   `https://api-m.sandbox.paypal.com/v1/checkout/orders/${req.params.id}`,
    //   configs
    // );
    if (resposne.data.status === "COMPLETED") {
      const amount2 = parseInt(resposne.data.gross_total_amount.value);
      const amount = amount2 - 1.25;
      const totalShare = amount / latestPrice;
      const total = totalShare - 1.25; // deduct the fees

      const blockChain = await updateLedger(
        total,
        user.email,
        latestPrice * 1000
      );
      if (blockChain) {
        res.status(200).json({ messege: "Success" });
      }
    }
  } catch (e) {
    console.log("error=>", e);
    res.status(500).json({ error: e.message });
  }
};

exports.latestCoinPrice = async (req, res) => {
  const price = await coin.find().sort({ _id: -1 }).limit(1);

  if (!price) {
    res.status(404).json({ message: "Price not get " });
  }
  res.status(200).json({ messege: price });
};
