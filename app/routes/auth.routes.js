const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");
const validate = require('../validation/auth.validation');



module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/auth/signup",[verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted],controller.signup);

  app.post("/api/auth/signin", controller.signin);

  app.post("/api/auth/forget-password", controller.forgotPassword);

  app.post('/api/auth/reset-password', controller.resetPassword);

//   app.get('/api/logout',auth,function(req,res){
//     let token = req.jwtToken.token
//     let secret = req.jwtToken.secret
//     if (typeof token == 'string' && typeof secret == 'string') {
//         exporter.setHashKeyValuesIntoRedis('expired_token', [token, secret])
//         .then(() => {
//             res.status(200).json({
//                 msg: 'logged out'
//             })
//         })
//         .catch((redisErr) => {
//         })
//     }
//     else {
//         res.status(404).json({
//             msg: 'invalid token'
//         })
//     }
// })

};
