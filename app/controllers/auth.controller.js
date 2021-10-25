const config = require("../config/auth.config");
const email = require("../utils/sendEmail");
const getuser = require("../utils/users");
const reset = require("../utils/resetpassword");
const User = require("../models/user.model");
const crypto = require("crypto");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    is_Admin: req.body.is_Admin,
  });

  const save = await user.save((err, user) => {
    if (err) {
      res.status(500).json({ message: err });
      return;
    }
    return res.status(200).json({ message: "User added Successfully." });
  });
};

exports.signin = async (req, res) => {
  const user2 = await User.findOne({
    email: req.body.email,
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
  let dbUser = await getuser.getUserByEmail(req.body.email);

  if (!dbUser) {
    return res.status(404).json({
      status: 404,
      message: "There is no user found with this email address",
    });
  }
  const resetToken = dbUser.createPasswordResetToken();
  await dbUser.save({ validateBeforeSave: false });

  const resetURL = `${resetToken}`;

  try {
    await email.sendEmail(
      req.body.email,
      "Reset Password ONLY VALID FOR 10 MINS",
      resetURL
    );

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

  console.log(hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(404).json({
      status: 404,
      message: "User not found",
    });
  }

  user.password = bcrypt.hashSync(req.body.password, 8);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.status(200).json({
    status: 200,
    message: "Password changed successfully!",
  });
};
