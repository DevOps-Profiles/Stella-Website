const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'prod-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// GET all products (supports optional ?category=CategoryName query filter)
router.get('/', async (req, res) => {
    const { category } = req.query;
    try {
        let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id';
        let params = [];
        if (category) {
            query += ' WHERE c.name = $1';
            params.push(category);
        }
        query += ' ORDER BY p.created_at DESC';
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all categories (for admin dashboards and selectors)
router.get('/categories', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET deal of the day products
router.get('/deals', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products WHERE is_deal_of_day = 1');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// GET single product
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1', 
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// POST new product (with image upload support)
router.post('/', upload.array('images', 10), async (req, res) => {
    try {
        const { name, description, price, stock_quantity, category_id, is_deal_of_day, deal_label } = req.body;
        
        // Parse specs from string to JSON object
        let specs = {};
        if (req.body.specs) {
            try {
                specs = typeof req.body.specs === 'string' ? JSON.parse(req.body.specs) : req.body.specs;
            } catch (e) {
                console.error("Error parsing specs:", e);
            }
        }

        // Process uploaded files
        let image_url = req.body.image_url || '';
        let additional_images = req.body.additional_images || [];
        
        if (req.files && req.files.length > 0) {
            // Map file paths to URLs (e.g. /uploads/filename.jpg)
            const fileUrls = req.files.map(f => `/uploads/${f.filename}`);
            image_url = fileUrls[0]; // First image is main
            if (fileUrls.length > 1) {
                additional_images = fileUrls.slice(1);
            }
        } else if (typeof additional_images === 'string') {
            // Handle case where additional_images comes as stringified JSON from postman
            try {
                additional_images = JSON.parse(additional_images);
            } catch(e) {}
        }

        const result = await db.query(
            'INSERT INTO products (name, description, price, stock_quantity, image_url, additional_images, specs, category_id, is_deal_of_day, deal_label) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [
                name,
                description || '',
                price,
                stock_quantity || 0,
                image_url,
                JSON.stringify(additional_images || []),
                JSON.stringify(specs || {}),
                category_id || null,
                is_deal_of_day === 'true' || is_deal_of_day === true,
                deal_label || '',
            ],
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Product create error:", err);
        res.status(500).json({ error: err.message });
    }
});

// PUT update product
router.put('/:id', upload.array('images', 10), async (req, res) => {
    const { id } = req.params;
    try {
        const { name, description, price, stock_quantity, category_id, is_deal_of_day, deal_label } = req.body;
        
        // Parse specs from string to JSON object
        let specs = {};
        if (req.body.specs) {
            try {
                specs = typeof req.body.specs === 'string' ? JSON.parse(req.body.specs) : req.body.specs;
            } catch (e) {
                console.error("Error parsing specs:", e);
            }
        }

        // Process uploaded files
        let image_url = req.body.image_url || '';
        let additional_images = req.body.additional_images || [];
        
        if (req.files && req.files.length > 0) {
            // Map file paths to URLs (e.g. /uploads/filename.jpg)
            const fileUrls = req.files.map(f => `/uploads/${f.filename}`);
            image_url = fileUrls[0]; // First image is main
            if (fileUrls.length > 1) {
                additional_images = fileUrls.slice(1);
            }
        } else if (typeof additional_images === 'string') {
            // Handle case where additional_images comes as stringified JSON from postman/frontend
            try {
                additional_images = JSON.parse(additional_images);
            } catch(e) {}
        }

        const result = await db.query(
            'UPDATE products SET name = $1, description = $2, price = $3, stock_quantity = $4, image_url = $5, additional_images = $6, specs = $7, category_id = $8, is_deal_of_day = $9, deal_label = $10 WHERE id = $11 RETURNING *',
            [
                name,
                description,
                price,
                stock_quantity,
                image_url,
                JSON.stringify(additional_images || []),
                JSON.stringify(specs || {}),
                category_id,
                is_deal_of_day,
                deal_label,
                id,
            ],
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE product
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
