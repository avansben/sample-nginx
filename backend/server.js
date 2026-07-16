// Express API for the guestbook lab. Listens on port 3000 inside the backend container.
// nginx forwards browser requests from /api/* to these routes (prefix stripped).
const express = require('express');
const { pool, waitForDb, initSchema } = require('./db');

const app = express();
const port = 3000;

app.use(express.json());

// Convert a database row (snake_case columns) to the JSON shape the frontend expects.
function mapMessage(row) {
  return {
    id: row.id,
    author: row.author,
    text: row.text,
    createdAt: row.created_at.toISOString()
  };
}

// Simple demo endpoint — proves the proxy path from nginx → backend works.
app.get('/hello', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM messages');
    res.json({
      message: 'Hello from the backend container',
      service: 'backend',
      storage: 'postgresql',
      messageCount: rows[0].count,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('GET /hello failed:', err);
    res.status(500).json({ error: 'Failed to read message count' });
  }
});

// Used by the frontend status banner to show whether PostgreSQL is reachable.
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('GET /health failed:', err);
    res.status(503).json({ status: 'degraded', database: 'disconnected' });
  }
});

// List guestbook entries, optionally filtered by ?search= (matches author or text).
app.get('/messages', async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

  try {
    let result;
    if (search) {
      const pattern = `%${search}%`;
      result = await pool.query(
        `SELECT id, author, text, created_at
         FROM messages
         WHERE author ILIKE $1 OR text ILIKE $1
         ORDER BY created_at DESC`,
        [pattern]
      );
    } else {
      result = await pool.query(
        `SELECT id, author, text, created_at
         FROM messages
         ORDER BY created_at DESC`
      );
    }

    res.json({ messages: result.rows.map(mapMessage) });
  } catch (err) {
    console.error('GET /messages failed:', err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// Create a new guestbook entry from JSON body { author, text }.
app.post('/messages', async (req, res) => {
  const author = typeof req.body.author === 'string' ? req.body.author.trim() : '';
  const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';

  if (!author || !text) {
    return res.status(400).json({ error: 'author and text are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO messages (author, text)
       VALUES ($1, $2)
       RETURNING id, author, text, created_at`,
      [author, text]
    );

    res.status(201).json(mapMessage(rows[0]));
  } catch (err) {
    console.error('POST /messages failed:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Remove a single message by numeric id.
app.delete('/messages/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid message id' });
  }

  try {
    const { rowCount } = await pool.query('DELETE FROM messages WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ deleted: id });
  } catch (err) {
    console.error('DELETE /messages failed:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Aggregate stats for the dashboard: totals, latest message, top authors.
app.get('/stats', async (req, res) => {
  try {
    const [summaryResult, authorsResult] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int AS total_messages,
          COUNT(DISTINCT author)::int AS unique_authors,
          MAX(created_at) AS latest_message_at
        FROM messages
      `),
      pool.query(`
        SELECT author, COUNT(*)::int AS count
        FROM messages
        GROUP BY author
        ORDER BY count DESC, author ASC
        LIMIT 5
      `)
    ]);

    const summary = summaryResult.rows[0];
    res.json({
      totalMessages: summary.total_messages,
      uniqueAuthors: summary.unique_authors,
      latestMessageAt: summary.latest_message_at
        ? summary.latest_message_at.toISOString()
        : null,
      topAuthors: authorsResult.rows.map((row) => ({
        author: row.author,
        count: row.count
      }))
    });
  } catch (err) {
    console.error('GET /stats failed:', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// Wait for PostgreSQL, ensure schema exists, then start accepting requests.
async function start() {
  await waitForDb();
  await initSchema();

  app.listen(port, () => {
    console.log(`Backend listening on port ${port} (PostgreSQL)`);
  });
}

start().catch((err) => {
  console.error('Failed to start backend:', err);
  process.exit(1);
});
