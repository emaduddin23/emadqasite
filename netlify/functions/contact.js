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

        const htmlContent = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
              
              <!-- Header -->
              <div style="background-color: #111827; padding: 30px 40px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">New Inquiry Received</h1>
                <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 14px;">Emad QA Site Contact Form</p>
              </div>

              <!-- Body -->
              <div style="padding: 40px;">
                <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151; line-height: 1.6;">You have a new message from a visitor on your website. Here are the details of the inquiry:</p>
                
                <!-- Details Table -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; width: 130px; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase;">Sender Name</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 16px; font-weight: 500;">${name.trim()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; width: 130px; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase;">Email Address</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-size: 16px;">
                      <a href="mailto:${email.trim()}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${email.trim()}</a>
                    </td>
                  </tr>
                </table>

                <!-- Message Area -->
                <div style="margin-bottom: 8px; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase;">Message Content</div>
                <div style="background-color: #f3f4f6; border-radius: 6px; padding: 20px; color: #374151; font-size: 15px; line-height: 1.7; white-space: pre-wrap; border: 1px solid #e5e7eb;">${message.trim()}</div>
                
              </div>

              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 20px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="margin: 0; color: #6b7280; font-size: 13px;">This email was automatically generated from your portfolio website.</p>
                <p style="margin: 6px 0 0 0; color: #9ca3af; font-size: 12px;">Please reply directly to the sender's email address above.</p>
              </div>

            </div>
          </div>
        `;

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER, // Send notification to yourself
          replyTo: email.trim(),
          subject: `New Message from ${name.trim()} - Website Contact Form`,
          text: `You have received a new message from your website contact form.\n\nName: ${name.trim()}\nEmail: ${email.trim()}\n\nMessage:\n${message.trim()}`,
          html: htmlContent
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
