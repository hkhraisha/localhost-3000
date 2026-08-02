// "Done" — home services booking app
// Pure Node.js backend (no external dependencies) so it runs with just `node server.js`.
// Persists data to data/db.json (users, bookings, sessions, feedback).

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const { SERVICES, CATEGORIES } = require('./data/services.js');

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// ---------- tiny JSON "database" ----------

function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { users: [], bookings: [], sessions: {}, feedback: [], nextUserId: 1, nextBookingId: 1 };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function saveDB(db) {
  // atomic-ish write: write to temp file then rename
  const tmp = DB_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_PATH);
}

let db = loadDB();

// ---------- password hashing (scrypt, built into node crypto) ----------

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const check = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
}

function makeToken() {
  return crypto.randomBytes(24).toString('hex');
}

// ---------- request helpers ----------

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > 1_000_000) { reject(new Error('body too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (chunks.length === 0) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (e) {
        reject(new Error('invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function getAuthUser(req) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  const userId = db.sessions[token];
  if (!userId) return null;
  const user = db.users.find(u => u.id === userId);
  return user ? { user, token } : null;
}

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, phone: u.phone || '', createdAt: u.createdAt };
}

// ---------- static file serving ----------

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function serveStatic(req, res, pathname) {
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(PUBLIC_DIR, filePath);
  // prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback for unknown non-api paths
      fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, data2) => {
        if (err2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        res.end(data2);
      });
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

// ---------- concierge (rule-based keyword matcher — no external AI API needed) ----------

const KEYWORDS = {
  cleaning: ['clean', 'dirty', 'dust', 'mess', 'tidy'],
  plumbing: ['leak', 'pipe', 'clog', 'plumb', 'toilet', 'faucet', 'drain'],
  electric: ['wiring', 'outlet', 'electric', 'power', 'circuit', 'breaker'],
  ac: ['ac ', 'a/c', 'air condition', 'cooling', 'cool', 'hot', 'hvac'],
  appliance: ['fridge', 'refrigerator', 'washer', 'washing machine', 'dryer', 'dishwasher', 'oven', 'microwave'],
  physician: ['sick', 'fever', 'doctor', 'ill', 'pain', 'medicine', 'prescription'],
  massage: ['massage', 'sore', 'stress', 'relax', 'spa'],
  driver: ['ride', 'drive', 'driver', 'pickup', 'car service'],
  petcare: ['dog', 'cat', 'pet', 'walk my'],
  beauty: ['hair', 'nails', 'makeup', 'salon'],
  childfamily: ['babysit', 'nanny', 'kids', 'children'],
  emergency: ['emergency', 'urgent', 'locked out', 'locksmith', 'flood', 'fire damage'],
  pestcontrol: ['bugs', 'ants', 'roach', 'rodent', 'mice', 'pest'],
  painting: ['paint', 'wall color'],
  carpentry: ['furniture', 'assemble', 'shelf', 'cabinet'],
};

function conciergeReply(message) {
  const text = message.toLowerCase();
  let matchedKeys = new Set();
  for (const [key, words] of Object.entries(KEYWORDS)) {
    if (words.some(w => text.includes(w))) matchedKeys.add(key);
  }
  const matches = SERVICES.filter(s => matchedKeys.has(s.key)).slice(0, 3);

  if (matches.length === 0) {
    return {
      reply: "I can help with that — here are a few popular services to start from, or try browsing all categories.",
      services: SERVICES.filter(s => ['cleaning', 'physician', 'electric'].includes(s.key)),
    };
  }
  const names = matches.map(m => m.title).join(', ');
  return {
    reply: `That sounds like it fits: ${names}. I've found vetted professionals for this — want to book the soonest one?`,
    services: matches,
  };
}

// ---------- route handling ----------

async function handleApi(req, res, pathname) {
  const method = req.method;

  // ----- auth -----
  if (pathname === '/api/auth/signup' && method === 'POST') {
    const body = await readBody(req);
    const { name, email, phone, password } = body;
    if (!name || !email || !password) return sendJSON(res, 400, { error: 'name, email, and password are required' });
    if (db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase())) {
      return sendJSON(res, 409, { error: 'An account with this email already exists' });
    }
    const user = {
      id: db.nextUserId++,
      name, email, phone: phone || '',
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    const token = makeToken();
    db.sessions[token] = user.id;
    saveDB(db);
    return sendJSON(res, 201, { token, user: publicUser(user) });
  }

  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = await readBody(req);
    const { email, password } = body;
    const user = db.users.find(u => u.email.toLowerCase() === String(email || '').toLowerCase());
    if (!user || !verifyPassword(password || '', user.passwordHash)) {
      return sendJSON(res, 401, { error: 'Invalid email or password' });
    }
    const token = makeToken();
    db.sessions[token] = user.id;
    saveDB(db);
    return sendJSON(res, 200, { token, user: publicUser(user) });
  }

  if (pathname === '/api/auth/logout' && method === 'POST') {
    const auth = getAuthUser(req);
    if (auth) { delete db.sessions[auth.token]; saveDB(db); }
    return sendJSON(res, 200, { ok: true });
  }

  // ----- profile -----
  if (pathname === '/api/me' && method === 'GET') {
    const auth = getAuthUser(req);
    if (!auth) return sendJSON(res, 401, { error: 'Not authenticated' });
    return sendJSON(res, 200, { user: publicUser(auth.user) });
  }

  if (pathname === '/api/me' && method === 'PUT') {
    const auth = getAuthUser(req);
    if (!auth) return sendJSON(res, 401, { error: 'Not authenticated' });
    const body = await readBody(req);
    if (body.name) auth.user.name = body.name;
    if (body.phone !== undefined) auth.user.phone = body.phone;
    saveDB(db);
    return sendJSON(res, 200, { user: publicUser(auth.user) });
  }

  // ----- services -----
  if (pathname === '/api/categories' && method === 'GET') {
    return sendJSON(res, 200, { categories: CATEGORIES });
  }

  if (pathname === '/api/services' && method === 'GET') {
    const { query } = url.parse(req.url, true);
    let list = SERVICES;
    if (query.category) list = list.filter(s => s.category === query.category);
    if (query.q) {
      const q = String(query.q).toLowerCase();
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q));
    }
    return sendJSON(res, 200, { services: list });
  }

  const serviceMatch = pathname.match(/^\/api\/services\/([a-zA-Z0-9_-]+)$/);
  if (serviceMatch && method === 'GET') {
    const service = SERVICES.find(s => s.key === serviceMatch[1]);
    if (!service) return sendJSON(res, 404, { error: 'Service not found' });
    return sendJSON(res, 200, { service });
  }

  // ----- bookings -----
  if (pathname === '/api/bookings' && method === 'POST') {
    const auth = getAuthUser(req);
    if (!auth) return sendJSON(res, 401, { error: 'Please sign in to book a service' });
    const body = await readBody(req);
    const { serviceKey, date, time, address, notes } = body;
    const service = SERVICES.find(s => s.key === serviceKey);
    if (!service) return sendJSON(res, 400, { error: 'Unknown service' });
    if (!date || !time || !address) return sendJSON(res, 400, { error: 'date, time, and address are required' });
    const booking = {
      id: db.nextBookingId++,
      userId: auth.user.id,
      serviceKey,
      serviceTitle: service.title,
      serviceIcon: service.icon,
      price: service.price,
      priceLabel: service.priceLabel,
      date, time, address, notes: notes || '',
      status: 'pending', // pending -> confirmed -> en_route -> done -> (cancelled)
      createdAt: new Date().toISOString(),
    };
    db.bookings.push(booking);
    saveDB(db);
    return sendJSON(res, 201, { booking });
  }

  if (pathname === '/api/bookings' && method === 'GET') {
    const auth = getAuthUser(req);
    if (!auth) return sendJSON(res, 401, { error: 'Not authenticated' });
    const mine = db.bookings.filter(b => b.userId === auth.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sendJSON(res, 200, { bookings: mine });
  }

  const cancelMatch = pathname.match(/^\/api\/bookings\/(\d+)\/cancel$/);
  if (cancelMatch && method === 'PATCH') {
    const auth = getAuthUser(req);
    if (!auth) return sendJSON(res, 401, { error: 'Not authenticated' });
    const booking = db.bookings.find(b => b.id === Number(cancelMatch[1]) && b.userId === auth.user.id);
    if (!booking) return sendJSON(res, 404, { error: 'Booking not found' });
    booking.status = 'cancelled';
    saveDB(db);
    return sendJSON(res, 200, { booking });
  }

  // ----- concierge -----
  if (pathname === '/api/concierge' && method === 'POST') {
    const body = await readBody(req);
    if (!body.message) return sendJSON(res, 400, { error: 'message is required' });
    return sendJSON(res, 200, conciergeReply(String(body.message)));
  }

  // ----- feedback -----
  if (pathname === '/api/feedback' && method === 'POST') {
    const auth = getAuthUser(req);
    const body = await readBody(req);
    const entry = {
      id: db.feedback.length + 1,
      userId: auth ? auth.user.id : null,
      rating: body.rating || null,
      message: body.message || '',
      createdAt: new Date().toISOString(),
    };
    db.feedback.push(entry);
    saveDB(db);
    return sendJSON(res, 201, { feedback: entry });
  }

  return sendJSON(res, 404, { error: 'Not found' });
}

const server = http.createServer(async (req, res) => {
  const { pathname } = url.parse(req.url);
  try {
    if (pathname.startsWith('/api/')) {
      await handleApi(req, res, pathname);
    } else {
      serveStatic(req, res, pathname);
    }
  } catch (err) {
    console.error(err);
    sendJSON(res, 500, { error: err.message || 'Server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Done app running at http://localhost:${PORT}`);
});
