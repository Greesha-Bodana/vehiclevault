const { sendEmail } = require("./MailConfig");

const mailSend = async (to, subject, text, html) => {
  return sendEmail({ to, subject, text, html });
};

module.exports = mailSend;
