const nodemailer = require('nodemailer');
let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;
  if (process.env.NODE_ENV === 'test') {
    transporter = nodemailer.createTransport({ streamTransport: true, newline: 'unix' });
    return transporter;
  }
  const account = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: { user: account.user, pass: account.pass }
  });
  return transporter;
};

const sendVerificationEmail = async (to, token) => {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: '"FinSight" <noreply@finsight.com>',
    to,
    subject: 'Verify your email',
    text: `Your token is ${token}`
  });
  if (process.env.NODE_ENV !== 'test') console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
};
const sendPasswordResetEmail = async (to, token) => {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: '"FinSight" <noreply@finsight.com>',
    to,
    subject: 'Reset Password',
    text: `Your reset token is ${token}`
  });
  if (process.env.NODE_ENV !== 'test') console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
};
const sendBudgetExceededEmail = async (to, categoryName, spent, budget) => {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: '"FinSight" <noreply@finsight.com>',
    to,
    subject: 'Budget Exceeded',
    text: `You exceeded budget for ${categoryName}. Spent: ${spent}, Budget: ${budget}`
  });
  if (process.env.NODE_ENV !== 'test') console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendBudgetExceededEmail };
