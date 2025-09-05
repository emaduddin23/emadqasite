const axios = require('axios');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const { name, email, message } = JSON.parse(event.body);

    // Notion API details
    const NOTION_TOKEN = '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'; // <-- Replace with your token
    const DATABASE_ID = '265d93cba0a8805d8599d4189a15c14d'; // <-- Replace with your database ID

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

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
