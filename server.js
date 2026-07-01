require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./db'); // Import database connection pool

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Contact API Endpoint - Save Message
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are all required.'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    // Insert into database using the imported pool
    await db.execute(
      'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
      [name.trim(), email.trim(), message.trim()]
    );

    res.status(200).json({
      success: true,
      message: 'Thank you! Your message has been received.'
    });

  } catch (error) {
    console.error('Contact API error:', error);
    res.status(500).json({
      success: false,
      error: `Database connection failed: ${error.message}`
    });
  }
});

// Admin Endpoint - View all submissions
app.get('/api/contact', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM contacts ORDER BY created_at DESC');
    res.status(200).json({
      success: true,
      count: rows.length,
      submissions: rows
    });
  } catch (error) {
    console.error('Failed to retrieve contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Visitor Counter API Endpoint
app.all('/api/views', async (req, res) => {
  try {
    if (req.method === 'POST') {
      await db.execute('UPDATE views SET count = count + 1 WHERE id = 1');
    }

    const [rows] = await db.execute('SELECT count FROM views WHERE id = 1');
    const count = rows[0]?.count || 0;

    res.status(200).json({ views: count });
  } catch (error) {
    console.error('Views API error:', error);
    res.status(500).json({ views: 0, error: true });
  }
});

// Fallback to serve index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
