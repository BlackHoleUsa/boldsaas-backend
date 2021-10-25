const nodemailer = require("nodemailer");

exports.sendEmail = async (email, subject, text) => {
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
      html: text,
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
