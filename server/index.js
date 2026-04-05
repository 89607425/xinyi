import crypto from 'node:crypto';
import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2/promise';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = Number(process.env.API_PORT || 3001);

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'xinyi';

let pool;

async function initDb() {
  const bootstrap = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });

  await bootstrap.query(`
    CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);
  await bootstrap.end();

  pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(64) NOT NULL UNIQUE,
      display_name VARCHAR(64) NOT NULL,
      salt VARCHAR(64) NOT NULL,
      password_hash VARCHAR(128) NOT NULL,
      created_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      created_at DATETIME NOT NULL,
      INDEX idx_sessions_user_id (user_id),
      CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS divination_records (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      payload JSON NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      INDEX idx_divination_user_id_created_at (user_id, created_at),
      CONSTRAINT fk_divination_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
  };
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    res.status(401).send('Unauthorized');
    return;
  }

  const [rows] = await pool.query(
    `
      SELECT u.id, u.username, u.display_name
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ?
      LIMIT 1
    `,
    [token],
  );

  const user = rows[0];
  if (!user) {
    res.status(401).send('Unauthorized');
    return;
  }

  req.user = user;
  req.token = token;
  next();
}

app.get('/api/health', (_, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/register', async (req, res) => {
  const { username, password, displayName } = req.body || {};
  if (!username || !password) {
    res.status(400).send('用户名和密码必填');
    return;
  }

  const [existsRows] = await pool.query('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
  if (existsRows.length) {
    res.status(409).send('用户名已存在');
    return;
  }

  const user = {
    id: crypto.randomUUID(),
    username,
    display_name: displayName || username,
    salt: crypto.randomBytes(16).toString('hex'),
    password_hash: '',
    created_at: new Date(),
  };

  user.password_hash = hashPassword(password, user.salt);

  await pool.query(
    `
      INSERT INTO users (id, username, display_name, salt, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [user.id, user.username, user.display_name, user.salt, user.password_hash, user.created_at],
  );

  const token = createToken();
  await pool.query('INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)', [token, user.id, new Date()]);

  res.json({ token, user: sanitizeUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    res.status(400).send('用户名和密码必填');
    return;
  }

  const [rows] = await pool.query(
    `
      SELECT id, username, display_name, salt, password_hash
      FROM users
      WHERE username = ?
      LIMIT 1
    `,
    [username],
  );

  const user = rows[0];
  if (!user) {
    res.status(401).send('账号或密码错误');
    return;
  }

  if (hashPassword(password, user.salt) !== user.password_hash) {
    res.status(401).send('账号或密码错误');
    return;
  }

  const token = createToken();
  await pool.query('INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)', [token, user.id, new Date()]);
  res.json({ token, user: sanitizeUser(user) });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

app.get('/api/divinations', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `
      SELECT payload
      FROM divination_records
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
    [req.user.id],
  );

  const records = rows.map((item) => item.payload);
  res.json({ records });
});

app.post('/api/divinations', requireAuth, async (req, res) => {
  const { record } = req.body || {};
  if (!record?.id) {
    res.status(400).send('记录格式错误');
    return;
  }

  const now = new Date();
  const nextRecord = {
    ...record,
    userId: req.user.id,
  };

  await pool.query(
    `
      INSERT INTO divination_records (id, user_id, payload, created_at, updated_at)
      VALUES (?, ?, CAST(? AS JSON), ?, ?)
      ON DUPLICATE KEY UPDATE
        payload = VALUES(payload),
        updated_at = VALUES(updated_at)
    `,
    [record.id, req.user.id, JSON.stringify(nextRecord), now, now],
  );

  res.json({ record: nextRecord });
});

app.post('/api/ai/interpret', async (req, res) => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    res.status(500).send('DEEPSEEK_API_KEY 未配置');
    return;
  }

  const { question, category, hexagram, movingLines } = req.body || {};

  const prompt = `你是一位博学温婉的易经民俗顾问。请根据用户起的卦象：${hexagram}，动爻：${Array.isArray(movingLines) && movingLines.length ? movingLines.join('、') : '无'}，所求事项：${category} ${question || ''}。\n\n请严格按照以下三段输出：\n【当下现状】\n【姐姐建议】\n【避坑指南】\n\n要求：\n1. 语气柔和、理性，侧重心理疏导与国学智慧。\n2. 严禁恐吓、迷信绝对化预言、确定性吉凶断语。\n3. 总字数 250-400 字。`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是温婉理性的易经民俗顾问，强调心理支持与文化解读。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      res.status(response.status).send(text || 'DeepSeek API error');
      return;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '当前网络繁忙，请稍后再试。';
    res.json({ text });
  } catch (error) {
    console.error('DeepSeek error', error);
    res.status(500).send('AI 服务调用失败');
  }
});

async function start() {
  try {
    if (!DB_PASSWORD) {
      throw new Error('DB_PASSWORD 未配置');
    }
    await initDb();
    app.listen(PORT, () => {
      console.log(`XinYi API server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to init mysql:', error);
    process.exit(1);
  }
}

void start();
