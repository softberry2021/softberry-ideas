const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB_PATH = path.join(__dirname, 'db.json');
function readDB() {
  if (!fs.existsSync(DB_PATH)) return { sessions: [] };
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch { return { sessions: [] }; }
}
function writeDB(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

// Anthropic proxy — key stays server-side
app.post('/api/generate', async (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'API key not configured on server.' });
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(req.body)
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Sessions CRUD
app.get('/api/sessions', (req, res) => {
  const db = readDB();
  res.json(db.sessions.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.post('/api/sessions', (req, res) => {
  const { title, service, angle, platform, tone, event, notes, ideas } = req.body;
  if (!ideas?.length) return res.status(400).json({ error: 'No ideas' });
  const db = readDB();
  const session = { id: uuidv4(), title, service, angle, platform, tone, event, notes, ideas, createdAt: new Date().toISOString() };
  db.sessions.unshift(session);
  if (db.sessions.length > 300) db.sessions = db.sessions.slice(0, 300);
  writeDB(db);
  res.json({ id: session.id });
});

app.get('/api/sessions/:id', (req, res) => {
  const db = readDB();
  const s = db.sessions.find(x => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json(s);
});

app.delete('/api/sessions/:id', (req, res) => {
  const db = readDB();
  db.sessions = db.sessions.filter(x => x.id !== req.params.id);
  writeDB(db);
  res.json({ ok: true });
});

app.delete('/api/sessions', (req, res) => {
  writeDB({ sessions: [] });
  res.json({ ok: true });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Soft Berry running on http://localhost:${PORT}`));
