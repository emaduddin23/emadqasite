const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');

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

// Ensure the contacts table exists
async function ensureTable(connection) {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
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

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  let connection;

  try {
    connection = await mysql.createConnection(getDbConfig());
    await ensureTable(connection);

    // POST — Save a new contact submission
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { name, email, message } = body;

      // Validate required fields
      if (!name || !email || !message) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Name, email, and message are all required.'
          })
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Please provide a valid email address.'
          })
        };
      }

      // Insert into database
      await connection.execute(
        'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
        [name.trim(), email.trim(), message.trim()]
      );

      // Send email notification
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER, // Send notification to yourself
          replyTo: email.trim(),
          subject: `New Contact Form Submission from ${name.trim()}`,
          text: `You have received a new message from your website contact form.\n\nName: ${name.trim()}\nEmail: ${email.trim()}\n\nMessage:\n${message.trim()}`
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Do not return error to user if email fails but DB succeeds
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Thank you! Your message has been received.'
        })
      };
    }

    // GET — Retrieve all contact submissions (admin use)
    if (event.httpMethod === 'GET') {
      const [rows] = await connection.execute(
        'SELECT * FROM contacts ORDER BY created_at DESC'
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          count: rows.length,
          submissions: rows
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Contact function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Something went wrong. Please try again later.'
      })
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
