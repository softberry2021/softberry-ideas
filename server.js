const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── DB: simple JSON file ──
const DB_PATH = path.join(__dirname, 'db.json');
function readDB() {
  if (!fs.existsSync(DB_PATH)) return { sessions: [] };
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch { return { sessions: [] }; }
}
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ── ROUTES ──

// GET all sessions (sidebar list)
app.get('/api/sessions', (req, res) => {
  const db = readDB();
  const list = db.sessions
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(s => ({
      id: s.id,
      title: s.title,
      service: s.service,
      angle: s.angle,
      platform: s.platform,
      ideaCount: s.ideas ? s.ideas.length : 0,
      createdAt: s.createdAt
    }));
  res.json(list);
});

// GET single session
app.get('/api/sessions/:id', (req, res) => {
  const db = readDB();
  const session = db.sessions.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Not found' });
  res.json(session);
});

// POST save session
app.post('/api/sessions', (req, res) => {
  const { title, service, angle, platform, tone, event, notes, ideas } = req.body;
  if (!ideas || !ideas.length) return res.status(400).json({ error: 'No ideas' });
  const db = readDB();
  const session = {
    id: uuidv4(),
    title: title || `${service} · ${angle}`,
    service, angle, platform, tone, event, notes, ideas,
    createdAt: new Date().toISOString()
  };
  db.sessions.unshift(session);
  // keep max 200 sessions
  if (db.sessions.length > 200) db.sessions = db.sessions.slice(0, 200);
  writeDB(db);
  res.json({ id: session.id });
});

// DELETE session
app.delete('/api/sessions/:id', (req, res) => {
  const db = readDB();
  db.sessions = db.sessions.filter(s => s.id !== req.params.id);
  writeDB(db);
  res.json({ ok: true });
});

// CLEAR all
app.delete('/api/sessions', (req, res) => {
  writeDB({ sessions: [] });
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Soft Berry running on http://localhost:${PORT}`));
