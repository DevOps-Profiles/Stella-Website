const express = require('express');
const router = express.Router();
const db = require('../db');
const PDFDocument = require('pdfkit');
const Razorpay = require('razorpay');
const fs = require('fs');
const path = require('path');
const { generateInvoice } = require('../utils/invoiceGenerator');
const { sendInvoiceEmail } = require('../utils/emailService');

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
}

// POST /api/orders/razorpay/create
router.post('/razorpay/create', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount) return res.status(400).json({ error: 'Amount is required' });
        
        if (!razorpay) {
            return res.status(500).json({ error: 'Razorpay is not configured on the server.' });
        }

        const options = {
            amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json({
            success: true,
            orderId: order.id,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.error('Razorpay Create Order Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/orders
router.post('/', async (req, res) => {
    const { 
        user_id, 
        items, 
        total_amount, 
        delivery_type, 
        address_id, 
        branch_id, 
        payment_method 
    } = req.body;

    // Start a transaction
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Create the order
        const orderResult = await client.query(
            'INSERT INTO orders (user_id, total_amount, delivery_type, address_id, branch_id, payment_method) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [user_id, total_amount, delivery_type, address_id, branch_id, payment_method]
        );
        
        const order = orderResult.rows[0];

        // 2. Add order items and deduct stock
        for (const item of items) {
            // Add to order_items
            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
                [order.id, item.product_id, item.quantity, item.price]
            );

            // Deduct stock
            const updateResult = await client.query(
                'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND stock_quantity >= $3 RETURNING id',
                [item.quantity, item.product_id, item.quantity]
            );
            
            if (updateResult.rowCount === 0) {
                throw new Error(`Insufficient stock for product ID ${item.product_id}`);
            }
        }

        await client.query('COMMIT');
        
        try {
            // Fetch user info
            const userResult = await client.query('SELECT name, email, phone_number FROM users WHERE id = $1', [user_id]);
            const user = userResult.rows[0] || { name: 'Customer' };
            
            // Fetch Shipping Address if applicable
            let shippingAddress = null;
            if (address_id) {
                const addrResult = await client.query('SELECT address_name, street_address, landmark, city, state, postal_code FROM addresses WHERE id = $1', [address_id]);
                shippingAddress = addrResult.rows[0] || null;
            } else if (branch_id) {
                // If store pickup, use branch address as shipping address
                const branchResult = await client.query('SELECT name as address_name, address as street_address FROM branches WHERE id = $1', [branch_id]);
                if (branchResult.rows[0]) {
                    shippingAddress = {
                        address_name: 'Store Pickup: ' + branchResult.rows[0].address_name,
                        street_address: branchResult.rows[0].street_address,
                        city: '', state: '', postal_code: '', landmark: ''
                    };
                }
            }

            // Format order items for invoice
            const invoiceItems = [];
            for (const item of items) {
                const prod = await client.query('SELECT name FROM products WHERE id = $1', [item.product_id]);
                invoiceItems.push({
                    product_id: item.product_id,
                    product_name: prod.rows[0] ? prod.rows[0].name : `Product #${item.product_id}`,
                    quantity: item.quantity,
                    price_at_purchase: item.price
                });
            }
            
            // Generate Invoice
            const invoiceFile = await generateInvoice(order, user, invoiceItems, shippingAddress);
            
            // Send Email
            await sendInvoiceEmail(user, order, invoiceFile);
            console.log('Invoice generated and emailed successfully for order', order.id);
        } catch (invoiceErr) {
            console.error('Invoice Generation/Email Error:', invoiceErr);
            // Don't fail the order just because email/invoice failed
        }

        res.status(201).json(order);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Order Error:', err);
        res.status(500).json({ error: 'Failed to create order', details: err.message });
    } finally {
        client.release();
    }
});

// GET /api/orders/user/:userId
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await db.query(
            `SELECT o.*, 
                    a.street_address, a.city, a.state, a.postal_code,
                    b.name as branch_name, b.address as branch_address,
                    COALESCE(
                        (SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', oi.id,
                                'product_id', p.id,
                                'name', p.name,
                                'price', oi.price_at_purchase,
                                'quantity', oi.quantity,
                                'image_url', p.image_url
                            )
                        )
                        FROM order_items oi
                        JOIN products p ON oi.product_id = p.id
                        WHERE oi.order_id = o.id),
                        JSON_ARRAY()
                    ) as items
             FROM orders o 
             LEFT JOIN addresses a ON o.address_id = a.id
             LEFT JOIN branches b ON o.branch_id = b.id
             WHERE o.user_id = $1 
             ORDER BY o.created_at DESC`,
            [userId]
        );
        const orders = result.rows.map((row) => ({
            ...row,
            items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [],
        }));
        res.json(orders);
    } catch (err) {
        console.error('Error fetching user orders:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/orders (all orders for admin dashboard logs)
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT o.*, u.name as user_name, u.phone_number as user_phone,
                   (SELECT CONCAT('[', GROUP_CONCAT(DISTINCT CONCAT('"', c.name, '"')), ']')
                    FROM order_items oi
                    JOIN products p ON oi.product_id = p.id
                    JOIN categories c ON p.category_id = c.id
                    WHERE oi.order_id = o.id) as categories
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);
        const orders = result.rows.map((row) => ({
            ...row,
            categories: typeof row.categories === 'string' ? JSON.parse(row.categories) : row.categories,
        }));
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/orders/:id/status (update order status + optional expected delivery date)
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, expected_delivery_date } = req.body;
    try {
        const result = await db.query(
            'UPDATE orders SET status = $1, expected_delivery_date = COALESCE($2, expected_delivery_date) WHERE id = $3 RETURNING *',
            [status, expected_delivery_date || null, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/orders/:id/delivery-date (set expected delivery date only)
router.put('/:id/delivery-date', async (req, res) => {
    const { id } = req.params;
    const { expected_delivery_date } = req.body;
    try {
        const result = await db.query(
            'UPDATE orders SET expected_delivery_date = $1 WHERE id = $2 RETURNING *',
            [expected_delivery_date || null, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// GET /api/orders/:id/invoice
router.get('/:id/invoice', async (req, res) => {
    const { id } = req.params;
    try {
        // Prevent browser caching of old invoices
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        const filePath = path.join(__dirname, '../invoices', `Invoice_${id}.pdf`);
        if (fs.existsSync(filePath)) {
            return res.download(filePath, `Stella_Mobiles_Invoice_${id}.pdf`);
        }

        // If file doesn't exist, we must generate it (for old orders)
        const orderResult = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (orderResult.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        const order = orderResult.rows[0];

        const userResult = await db.query('SELECT name, email, phone_number FROM users WHERE id = $1', [order.user_id]);
        const user = userResult.rows[0] || { name: 'Customer' };

        let shippingAddress = null;
        if (order.address_id) {
            const addrResult = await db.query('SELECT address_name, street_address, landmark, city, state, postal_code FROM addresses WHERE id = $1', [order.address_id]);
            shippingAddress = addrResult.rows[0] || null;
        } else if (order.branch_id) {
            const branchResult = await db.query('SELECT name as address_name, address as street_address FROM branches WHERE id = $1', [order.branch_id]);
            if (branchResult.rows[0]) {
                shippingAddress = {
                    address_name: 'Store Pickup: ' + branchResult.rows[0].address_name,
                    street_address: branchResult.rows[0].street_address,
                    city: '', state: '', postal_code: '', landmark: ''
                };
            }
        }

        const itemsResult = await db.query(`
            SELECT oi.product_id, p.name as product_name, oi.quantity, oi.price_at_purchase
            FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1
        `, [id]);
        
        await generateInvoice(order, user, itemsResult.rows, shippingAddress);
        
        if (fs.existsSync(filePath)) {
            res.download(filePath, `Stella_Mobiles_Invoice_${id}.pdf`);
        } else {
            res.status(500).json({ error: 'Failed to generate invoice on the fly.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to download invoice' });
    }
});

module.exports = router;
