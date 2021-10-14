const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).json({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = async (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).json({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;

    const find = await User.findOne({
      _id: decoded.id,
      is_Admin: true,
      token: token,
    }).lean();

    if (!find) {
      res.status(403).json({ message: "Require Admin Role!" });
    }
    next();
  });
};

isUser = async (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).json({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;

    const find = await User.findOne({
      _id: decoded.id,
      is_Admin: false,
      is_Blocked: false,
      token: token,
    }).lean();

    if (!find) {
      res.status(403).json({ message: "User is not Found!" });
    }
    next();
  });
};

const authJwt = {
  verifyToken,
  isAdmin,
  isUser,
};
module.exports = authJwt;
