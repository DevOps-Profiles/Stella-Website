const nodemailer = require('nodemailer');
const fs = require('fs');

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: process.env.SMTP_PORT || 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'support@stellahitech.com', 
        pass: process.env.SMTP_PASS || 'your_email_password',
    },
});

async function sendInvoiceEmail(user, order, invoiceFile) {
    if (!user.email) {
        console.log('User does not have an email address. Skipping email invoice.');
        return;
    }

    try {
        const mailOptions = {
            from: `"Stella Mobiles" <${process.env.SMTP_USER || 'support@stellahitech.com'}>`,
            to: user.email,
            subject: `Your Stella Mobiles Invoice - Order #${order.id}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2>Thank you for your order, ${user.name}!</h2>
                    <p>Your order <strong>#${order.id}</strong> has been successfully placed.</p>
                    <p>We have attached your official tax invoice to this email for your records.</p>
                    <p>If you have any questions or need further support, please don't hesitate to reach out to us.</p>
                    <br/>
                    <p>Best Regards,</p>
                    <p><strong>Stella Hi-Tech Team</strong><br/>support@stellahitech.com</p>
                </div>
            `,
            attachments: [
                {
                    filename: invoiceFile.fileName,
                    path: invoiceFile.filePath
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Invoice email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending invoice email:', error);
        throw error;
    }
}

module.exports = { sendInvoiceEmail };
