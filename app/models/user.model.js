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
    type: String
  },
  passwordResetExpires: {
    type: Date,
  },
});

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
