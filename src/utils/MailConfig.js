const nodemailer = require("nodemailer");

const getTransporter = () =>
    nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

const sendEmail = async ({ to, subject, text, html }) => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        return {
            skipped: true,
            message: "SMTP credentials are not configured"
        };
    }

    const transporter = getTransporter();

    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_EMAIL,
        to,
        subject,
        text,
        html
    });

    return { skipped: false };
};

module.exports = {
    sendEmail
};
