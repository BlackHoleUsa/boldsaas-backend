const db = require("../models");
const User = db.user;


exports.queryUsers = async (filter, options) => {
    const users = await User.paginate(filter, options);
    return users;
  };
  