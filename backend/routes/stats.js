const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const client = await db.pool.connect();
        try {
            const filter = req.query.filter || 'week';
            const { startDate, endDate } = req.query;
            let dateInterval = '7 DAY';
            let groupBy = 'DATE(created_at)';
            let whereClause = '';
            let params = [];

            if (startDate && endDate) {
                whereClause = 'created_at >= $1 AND created_at <= $2';
                params = [`${startDate} 00:00:00`, `${endDate} 23:59:59`];
                
                const start = new Date(startDate);
                const end = new Date(endDate);
                const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                if (diffDays > 365) {
                    groupBy = "DATE_FORMAT(created_at, '%Y-%m')";
                } else {
                    groupBy = 'DATE(created_at)';
                }
            } else {
                if (filter === 'month') {
                    dateInterval = '30 DAY';
                    groupBy = 'DATE(created_at)';
                } else if (filter === 'year') {
                    dateInterval = '1 YEAR';
                    groupBy = "DATE_FORMAT(created_at, '%Y-%m')";
                }
                whereClause = `created_at >= DATE_SUB(NOW(), INTERVAL ${dateInterval})`;
            }

            const revenueResult = await client.query(
                `SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled' AND ${whereClause}`,
                params
            );
            const totalRevenue = parseFloat(revenueResult.rows[0].total) || 0;

            const ordersResult = await client.query(
                `SELECT COUNT(*) as count FROM orders WHERE ${whereClause}`,
                params
            );
            const totalOrders = parseInt(ordersResult.rows[0].count, 10) || 0;

            const customersResult = await client.query(
                `SELECT COUNT(DISTINCT user_id) as count FROM orders WHERE ${whereClause}`,
                params
            );
            const newCustomers = parseInt(customersResult.rows[0].count, 10) || 0;

            const stockResult = await client.query('SELECT COUNT(*) as count FROM products WHERE stock_quantity <= 5');
            const lowStock = parseInt(stockResult.rows[0].count, 10) || 0;

            const dailyRevenueResult = await client.query(`
                SELECT ${groupBy} as date, COALESCE(SUM(total_amount), 0) as revenue
                FROM orders
                WHERE status != 'cancelled' AND ${whereClause}
                GROUP BY ${groupBy}
                ORDER BY date ASC
            `, params);

            // Format for frontend
            let statsLabel = 'Weekly Revenue';
            if (startDate && endDate) {
                statsLabel = 'Selected Period Revenue';
            } else if (filter === 'month') {
                statsLabel = 'Monthly Revenue';
            } else if (filter === 'year') {
                statsLabel = 'Yearly Revenue';
            }

            const stats = [
                { label: statsLabel, value: 'RS ' + totalRevenue.toLocaleString(), color: 'text-white' },
                { label: 'Orders', value: totalOrders.toString(), color: 'text-white' },
                { label: 'Customers', value: newCustomers.toString(), color: 'text-white' },
                { label: 'Low Stock', value: lowStock.toString(), color: 'text-stella-red' }
            ];

            const chartData = dailyRevenueResult.rows.map(row => {
                let dateStr = row.date;
                // If it's a Date object (for week/month), extract YYYY-MM-DD
                if (row.date instanceof Date) {
                    dateStr = row.date.toISOString().split('T')[0];
                }
                return {
                    date: dateStr,
                    revenue: parseFloat(row.revenue)
                };
            });

            res.json({
                stats,
                chartData
            });

        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Server error fetching stats' });
    }
});

module.exports = router;
