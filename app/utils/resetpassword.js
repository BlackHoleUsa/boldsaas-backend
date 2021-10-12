const db = require("../models");
const userService = require("./users")
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const User = db.user;

exports.resetPassword = async (email, newPassword) => {
    try {
       
      const user = await userService.getUserByEmail(email);
   
     
      if (!user) {
        throw new Error('Wrong User');
      }
      
      userService.updateUserById(user.id, { password:bcrypt.hashSync(newPassword, 8)});
  
    } catch (error) {
      console.log("error");
    }
  };