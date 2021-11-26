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

  password: {
    type:String,
    minlength:8,
    trim :true
  },

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
  },
  passwordResetExpires: {
    type: Number,
   
  },
});

  module.exports = mongoose.model("User", UserSchema);
