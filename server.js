const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3456;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const ROOMS_FILE = path.join(DATA_DIR, 'rooms.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

function createDemoRoom(code = 'TURF84') {
  return {
    code,
    meta: {
      title: 'Saturday Turf Session',
      date: new Date().toISOString().slice(0, 10),
      slotStart: '14:00',
      slotEnd: '16:30',
      minPlayers: 10,
      rsvpCutoff: 'Fri 9:00 PM',
      currency: '₹',
      defaultOvers: 5,
      alarm1HrEnabled: true,
    },
    turfOptions: [
      { id: 't1', name: 'GreenBox Arena (5v5/7v7)', time: '14:00–16:30', price: 2400, votes: ['p1', 'p2', 'p3', 'p5', 'p7'], selected: true },
      { id: 't2', name: 'Metro Roof Turf', time: '16:00–18:30', price: 2800, votes: ['p4', 'p6'], selected: false },
      { id: 't3', name: 'Dugout Sports Park', time: '13:30–16:00', price: 2100, votes: ['p8'], selected: false },
    ],
    players: [
      { id: 'p1', name: 'Aarav', phone: '+919820100101', role: 'All-rounder', rsvp: 'in', checkedIn: true, status: 'active', team: 'A', isCaptain: true },
      { id: 'p2', name: 'Rohan', phone: '+919820100102', role: 'Bowler', rsvp: 'in', checkedIn: true, status: 'active', team: 'B', isCaptain: true },
      { id: 'p3', name: 'Vikram', phone: '+919820100103', role: 'Batsman', rsvp: 'in', checkedIn: true, status: 'active', team: 'A', isCaptain: false },
      { id: 'p4', name: 'Kabir', phone: '+919820100104', role: 'All-rounder', rsvp: 'in', checkedIn: true, status: 'active', team: 'B', isCaptain: false },
      { id: 'p5', name: 'Siddharth', phone: '+919820100105', role: 'Batsman', rsvp: 'in', checkedIn: true, status: 'active', team: 'A', isCaptain: false },
      { id: 'p6', name: 'Neel', phone: '+919820100106', role: 'Bowler', rsvp: 'in', checkedIn: true, status: 'active', team: 'B', isCaptain: false },
      { id: 'p7', name: 'Arjun', phone: '+919820100107', role: 'Batsman', rsvp: 'in', checkedIn: true, status: 'active', team: 'A', isCaptain: false },
      { id: 'p8', name: 'Dev', phone: '+919820100108', role: 'All-rounder', rsvp: 'in', checkedIn: true, status: 'active', team: 'B', isCaptain: false },
      { id: 'p9', name: 'Karan', phone: '+919820100109', role: 'Bowler', rsvp: 'in', checkedIn: true, status: 'late', team: 'A', isCaptain: false },
      { id: 'p10', name: 'Manav', phone: '+919820100110', role: 'Batsman', rsvp: 'in', checkedIn: true, status: 'left_early', team: 'B', isCaptain: false },
      { id: 'p11', name: 'Pranav', phone: '+919820100111', role: 'All-rounder', rsvp: 'in', checkedIn: true, status: 'active', team: 'J', isCaptain: false },
      { id: 'p12', name: 'Ishaan', phone: '+919820100112', role: 'Batsman', rsvp: 'maybe', checkedIn: false, status: 'absent', team: null, isCaptain: false },
      { id: 'p13', name: 'Yash', phone: '+919820100113', role: 'Bowler', rsvp: 'maybe', checkedIn: false, status: 'absent', team: null, isCaptain: false },
      { id: 'p14', name: 'Tarun', phone: '+919820100114', role: 'Batsman', rsvp: 'out', checkedIn: false, status: 'absent', team: null, isCaptain: false },
    ],
    gear: [
      { id: 'g1', item: 'Tennis Balls (x3)', assignee: 'Rohan', cost: 240, done: true },
      { id: 'g2', item: 'Stumps & Bails', assignee: 'Vikram', cost: 0, done: true },
      { id: 'g3', item: 'Drinking Water (5L)', assignee: 'Dev', cost: 120, done: true },
    ],
    rules: {
      locked: false,
      oversPerMatch: 5,
      maxOversPerBowler: 2,
      oneTipOneHand: true,
      lastManBatting: true,
      noBallFreeHit: true,
      wideCountsOne: true,
      overthrowAllowed: false,
      roofOut: true,
    },
    toss: { winner: 'Team A', decision: 'Bat' },
    series: {
      teamAName: 'Team A',
      teamBName: 'Team B',
      currentMatchIndex: 0,
      matches: [
        {
          id: 'm1',
          name: 'Match 1',
          oversLimit: 5,
          status: 'live',
          winner: null,
          currentInnings: 0,
          innings: [
            {
              battingTeam: 'A',
              bowlingTeam: 'B',
              runs: 38,
              wickets: 2,
              balls: 21,
              extras: { wd: 1, nb: 1 },
              strikerId: 'p1',
              nonStrikerId: 'p5',
              bowlerId: 'p2',
              outIds: ['p3', 'p7'],
              battingStats: {
                p1: { runs: 18, balls: 9, fours: 2, sixes: 1, outText: 'not out' },
                p3: { runs: 8, balls: 5, fours: 1, sixes: 0, outText: 'c Kabir b Rohan' },
                p7: { runs: 4, balls: 3, fours: 1, sixes: 0, outText: 'b Neel' },
                p5: { runs: 6, balls: 4, fours: 1, sixes: 0, outText: 'not out' },
              },
              bowlingStats: {
                p2: { balls: 12, runs: 19, wickets: 1 },
                p6: { balls: 9, runs: 17, wickets: 1 },
              },
              ballLog: [
                { label: '1', runs: 1, extra: null, wicket: false, swap: true, batterId: 'p1', bowlerId: 'p6' },
                { label: '4', runs: 4, extra: null, wicket: false, swap: false, batterId: 'p5', bowlerId: 'p6' },
                { label: 'Wd', runs: 1, extra: 'wide', wicket: false, swap: false, batterId: 'p5', bowlerId: 'p6' },
                { label: '0', runs: 0, extra: null, wicket: false, swap: false, batterId: 'p5', bowlerId: 'p6' },
                { label: '2', runs: 2, extra: null, wicket: false, swap: false, batterId: 'p5', bowlerId: 'p6' },
                { label: '6', runs: 6, extra: null, wicket: false, swap: false, batterId: 'p1', bowlerId: 'p2' },
              ],
            },
            {
              battingTeam: 'B',
              bowlingTeam: 'A',
              runs: 0,
              wickets: 0,
              balls: 0,
              extras: { wd: 0, nb: 0 },
              strikerId: 'p4',
              nonStrikerId: 'p8',
              bowlerId: 'p9',
              outIds: [],
              battingStats: {},
              bowlingStats: {},
              ballLog: [],
            },
          ],
        },
      ],
    },
    expenses: [
      { id: 'e1', title: 'Turf Booking (GreenBox Arena)', category: 'Turf', amount: 2400, paidBy: 'p1', splitMode: 'all_attended' },
      { id: 'e2', title: 'Tennis Balls (x3)', category: 'Gear', amount: 240, paidBy: 'p2', splitMode: 'all_attended' },
      { id: 'e3', title: 'Water Bottles (Mid-game)', category: 'Refreshments', amount: 120, paidBy: 'p8', splitMode: 'all_attended' },
      { id: 'e4', title: 'Post-game Nimbu Pani & Snacks', category: 'Refreshments', amount: 480, paidBy: 'p3', splitMode: 'all_attended' },
    ],
    splitSettings: {
      mode: 'prorated',
      settledPlayerIds: ['p2', 'p3', 'p5'],
    },
  };
}

function createEmptyRoom(code, opts = {}) {
  const hostId = 'p1';
  const hostName = (opts.hostName || 'Host').trim();
  const slotStart = opts.slotStart || '14:00';
  const slotEnd = opts.slotEnd || '16:30';
  const turfName = (opts.turfName || 'Local Turf').trim();
  const turfPrice = Number(opts.turfPrice || 2000);

  return {
    code,
    meta: {
      title: (opts.title || 'Weekend Turf Cricket').trim(),
      date: new Date().toISOString().slice(0, 10),
      slotStart,
      slotEnd,
      minPlayers: Number(opts.minPlayers || 10),
      rsvpCutoff: '1 hr before',
      currency: '₹',
      defaultOvers: 5,
      alarm1HrEnabled: true,
    },
    turfOptions: [
      { id: 't1', name: turfName, time: `${slotStart}–${slotEnd}`, price: turfPrice, votes: [hostId], selected: true },
    ],
    players: [
      {
        id: hostId,
        name: hostName,
        phone: (opts.hostPhone || '').trim(),
        role: opts.hostRole || 'All-rounder',
        rsvp: 'in',
        checkedIn: true,
        status: 'active',
        team: 'A',
        isCaptain: true,
      },
    ],
    gear: [],
    rules: {
      locked: false,
      oversPerMatch: 5,
      maxOversPerBowler: 2,
      oneTipOneHand: true,
      lastManBatting: true,
      noBallFreeHit: true,
      wideCountsOne: true,
      overthrowAllowed: false,
      roofOut: true,
    },
    toss: { winner: 'Team A', decision: 'Bat' },
    series: {
      teamAName: 'Team A',
      teamBName: 'Team B',
      currentMatchIndex: 0,
      matches: [
        {
          id: 'm1',
          name: 'Match 1',
          oversLimit: 5,
          status: 'live',
          winner: null,
          currentInnings: 0,
          innings: [
            { battingTeam: 'A', bowlingTeam: 'B', runs: 0, wickets: 0, balls: 0, extras: { wd: 0, nb: 0 }, strikerId: hostId, nonStrikerId: '', bowlerId: '', outIds: [], battingStats: {}, bowlingStats: {}, ballLog: [] },
            { battingTeam: 'B', bowlingTeam: 'A', runs: 0, wickets: 0, balls: 0, extras: { wd: 0, nb: 0 }, strikerId: '', nonStrikerId: '', bowlerId: hostId, outIds: [], battingStats: {}, bowlingStats: {}, ballLog: [] },
          ],
        },
      ],
    },
    expenses: [
      { id: 'e1', title: `Turf Booking (${turfName})`, category: 'Turf', amount: turfPrice, paidBy: hostId, splitMode: 'all_attended' },
    ],
    splitSettings: { mode: 'prorated', settledPlayerIds: [] },
  };
}

function generateRoomCode(rooms) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms[code]);
  return code;
}

function ensureRoomsFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ROOMS_FILE)) {
    const initial = { TURF84: createDemoRoom('TURF84') };
    fs.writeFileSync(ROOMS_FILE, JSON.stringify(initial, null, 2), 'utf8');
  }
}

function readRooms() {
  ensureRoomsFile();
  return JSON.parse(fs.readFileSync(ROOMS_FILE, 'utf8'));
}

function writeRooms(rooms) {
  ensureRoomsFile();
  fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2), 'utf8');
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) reject(new Error('Payload too large'));
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const urlPath = req.url.split('?')[0];

  if (urlPath === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, { ok: true, time: new Date().toISOString() });
  }

  // Create a new room
  if (urlPath === '/api/rooms' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const rooms = readRooms();
      const code = generateRoomCode(rooms);
      rooms[code] = createEmptyRoom(code, body);
      writeRooms(rooms);
      return sendJson(res, 201, { code, room: rooms[code] });
    } catch {
      return sendJson(res, 400, { error: 'Could not create room' });
    }
  }

  // Room-specific routes: /api/rooms/:code[/join|/reset]
  const roomMatch = urlPath.match(/^\/api\/rooms\/([A-Za-z0-9]{4,10})(?:\/(join|reset))?$/);
  if (roomMatch) {
    const code = roomMatch[1].toUpperCase();
    const action = roomMatch[2];
    const rooms = readRooms();

    if (!rooms[code]) {
      return sendJson(res, 404, { error: `Room "${code}" not found. Check the code or host a new game.` });
    }

    if (!action && req.method === 'GET') {
      return sendJson(res, 200, rooms[code]);
    }

    if (!action && req.method === 'PUT') {
      try {
        const nextRoom = await readBody(req);
        nextRoom.code = code;
        rooms[code] = nextRoom;
        writeRooms(rooms);
        return sendJson(res, 200, { ok: true, room: nextRoom });
      } catch {
        return sendJson(res, 400, { error: 'Invalid JSON payload' });
      }
    }

    if (action === 'join' && req.method === 'POST') {
      try {
        const body = await readBody(req);
        const room = rooms[code];
        const joinName = (body.name || '').trim();
        if (joinName) {
          const existing = room.players.find((p) => p.name.toLowerCase() === joinName.toLowerCase());
          if (!existing) {
            room.players.push({
              id: 'p' + Date.now(),
              name: joinName,
              phone: (body.phone || '').trim(),
              role: body.role || 'All-rounder',
              rsvp: 'in',
              checkedIn: true,
              status: 'active',
              team: null,
              isCaptain: false,
            });
            writeRooms(rooms);
          } else if (body.phone && !existing.phone) {
            existing.phone = body.phone.trim();
            writeRooms(rooms);
          }
        }
        return sendJson(res, 200, { code, room });
      } catch {
        return sendJson(res, 400, { error: 'Could not join room' });
      }
    }

    if (action === 'reset' && req.method === 'POST') {
      if (code === 'TURF84') {
        rooms[code] = createDemoRoom('TURF84');
        writeRooms(rooms);
      }
      return sendJson(res, 200, { ok: true, room: rooms[code] });
    }
  }

  if (urlPath === '/api/support' && req.method === 'POST') {
    try {
      const ticket = await readBody(req);
      return sendJson(res, 200, {
        ok: true,
        ticketId: 'PD-' + Math.floor(1000 + Math.random() * 9000),
        receivedAt: new Date().toISOString(),
        message: ticket.message || '',
      });
    } catch {
      return sendJson(res, 400, { error: 'Invalid support request' });
    }
  }

  // Serve static frontend files
  let safePath = urlPath === '/' ? '/index.html' : urlPath;
  safePath = path.normalize(safePath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not Found');
  }

  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`PitchDay running at http://localhost:${PORT}`);
});
