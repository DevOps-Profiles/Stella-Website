require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('./index');

async function migrateFilters() {
  try {
    console.log('Adding filters column to categories table...');
    // Ignore error if column already exists
    await db.query('ALTER TABLE categories ADD COLUMN filters JSON;').catch(e => {
        if (!e.message.includes('Duplicate column name')) {
            throw e;
        }
    });

    console.log('Fetching existing filters from site_config...');
    const result = await db.query('SELECT config_value FROM site_config WHERE config_key = ?', ['category_filters']);
    
    if (result.rows && result.rows.length > 0) {
        let filtersConfig = result.rows[0].config_value;
        if (typeof filtersConfig === 'string') {
          filtersConfig = JSON.parse(filtersConfig);
        }

        const keys = Object.keys(filtersConfig);
        
        for (const catName of keys) {
            if (catName === '_category_images') continue;
            
            const filters = filtersConfig[catName];
            if (Array.isArray(filters) && filters.length > 0) {
                console.log(`Migrating filters for category: ${catName}`);
                await db.query('UPDATE categories SET filters = ? WHERE name = ?', [JSON.stringify(filters), catName]);
            }
        }
    }
    
    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await db.end();
    process.exit(0);
  }
}

migrateFilters();
