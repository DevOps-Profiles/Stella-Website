const nodemailer = require('nodemailer');
const fs = require('fs');

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 465,
    secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'support@stellahitech.com', 
        pass: process.env.SMTP_PASS || 'your_email_password',
    },
});

async function sendInvoiceEmail(user, order, invoiceFile) {
    console.log(`[EMAIL] Attempting to send invoice email to: ${user.email} for order #${order.id}...`);
    if (!user.email) {
        console.log('[EMAIL] User does not have an email address. Skipping email invoice.');
        return;
    }

    try {
        const attachment = { filename: invoiceFile.fileName };
        if (invoiceFile.buffer) {
            attachment.content = invoiceFile.buffer;
        } else if (invoiceFile.filePath) {
            attachment.path = invoiceFile.filePath;
        }

        const mailOptions = {
            from: `"Stella Mobiles" <${process.env.SMTP_USER || 'support@stellahitech.com'}>`,
            to: user.email.trim().toLowerCase(),
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
            attachments: [attachment]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Invoice email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending invoice email:', error);
        throw error;
    }
}

async function sendAdminNotificationEmail(user, order, items) {
    const adminEmail = 'support@stellahitech.com';
    try {
        console.log(`[EMAIL] Attempting to send admin order placement notification for Order #${order.id}...`);
        
        const itemsHtml = items.map(item => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">${item.product_name || `Product #${item.product_id}`}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${Number(item.price_at_purchase).toLocaleString('en-IN')}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: `"Stella System" <${process.env.SMTP_USER || 'support@stellahitech.com'}>`,
            to: adminEmail,
            subject: `🚨 Alert: New Order Placed - Order #${order.id}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #ed1c24; margin-top: 0;">New Order Received!</h2>
                    <p>Hello Admin,</p>
                    <p>A new order has been successfully placed on the Stella Technologies website.</p>
                    
                    <h3 style="border-bottom: 2px solid #ed1c24; padding-bottom: 5px; color: #111;">Order Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 6px 0; font-weight: bold; width: 140px;">Order ID:</td>
                            <td style="padding: 6px 0;">#${order.id}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-weight: bold;">Customer:</td>
                            <td style="padding: 6px 0;">${user.name || 'N/A'} (${user.phone_number || 'N/A'})</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-weight: bold;">Email:</td>
                            <td style="padding: 6px 0;">${user.email || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-weight: bold;">Amount:</td>
                            <td style="padding: 6px 0; font-weight: bold; color: #ed1c24;">₹${Number(order.total_amount).toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-weight: bold;">Delivery Type:</td>
                            <td style="padding: 6px 0; text-transform: uppercase;">${order.delivery_type}</td>
                        </tr>
                        ${order.time_slot ? `
                        <tr>
                            <td style="padding: 6px 0; font-weight: bold;">Time Slot:</td>
                            <td style="padding: 6px 0; color: #ed1c24; font-weight: bold;">${order.time_slot}</td>
                        </tr>
                        ` : ''}
                        <tr>
                            <td style="padding: 6px 0; font-weight: bold;">Payment Method:</td>
                            <td style="padding: 6px 0; text-transform: uppercase;">${order.payment_method}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-weight: bold;">Expected Date:</td>
                            <td style="padding: 6px 0;">${new Date(order.expected_delivery_date).toLocaleDateString('en-IN')}</td>
                        </tr>
                    </table>

                    <h3 style="border-bottom: 2px solid #ed1c24; padding-bottom: 5px; color: #111; margin-top: 25px;">Ordered Items</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f9f9f9;">
                                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Product / Variant</th>
                                <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd; width: 60px;">QTY</th>
                                <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd; width: 100px;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    
                    <p style="margin-top: 30px; font-size: 11px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 10px;">
                        This is an automated notification from the Stella Technologies system.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('[EMAIL] Admin order placement notification sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('[EMAIL] Error sending admin notification email:', error);
        throw error;
    }
}

module.exports = { sendInvoiceEmail, sendAdminNotificationEmail };
