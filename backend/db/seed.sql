-- Clean existing data to avoid conflicts
TRUNCATE TABLE reviews, order_items, orders, products, addresses, categories, branches, users RESTART IDENTITY CASCADE;

-- Seed Categories
INSERT INTO categories (name, description) VALUES 
('Smartphones', 'The latest mobile devices from top brands'),
('Accessories', 'Cases, chargers, and more'),
('Tablets', 'Powerful portable computing'),
('Audio', 'Premium sound experience');

-- Seed Products with Rich Details
INSERT INTO products (name, category_id, description, price, stock_quantity, image_url, additional_images, specs, is_deal_of_day, deal_label) VALUES 
('iPhone 15 Pro', (SELECT id FROM categories WHERE name = 'Smartphones'), 
'iPhone 15 Pro is the first iPhone to feature an aerospace-grade titanium design, using the same alloy that spacecraft use for missions to Mars. Titanium has one of the best strength-to-weight ratios of any metal, making these our lightest Pro models ever. You’ll notice the difference the moment you pick one up.', 
134900.00, 50, 
'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80', 
ARRAY['https://images.unsplash.com/photo-1696446702183-cbd13d789078?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&w=800&q=80'], 
'{"Display": "6.1-inch Super Retina XDR", "Processor": "A17 Pro chip with 6-core GPU", "Camera": "48MP Main | 12MP Ultra Wide | 12MP Telephoto", "Battery": "Up to 23 hours video playback", "Safety": "Emergency SOS via satellite, Crash Detection"}', 
true, 'NEW TITANIUM DESIGN'),

('Samsung Galaxy S24 Ultra', (SELECT id FROM categories WHERE name = 'Smartphones'), 
'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility — starting with the most important device in your life. Your smartphone. Epic, just like that.', 
129999.00, 30, 
'https://images.unsplash.com/photo-1707064434685-6e06821ba293?auto=format&fit=crop&w=800&q=80', 
ARRAY['https://images.unsplash.com/photo-1707064434195-076f8319f39a?auto=format&fit=crop&w=800&q=80'], 
'{"Display": "6.8-inch QHD+ Dynamic AMOLED 2X", "Processor": "Snapdragon 8 Gen 3 for Galaxy", "Camera": "200MP Main | 50MP Periscope | 10MP Telephoto", "S-Pen": "Built-in S Pen", "AI": "Circle to Search, Live Translate, Note Assist"}', 
true, 'LIMITED STOCK - GALAXY AI'),

('Stella Buds Pro', (SELECT id FROM categories WHERE name = 'Audio'), 
'Immerse yourself in pure sound. The Stella Buds Pro features custom-built drivers and advanced active noise cancellation that adapts to your environment. Whether you are in a noisy cafe or a quiet library, your music stays crisp and clear.', 
12999.00, 100, 
'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', 
ARRAY['https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=800&q=80'], 
'{"Audio": "Custom 11mm Dynamic Driver", "ANC": "Active Noise Cancellation up to 45dB", "Battery": "7 hours (ANC on) / 30 hours with case", "Connectivity": "Bluetooth 5.3, Dual Device Pairing", "Rating": "IPX4 Water Resistant"}', 
false, NULL),

('iPad Air M2', (SELECT id FROM categories WHERE name = 'Tablets'), 
'iPad Air is now available in an 11-inch model and an all-new 13-inch model. Both feature a stunning Liquid Retina display, the incredible performance of the M2 chip, and the advanced capabilities of iPadOS. It’s light, bright, and full of might.', 
59900.00, 20, 
'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80', 
ARRAY['https://images.unsplash.com/photo-1494173853739-c21f58b16055?auto=format&fit=crop&w=800&q=80'], 
'{"Display": "11-inch Liquid Retina display", "Processor": "Apple M2 chip with 8-core CPU", "Storage": "128GB, 256GB, 512GB, 1TB", "Camera": "12MP Landscape Ultra Wide front camera", "Support": "Apple Pencil Pro, Magic Keyboard"}', 
false, NULL),

('Google Pixel 8 Pro', (SELECT id FROM categories WHERE name = 'Smartphones'), 
'Pixel 8 Pro is the all-pro phone engineered by Google. It’s sleek, sophisticated, and has a stunning 6.7-inch Super Actua display. And it’s the first phone with a built-in temperature sensor.', 
106999.00, 25, 
'https://images.unsplash.com/photo-1697525381677-674b898d9255?auto=format&fit=crop&w=800&q=80', 
ARRAY['https://images.unsplash.com/photo-1697525381373-3e75a6c17e33?auto=format&fit=crop&w=800&q=80'], 
'{"Display": "6.7-inch Super Actua display (1-120Hz)", "Processor": "Google Tensor G3 with Titan M2", "Camera": "50MP Main | 48MP Ultrawide | 48MP Telephoto", "Features": "Magic Eraser, Best Take, Video Boost", "Safety": "7 years of OS and security updates"}', 
false, NULL);

-- Seed Branches
INSERT INTO branches (name, address, phone_number) VALUES 
('Stella Anna Nagar', '123, Shanthi Colony, Anna Nagar, Chennai - 600040', '+91 98765 43210'),
('Stella T-Nagar', '45, Pondy Bazaar, T-Nagar, Chennai - 600017', '+91 98765 43211');

-- Seed User (Admin)
INSERT INTO users (name, phone_number, role) VALUES 
('Stella Admin', '9999999999', 'admin');

-- Seed Site Config (Initial)
INSERT INTO site_config (config_key, config_value) VALUES 
('homepage', '{
    "hero": {
        "slides": [
            {
                "id": 1,
                "title": "Unleash the Future",
                "subtitle": "Experience the next generation of mobile performance and design.",
                "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1920&q=80"
            },
            {
                "id": 2,
                "title": "Titanium Strength",
                "subtitle": "Aerospace-grade titanium design. Incredibly strong. Incredibly light.",
                "image": "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=1920&q=80"
            },
            {
                "id": 3,
                "title": "Pure Audio Bliss",
                "subtitle": "Crystal clear sound with advanced active noise cancellation technology.",
                "image": "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=1920&q=80"
            }
        ],
        "buttonText": "Discover Elite"
    },
    "franchise": {
        "title": "Partner with Stella",
        "description": "Join the fastest growing mobile franchise in India with zero franchise fees and full marketing support.",
        "bannerImg": "https://images.unsplash.com/photo-1556740734-7f95831517f9?auto=format&fit=crop&w=1920&q=80",
        "stats": [
            {"label": "Outlets", "value": "50+"},
            {"label": "Growth", "value": "200%"}
        ]
    }
}')
ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value;

INSERT INTO site_config (config_key, config_value) VALUES 
('category_filters', '{
    "Smartphones": [
        { "name": "Brand", "key": "brand", "options": ["Apple", "Samsung", "Google", "OnePlus"] },
        { "name": "Storage", "key": "Storage", "options": ["128GB", "256GB", "512GB"] },
        { "name": "RAM", "key": "RAM", "options": ["8GB", "12GB", "16GB"] }
    ],
    "Audio": [
        { "name": "Brand", "key": "brand", "options": ["Stella", "Sony", "Bose", "Apple"] },
        { "name": "Type", "key": "Type", "options": ["ANC Earbuds", "Wireless Over-Ear", "Gaming Headset"] }
    ],
    "Accessories": [
        { "name": "Type", "key": "Type", "options": ["Chargers", "Protective Cases", "Cables", "Power Banks"] }
    ],
    "Tablets": [
        { "name": "Brand", "key": "brand", "options": ["Apple", "Samsung", "Lenovo"] },
        { "name": "Storage", "key": "Storage", "options": ["64GB", "128GB", "256GB"] }
    ]
}')
ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value;

