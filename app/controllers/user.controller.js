const coin = require("../models/coin.model");
const userService = require("../utils/users");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
require("dotenv").config();
const axios = require("axios");

const stripe = require("stripe")(process.env.Private_Api_Key);

const paypal = require("@paypal/checkout-server-sdk");
const { blockchain } = require("../contractInfo/Sample");

const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;
const client = new paypal.core.PayPalHttpClient(
  new Environment(process.env.PayPal_Client_Id, process.env.PayPal_Secret_Id)
);

exports.coinPriceHistroy = async (req, res) => {
  const value = await coin.find({}).lean();

  if (!value) {
    res.status(404).json({ message: "Price is not Updated " });
  }
  res.status(200).json({ messege: value });
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
  let userId;

  if (!token) {
    return res.status(403).json({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    id = decoded.id;
  });
  const user = await User.findOne({ id: userId }).lean();
  //console.log(user);
  console.log(user.email);
  const price = await coin.find().sort({ _id: -1 }).limit(1);
  try {
    const intent = await stripe.paymentIntents.retrieve(req.body.id);
    console.log(intent);
    if (intent.status === "succeeded") {
      console.log("blockchain part");
      res.status(200).json({ messege: "Successfully" });
    }
  } catch (e) {
    console.log(e);
    res.send(e);
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
    console.log(e);
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
    id = decoded.id;
  });
  const user = await User.findOne({ id: userId }).lean();
  //console.log(user);
  console.log(user.email);
  const price = await coin.find().sort({ _id: -1 }).limit(1);
  const clientToken = await Token.find().sort({ _id: -1 }).limit(1);

  const configs = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${clientToken}`,
    },
  };
  try {
    const resposne = await axios(
      `https://api-m.sandbox.paypal.com/v1/checkout/orders/${req.params.id}`,
      configs
    );
    if (resposne.data.status === "COMPLETED") {
      console.log("blockChain");
      res.status(200).json({ messege: "Success" });
    }
  } catch (e) {
    res.status(404).json({ message: e });
  }
};

exports.latestCoinPrice = async (req, res) => {
  const price = await coin.find().sort({ _id: -1 }).limit(1);

  if (!price) {
    res.status(404).json({ message: "Price not get " });
  }
  res.status(200).json({ messege: price });
};
