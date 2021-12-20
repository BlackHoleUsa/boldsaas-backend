const config = require("../config/auth.config");
const adminService = require("../utils/admin");
const user = require("../models/user.model");
const userService = require("../utils/users");
const coin = require("../models/coin.model");
const { updateLedger } = require("../contractInfo/Sample");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.getAllUsers = async (req, res) => {
  const admin = await user.find({ is_Admin: false, is_Blocked: false }).lean();

  res.send(admin);
};

exports.blockUser = async (req, res) => {
  const block = await user.updateOne(
    { email: req.body.email },
    { $set: { is_Blocked: "true" } }
  );

  if (block.nModified === 1) {
    res.status(200).send({ message: "User Blocked Sucessfully" });
  } else {
    res.status(404).send({ message: "User not Blocked " });
  }
};

exports.resetPassword = async (req, res) => {
  const { password, newPassword } = req.body;
  const user1 = await user
    .findOne({
      is_Admin: true,
    })
    .lean();

  var passwordIsValid = bcrypt.compareSync(req.body.password, user1.password);

  if (!passwordIsValid) {
    return res.status(401).json({
      accessToken: null,
      message: "Invalid Password!",
    });
  }

  const hashPassword = await bcrypt.hash(newPassword, 8);

  const update = await userService.updateUserById(user1._id, {
    password: hashPassword,
  });

  res.status(200).json({ message: "Password Updated Sucessfully" });
};

exports.priceUpdate = async (req, res) => {
  const value = await coin.create({
    coin_price: req.body.value,
  });

  if (!value) {
    res.status(404).json({ message: "Price is not Updated " });
  }
  res.status(200).json({ message: "Price Updated Sucessfully" });
};

exports.updateLedgerbyAdmin = async (req, res) => {
  const { email, value } = req.body;
  const isEmailExists = await userService.getUserByEmail(email);
  var price = await coin.find().sort({ _id: -1 }).limit(1);
  price = parseInt(price[0].coin_price);
  try {
    if (isEmailExists) {
      const amount = parseInt(value);
      const updatedLedger = await updateLedger(amount, email, price * 1000);
      if (updatedLedger) {
        res.status(200).json({ message: "Success" });
      } else {
        res.status(500).send("Ledger is not updated!");
      }
    } else {
      res.status(404).send("Email not exists!");
    }
  } catch (err) {
    console.log(err);
  }
};
