const nodemailer = require("nodemailer");
require("dotenv").config();

exports.sendEmail = async (email, subject, recovery_token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Outlook365",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_EMAIL_PASSWORD,
      },
    });
    console.log(process.env.EMAIL_URL);

    var mailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: subject,
      // text: 'Reset Password ONLY VALID FOR 10 MINS',
      html: `<p>Click <a href=${process.env.EMAIL_URL}/forgotpassword?token=${recovery_token}>here</a> to reset your password</p>`,
    };

    http: transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent :" + info.response);
      }
    });
  } catch (error) {
    console.log(error, "email not sent");
  }
};
