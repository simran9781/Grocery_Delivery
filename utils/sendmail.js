const nodemailer = require("nodemailer");
require("dotenv").config();
const sendmail=(email,subject,message)=>
{
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  service:"gmail",
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


async function main() {
 
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER, 
    to: email, 
    subject: subject,
    text: "Please click the link to verify your email", 
    html: `<a href=${message}>Link</a>`, 
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

main().catch(console.error);
}

module.exports.sendmail = sendmail;