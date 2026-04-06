import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = Number(process.env.PORT || process.env.API_PORT || 3001);

const DB_URL = process.env.MYSQL_URL || process.env.DATABASE_URL || '';
let DB_HOST = '';
let DB_PORT = 3306;
let DB_USER = '';
let DB_PASSWORD = '';
let DB_NAME = '';

if (DB_URL) {
  const url = new URL(DB_URL);
  DB_HOST = url.hostname;
  DB_PORT = Number(url.port || 3306);
  DB_USER = decodeURIComponent(url.username);
  DB_PASSWORD = decodeURIComponent(url.password);
  DB_NAME = decodeURIComponent(url.pathname.replace(/^\//, ''));
} else {
  DB_HOST = process.env.DB_HOST || process.env.MYSQLHOST || '';
  DB_PORT = Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306);
  DB_USER = process.env.DB_USER || process.env.MYSQLUSER || '';
  DB_PASSWORD = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '';
  DB_NAME = process.env.DB_NAME || process.env.MYSQLDATABASE || '';
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const MOCK_PAYMENT = String(process.env.MOCK_PAYMENT || 'true').toLowerCase() !== 'false';
const MOCK_SMS = String(process.env.MOCK_SMS || 'true').toLowerCase() !== 'false';
const MOCK_WECHAT_AUTH = String(process.env.MOCK_WECHAT_AUTH || 'true').toLowerCase() !== 'false';

let pool;
const DEFAULT_SENSITIVE_WORDS = ['政治', '寿命', '彩票', '开奖号码', '违法'];
const PHONE_REGEX = /^1\d{10}$/;

function randomDigits(length) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

function randomId(prefix) {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function maskPhone(phone) {
  if (!PHONE_REGEX.test(phone)) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
}

async function initDb() {
  const bootstrap = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });

  try {
    await bootstrap.query(`
      CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
  } catch (error) {
    console.warn('Skip CREATE DATABASE (insufficient permission or managed instance):', error?.message || error);
  } finally {
    await bootstrap.end();
  }

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
      phone VARCHAR(20) DEFAULT NULL,
      display_name VARCHAR(64) NOT NULL,
      balance_cents INT NOT NULL DEFAULT 0,
      salt VARCHAR(64) NOT NULL,
      password_hash VARCHAR(128) NOT NULL,
      created_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  try {
    const [phoneColumnRows] = await pool.query("SHOW COLUMNS FROM users LIKE 'phone'");
    if (!phoneColumnRows.length) {
      await pool.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL');
    }

    const [balanceColumnRows] = await pool.query("SHOW COLUMNS FROM users LIKE 'balance_cents'");
    if (!balanceColumnRows.length) {
      await pool.query('ALTER TABLE users ADD COLUMN balance_cents INT NOT NULL DEFAULT 0');
    }

    const [phoneIndexRows] = await pool.query("SHOW INDEX FROM users WHERE Key_name = 'uniq_users_phone'");
    if (!phoneIndexRows.length) {
      await pool.query('ALTER TABLE users ADD UNIQUE KEY uniq_users_phone (phone)');
    }
  } catch (error) {
    console.warn('Skip users migration:', error?.message || error);
  }

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      channel VARCHAR(16) NOT NULL,
      amount_cents INT NOT NULL,
      status VARCHAR(16) NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      INDEX idx_wallet_user_id_created_at (user_id, created_at),
      CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sms_codes (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      phone VARCHAR(20) NOT NULL,
      purpose VARCHAR(32) NOT NULL,
      code VARCHAR(8) NOT NULL,
      ip VARCHAR(64) DEFAULT NULL,
      used_at DATETIME DEFAULT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL,
      INDEX idx_sms_phone_created_at (phone, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS wechat_qr_sessions (
      id VARCHAR(64) PRIMARY KEY,
      mode VARCHAR(16) NOT NULL,
      status VARCHAR(16) NOT NULL,
      created_at DATETIME NOT NULL,
      expires_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sensitive_words (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      word VARCHAR(64) NOT NULL UNIQUE,
      updated_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM sensitive_words');
  if (!rows[0].count) {
    for (const word of DEFAULT_SENSITIVE_WORDS) {
      await pool.query('INSERT INTO sensitive_words (word, updated_at) VALUES (?, ?)', [word, new Date()]);
    }
  }
}

app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  const allowOrigin = process.env.APP_URL || req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
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
    phoneMasked: user.phone ? maskPhone(String(user.phone)) : null,
    balanceCents: Number(user.balance_cents || 0),
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
      SELECT u.id, u.username, u.phone, u.display_name, u.balance_cents
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

app.get('/api/config/sensitive-words', async (_, res) => {
  const [rows] = await pool.query('SELECT word FROM sensitive_words ORDER BY id ASC');
  res.json({ words: rows.map((item) => item.word) });
});

app.post('/api/validate/question', async (req, res) => {
  const question = String(req.body?.question || '');
  if (!question.trim()) {
    res.json({ blocked: false, hitWord: null });
    return;
  }

  const [rows] = await pool.query(
    `
      SELECT word
      FROM sensitive_words
      WHERE ? LIKE CONCAT('%', word, '%')
      ORDER BY CHAR_LENGTH(word) DESC
      LIMIT 1
    `,
    [question],
  );

  const hitWord = rows[0]?.word || null;
  res.json({ blocked: Boolean(hitWord), hitWord });
});

app.post('/api/auth/sms/send', async (req, res) => {
  const phone = String(req.body?.phone || '').trim();
  const purpose = String(req.body?.purpose || 'register');
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '');
  if (!PHONE_REGEX.test(phone)) {
    res.status(400).send('手机号格式不正确');
    return;
  }
  if (purpose !== 'register') {
    res.status(400).send('短信用途不支持');
    return;
  }

  const [existsRows] = await pool.query('SELECT id FROM users WHERE phone = ? LIMIT 1', [phone]);
  if (existsRows.length) {
    res.status(409).send('该手机号已注册');
    return;
  }

  const [latestRows] = await pool.query(
    `
      SELECT created_at
      FROM sms_codes
      WHERE phone = ? AND purpose = ?
      ORDER BY id DESC
      LIMIT 1
    `,
    [phone, purpose],
  );
  const latest = latestRows[0];
  if (latest) {
    const latestAt = new Date(latest.created_at).getTime();
    if (Date.now() - latestAt < 60 * 1000) {
      res.status(429).send('验证码发送过于频繁，请 60 秒后再试');
      return;
    }
  }

  const [dailyRows] = await pool.query(
    `
      SELECT COUNT(*) AS count
      FROM sms_codes
      WHERE phone = ? AND purpose = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
    `,
    [phone, purpose],
  );
  if (Number(dailyRows[0]?.count || 0) >= 10) {
    res.status(429).send('该手机号今日验证码次数已达上限');
    return;
  }

  const code = randomDigits(6);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
  await pool.query(
    `
      INSERT INTO sms_codes (phone, purpose, code, ip, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [phone, purpose, code, ip, expiresAt, now],
  );

  if (MOCK_SMS) {
    console.log(`[MOCK_SMS] phone=${phone} code=${code}`);
  } else {
    // TODO: integrate real SMS provider (Aliyun/Tencent etc.)
  }

  res.json({
    sent: true,
    expiresInSec: 300,
    phoneMasked: maskPhone(phone),
    ...(MOCK_SMS ? { debugCode: code } : {}),
  });
});

// WeChat QR login/register is temporarily disabled.
app.post('/api/auth/wechat/qr/start', async (_, res) => {
  res.status(503).send('微信扫码登录/注册功能暂未开放');
});

// WeChat QR login/register is temporarily disabled.
app.post('/api/auth/wechat/qr/mock-confirm', async (_, res) => {
  res.status(503).send('微信扫码登录/注册功能暂未开放');
});

app.post('/api/auth/register', async (req, res) => {
  const { username, password, displayName, phone, smsCode } = req.body || {};
  if (!username || !password || !phone || !smsCode) {
    res.status(400).send('用户名、密码、手机号、验证码均必填');
    return;
  }
  if (!PHONE_REGEX.test(String(phone))) {
    res.status(400).send('手机号格式不正确');
    return;
  }

  const [existsRows] = await pool.query('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
  if (existsRows.length) {
    res.status(409).send('用户名已存在');
    return;
  }
  const [phoneExistsRows] = await pool.query('SELECT id FROM users WHERE phone = ? LIMIT 1', [phone]);
  if (phoneExistsRows.length) {
    res.status(409).send('该手机号已注册');
    return;
  }

  const [smsRows] = await pool.query(
    `
      SELECT id, code, expires_at, used_at
      FROM sms_codes
      WHERE phone = ? AND purpose = 'register'
      ORDER BY id DESC
      LIMIT 1
    `,
    [phone],
  );
  const sms = smsRows[0];
  if (!sms) {
    res.status(400).send('请先获取验证码');
    return;
  }
  if (sms.used_at) {
    res.status(400).send('验证码已被使用');
    return;
  }
  if (new Date(sms.expires_at).getTime() < Date.now()) {
    res.status(400).send('验证码已过期，请重新获取');
    return;
  }
  if (String(sms.code) !== String(smsCode).trim()) {
    res.status(400).send('验证码错误');
    return;
  }

  const user = {
    id: crypto.randomUUID(),
    username,
    phone,
    display_name: displayName || username,
    balance_cents: 0,
    salt: crypto.randomBytes(16).toString('hex'),
    password_hash: '',
    created_at: new Date(),
  };

  user.password_hash = hashPassword(password, user.salt);

  await pool.query(
    `
      INSERT INTO users (id, username, phone, display_name, balance_cents, salt, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [user.id, user.username, user.phone, user.display_name, user.balance_cents, user.salt, user.password_hash, user.created_at],
  );
  await pool.query('UPDATE sms_codes SET used_at = ? WHERE id = ?', [new Date(), sms.id]);

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
      SELECT id, username, phone, display_name, balance_cents, salt, password_hash
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

app.post('/api/wallet/topup', requireAuth, async (req, res) => {
  const amountYuan = Number(req.body?.amountYuan);
  const channel = String(req.body?.channel || '');

  if (!Number.isFinite(amountYuan) || amountYuan <= 0) {
    res.status(400).send('充值金额不合法');
    return;
  }
  if (!['wechat', 'alipay'].includes(channel)) {
    res.status(400).send('支付渠道不合法');
    return;
  }

  const amountCents = Math.round(amountYuan * 100);
  if (amountCents <= 0) {
    res.status(400).send('充值金额不合法');
    return;
  }

  if (!MOCK_PAYMENT) {
    if (channel === 'wechat') {
      const missingWechat =
        !process.env.WECHAT_PAY_MCH_ID || !process.env.WECHAT_PAY_APP_ID || !process.env.WECHAT_PAY_API_V3_KEY;
      if (missingWechat) {
        res.status(501).send('微信支付配置不完整（需 WECHAT_PAY_MCH_ID/WECHAT_PAY_APP_ID/WECHAT_PAY_API_V3_KEY）');
        return;
      }
    }
    if (channel === 'alipay') {
      const missingAlipay =
        !process.env.ALIPAY_APP_ID || !process.env.ALIPAY_PRIVATE_KEY || !process.env.ALIPAY_PUBLIC_KEY;
      if (missingAlipay) {
        res.status(501).send('支付宝配置不完整（需 ALIPAY_APP_ID/ALIPAY_PRIVATE_KEY/ALIPAY_PUBLIC_KEY）');
        return;
      }
    }
  }

  const now = new Date();
  const transactionId = `txn_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `
        INSERT INTO wallet_transactions (id, user_id, channel, amount_cents, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [transactionId, req.user.id, channel, amountCents, MOCK_PAYMENT ? 'paid' : 'pending', now, now],
    );

    if (MOCK_PAYMENT) {
      await connection.query('UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?', [amountCents, req.user.id]);
    }

    const [userRows] = await connection.query(
      `
        SELECT id, username, phone, display_name, balance_cents
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [req.user.id],
    );

    await connection.commit();

    res.json({
      transactionId,
      paid: MOCK_PAYMENT,
      user: sanitizeUser(userRows[0]),
    });
  } catch (error) {
    await connection.rollback();
    console.error('Topup failed:', error);
    res.status(500).send('充值失败，请稍后重试');
  } finally {
    connection.release();
  }
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
  const apiKey = process.env.SILICONFLOW_API_KEY;
  const apiBase = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';
  const model = process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V3';
  if (!apiKey) {
    res.status(500).send('SILICONFLOW_API_KEY 未配置');
    return;
  }

  const {
    question,
    category,
    primaryHexagram,
    changedHexagram,
    movingLines,
    judgment,
    summary,
    fortune,
    changedJudgment,
    changedSummary,
    changedFortune,
  } = req.body || {};

  const fallbackText = `【当下现状】
你当前更需要的不是“立刻得到标准答案”，而是先把问题拆成可执行的小步骤。此卦显示你已具备推进条件，但节奏上仍需稳住，不宜被外界噪音牵引。

【姐姐建议】
围绕“${category || '当前事项'}”先做一件最小可验证动作，并在 3-7 天内复盘结果。若“${question || '当前问题'}”涉及多人协作，先统一预期再行动，能显著降低内耗。

【避坑指南】
避免情绪化加码、避免一次性押注、避免把短期波动当成长期结论。先守住边界与节奏，再逐步放大投入。`;

  const prompt = `你是一位博学温婉的易经民俗顾问。
用户信息如下：
- 所求事项：${category || '未填写'}
- 具体问题：${question || '未填写'}
- 本卦：${primaryHexagram || '未知'}
- 变卦：${changedHexagram || '未知'}
- 动爻：${Array.isArray(movingLines) && movingLines.length ? movingLines.join('、') : '无'}
- 离线卦辞：${judgment || '无'}
- 离线一句话大意：${summary || '无'}
- 离线吉凶等级：${fortune || '无'}
- 变卦卦辞：${changedJudgment || '无'}
- 变卦一句话大意：${changedSummary || '无'}
- 变卦吉凶等级：${changedFortune || '无'}

请你必须结合“用户具体问题 + 本卦/变卦/动爻”做针对性解读，避免空泛套话。
如果有动爻，请把“本卦”视为现状，把“变卦”视为发展后的主趋势。
请严格按照以下三段输出：
【当下现状】
【姐姐建议】
【避坑指南】

要求：
1. 语气柔和、理性，侧重心理疏导与国学智慧。
2. 严禁恐吓、迷信绝对化预言、确定性吉凶断语。
3. 总字数 250-400 字。`;

  try {
    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
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
      let errorMessage = text;
      let errorCode = '';
      try {
        const parsed = JSON.parse(text);
        errorMessage = parsed?.error?.message || text;
        errorCode = parsed?.error?.code || '';
      } catch {
        // Keep raw text.
      }

      const normalized = `${errorMessage} ${errorCode}`.toLowerCase();
      if (
        normalized.includes('insufficient balance') ||
        normalized.includes('insufficient_balance') ||
        normalized.includes('invalid_request_error')
      ) {
        res.json({ text: `${fallbackText}\n\n（提示：当前 AI 服务余额不足，已自动切换离线解读。）` });
        return;
      }
      res.status(response.status).send(errorMessage || text || 'SiliconFlow API error');
      return;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '当前网络繁忙，请稍后再试。';
    res.json({ text });
  } catch (error) {
    console.error('SiliconFlow error', error);
    res.status(500).send('AI 服务调用失败');
  }
});

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get(/^\/(?!api).*/, (_, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

async function start() {
  try {
    if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
      throw new Error(
        'MySQL 配置不完整。请在 Railway 设置 MYSQL_URL（或 DATABASE_URL），或提供 MYSQLHOST/MYSQLPORT/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE。',
      );
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
