var nodemailer = require("nodemailer");

// Nodemailer
const sendEmail = async (options) => {
  // 1) Create transporter ( service that will send email like "gmail","Mailgun", "mialtrap", sendGrid)
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "tefamod22@gmail.com",
      pass: "qorz nvys jonh pudb",
    },
  });

  // 2) Define email options (like from, to, subject, email content)
  var mailOptions = {
    from: "tefamod22@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Send email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendEmail;
