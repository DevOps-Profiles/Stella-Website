const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const converter = require('number-to-words');

const invoiceDir = path.join(__dirname, '../invoices');
if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir, { recursive: true });
}

async function generateInvoice(order, user, orderItems, shippingAddress = null) {
    return new Promise((resolve, reject) => {
        try {
            const fileName = `Invoice_${order.id}.pdf`;
            const filePath = path.join(invoiceDir, fileName);
            // Use A4 size: 595.28 x 841.89 points
            const doc = new PDFDocument({ size: 'A4', margin: 30 });
            
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // Coordinates & Layout Settings
            const marginX = 40;
            const rightEdge = 555;
            let currentY = 40;

            // --- WATERMARK ---
            const watermarkPath = path.join(__dirname, '../assets/watermark.png');
            if (fs.existsSync(watermarkPath)) {
                doc.save();
                doc.opacity(0.15);
                // Center the watermark
                doc.image(watermarkPath, 147, 240, { width: 300 });
                doc.restore();
            }

            // --- HEADER ---
            // Logo
            const logoPath = path.join(__dirname, '../assets/logo.png');
            if (fs.existsSync(logoPath)) {
                // Adjust width to match the aspect ratio of the logo
                doc.image(logoPath, marginX, currentY, { width: 180 });
            }
            
            // Header Right - "Tax Invoice"
            doc.font('Helvetica-Bold')
               .fontSize(16)
               .fillColor('#ed1c24') // Red color from the image
               .text('Tax Invoice', 380, currentY, { width: rightEdge - 380, align: 'right' });
            
            doc.fillColor('#000000')
               .fontSize(9);

            const invoiceDate = new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            
            const invLabelsX = 400;
            const invValsX = 450;
            let rightY = currentY + 25;
            
            doc.font('Helvetica-Bold');
            doc.text('Invoice No', invLabelsX, rightY); 
            doc.font('Helvetica').text(': ' + order.id.toString(), invValsX, rightY);
            
            rightY += 15;
            doc.font('Helvetica-Bold');
            doc.text('Date', invLabelsX, rightY); 
            doc.font('Helvetica').text(': ' + invoiceDate, invValsX, rightY);

            rightY += 15;
            doc.font('Helvetica-Bold');
            doc.text('GSTIN', invLabelsX, rightY); 
            doc.font('Helvetica').text(': 33ABOCS5957J1ZO', invValsX, rightY);

            // Tagline below logo
            currentY += 65;
            doc.font('Helvetica-Bold')
               .fontSize(8)
               .fillColor('#333333')
               .text('MOBILES / ACCESSORIES / GADGETS / SERVICE', marginX + 5, currentY);

            // Full width header separator
            currentY += 15;
            doc.moveTo(marginX, currentY).lineTo(rightEdge, currentY).lineWidth(1).stroke('#000000');

            // --- BILL TO ---
            currentY += 10;
            doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000').text('BILL TO', marginX + 10, currentY);
            
            const billLabelsX = marginX + 10;
            const billValsX = marginX + 55;

            currentY += 15;
            doc.font('Helvetica').text('Name', billLabelsX, currentY); 
            doc.text(': ' + (user.name || 'Customer'), billValsX, currentY);

            currentY += 15;
            let addressStr = 'N/A';
            if (shippingAddress) {
                const parts = [
                    shippingAddress.address_name,
                    shippingAddress.street_address,
                    shippingAddress.landmark,
                    shippingAddress.city,
                    shippingAddress.state,
                    shippingAddress.postal_code
                ].filter(Boolean);
                addressStr = parts.join(', ');
            }
            doc.text('Address', billLabelsX, currentY); 
            doc.text(': ' + addressStr, billValsX, currentY, { width: 250 });

            const addrHeight = doc.heightOfString(': ' + addressStr, { width: 250 });
            currentY += addrHeight + 5;
            
            doc.text('Phone', billLabelsX, currentY); 
            doc.text(': ' + (user.phone_number || 'N/A'), billValsX, currentY);

            currentY += 15;
            doc.text('Email', billLabelsX, currentY); 
            doc.text(': ' + (user.email || 'N/A'), billValsX, currentY);

            // --- TABLE ---
            currentY += 35;
            const tableTop = currentY;
            
            // Table Header Box
            const headerHeight = 20;
            doc.lineWidth(0.5).stroke('#000000');
            
            // Horizontal lines for header
            doc.moveTo(marginX, tableTop).lineTo(rightEdge, tableTop).stroke();
            doc.moveTo(marginX, tableTop + headerHeight).lineTo(rightEdge, tableTop + headerHeight).stroke();

            const cols = {
                sno: { x: marginX, w: 40 },
                desc: { x: marginX + 40, w: 260 },
                qty: { x: marginX + 300, w: 50 },
                price: { x: marginX + 350, w: 80 },
                total: { x: marginX + 430, w: rightEdge - (marginX + 430) }
            };

            // Vertical lines for header
            doc.moveTo(marginX, tableTop).lineTo(marginX, tableTop + headerHeight).stroke();
            doc.moveTo(cols.desc.x, tableTop).lineTo(cols.desc.x, tableTop + headerHeight).stroke();
            doc.moveTo(cols.qty.x, tableTop).lineTo(cols.qty.x, tableTop + headerHeight).stroke();
            doc.moveTo(cols.price.x, tableTop).lineTo(cols.price.x, tableTop + headerHeight).stroke();
            doc.moveTo(cols.total.x, tableTop).lineTo(cols.total.x, tableTop + headerHeight).stroke();
            doc.moveTo(rightEdge, tableTop).lineTo(rightEdge, tableTop + headerHeight).stroke();

            // Header Text
            const textY = tableTop + 6;
            doc.font('Helvetica').fontSize(9);
            doc.text('S.No', cols.sno.x, textY, { width: cols.sno.w, align: 'center' });
            doc.text('Product Description', cols.desc.x, textY, { width: cols.desc.w, align: 'center' });
            doc.text('QTY', cols.qty.x, textY, { width: cols.qty.w, align: 'center' });
            doc.text('Price', cols.price.x, textY, { width: cols.price.w, align: 'center' });
            doc.text('Total Amount', cols.total.x, textY, { width: cols.total.w, align: 'center' });

            // Table Rows
            let rowY = tableTop + headerHeight;
            let subtotal = 0;

            for (let i = 0; i < orderItems.length; i++) {
                const item = orderItems[i];
                const unitPrice = parseFloat(item.price_at_purchase);
                // Reverse calculate base price (Assuming price is inclusive of 18% GST for visual match, wait the user said GST is 18%, we will calculate total first, but the invoice image shows Price and Total Amount. Let's just use the item price and qty.)
                
                // For a proper B2C invoice, usually the 'Price' is the taxable value, and GST is added later. 
                // But if the website shows inclusive prices, we extract the base price.
                const basePrice = unitPrice / 1.18;
                const totalItemPrice = basePrice * item.quantity;
                subtotal += totalItemPrice;

                // Draw vertical lines for this row
                const rowHeight = 25;
                doc.moveTo(marginX, rowY).lineTo(marginX, rowY + rowHeight).stroke();
                doc.moveTo(cols.desc.x, rowY).lineTo(cols.desc.x, rowY + rowHeight).stroke();
                doc.moveTo(cols.qty.x, rowY).lineTo(cols.qty.x, rowY + rowHeight).stroke();
                doc.moveTo(cols.price.x, rowY).lineTo(cols.price.x, rowY + rowHeight).stroke();
                doc.moveTo(cols.total.x, rowY).lineTo(cols.total.x, rowY + rowHeight).stroke();
                doc.moveTo(rightEdge, rowY).lineTo(rightEdge, rowY + rowHeight).stroke();

                const itemTextY = rowY + 8;
                doc.text((i + 1).toString(), cols.sno.x, itemTextY, { width: cols.sno.w, align: 'center' });
                doc.text(item.product_name || `Product #${item.product_id}`, cols.desc.x + 10, itemTextY, { width: cols.desc.w - 20, align: 'left' });
                doc.text(item.quantity.toString(), cols.qty.x, itemTextY, { width: cols.qty.w, align: 'center' });
                doc.text(basePrice.toFixed(2), cols.price.x, itemTextY, { width: cols.price.w, align: 'center' });
                doc.text(totalItemPrice.toFixed(2), cols.total.x, itemTextY, { width: cols.total.w, align: 'center' });

                rowY += rowHeight;
            }

            // Draw a few empty rows to fill space and match the design (e.g. up to y=350)
            while (rowY < 350) {
                const rowHeight = 25;
                doc.moveTo(marginX, rowY).lineTo(marginX, rowY + rowHeight).stroke();
                doc.moveTo(cols.desc.x, rowY).lineTo(cols.desc.x, rowY + rowHeight).stroke();
                doc.moveTo(cols.qty.x, rowY).lineTo(cols.qty.x, rowY + rowHeight).stroke();
                doc.moveTo(cols.price.x, rowY).lineTo(cols.price.x, rowY + rowHeight).stroke();
                doc.moveTo(cols.total.x, rowY).lineTo(cols.total.x, rowY + rowHeight).stroke();
                doc.moveTo(rightEdge, rowY).lineTo(rightEdge, rowY + rowHeight).stroke();
                rowY += rowHeight;
            }

            // Close the table bottom
            doc.moveTo(marginX, rowY).lineTo(rightEdge, rowY).stroke();

            currentY = rowY + 20;

            // --- BOTTOM SECTION ---
            // Calculations (Right Side)
            const calcX = 350;
            const calcValX = 460;
            let calcY = currentY;

            const cgst = subtotal * 0.09;
            const sgst = subtotal * 0.09;
            const rawTotal = subtotal + cgst + sgst;
            const grandTotal = Math.round(rawTotal);
            const roundOff = grandTotal - rawTotal;

            doc.font('Helvetica-Bold');
            doc.text('CGST @ 9%', calcX, calcY);
            doc.text(cgst.toFixed(2), calcValX, calcY, { width: 80, align: 'right' });

            calcY += 20;
            doc.text('SGST @ 9%', calcX, calcY);
            doc.text(sgst.toFixed(2), calcValX, calcY, { width: 80, align: 'right' });

            calcY += 20;
            doc.text('Round off', calcX, calcY);
            doc.text(roundOff.toFixed(2), calcValX, calcY, { width: 80, align: 'right' });

            calcY += 25;
            doc.text('GRAND TOTAL', calcX, calcY);
            doc.text(grandTotal.toFixed(2), calcValX, calcY, { width: 80, align: 'right' });

            // Amount in words
            calcY += 30;
            const words = converter.toWords(grandTotal).toUpperCase() + ' RUPEES ONLY';
            doc.text('Amount in Words :', 300, calcY);
            doc.font('Helvetica').fontSize(8).text(words, 400, calcY, { width: 150 });

            // Removed Signatory Box as requested

            // --- TERMS & CONDITIONS (Left Side) ---
            let leftY = currentY;
            const termsBoxY = leftY;
            doc.roundedRect(marginX, termsBoxY, 230, 115, 5).stroke();
            leftY += 8;
            doc.font('Helvetica-Bold').fontSize(7).text('TERMS & CONDITIONS', marginX + 10, leftY);
            leftY += 12;
            doc.font('Helvetica').fontSize(6);
            
            const termsText = [
                "1. Goods once sold will not be taken back or exchanged.",
                "2. Returns or replacements are allowed only as per the manufacturer's warranty or policy.",
                "3. The store will not be responsible for claims after the customer leaves without verification.",
                "4. Any disputes arising from the sales shall be subject to the jurisdiction of the competent courts where the franchisee business is located."
            ];

            termsText.forEach(text => {
                doc.text(text, marginX + 5, leftY, { width: 220 });
                leftY += doc.heightOfString(text, { width: 220 }) + 3;
            });

            // --- CONTACT ICONS (Left Bottom) ---
            // Move leftY firmly below the terms box to prevent overlap!
            leftY = termsBoxY + 115 + 15;
            
            doc.fontSize(7).font('Helvetica');

            const drawIcon = (pathString, x, y) => {
                doc.save()
                   .translate(x, y)
                   .scale(0.5) // Scale down 24x24 icons to 12x12
                   .path(pathString)
                   .fill('#333333')
                   .restore();
            };

            // Map pin SVG
            drawIcon('M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', marginX, leftY - 2);
            doc.text('102/5a/1a, Polepettai, Melur', marginX + 18, leftY);
            doc.text('Thoothukudi, Tamil Nadu - 628 002', marginX + 18, leftY + 10);
            
            leftY += 25;
            // Phone SVG
            drawIcon('M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z', marginX, leftY - 2);
            doc.text('+91 9095510510, +91 9345110510', marginX + 18, leftY);

            leftY += 15;
            // Email SVG
            drawIcon('M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z', marginX, leftY - 2);
            doc.text('support@stellahitech.com', marginX + 18, leftY);

            leftY += 15;
            // Web SVG
            drawIcon('M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.09 13.36 4 12.69 4 12s.09-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c1.96-1.66 3.49-2.93 5.33-3.56C9.81 5.55 9.35 6.75 9.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.34.16-2h4.68c.09.66.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.17.64.26 1.31.26 2s-.09 1.36-.26 2h-3.38z', marginX, leftY - 2);
            doc.text('www.stellahitech.com', marginX + 18, leftY);

            // --- FOOTER ---
            const footerY = 760; // moved up safely from 800 to avoid spanning to next page
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333');
            doc.text('T H A N K   Y O U', marginX, footerY - 15, { width: rightEdge - marginX, align: 'center' });
            doc.fontSize(8).fillColor('#666666');
            doc.text('F O R   Y O U R   B U S I N E S S !', marginX, footerY + 5, { width: rightEdge - marginX, align: 'center' });

            // Computer generated warning note
            doc.fontSize(7).font('Helvetica-Oblique').fillColor('#999999');
            doc.text('This is a computer generated invoice and does not require a physical signature.', marginX, footerY + 25, { width: rightEdge - marginX, align: 'center' });

            doc.fontSize(6).font('Helvetica-Bold').fillColor('#000000');
            doc.text('FOR FRANCHISE ENQUIRY\n+91 9345110510', rightEdge - 150, footerY, { width: 150, align: 'right' });

            doc.end();
            
            writeStream.on('finish', () => {
                resolve({ filePath, fileName });
            });
            writeStream.on('error', reject);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateInvoice };
