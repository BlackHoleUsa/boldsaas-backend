const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");
const validate = require("../validation/auth.validation");
const middlewares = require("../middlewares/validate");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [verifySignUp.checkDuplicateUsernameOrEmail],
    controller.signup
  );

  app.post("/api/auth/signin", middlewares(validate.email), controller.signin);

  app.post(
    "/api/auth/forget-password",
    middlewares(validate.emails),
    controller.forgotPassword
  );

  app.patch("/api/auth/reset-password/:token", controller.resetPassword);
};
