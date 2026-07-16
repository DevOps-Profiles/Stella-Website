require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://stellahitech.com',
    'http://localhost:5174', // Allow local dev
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());

const path = require('path');

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const siteConfigRoutes = require('./routes/site_config');
const statsRoutes = require('./routes/stats');
const categoriesRoutes = require('./routes/categories');
const addressRoutes = require('./routes/addresses');
const branchRoutes = require('./routes/branches');
const uploadRoutes = require('./routes/upload');

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/site-config', siteConfigRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoints
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'StellaHiTech API',
    status: 'running'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Stella Mobiles API is running' });
});

// Mock Manufacturer Page for Scraper Testing
app.get('/api/mock-manufacturer-page', (req, res) => {
  res.send(`
    <html>
      <head><title>Apple iPhone 17 Pro Max Manufacturer Specs</title></head>
      <body>
        <div id="aplus">
          <h2>iPhone 17 Pro Max — Liquid Titanium. Beyond Pro.</h2>
          <p>iPhone 17 Pro Max introduces the revolutionary liquid titanium alloy, making it lighter and significantly stronger than ever before. With incredibly thin bezels and an all-new seamless design, it redefines what a smartphone can look and feel like.</p>
          <img src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80" alt="iPhone 17 Pro Max Liquid Titanium Design" style="width:100%; border-radius: 12px; margin: 16px 0;" />
          
          <h3>A19 Pro Chip — Unmatched Apple Intelligence.</h3>
          <p>The A19 Pro chip is built on a 2nm architecture, bringing groundbreaking speed and battery efficiency. Designed specifically to power the next generation of Apple Intelligence, it transforms how you game, work, and interact with the world.</p>
          
          <h3>A camera that sees beyond reality.</h3>
          <p>Equipped with a massive 48MP triple-lens array, the iPhone 17 Pro Max brings DSLR-level photography to your pocket. New spatial video capturing is richer, and the low-light performance is unmatched in the industry.</p>
          <img src="https://images.unsplash.com/photo-1695048065098-b80c55ff4ac2?auto=format&fit=crop&w=1200&q=80" alt="iPhone 17 Pro Max Camera System" style="width:100%; border-radius: 12px; margin: 16px 0;" />
          
          <h3>10x Optical Zoom — Getting closer than ever.</h3>
          <p>The new periscope telephoto lens delivers an astounding 10x optical zoom. Capture wildlife, sports, and distant details with pristine clarity without taking a single step forward.</p>
        </div>
      </body>
    </html>
  `);
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

console.log("Server unref?", server._handle && server._handle.hasRef());