const Joi = require("joi");

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    password: Joi.string().required(),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const is_toc = {
  body: Joi.object().keys({
    is_toc: Joi.boolean().required(),
  }),
};

module.exports = {
  forgotPassword,
  resetPassword,
  verifyEmail,
  is_toc,
};
