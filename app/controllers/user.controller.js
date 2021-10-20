const coin = require("../models/coin.model");
const userService = require("../utils/users");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
require("dotenv").config();

const stripe = require("stripe")(process.env.Private_Api_Key);

const paypal = require("paypal-rest-sdk");
const { blockchain } = require("../contractInfo/Sample");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.PayPal_Client_Id,

  client_secret: process.env.PayPal_Secret_Id,
});

exports.coinPriceHistroy = async (req, res) => {
  const value = await coin.find({}).lean();

  if (!value) {
    res.status(404).json({ message: "Price is not Updated " });
  }
  res.status(200).json({ messege: value });
};

exports.stripePage = (req, res) => {
  //console.log(process.env.Public_Api_Key);

  res.render("Home", {
    key: process.env.Public_Api_Key,
  });
};

exports.stripePayment = async (req, res) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).json({ message: "No token provided!" });
  }

  let find;
  let totalPrice = req.body.price;
  let price = await coin.find().sort({ _id: -1 }).limit(1);

  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;

    find = await User.findOne({
      _id: decoded.id,
      is_Admin: true,
      token: token,
    }).lean();
  });
  stripe.customers
    .create({
      email: req.body.stripeEmail,
      source: req.body.stripeToken,
    })
    .then((customers) => {
      return stripe.charges.create({
        amount: price,
        description: "Thanks for buying shares",
        currency: "USD",
        customer: customer.id,
      });
    })
    .then(async (charge) => {
      find.update({ purchase: true });
      userEmail = await find.find({ email: find.email });
      console.log(userEmail);
      blockchain(totalPrice, userEmail, price);

      res.send("Succes");
    })
    .catch((err) => {
      res.send(err);
    });
};

exports.payPal = async (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:8080/api/paypal-payment-success",
      cancel_url: "http://localhost:8080/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Shares",
              price: "25.00", // req.body.price,
              currency: "USD",
              quantity: 1, // req.body.quantity,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "25.00", // req.body.total
        },
        description: "Thank You for buying the tokens",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
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
