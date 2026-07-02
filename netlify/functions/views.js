const mysql = require('mysql2/promise');

// MySQL connection config from Netlify environment variables
function getDbConfig() {
  return {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    connectTimeout: 10000
  };
}

// Ensure the page_views table exists and has a row
async function ensureTable(connection) {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS page_views (
      id INT PRIMARY KEY,
      count INT NOT NULL DEFAULT 0
    )
  `);
  
  // Insert initial row if not exists
  await connection.execute(`
    INSERT IGNORE INTO page_views (id, count) VALUES (1, 0)
  `);
}

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  let connection;

  try {
    connection = await mysql.createConnection(getDbConfig());
    await ensureTable(connection);

    // POST: Increment the view count
    if (event.httpMethod === 'POST') {
      await connection.execute(
        'UPDATE page_views SET count = count + 1 WHERE id = 1'
      );
    }

    // Both GET and POST will return the current (or updated) count
    const [rows] = await connection.execute(
      'SELECT count FROM page_views WHERE id = 1'
    );
    
    const count = rows[0] ? rows[0].count : 0;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ views: count })
    };

  } catch (error) {
    console.error('Views function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ views: 0, error: 'Database error' })
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
