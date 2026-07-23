const express = require('express');
const router = express.Router();
const db = require('../db');

// Ensure sort_order column exists
async function ensureSortOrderColumn() {
  try {
    const cols = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'categories' AND COLUMN_NAME = 'sort_order'
    `);
    if (cols.rows.length === 0) {
      await db.query('ALTER TABLE categories ADD COLUMN sort_order INT DEFAULT 0');
      console.log('Added sort_order column to categories table');
    }
  } catch (err) {
    console.error('Error ensuring sort_order column:', err);
  }
}
ensureSortOrderColumn();

// GET all categories
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM categories ORDER BY CASE WHEN sort_order IS NULL OR sort_order = 0 THEN 99999 ELSE sort_order END ASC, name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST new category
router.post('/', async (req, res) => {
    const { name, description, filters, sort_order } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
        const filtersJson = filters ? JSON.stringify(filters) : null;
        const result = await db.query(
            'INSERT INTO categories (name, description, filters, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description || '', filtersJson, sort_order || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT update category
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, filters, sort_order } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
        const filtersJson = filters ? JSON.stringify(filters) : null;
        const result = await db.query(
            'UPDATE categories SET name = $1, description = $2, filters = $3, sort_order = $4 WHERE id = $5 RETURNING *',
            [name, description, filtersJson, sort_order || 0, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE category
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Check if there are any products under this category
        const prodResult = await db.query('SELECT COUNT(*) FROM products WHERE category_id = $1', [id]);
        const productCount = parseInt(prodResult.rows[0].count, 10);
        if (productCount > 0) {
            return res.status(400).json({ error: `Cannot delete category. It currently has ${productCount} product(s) assigned to it.` });
        }

        const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
