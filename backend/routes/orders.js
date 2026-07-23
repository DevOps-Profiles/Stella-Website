const express = require('express');
const router = express.Router();
const db = require('../db');
const PDFDocument = require('pdfkit');
const Razorpay = require('razorpay');
const fs = require('fs');
const path = require('path');
const { generateInvoice } = require('../utils/invoiceGenerator');
const { sendInvoiceEmail, sendAdminNotificationEmail } = require('../utils/emailService');

// Ensure variant_label column exists in order_items table
async function ensureVariantLabelColumn() {
  try {
    const cols = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'order_items' AND COLUMN_NAME = 'variant_label'
    `);
    if (cols.rows.length === 0) {
      await db.query('ALTER TABLE order_items ADD COLUMN variant_label VARCHAR(255)');
      console.log('Added variant_label column to order_items table');
    }
  } catch (err) {
    console.error('Error ensuring variant_label column:', err);
  }
}
ensureVariantLabelColumn();

// Ensure time_slot column exists in orders table
async function ensureTimeSlotColumn() {
  try {
    const cols = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'time_slot'
    `);
    if (cols.rows.length === 0) {
      await db.query('ALTER TABLE orders ADD COLUMN time_slot VARCHAR(50)');
      console.log('Added time_slot column to orders table');
    }
  } catch (err) {
    console.error('Error ensuring time_slot column:', err);
  }
}
ensureTimeSlotColumn();

// Ensure serial_no, hsn_code, imei1, imei2 columns exist in order_items table
async function ensureProductCodeColumns() {
  try {
    const columnsToAdd = ['serial_no', 'hsn_code', 'imei1', 'imei2'];
    for (const colName of columnsToAdd) {
      const cols = await db.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'order_items' AND COLUMN_NAME = $1
      `, [colName]);
      if (cols.rows.length === 0) {
        await db.query(`ALTER TABLE order_items ADD COLUMN ${colName} VARCHAR(255) DEFAULT NULL`);
        console.log(`Added ${colName} column to order_items table`);
      }
    }
  } catch (err) {
    console.error('Error ensuring product code columns:', err);
  }
}
ensureProductCodeColumns();

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
        payment_method,
        time_slot
    } = req.body;

    // Start a transaction
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');

        // Calculate tomorrow's date for expected_delivery_date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const expected_delivery_date = tomorrow.toISOString().split('T')[0];

        // 1. Create the order
        const orderResult = await client.query(
            'INSERT INTO orders (user_id, total_amount, delivery_type, address_id, branch_id, payment_method, expected_delivery_date, time_slot) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [user_id, total_amount, delivery_type, address_id, branch_id, payment_method, expected_delivery_date, time_slot || null]
        );
        
        const order = orderResult.rows[0];

        // 2. Add order items and deduct stock
        for (const item of items) {
            // Add to order_items
            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, variant_label) VALUES ($1, $2, $3, $4, $5)',
                [order.id, item.product_id, item.quantity, item.price, item.variant_label || '']
            );

            // Deduct stock
            const updateResult = await client.query(
                'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND stock_quantity >= $3 RETURNING id',
                [item.quantity, item.product_id, item.quantity]
            );
            
            if (updateResult.rowCount === 0) {
                throw new Error(`Insufficient stock for product ID ${item.product_id}`);
            }

            // Deduct specific variant stock if variant_label is present
            if (item.variant_label) {
                const prodRes = await client.query('SELECT variants FROM products WHERE id = $1', [item.product_id]);
                if (prodRes.rows.length > 0 && prodRes.rows[0].variants) {
                    let variants = [];
                    try {
                        variants = typeof prodRes.rows[0].variants === 'string' 
                            ? JSON.parse(prodRes.rows[0].variants) 
                            : prodRes.rows[0].variants;
                    } catch (e) {
                        variants = [];
                    }

                    if (Array.isArray(variants) && variants.length > 0) {
                        const labelParts = item.variant_label.split('/').map(s => s.trim().toLowerCase());
                        const vIdx = variants.findIndex(v => {
                            const vColor = (v.color || '').trim().toLowerCase();
                            const vRam = (v.ram || '').trim().toLowerCase();
                            const vStorage = (v.storage || '').trim().toLowerCase();
                            
                            return (vColor && labelParts.includes(vColor)) || 
                                   (vRam && labelParts.includes(vRam)) || 
                                   (vStorage && labelParts.includes(vStorage));
                        });

                        if (vIdx !== -1) {
                            const v = variants[vIdx];
                            const currentVStock = v.stock_quantity !== undefined ? parseInt(v.stock_quantity, 10) : 0;
                            if (currentVStock < item.quantity) {
                                throw new Error(`Insufficient stock for variant "${item.variant_label}"`);
                            }
                            variants[vIdx].stock_quantity = currentVStock - item.quantity;
                            await client.query('UPDATE products SET variants = $1 WHERE id = $2', [JSON.stringify(variants), item.product_id]);
                        }
                    }
                }
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
                const baseName = prod.rows[0] ? prod.rows[0].name : `Product #${item.product_id}`;
                const variantSuffix = item.variant_label ? ` (${item.variant_label})` : '';
                invoiceItems.push({
                    product_id: item.product_id,
                    product_name: baseName + variantSuffix,
                    quantity: item.quantity,
                    price_at_purchase: item.price
                });
            }
            
            // Customer invoice generation and email dispatch is deferred until the status update milestone:
            // (Prepaid -> Processing status, COD/Store Pickup -> Delivered status)
            console.log(`Customer invoice email deferred for order #${order.id} until status milestone is reached.`);

            // Send Admin Notification Email for every order placed
            try {
                await sendAdminNotificationEmail(user, order, invoiceItems);
            } catch (adminEmailErr) {
                console.error('Failed to send order notification to admin:', adminEmailErr);
            }
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
                                'name', COALESCE(p.name, 'Deleted Product'),
                                'price', oi.price_at_purchase,
                                'quantity', oi.quantity,
                                'image_url', COALESCE(p.image_url, ''),
                                'variant_label', oi.variant_label
                            )
                        )
                        FROM order_items oi
                        LEFT JOIN products p ON oi.product_id = p.id
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
                   b.name as branch_name,
                   (SELECT CONCAT('[', GROUP_CONCAT(DISTINCT CONCAT('"', COALESCE(c.name, 'Uncategorized'), '"')), ']')
                    FROM order_items oi
                    LEFT JOIN products p ON oi.product_id = p.id
                    LEFT JOIN categories c ON p.category_id = c.id
                    WHERE oi.order_id = o.id) as categories
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN branches b ON o.branch_id = b.id
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

// GET /api/orders/:id/items (fetch all items with product info for an order)
router.get('/:id/items', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(`
            SELECT oi.id as item_id, oi.product_id, COALESCE(p.name, 'Deleted Product') as name, 
                   oi.quantity, oi.price_at_purchase as price, oi.variant_label,
                   oi.serial_no, oi.hsn_code, oi.imei1, oi.imei2
            FROM order_items oi 
            LEFT JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id = $1
        `, [id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/orders/:id/status (update order status + optional expected delivery date)
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, expected_delivery_date, itemCodes } = req.body;
    try {
        // If itemCodes is provided, update the order_items table first!
        if (itemCodes && typeof itemCodes === 'object') {
            for (const [itemId, codes] of Object.entries(itemCodes)) {
                await db.query(`
                    UPDATE order_items 
                    SET serial_no = $1, hsn_code = $2, imei1 = $3, imei2 = $4 
                    WHERE id = $5 AND order_id = $6
                `, [
                    codes.serial_no || null,
                    codes.hsn_code || null,
                    codes.imei1 || null,
                    codes.imei2 || null,
                    itemId,
                    id
                ]);
            }
        }

        const result = await db.query(
            'UPDATE orders SET status = $1, expected_delivery_date = COALESCE($2, expected_delivery_date) WHERE id = $3 RETURNING *',
            [status, expected_delivery_date || null, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const order = result.rows[0];

        const isCodOrPickup = order.payment_method?.toLowerCase() === 'cod' || 
                              order.delivery_type?.toLowerCase() === 'pickup' || 
                              order.delivery_type?.toLowerCase() === 'store_pickup' ||
                              order.payment_method?.toLowerCase() === 'store';

        const statusLower = (status || '').toLowerCase();
        let triggerEmail = false;
        
        if (isCodOrPickup) {
            triggerEmail = statusLower === 'delivered';
        } else {
            triggerEmail = statusLower === 'processing';
        }

        if (triggerEmail) {
            try {
                // Fetch user info
                const userResult = await db.query('SELECT name, email, phone_number FROM users WHERE id = $1', [order.user_id]);
                const user = userResult.rows[0] || { name: 'Customer' };
                
                // Fetch Shipping Address if applicable
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

                // Fetch order items (including serial_no, hsn_code, imei1, imei2)
                const itemsResult = await db.query(`
                    SELECT oi.*, p.name as product_name 
                    FROM order_items oi 
                    LEFT JOIN products p ON oi.product_id = p.id 
                    WHERE oi.order_id = $1
                `, [order.id]);
                
                const invoiceItems = itemsResult.rows.map(item => {
                    const variantSuffix = item.variant_label ? ` (${item.variant_label})` : '';
                    return {
                        product_id: item.product_id,
                        product_name: (item.product_name || `Product #${item.product_id}`) + variantSuffix,
                        quantity: item.quantity,
                        price_at_purchase: item.price_at_purchase,
                        serial_no: item.serial_no,
                        hsn_code: item.hsn_code,
                        imei1: item.imei1,
                        imei2: item.imei2
                    };
                });
                
                // Generate Invoice
                const invoiceFile = await generateInvoice(order, user, invoiceItems, shippingAddress);
                
                // Send Email
                await sendInvoiceEmail(user, order, invoiceFile);
                console.log('Invoice generated and emailed successfully on status change to', status, 'for order', order.id);
            } catch (invoiceErr) {
                console.error('Invoice Generation/Email Error on Delivered status:', invoiceErr);
            }
        }

        res.json(order);
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

        const orderResult = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (orderResult.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        const order = orderResult.rows[0];

        const isCodOrPickup = order.payment_method?.toLowerCase() === 'cod' || 
                              order.delivery_type?.toLowerCase() === 'pickup' || 
                              order.delivery_type?.toLowerCase() === 'store_pickup' ||
                              order.payment_method?.toLowerCase() === 'store';

        const statusLower = (order.status || '').toLowerCase();
        let allowed = false;
        
        if (isCodOrPickup) {
            allowed = statusLower === 'delivered';
        } else {
            allowed = ['processing', 'shipped', 'delivered'].includes(statusLower);
        }

        if (!allowed) {
            const errorMsg = isCodOrPickup 
                ? 'Invoice download is only available after the order is marked as delivered.'
                : 'Invoice download is only available after the order is processed.';
            return res.status(403).json({ error: errorMsg });
        }

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
            SELECT oi.product_id, COALESCE(p.name, 'Deleted Product') as product_name, 
                   oi.quantity, oi.price_at_purchase, oi.variant_label,
                   oi.serial_no, oi.hsn_code, oi.imei1, oi.imei2
            FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1
        `, [id]);
        
        const formattedItems = itemsResult.rows.map(item => {
            const variantSuffix = item.variant_label ? ` (${item.variant_label})` : '';
            return {
                ...item,
                product_name: item.product_name + variantSuffix,
                serial_no: item.serial_no,
                hsn_code: item.hsn_code,
                imei1: item.imei1,
                imei2: item.imei2
            };
        });
        
        const { buffer } = await generateInvoice(order, user, formattedItems, shippingAddress);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Stella_Mobiles_Invoice_${id}.pdf"`);
        res.send(buffer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to download invoice' });
    }
});

module.exports = router;
