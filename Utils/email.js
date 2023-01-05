const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  // create transporter
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // define the email functions

  const mailOptions = {
    from: 'ORIJA DAMILOLA <damilolaomotola20@gmail>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //actually send the email

  await transport.sendMail(mailOptions);
};

module.exports = sendMail;
// FOR GMAIL
//const transporter = nodemailer.createTransport({
//service: 'Gmail',
//auth: {
//user: process.env.EMAIL_USERNAME,
//pass: process.env.EMAIL_PASSWORD,
//},
