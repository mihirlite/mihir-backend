import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for STARTTLS (587)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false // Allows self-signed certs and avoids Gmail STARTTLS issues
    }
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Email SMTP connection failed:", error.message);
    } else {
        console.log("✅ Email SMTP server is ready to send emails");
    }
});

export const sendEmail = async ({ to, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"FlavoHub 🍕" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        console.log(`✅ Email sent to ${to} | MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Email Error (to: ${to}):`, error.message);
        return { success: false, error };
    }
};
