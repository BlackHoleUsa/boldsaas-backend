const mongoose = require("mongoose");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
  },

  password: String,

  is_Admin: {
    type: Boolean,
    default: false,
  },

  is_Blocked: {
    type: Boolean,
    default: false,
  },
  is_Purchased: {
    type: Boolean,
    default: false,
  },
  token: String,
  Created_date: {
    type: Date,
    default: Date.now,
  },

  passwordChangedAt: Date,
  passwordResetToken: {
    type: String,
    expires: "1m",
    default: Date.now,
  },
  passwordResetExpires: {
    type: Date,
    expires: "1m",
    default: Date.now,
  },
});

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 100;

  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
