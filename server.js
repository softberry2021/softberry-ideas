const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB_PATH = path.join(__dirname, 'db.json');

function readDB() {
  if (!fs.existsSync(DB_PATH)) return { sessions: [] };
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch(e) { return { sessions: [] }; }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

app.post('/api/generate', async function(req, res) {
  var key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });
  }
  try {
    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    var data = await response.json();
    return res.status(response.status).json(data);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get('/api/sessions', function(req, res) {
  var db = readDB();
  var sorted = db.sessions.sort(function(a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  return res.json(sorted);
});

app.post('/api/sessions', function(req, res) {
  var body = req.body;
  if (!body.ideas || !body.ideas.length) {
    return res.status(400).json({ error: 'No ideas' });
  }
  var db = readDB();
  var session = {
    id: uuidv4(),
    title: body.title,
    service: body.service,
    angle: body.angle,
    platform: body.platform,
    tone: body.tone,
    event: body.event,
    notes: body.notes,
    ideas: body.ideas,
    createdAt: new Date().toISOString()
  };
  db.sessions.unshift(session);
  if (db.sessions.length > 300) {
    db.sessions = db.sessions.slice(0, 300);
  }
  writeDB(db);
  return res.json({ id: session.id });
});

app.get('/api/sessions/:id', function(req, res) {
  var db = readDB();
  var session = db.sessions.find(function(x) { return x.id === req.params.id; });
  if (!session) return res.status(404).json({ error: 'Not found' });
  return res.json(session);
});

app.delete('/api/sessions/:id', function(req, res) {
  var db = readDB();
  db.sessions = db.sessions.filter(function(x) { return x.id !== req.params.id; });
  writeDB(db);
  return res.json({ ok: true });
});

app.delete('/api/sessions', function(req, res) {
  writeDB({ sessions: [] });
  return res.json({ ok: true });
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log('Soft Berry running on port ' + PORT);
});
