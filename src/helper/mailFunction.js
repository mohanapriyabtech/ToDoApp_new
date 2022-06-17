const nodeMailer = require("nodemailer");
require("dotenv").config();

const mailTransporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendMail = async (email, otp) => {
  var mailOptions = {
    from: process.env.EMAIL_ID,
    to: email,
    subject: "Verify your email",
    html: `<p> Enter <b> ${otp} </b> in the app to verify yor email address</p> `,
  };
  console.log(otp);

  mailTransporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error);
    }
    console.log("Mail sent to : %s", email);
  });
};

exports.statusMail = async (userEmail, fullName, task, taskStatus) => {
  const mailOptions = {
    from: process.env.EMAIL_ID,
    to: userEmail,
    subject: "Task Status Report",
    html: `<p> Dear ${fullName} ,</n>Your Task Topic is <b>${task}</b>.
    </n>Your Task status is<b> ${taskStatus}</b> </p>`,
  };
  mailTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
  });
};
