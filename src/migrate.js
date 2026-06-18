const pool = require('./db');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS chatapp (
        id          SERIAL PRIMARY KEY,
        room        VARCHAR(100)  NOT NULL DEFAULT 'general',
        sender      VARCHAR(100)  NOT NULL,
        message     TEXT          NOT NULL,
        message_type VARCHAR(20)  NOT NULL DEFAULT 'text',
        is_edited   BOOLEAN       NOT NULL DEFAULT FALSE,
        is_deleted  BOOLEAN       NOT NULL DEFAULT FALSE,
        created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Migration complete: table "chatapp" is ready.');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
