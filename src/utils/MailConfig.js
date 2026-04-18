const nodemailer = require("nodemailer");

const getTransporter = () => {
    const emailUser = process.env.SMTP_EMAIL || process.env.EMAIL_USER;
    const emailPass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });
};

const sendEmail = async ({ to, subject, text, html }) => {
    const emailUser = process.env.SMTP_EMAIL || process.env.EMAIL_USER;
    const emailPass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;

    if (!process.env.SMTP_HOST || !emailUser || !emailPass) {
        return {
            skipped: true,
            message: "SMTP credentials are not configured"
        };
    }

    const transporter = getTransporter();

    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.EMAIL_FROM || emailUser,
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
