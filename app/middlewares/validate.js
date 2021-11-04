const Joi = require("joi");
// const httpStatus = require("http-status");

// const validate = (schema) => (req, res, next) => {
//   const validSchema = req.body;
//   const object = pick(req, Object.keys(validSchema));
//   const { value, error } = Joi.compile(validSchema)
//     .prefs({ errors: { label: "key" }, abortEarly: false })
//     .validate(object);

//   if (error) {
//     const errorMessage = error.details
//       .map((details) => details.message)
//       .join(", ");
//     return res.status(404).json({ message:errorMessage})
//   }
//   Object.assign(req, value);
//   return next();
// };

const validate = (schema, property) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    const valid = error == null;

    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");

      res.status(422).json({ error: message });
    }
  };
};
// module.exports = middleware;
module.exports = validate;
