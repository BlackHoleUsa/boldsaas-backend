const db = require("../models");
const User = db.user;

exports.getUserByEmail = async (email) => {
  const user=await User.findOne({ email: email }).lean();
  return user;
};

exports.updateUserById = async (userId, updateBody) => {
  const user = await User.findByIdAndUpdate(userId, updateBody, {
    new: true,
  }).lean();

  return user;
};

exports.queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

exports.updateUserById = async (userId, updateBody) => {
  const user = await User.findByIdAndUpdate(userId, updateBody, {
    new: true,
  }).lean();

  return user;
};
