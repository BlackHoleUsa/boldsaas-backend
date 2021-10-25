const coin = require("../models/coin.model");
const userService = require("../utils/users");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
require("dotenv").config();

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

exports.stripeBlockChain = async (req, res) => {
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

  const block = await blockchain(req.body.totalPrice / 100, user.email, price);
  res.send(200);
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
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "25.00",
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        throw error;
      } else {
        // userEmail = await find.find({ email: find.email });
        // console.log(userEmail);
        // blockchain(totalPrice, userEmail, price);

        res.send("Success");
      }
    }
  );
};

exports.latestCoinPrice = async (req, res) => {
  const price = await coin.find().sort({ _id: -1 }).limit(1);

  if (!price) {
    res.status(404).json({ message: "Price not get " });
  }
  res.status(200).json({ messege: price });
};
