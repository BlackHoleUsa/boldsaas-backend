const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");
const adminController = require("../controllers/admin.controller");
const userController = require("../controllers/user.controller");
const paypal = require("paypal-rest-sdk");
const validate = require("../validation/auth.validation");
const middlewares = require("../middlewares/validate");

require("dotenv").config();

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AUd_1SfNYpwJxytXEef0YapXpidaA_d2m3ikxZo5RJAYKB5L8s08g6pdztcRWuEKAPxpKfZ0D6U2UcQm",

  client_secret:
    "EOdOrV82DuPa1QLM2IbvzQ5mhA9z60waB-LhfK4eOuPba0NL-TDaDW0JFh6g4XVP-MvsLA0IiijqbsqB",
});

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/admin/get-all-users",
    [authJwt.verifyToken, authJwt.isAdmin],
    adminController.getAllUsers
  );

  app.put(
    "/api/admin/block-user",
    [authJwt.verifyToken],
    adminController.blockUser
  );

  app.put(
    "/api/admin/password-reset",
    [authJwt.verifyToken],
    adminController.resetPassword
  );

  app.get("/api/latest", userController.latestCoinPrice);
  app.post(
    "/api/admin/coin-price-update",
    [authJwt.isAdmin],
    middlewares(validate.value),
    adminController.priceUpdate
  );

  // app.get("/api/coin-price-histroy", userController.coinPriceHistroy);

  app.get("/api/stripe-page", userController.stripePage);

  app.post("/api/payment", userController.stripePayment);

  app.get("/go", (req, res) => res.render("paypal"));

  app.post("/api/paypal", userController.payPal);

  app.get("/api/paypal-payment-success", userController.payPalPaymentSuccees);

  app.get("/success", (req, res) => {
    res.send("Success");
  });

  app.get("/cancel", (req, res) => res.send("Cancelled"));
};
