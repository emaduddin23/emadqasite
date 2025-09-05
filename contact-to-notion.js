const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Place your Notion integration token here
const NOTION_TOKEN = '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'; // <-- Your token goes here
const DATABASE_ID = '265d93cba0a8805d8599d4189a15c14d'; // <-- Replace with your Notion database ID

app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await axios.post(
      'https://api.notion.com/v1/pages',
      {
        parent: { database_id: DATABASE_ID },
        properties: {
          Name: { title: [{ text: { content: name } }] },
          Email: { email: email },
          Message: { rich_text: [{ text: { content: message } }] }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        }
      }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
