const { getStore } = require("@netlify/blobs");

exports.handler = async function (event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store",
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  try {
    const store = getStore("site-analytics");

    // Read current count
    let count = 0;
    const existing = await store.get("total-views");
    if (existing) {
      count = parseInt(existing, 10) || 0;
    }

    // POST = new visit, increment the counter
    // GET  = just return current count (no increment)
    if (event.httpMethod === "POST") {
      count++;
      await store.set("total-views", count.toString());
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ views: count }),
    };
  } catch (error) {
    console.error("Views counter error:", error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ views: 0, error: true }),
    };
  }
};
