const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL connection config
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  connectTimeout: 10000
};

// Only use SSL if explicitly requested (fixes HANDSHAKE_NO_SSL_SUPPORT for local/basic MySQL)
if (process.env.MYSQL_SSL === 'true') {
  dbConfig.ssl = { rejectUnauthorized: false };
}

// Create a connection pool instead of single connections for better performance
const pool = mysql.createPool(dbConfig);

// Initialize tables
async function initDB() {
  try {
    const connection = await pool.getConnection();
    
    // Create contacts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create views table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS views (
        id INT PRIMARY KEY DEFAULT 1,
        count INT DEFAULT 0
      )
    `);
    
    // Insert initial row for views if it doesn't exist
    await connection.execute(`
      INSERT IGNORE INTO views (id, count) VALUES (1, 0)
    `);

    connection.release();
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// Run initialization
initDB();

module.exports = pool;
