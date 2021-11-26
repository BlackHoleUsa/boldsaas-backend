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

const schemas = {
  email: Joi.object().keys({
    username:Joi.string(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    is_Admin:Joi.boolean().optional()
  }),
  value: Joi.object().keys({
    value: Joi.number().required(),
  }),
  updateLedger:Joi.object().keys({
    email:Joi.string().required(),
    value:Joi.required()
  }),
  emails: Joi.object().keys({
    email: Joi.string().required(),
  }),
  // define all the other schemas below
};
module.exports = schemas;

// module.exports = {
//   forgotPassword,
//   resetPassword,
//   verifyEmail,
//   is_toc,
// };
