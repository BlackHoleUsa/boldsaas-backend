const nodemailer = require("nodemailer");

exports.sendEmail = async (email, subject, recovery_token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "abubakarblackhole5@gmail.com",
        pass: "st1rc2py",
      },
    });

    var mailOptions = {
      from: "abubakarblackhole5@gmail.com",
      to: email,
      subject: subject,
      // text: 'Reset Password ONLY VALID FOR 10 MINS',
      html:
        '<p>Click <a href="http://localhost:3000/forgotpassword?token=' +
        recovery_token +
        '">here</a> to reset your password</p>',
    };

    transporter.sendMail(mailOptions, function (err, info) {
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
