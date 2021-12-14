const config = require("../config/auth.config");
const email = require("../utils/sendEmail");
const getuser = require("../utils/users");
const reset = require("../utils/resetpassword");
const User = require("../models/user.model");
const crypto = require("crypto");
const moment = require("moment");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    is_Admin: req.body.is_Admin,
  });
  // var token = jwt.sign({ id: user.id }, config.secret, {
  //     expiresIn: 86400, // 24 hours
  //   });

  const token = jwt.sign({ user_id: user._id }, config.secret, {
    expiresIn: "86400", //24h
  });

  // save user token
  user.token = token;

  const save = await user.save((err, user) => {
    if (err) {
      res.status(500).json({ message: err });
      return;
    }
    console.log("user =>", user);
    return res.status(200).json({ message: "User added Successfully.", user });
  });
  // console.log("save => ", save);
  // res.send(save);

  // var token = jwt.sign({ id: user.id }, config.secret, {
  //     expiresIn: 86400, // 24 hours
  //   });

  // const find = await User.updateOne(
  //   { email: req.body.email },
  //   { $set: { token: token } }
};

exports.signin = async (req, res) => {
  const user2 = await User.findOne({
    email: req.body.email,
    is_Blocked: false,
  }).exec(async (err, user) => {
    if (err) {
      res.status(500).json({ message: err });
      return;
    }

    if (!user) {
      return res.status(404).json({ message: "User Not found." });
    }

    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    var token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: 86400, // 24 hours
    });

    const find = await User.updateOne(
      { email: req.body.email },
      { $set: { token: token } }
    )
      .lean()
      .then((result) => {
        res.status(200).json({
          id: user._id,
          username: user.username,
          email: user.email,
          is_Admin: user.is_Admin,
          accessToken: token,
        });
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  });
};

exports.forgotPassword = async (req, res) => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  let dbUser = await getuser.getUserByEmail(req.body.email);

  if (!dbUser) {
    return res.status(404).json({
      status: 404,
      message: "There is no user found with this email address",
    });
  }
  dbUser.passwordResetToken = passwordResetToken;

  const resetURL = `${resetToken}`;

  try {
    await email.sendEmail(
      req.body.email,
      "Reset Password ONLY VALID FOR 10 MINS",
      resetURL
    );
    const time = parseInt(moment().unix());
    dbUser.passwordResetExpires = time;
    await dbUser.save({ validateBeforeSave: false });

    res.status(200).json({
      code: 200,
      message: "Password reset email has been successfully sent to your email",
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.resetPassword = async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  await User.findOne({
    passwordResetToken: hashedToken,
  })
    .exec()
    .then((product) => {
      const generateTime = product.passwordResetExpires;
      const currentTime = parseInt(moment().unix());
      const diff = currentTime - generateTime;
      if (diff < 600) {
        product.password = bcrypt.hashSync(req.body.password, 8);
        product.passwordResetToken = undefined;
        product.passwordResetExpires = undefined;
        product.save((err, result) => {
          if (err) {
            res
              .status(500)
              .send("System error and user not saved due to some issue");
            return;
          }
          res.status(200).json({
            message: "Password changed successfully!",
            result,
          });
        });
      } else {
        product.passwordResetToken = undefined;
        product.passwordResetExpires = undefined;
        product.save();
        return res.status(404).json({
          status: 404,
          message: "Time Expire",
        });
      }
    })
    .catch((err) => {
      return res.status(404).json({
        status: 404,
        message: "User not Found",
        err,
      });
    });
};
