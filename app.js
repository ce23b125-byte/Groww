let state = null;
let currentRoomCode = localStorage.getItem('pitchday_room') || '';
let userProfile = JSON.parse(localStorage.getItem('pitchday_profile') || 'null') || {
  name: '',
  phone: '',
  role: 'All-rounder',
  upiId: '',
};
let entryError = '';
let activeTab = 'gameday'; // 'gameday' | 'matches' | 'pay'
let gamedaySub = 'roster'; // 'roster' | 'turf' | 'teams'
let drawerTab = 'profile'; // 'profile' | 'settings' | 'help'
let editingTurfId = null;
let editingGearId = null;
let slotTimerSeconds = 48 * 60;
let slotTimerRunning = false;
let slotTimerHandle = null;

const $ = (sel) => document.querySelector(sel);

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), 2800);
}

const LOCAL_ROOMS_KEY = 'pitchday_static_rooms_v1';

function createStaticDemoRoom(code = 'TURF84') {
  return {
    code,
    meta: { title: 'Saturday Turf Session', date: new Date().toISOString().slice(0, 10), slotStart: '14:00', slotEnd: '16:30', minPlayers: 10, rsvpCutoff: 'Fri 9:00 PM', currency: '₹', defaultOvers: 5, alarm1HrEnabled: true },
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
    rules: { locked: false, oversPerMatch: 5, maxOversPerBowler: 2, oneTipOneHand: true, lastManBatting: true, noBallFreeHit: true, wideCountsOne: true, overthrowAllowed: false, roofOut: true },
    toss: { winner: 'Team A', decision: 'Bat' },
    series: {
      teamAName: 'Team A', teamBName: 'Team B', currentMatchIndex: 0,
      matches: [{
        id: 'm1', name: 'Match 1', oversLimit: 5, status: 'live', winner: null, currentInnings: 0,
        innings: [
          {
            battingTeam: 'A', bowlingTeam: 'B', runs: 38, wickets: 2, balls: 21, extras: { wd: 1, nb: 1 },
            strikerId: 'p1', nonStrikerId: 'p5', bowlerId: 'p2', outIds: ['p3', 'p7'],
            battingStats: { p1: { runs: 18, balls: 9, fours: 2, sixes: 1, outText: 'not out' }, p3: { runs: 8, balls: 5, fours: 1, sixes: 0, outText: 'c Kabir b Rohan' }, p7: { runs: 4, balls: 3, fours: 1, sixes: 0, outText: 'b Neel' }, p5: { runs: 6, balls: 4, fours: 1, sixes: 0, outText: 'not out' } },
            bowlingStats: { p2: { balls: 12, runs: 19, wickets: 1 }, p6: { balls: 9, runs: 17, wickets: 1 } },
            ballLog: [
              { label: '1', runs: 1, extra: null, wicket: false, swap: true, batterId: 'p1', bowlerId: 'p6' },
              { label: '4', runs: 4, extra: null, wicket: false, swap: false, batterId: 'p5', bowlerId: 'p6' },
              { label: 'Wd', runs: 1, extra: 'wide', wicket: false, swap: false, batterId: 'p5', bowlerId: 'p6' },
              { label: '0', runs: 0, extra: null, wicket: false, swap: false, batterId: 'p5', bowlerId: 'p6' },
              { label: '2', runs: 2, extra: null, wicket: false, swap: false, batterId: 'p5', bowlerId: 'p6' },
              { label: '6', runs: 6, extra: null, wicket: false, swap: false, batterId: 'p1', bowlerId: 'p2' },
            ],
          },
          { battingTeam: 'B', bowlingTeam: 'A', runs: 0, wickets: 0, balls: 0, extras: { wd: 0, nb: 0 }, strikerId: 'p4', nonStrikerId: 'p8', bowlerId: 'p9', outIds: [], battingStats: {}, bowlingStats: {}, ballLog: [] },
        ],
      }],
    },
    expenses: [
      { id: 'e1', title: 'Turf Booking (GreenBox Arena)', category: 'Turf', amount: 2400, paidBy: 'p1', splitMode: 'all_attended' },
      { id: 'e2', title: 'Tennis Balls (x3)', category: 'Gear', amount: 240, paidBy: 'p2', splitMode: 'all_attended' },
      { id: 'e3', title: 'Water Bottles (Mid-game)', category: 'Refreshments', amount: 120, paidBy: 'p8', splitMode: 'all_attended' },
      { id: 'e4', title: 'Post-game Nimbu Pani & Snacks', category: 'Refreshments', amount: 480, paidBy: 'p3', splitMode: 'all_attended' },
    ],
    splitSettings: { mode: 'prorated', settledPlayerIds: ['p2', 'p3', 'p5'] },
  };
}

function getStaticRooms() {
  let rooms = JSON.parse(localStorage.getItem(LOCAL_ROOMS_KEY) || 'null');
  if (!rooms) {
    rooms = { TURF84: createStaticDemoRoom('TURF84') };
    localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(rooms));
  }
  return rooms;
}

function saveStaticRooms(rooms) {
  localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(rooms));
}

async function apiCall(path, options = {}) {
  try {
    const res = await fetch(path, options);
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return res;
  } catch {
    // Static mode fallback (GitHub Pages)
  }

  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const rooms = getStaticRooms();

  if (path === '/api/rooms' && method === 'POST') {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do { code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''); } while (rooms[code]);
    const hostId = 'p1';
    const turfName = (body.turfName || 'Local Turf').trim();
    const turfPrice = Number(body.turfPrice || 2000);
    const slotStart = body.slotStart || '14:00';
    const slotEnd = body.slotEnd || '16:30';
    rooms[code] = {
      code,
      meta: { title: (body.title || 'Weekend Turf').trim(), date: new Date().toISOString().slice(0, 10), slotStart, slotEnd, minPlayers: Number(body.minPlayers || 10), rsvpCutoff: '1 hr before', currency: '₹', defaultOvers: 5, alarm1HrEnabled: true },
      turfOptions: [{ id: 't1', name: turfName, time: `${slotStart}–${slotEnd}`, price: turfPrice, votes: [hostId], selected: true }],
      players: [{ id: hostId, name: (body.hostName || 'Host').trim(), phone: (body.hostPhone || '').trim(), role: body.hostRole || 'All-rounder', rsvp: 'in', checkedIn: true, status: 'active', team: 'A', isCaptain: true }],
      gear: [],
      rules: { locked: false, oversPerMatch: 5, maxOversPerBowler: 2, oneTipOneHand: true, lastManBatting: true, noBallFreeHit: true, wideCountsOne: true, overthrowAllowed: false, roofOut: true },
      toss: { winner: 'Team A', decision: 'Bat' },
      series: { teamAName: 'Team A', teamBName: 'Team B', currentMatchIndex: 0, matches: [{ id: 'm1', name: 'Match 1', oversLimit: 5, status: 'live', winner: null, currentInnings: 0, innings: [{ battingTeam: 'A', bowlingTeam: 'B', runs: 0, wickets: 0, balls: 0, extras: { wd: 0, nb: 0 }, strikerId: hostId, nonStrikerId: '', bowlerId: '', outIds: [], battingStats: {}, bowlingStats: {}, ballLog: [] }, { battingTeam: 'B', bowlingTeam: 'A', runs: 0, wickets: 0, balls: 0, extras: { wd: 0, nb: 0 }, strikerId: '', nonStrikerId: '', bowlerId: hostId, outIds: [], battingStats: {}, bowlingStats: {}, ballLog: [] }] }] },
      expenses: [{ id: 'e1', title: `Turf Booking (${turfName})`, category: 'Turf', amount: turfPrice, paidBy: hostId, splitMode: 'all_attended' }],
      splitSettings: { mode: 'prorated', settledPlayerIds: [] },
    };
    saveStaticRooms(rooms);
    return new Response(JSON.stringify({ code, room: rooms[code] }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  }

  const m = path.match(/^\/api\/rooms\/([A-Za-z0-9]{4,10})(?:\/(join|reset))?$/);
  if (m) {
    const code = m[1].toUpperCase();
    const action = m[2];
    if (!rooms[code]) return new Response(JSON.stringify({ error: `Room "${code}" not found.` }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    if (!action && method === 'GET') return new Response(JSON.stringify(rooms[code]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    if (!action && method === 'PUT') { rooms[code] = body; saveStaticRooms(rooms); return new Response(JSON.stringify({ ok: true, room: body }), { status: 200, headers: { 'Content-Type': 'application/json' } }); }
    if (action === 'join' && method === 'POST') {
      const joinName = (body.name || '').trim();
      if (joinName && !rooms[code].players.some((p) => p.name.toLowerCase() === joinName.toLowerCase())) {
        rooms[code].players.push({ id: 'p' + Date.now(), name: joinName, phone: (body.phone || '').trim(), role: body.role || 'All-rounder', rsvp: 'in', checkedIn: true, status: 'active', team: null, isCaptain: false });
        saveStaticRooms(rooms);
      }
      return new Response(JSON.stringify({ code, room: rooms[code] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (action === 'reset' && method === 'POST') {
      if (code === 'TURF84') { rooms[code] = createStaticDemoRoom('TURF84'); saveStaticRooms(rooms); }
      return new Response(JSON.stringify({ ok: true, room: rooms[code] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (path === '/api/support' && method === 'POST') {
    return new Response(JSON.stringify({ ok: true, ticketId: 'PD-' + Math.floor(1000 + Math.random() * 9000) }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
}

function saveLocalProfile() {
  localStorage.setItem('pitchday_profile', JSON.stringify(userProfile));
}

async function enterRoom(code, isNewJoin = true) {
  const clean = String(code || '').trim().toUpperCase();
  if (!clean) {
    entryError = 'Enter a room code.';
    return render();
  }
  entryError = '';
  const url = isNewJoin && userProfile.name ? `/api/rooms/${clean}/join` : `/api/rooms/${clean}`;
  const res = await apiCall(url, isNewJoin && userProfile.name ? {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userProfile),
  } : undefined);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    entryError = err.error || `Room "${clean}" not found.`;
    currentRoomCode = '';
    localStorage.removeItem('pitchday_room');
    return render();
  }

  const data = await res.json();
  state = data.room || data;
  currentRoomCode = state.code || clean;
  localStorage.setItem('pitchday_room', currentRoomCode);
  if (isNewJoin && userProfile.name) {
    syncRosterConsistency();
    await apiCall(`/api/rooms/${currentRoomCode}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
  }
  activeTab = 'gameday';
  render();
}

async function saveState(toastMsg) {
  if (!currentRoomCode || !state) return;
  await apiCall(`/api/rooms/${currentRoomCode}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  });
  render();
  if (toastMsg) showToast(toastMsg);
}

function leaveRoom() {
  currentRoomCode = '';
  state = null;
  entryError = '';
  localStorage.removeItem('pitchday_room');
  $('#drawer-backdrop').classList.add('hidden');
  render();
}

function formatOvers(balls) {
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

function formatClock(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function minusOneHour(hhmm) {
  const [h, m] = String(hhmm || '14:00').split(':').map(Number);
  const nh = (h + 23) % 24;
  return `${String(nh).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
}

function playerName(id) {
  if (!state) return '—';
  const p = state.players.find((x) => x.id === id);
  return p ? p.name : '—';
}

function isAvailable(p) {
  return p && p.rsvp !== 'out' && p.checkedIn;
}

function balanceAvailableTeams() {
  const available = state.players.filter(isAvailable);
  state.players.forEach((p) => {
    if (!isAvailable(p)) {
      p.team = null;
      p.isCaptain = false;
    }
  });

  const pool = [...available];
  if (pool.length % 2 === 1 && pool.length >= 3) {
    const randIdx = Math.floor(Math.random() * pool.length);
    const joker = pool.splice(randIdx, 1)[0];
    joker.team = 'J';
    joker.isCaptain = false;
  }

  pool.sort((a, b) => a.role.localeCompare(b.role));
  pool.forEach((p, idx) => {
    p.team = idx % 2 === 0 ? 'A' : 'B';
    p.isCaptain = idx < 2;
  });
}

function syncRosterConsistency(changedPlayer) {
  if (!state) return;
  if (changedPlayer && !isAvailable(changedPlayer)) {
    changedPlayer.team = null;
    changedPlayer.isCaptain = false;
  }

  const available = state.players.filter(isAvailable);
  available.forEach((p) => {
    if (!p.team) {
      const countA = available.filter((x) => x.team === 'A').length;
      const countB = available.filter((x) => x.team === 'B').length;
      p.team = countA <= countB ? 'A' : 'B';
    }
  });

  ['A', 'B'].forEach((t) => {
    const members = available.filter((p) => p.team === t);
    if (members.length > 0 && !members.some((p) => p.isCaptain)) {
      members[0].isCaptain = true;
    }
  });

  const countA = available.filter((p) => p.team === 'A').length;
  const countB = available.filter((p) => p.team === 'B').length;
  const hasJoker = available.some((p) => p.team === 'J');
  if (available.length >= 2 && (Math.abs(countA - countB) > 1 || (available.length % 2 === 1 && !hasJoker) || (available.length % 2 === 0 && hasJoker))) {
    balanceAvailableTeams();
  }

  state.series.matches.forEach((m) => {
    m.innings.forEach((inn) => {
      const batPool = available.filter((p) => p.team === inn.battingTeam || p.team === 'J');
      const bowlPool = available.filter((p) => p.team === inn.bowlingTeam || p.team === 'J');
      const outSet = new Set(inn.outIds || []);

      if (inn.strikerId && !batPool.some((p) => p.id === inn.strikerId)) {
        const next = batPool.find((p) => !outSet.has(p.id) && p.id !== inn.nonStrikerId);
        inn.strikerId = next ? next.id : '';
      }
      if (inn.nonStrikerId && !batPool.some((p) => p.id === inn.nonStrikerId)) {
        const next = batPool.find((p) => !outSet.has(p.id) && p.id !== inn.strikerId);
        inn.nonStrikerId = next ? next.id : '';
      }
      if (inn.bowlerId && !bowlPool.some((p) => p.id === inn.bowlerId)) {
        inn.bowlerId = bowlPool[0] ? bowlPool[0].id : '';
      }
    });
  });
}

function ensureInningsMaps(inn) {
  if (!inn.extras) inn.extras = { wd: 0, nb: 0 };
  if (!inn.outIds) inn.outIds = [];
  if (!inn.battingStats) inn.battingStats = {};
  if (!inn.bowlingStats) inn.bowlingStats = {};
}

function render() {
  const bottomNav = $('.bottom-nav');
  const roomPill = $('#btn-room-pill');
  const displayName = userProfile.name || 'A';
  $('#menu-avatar').textContent = displayName[0].toUpperCase();

  if (!currentRoomCode || !state) {
    $('#header-subtitle').textContent = 'Join or host a game day';
    bottomNav.classList.add('hidden');
    roomPill.classList.add('hidden');
    $('#main-content').innerHTML = renderEntry();
    bindEntryEvents();
    return;
  }

  $('#header-subtitle').textContent = `${state.meta.title} · ${state.meta.slotStart}–${state.meta.slotEnd}`;
  bottomNav.classList.remove('hidden');
  roomPill.classList.remove('hidden');
  roomPill.textContent = `Room ${currentRoomCode}`;

  document.querySelectorAll('.tab-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === activeTab);
  });

  const main = $('#main-content');
  if (activeTab === 'gameday') main.innerHTML = renderGameDay();
  else if (activeTab === 'matches') main.innerHTML = renderMatches();
  else main.innerHTML = renderPay();

  bindEvents();
}

/* ==================== ONBOARDING & ROOM ENTRY ==================== */
function renderEntry() {
  return `
    <div class="entry-wrap">
      <div class="entry-hero">
        <h1>One room for your turf day.</h1>
        <p class="muted" style="margin-top:6px;">Enter your details once, then join your group's room code or host a new game.</p>
      </div>

      ${entryError ? `<div class="notice-bar dark"><span>${esc(entryError)}</span></div>` : ''}

      <div>
        <div class="section-head">
          <span class="section-title">1. Your Details</span>
          ${userProfile.name ? '<span class="badge badge-accent">Saved</span>' : ''}
        </div>
        <form id="form-entry-profile" class="inline-form" style="margin-top:0;">
          <input class="input input-grow" name="name" placeholder="Your name (required)" value="${esc(userProfile.name)}" required />
          <input class="input" name="phone" placeholder="Phone (optional)" value="${esc(userProfile.phone)}" style="width:140px" />
          <select class="select" name="role">
            ${['All-rounder', 'Batsman', 'Bowler'].map((r) => `<option ${userProfile.role === r ? 'selected' : ''}>${r}</option>`).join('')}
          </select>
          <input class="input" name="upiId" placeholder="UPI ID (optional)" value="${esc(userProfile.upiId)}" style="width:150px" />
          <button class="btn" type="submit">Save</button>
        </form>
      </div>

      <div class="split-2">
        <div class="scorer-panel">
          <div class="section-head">
            <span class="section-title">2. Join with Code</span>
          </div>
          <form id="form-join-room" style="display:flex; flex-direction:column; gap:10px;">
            <input class="input code-input" name="code" placeholder="TURF84" maxlength="8" required />
            <button class="btn btn-primary" type="submit">Join Room</button>
          </form>
          <div style="margin-top:14px; padding-top:12px; border-top:1px solid var(--hairline); display:flex; align-items:center; justify-content:space-between;">
            <span class="muted">Want to explore first?</span>
            <button class="btn btn-sm" id="btn-demo-room">Open Sample (TURF84)</button>
          </div>
        </div>

        <div class="scorer-panel">
          <div class="section-head">
            <span class="section-title">Or Host a GameDay</span>
          </div>
          <form id="form-host-room" style="display:flex; flex-direction:column; gap:10px;">
            <input class="input" name="title" placeholder="Session title (e.g. Sunday Turf)" required />
            <div style="display:flex; gap:8px;">
              <input class="input input-grow" name="turfName" placeholder="Turf name" required />
              <input class="input" name="turfPrice" type="number" placeholder="Price" style="width:90px" required />
            </div>
            <div style="display:flex; gap:8px;">
              <input class="input" name="slotStart" value="14:00" style="width:90px" required />
              <input class="input" name="slotEnd" value="16:30" style="width:90px" required />
              <input class="input input-grow" name="minPlayers" type="number" value="10" placeholder="Min players" required />
            </div>
            <button class="btn btn-primary" type="submit">Create Room & Get Code</button>
          </form>
        </div>
      </div>
    </div>
  `;
}

function bindEntryEvents() {
  const profForm = $('#form-entry-profile');
  if (profForm) {
    profForm.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(profForm);
      userProfile = {
        name: fd.get('name').trim(),
        phone: (fd.get('phone') || '').trim(),
        role: fd.get('role'),
        upiId: (fd.get('upiId') || '').trim(),
      };
      saveLocalProfile();
      showToast('Details saved');
      render();
    };
  }

  const syncInlineProfile = () => {
    const form = $('#form-entry-profile');
    if (!form) return;
    const fd = new FormData(form);
    const name = (fd.get('name') || '').trim();
    if (name) {
      userProfile = {
        name,
        phone: (fd.get('phone') || '').trim(),
        role: fd.get('role'),
        upiId: (fd.get('upiId') || '').trim(),
      };
      saveLocalProfile();
    }
  };

  const joinForm = $('#form-join-room');
  if (joinForm) {
    joinForm.onsubmit = (e) => {
      e.preventDefault();
      syncInlineProfile();
      const fd = new FormData(joinForm);
      enterRoom(fd.get('code'), true);
    };
  }

  const demoBtn = $('#btn-demo-room');
  if (demoBtn) {
    demoBtn.onclick = () => {
      syncInlineProfile();
      enterRoom('TURF84', false);
    };
  }

  const hostForm = $('#form-host-room');
  if (hostForm) {
    hostForm.onsubmit = async (e) => {
      e.preventDefault();
      syncInlineProfile();
      if (!userProfile.name) {
        entryError = 'Please enter your name in Step 1 before hosting.';
        return render();
      }
      const fd = new FormData(hostForm);
      const res = await apiCall('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: userProfile.name,
          hostPhone: userProfile.phone,
          hostRole: userProfile.role,
          title: fd.get('title'),
          turfName: fd.get('turfName'),
          turfPrice: fd.get('turfPrice'),
          slotStart: fd.get('slotStart'),
          slotEnd: fd.get('slotEnd'),
          minPlayers: fd.get('minPlayers'),
        }),
      });
      const data = await res.json();
      state = data.room;
      currentRoomCode = data.code;
      localStorage.setItem('pitchday_room', currentRoomCode);
      activeTab = 'gameday';
      showToast(`Room ${currentRoomCode} created`);
      render();
    };
  }
}

/* ==================== TAB 1: GAMEDAY ==================== */
function renderGameDay() {
  const confirmed = state.players.filter((p) => p.rsvp === 'in');
  const gameOn = confirmed.length >= state.meta.minPlayers;
  const alarmTime = minusOneHour(state.meta.slotStart);

  return `
    <div class="dark-strip">
      <div class="strip-row">
        <div>
          <div class="muted">Slot · ${esc(state.meta.slotStart)}–${esc(state.meta.slotEnd)}</div>
          <strong class="num" style="font-size:17px; font-weight:500;">${confirmed.length} / ${state.meta.minPlayers} players</strong>
        </div>
        <span class="badge badge-accent">${gameOn ? 'Game On' : `Need ${state.meta.minPlayers - confirmed.length}`}</span>
      </div>

      <div class="strip-row" style="border-top:1px solid #2b2a2b; padding-top:10px;">
        <div>
          <div class="muted">Turf Time Left</div>
          <div style="display:flex; align-items:center; gap:8px; margin-top:2px;">
            <strong id="slot-clock-display" class="num" style="font-size:16px; font-weight:500;">${formatClock(slotTimerSeconds)}</strong>
            <button class="btn btn-sm" id="btn-toggle-clock">${slotTimerRunning ? 'Pause' : 'Start'}</button>
          </div>
        </div>
        <div style="text-align:right;">
          <div class="muted">1-Hr Alarm (${alarmTime})</div>
          <div style="display:flex; align-items:center; gap:6px; justify-content:flex-end; margin-top:2px;">
            <button class="btn btn-sm ${state.meta.alarm1HrEnabled ? 'btn-primary' : ''}" id="btn-toggle-alarm">${state.meta.alarm1HrEnabled ? 'On' : 'Off'}</button>
            <button class="btn btn-sm" id="btn-test-alarm">Test</button>
          </div>
        </div>
      </div>
    </div>

    <div class="subnav">
      <button class="subnav-btn ${gamedaySub === 'roster' ? 'active' : ''}" data-gd-sub="roster">Roster & Check-in</button>
      <button class="subnav-btn ${gamedaySub === 'turf' ? 'active' : ''}" data-gd-sub="turf">Turf & Gear</button>
      <button class="subnav-btn ${gamedaySub === 'teams' ? 'active' : ''}" data-gd-sub="teams">Teams & Rules</button>
    </div>

    ${gamedaySub === 'roster' ? renderRoster() : ''}
    ${gamedaySub === 'turf' ? renderTurfAndGear() : ''}
    ${gamedaySub === 'teams' ? renderTeamsAndRules() : ''}
  `;
}

function renderRoster() {
  return `
    <div>
      <div class="section-head">
        <span class="section-title">Players (${state.players.filter((p) => p.rsvp === 'in').length} In · ${state.players.filter(isAvailable).length} Here)</span>
        <button class="btn btn-sm" id="btn-copy-invite">Invite & Code</button>
      </div>
      <div>
        ${state.players.map((p) => `
          <div class="player-card-row">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
              <div>
                <strong>${esc(p.name)}</strong>
                <span class="muted"> · ${esc(p.role)}</span>
              </div>
              <a class="btn btn-sm" href="tel:${esc(p.phone || '')}" data-call-player="${p.id}" style="text-decoration:none;">Call</a>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; flex-wrap:wrap;">
              <div class="seg-group">
                <button class="seg-btn ${p.rsvp === 'in' ? 'active-accent' : ''}" data-rsvp="${p.id}:in">In</button>
                <button class="seg-btn ${p.rsvp === 'maybe' ? 'active-dark' : ''}" data-rsvp="${p.id}:maybe">Maybe</button>
                <button class="seg-btn ${p.rsvp === 'out' ? 'active-muted' : ''}" data-rsvp="${p.id}:out">Out</button>
              </div>
              <div class="seg-group">
                <button class="seg-btn ${p.checkedIn && p.status === 'active' ? 'active-accent' : ''}" data-checkin="${p.id}:active">Here</button>
                <button class="seg-btn ${p.status === 'late' ? 'active-dark' : ''}" data-checkin="${p.id}:late">Late</button>
                <button class="seg-btn ${p.status === 'left_early' ? 'active-dark' : ''}" data-checkin="${p.id}:left_early">Left</button>
                <button class="seg-btn ${!p.checkedIn ? 'active-muted' : ''}" data-checkin="${p.id}:absent">Out</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <form id="form-add-player" class="inline-form">
        <input class="input input-grow" name="name" placeholder="Add player name" required />
        <input class="input" name="phone" placeholder="Phone (optional)" style="width:140px" />
        <select class="select" name="role">
          <option>All-rounder</option>
          <option>Batsman</option>
          <option>Bowler</option>
        </select>
        <button class="btn btn-primary" type="submit">Add</button>
      </form>
    </div>
  `;
}

function renderTurfAndGear() {
  return `
    <div class="split-2">
      <div>
        <div class="section-head">
          <span class="section-title">Turf Poll</span>
        </div>
        ${state.turfOptions.length === 0 ? '<div class="muted">No turf options yet.</div>' : state.turfOptions.map((t) => editingTurfId === t.id ? `
          <form class="inline-form" data-save-turf="${t.id}" style="margin:0; padding:8px 0; border-bottom:1px solid var(--hairline);">
            <input class="input input-grow" name="name" value="${esc(t.name)}" required />
            <input class="input" name="time" value="${esc(t.time)}" style="width:110px" required />
            <input class="input" name="price" type="number" value="${t.price}" style="width:80px" required />
            <button class="btn btn-sm btn-primary" type="submit">Save</button>
            <button class="btn btn-sm" type="button" id="btn-cancel-turf">Cancel</button>
          </form>
        ` : `
          <div class="row-item">
            <div>
              <strong>${esc(t.name)}</strong>
              <div class="muted num">${esc(t.time)} · ${esc(state.meta.currency)}${t.price} · ${t.votes.length} votes</div>
            </div>
            <div style="display:flex; gap:5px; flex-wrap:wrap;">
              <button class="btn btn-sm" data-vote-turf="${t.id}">Vote</button>
              <button class="btn btn-sm ${t.selected ? 'btn-primary' : ''}" data-lock-turf="${t.id}">
                ${t.selected ? 'Booked' : 'Lock'}
              </button>
              <button class="btn btn-sm" data-edit-turf="${t.id}">Edit</button>
              <button class="btn btn-sm" data-del-turf="${t.id}" title="Delete">&times;</button>
            </div>
          </div>
        `).join('')}
        <form id="form-add-turf" class="inline-form">
          <input class="input input-grow" name="name" placeholder="Turf name" required />
          <input class="input" name="time" placeholder="14:00–16:30" style="width:110px" required />
          <input class="input" name="price" type="number" placeholder="Price" style="width:80px" required />
          <button class="btn" type="submit">Add</button>
        </form>
      </div>

      <div>
        <div class="section-head">
          <span class="section-title">Gear & Advance</span>
        </div>
        ${state.gear.length === 0 ? '<div class="muted">No gear assigned yet.</div>' : state.gear.map((g) => editingGearId === g.id ? `
          <form class="inline-form" data-save-gear="${g.id}" style="margin:0; padding:8px 0; border-bottom:1px solid var(--hairline);">
            <input class="input input-grow" name="item" value="${esc(g.item)}" required />
            <input class="input" name="assignee" value="${esc(g.assignee)}" style="width:95px" required />
            <input class="input" name="cost" type="number" value="${g.cost}" style="width:75px" />
            <button class="btn btn-sm btn-primary" type="submit">Save</button>
            <button class="btn btn-sm" type="button" id="btn-cancel-gear">Cancel</button>
          </form>
        ` : `
          <div class="row-item">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
              <input type="checkbox" data-toggle-gear="${g.id}" ${g.done ? 'checked' : ''} />
              <span style="${g.done ? 'text-decoration:line-through; color:var(--muted);' : ''}">
                <strong>${esc(g.item)}</strong> · ${esc(g.assignee)}
              </span>
            </label>
            <div style="display:flex; align-items:center; gap:5px;">
              <span class="muted num">${esc(state.meta.currency)}${g.cost}</span>
              <button class="btn btn-sm" data-edit-gear="${g.id}">Edit</button>
              <button class="btn btn-sm" data-del-gear="${g.id}" title="Delete">&times;</button>
            </div>
          </div>
        `).join('')}
        <form id="form-add-gear" class="inline-form">
          <input class="input input-grow" name="item" placeholder="Ball, stumps, water..." required />
          <input class="input" name="assignee" placeholder="Who?" style="width:90px" required />
          <input class="input" name="cost" type="number" placeholder="Cost" style="width:75px" value="0" />
          <button class="btn" type="submit">Add</button>
        </form>
      </div>
    </div>
  `;
}

function renderTeamsAndRules() {
  const locked = !!state.rules.locked;
  const availableCount = state.players.filter(isAvailable).length;
  const teamA = state.players.filter((p) => isAvailable(p) && p.team === 'A');
  const teamB = state.players.filter((p) => isAvailable(p) && p.team === 'B');
  const joker = state.players.find((p) => isAvailable(p) && p.team === 'J');
  const ruleDefs = [
    ['oneTipOneHand', 'One-tip one-hand'],
    ['lastManBatting', 'Last man batting'],
    ['noBallFreeHit', 'No-ball = 1 + Free Hit'],
    ['wideCountsOne', 'Wide = 1'],
    ['overthrowAllowed', 'Overthrows'],
    ['roofOut', 'Roof = Out'],
  ];

  return `
    ${availableCount < 4 ? '<div class="notice-bar dark"><span>Need at least 4 checked-in players to form 2v2 teams.</span></div>' : ''}
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid var(--hairline);">
      <div>
        <strong>Match Setup</strong>
        <span class="muted"> · ${teamA.length}v${teamB.length}${joker ? ` + Joker (${esc(joker.name)})` : ''}</span>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-sm" id="btn-balance-teams" ${locked ? 'disabled' : ''}>Auto-Balance</button>
        <button class="btn btn-sm ${locked ? 'btn-primary' : ''}" id="btn-lock-rules">
          ${locked ? 'Locked (Unlock)' : 'Lock Setup'}
        </button>
      </div>
    </div>

    <div class="split-2">
      <div>
        <div class="row-2col" style="gap:12px;">
          <div>
            <div style="font-weight:600; font-size:13px; color:var(--accent); margin-bottom:6px;">Team A (${teamA.length})</div>
            ${teamA.map((p) => `
              <div class="row-item" style="padding:6px 0;">
                <span>${esc(p.name)}</span>
                <div style="display:flex; gap:4px;">
                  <button class="btn btn-sm ${p.isCaptain ? 'btn-primary' : ''}" data-captain="${p.id}" title="Set Captain" ${locked ? 'disabled' : ''}>C</button>
                  <button class="btn btn-sm" data-swap-team="${p.id}" ${locked ? 'disabled' : ''}>→ B</button>
                </div>
              </div>
            `).join('')}
          </div>
          <div>
            <div style="font-weight:600; font-size:13px; color:var(--ink); margin-bottom:6px;">Team B (${teamB.length})</div>
            ${teamB.map((p) => `
              <div class="row-item" style="padding:6px 0;">
                <span>${esc(p.name)}</span>
                <div style="display:flex; gap:4px;">
                  <button class="btn btn-sm ${p.isCaptain ? 'btn-primary' : ''}" data-captain="${p.id}" title="Set Captain" ${locked ? 'disabled' : ''}>C</button>
                  <button class="btn btn-sm" data-swap-team="${p.id}" ${locked ? 'disabled' : ''}>← A</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ${joker ? `
          <div class="row-item" style="margin-top:10px; padding:8px 12px; background:var(--surface); border-radius:var(--radius-surface); border:1px solid var(--hairline);">
            <div><strong>${esc(joker.name)}</strong> <span class="badge badge-accent">Joker</span></div>
            <span class="muted">Plays for both teams</span>
          </div>
        ` : ''}
      </div>

      <div>
        <div class="row-item" style="padding-top:0;">
          <div><strong>${esc(state.toss.winner)}</strong> won toss · ${esc(state.toss.decision)}</div>
          <button class="btn btn-sm" id="btn-flip-toss" ${locked ? 'disabled' : ''}>Flip Coin</button>
        </div>
        <div class="row-item">
          <span class="muted">Max overs per bowler</span>
          <div style="display:flex; align-items:center; gap:6px;">
            <button class="btn btn-sm" id="btn-quota-minus" ${locked ? 'disabled' : ''}>-</button>
            <strong class="num">${state.rules.maxOversPerBowler || 2}</strong>
            <button class="btn btn-sm" id="btn-quota-plus" ${locked ? 'disabled' : ''}>+</button>
          </div>
        </div>
        <div class="rules-grid" style="margin-top:12px;">
          ${ruleDefs.map(([key, label]) => `
            <button class="rule-chip ${state.rules[key] ? 'active' : ''}" data-rule="${key}" ${locked ? 'disabled' : ''}>
              ${state.rules[key] ? '✓ ' : ''}${label}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ==================== TAB 2: MATCHES (SCORER + SCORECARD) ==================== */
function renderMatches() {
  const mIdx = state.series.currentMatchIndex;
  const match = state.series.matches[mIdx];
  const inn = match.innings[match.currentInnings];
  ensureInningsMaps(inn);

  const winsA = state.series.matches.filter((m) => m.winner === 'A').length;
  const winsB = state.series.matches.filter((m) => m.winner === 'B').length;

  const battingSquad = state.players.filter((p) => isAvailable(p) && (p.team === inn.battingTeam || p.team === 'J'));
  const bowlingSquad = state.players.filter((p) => isAvailable(p) && (p.team === inn.bowlingTeam || p.team === 'J'));
  const outSet = new Set(inn.outIds);
  const maxQuotaBalls = (state.rules.maxOversPerBowler || 2) * 6;

  const firstInn = match.innings[0];
  const target = match.currentInnings === 1 ? firstInn.runs + 1 : null;
  const maxBalls = match.oversLimit * 6;
  const ballsLeft = Math.max(0, maxBalls - inn.balls);
  const recentBalls = inn.ballLog.slice(-6);

  const availableForStriker = battingSquad.filter((p) => !outSet.has(p.id) && p.id !== inn.nonStrikerId);
  const availableForNonStriker = battingSquad.filter((p) => !outSet.has(p.id) && p.id !== inn.strikerId);

  // Edge-case guards
  const oversDone = inn.balls >= maxBalls;
  const targetChased = target !== null && inn.runs >= target;
  const notOutBatters = battingSquad.filter((p) => !outSet.has(p.id));
  const allOut = notOutBatters.length === 0 || (notOutBatters.length === 1 && !state.rules.lastManBatting);
  const currentBowlerBalls = inn.bowlerId ? (inn.bowlingStats[inn.bowlerId]?.balls || 0) : 0;
  const bowlerQuotaFull = inn.bowlerId && currentBowlerBalls >= maxQuotaBalls;
  const scoringBlocked = match.status === 'completed' || oversDone || targetChased || allOut || bowlerQuotaFull || !inn.strikerId || !inn.bowlerId;

  let statusBanner = '';
  if (match.status === 'completed') {
    statusBanner = `<div class="notice-bar dark"><span>${esc(match.name)} completed (${match.winner === 'Tie' ? 'Tie' : `Team ${match.winner} won`}). Start next match above.</span></div>`;
  } else if (targetChased) {
    statusBanner = `<div class="notice-bar"><span>Target chased! Team ${inn.battingTeam} wins.</span><button class="btn btn-sm btn-primary" id="btn-banner-end">End Match</button></div>`;
  } else if (allOut) {
    statusBanner = `<div class="notice-bar dark"><span>All out!</span><button class="btn btn-sm btn-primary" id="btn-banner-switch">${match.currentInnings === 0 ? 'Start Inn 2' : 'End Match'}</button></div>`;
  } else if (oversDone) {
    statusBanner = `<div class="notice-bar dark"><span>Innings overs complete (${match.oversLimit}.0 ov).</span><button class="btn btn-sm btn-primary" id="btn-banner-switch">${match.currentInnings === 0 ? 'Start Inn 2' : 'End Match'}</button></div>`;
  } else if (bowlerQuotaFull) {
    statusBanner = `<div class="notice-bar"><span>${esc(playerName(inn.bowlerId))} finished ${state.rules.maxOversPerBowler} ov quota. Pick next bowler.</span></div>`;
  }

  return `
    <div class="dark-strip">
      <div class="strip-row">
        <div>
          <div class="muted">Series</div>
          <strong class="num" style="font-size:16px; font-weight:500;">Team A ${winsA} – ${winsB} Team B</strong>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <select class="select" id="select-match" style="min-height:32px; padding:4px 8px; font-size:12px;">
            ${state.series.matches.map((m, i) => `<option value="${i}" ${i === mIdx ? 'selected' : ''}>${esc(m.name)} (${m.status})</option>`).join('')}
          </select>
          <button class="btn btn-sm btn-primary" id="btn-new-match">+ Match</button>
        </div>
      </div>
    </div>

    ${battingSquad.length === 0 || bowlingSquad.length === 0 ? '<div class="notice-bar dark"><span>Add & balance at least 2 teams in GameDay before scoring.</span></div>' : ''}

    <div class="split-scorer">
      <div class="scorer-panel">
        ${statusBanner}
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap;">
          <div>
            <span class="badge badge-accent">Team ${inn.battingTeam} · Inn ${match.currentInnings + 1}</span>
            <div class="score-big num" style="margin-top:8px;">${inn.runs}/${inn.wickets}</div>
            <div class="muted num" style="margin-top:4px;">
              Overs ${formatOvers(inn.balls)} / ${match.oversLimit}
              ${target ? ` · Need ${Math.max(0, target - inn.runs)} off ${ballsLeft}b` : ''}
            </div>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-sm" id="btn-switch-innings">Switch Inn</button>
            <button class="btn btn-sm btn-primary" id="btn-finish-match">End Match</button>
          </div>
        </div>

        <div class="row-2col" style="margin-top:12px;">
          <div class="field-group">
            <label class="field-label">Striker * (Team ${inn.battingTeam})</label>
            <select class="select" id="sel-striker">
              ${availableForStriker.length === 0 ? '<option value="">No batters left</option>' : availableForStriker.map((p) => `
                <option value="${p.id}" ${p.id === inn.strikerId ? 'selected' : ''}>${esc(p.name)}${p.team === 'J' ? ' (Joker)' : ''} *</option>
              `).join('')}
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">Non-Striker (Team ${inn.battingTeam})</label>
            <select class="select" id="sel-nonstriker">
              <option value="">${availableForNonStriker.length === 0 ? 'Last man' : '—'}</option>
              ${availableForNonStriker.map((p) => `
                <option value="${p.id}" ${p.id === inn.nonStrikerId ? 'selected' : ''}>${esc(p.name)}${p.team === 'J' ? ' (Joker)' : ''}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div style="display:flex; gap:10px; align-items:flex-end; margin-top:10px;">
          <div class="field-group" style="flex:1;">
            <label class="field-label">Bowler (Team ${inn.bowlingTeam} · max ${state.rules.maxOversPerBowler || 2} ov)</label>
            <select class="select" id="sel-bowler">
              ${bowlingSquad.length === 0 ? '<option value="">No bowlers</option>' : bowlingSquad.map((p) => {
                const bs = inn.bowlingStats[p.id] || { balls: 0, runs: 0, wickets: 0 };
                const full = bs.balls >= maxQuotaBalls;
                return `<option value="${p.id}" ${p.id === inn.bowlerId ? 'selected' : ''} ${full && p.id !== inn.bowlerId ? 'disabled' : ''}>
                  ${esc(p.name)}${p.team === 'J' ? ' (Joker)' : ''} (${formatOvers(bs.balls)}/${state.rules.maxOversPerBowler || 2}${full ? ' · Full' : ''})
                </option>`;
              }).join('')}
            </select>
          </div>
          <button class="btn btn-sm" id="btn-swap-strike" ${!inn.nonStrikerId ? 'disabled' : ''}>Swap ⇄</button>
        </div>

        <div class="over-strip">
          ${recentBalls.length === 0 ? '<span class="muted">No balls yet</span>' : recentBalls.map((b) => `
            <span class="ball-chip ${b.runs >= 4 ? 'boundary' : ''} ${b.wicket ? 'wicket' : ''}">${esc(b.label)}</span>
          `).join('')}
        </div>

        <div class="keypad">
          <button class="pad-btn" data-ball="0" ${scoringBlocked ? 'disabled' : ''}>0</button>
          <button class="pad-btn" data-ball="1" ${scoringBlocked ? 'disabled' : ''}>1</button>
          <button class="pad-btn" data-ball="2" ${scoringBlocked ? 'disabled' : ''}>2</button>
          <button class="pad-btn" data-ball="3" ${scoringBlocked ? 'disabled' : ''}>3</button>
          <button class="pad-btn run-high" data-ball="4" ${scoringBlocked ? 'disabled' : ''}>4</button>
          <button class="pad-btn run-high" data-ball="6" ${scoringBlocked ? 'disabled' : ''}>6</button>
          <button class="pad-btn" data-extra="wide" ${scoringBlocked ? 'disabled' : ''}>Wide</button>
          <button class="pad-btn" data-extra="noball" ${scoringBlocked ? 'disabled' : ''}>No Ball</button>
          <button class="pad-btn wicket-btn" data-wicket="1" ${scoringBlocked ? 'disabled' : ''}>Wicket</button>
          <button class="pad-btn" id="btn-undo-ball">Undo</button>
        </div>
      </div>

      <div>
        <div class="section-head">
          <span class="section-title">Scorecard · Team ${inn.battingTeam}</span>
          <span class="muted num">Extras ${(inn.extras.wd || 0) + (inn.extras.nb || 0)} (wd ${inn.extras.wd || 0}, nb ${inn.extras.nb || 0})</span>
        </div>

        <table class="score-table">
          <thead>
            <tr>
              <th>Batter</th>
              <th class="r">R</th>
              <th class="r">B</th>
              <th class="r">4s</th>
              <th class="r">6s</th>
              <th class="r">SR</th>
            </tr>
          </thead>
          <tbody>
            ${battingSquad.map((p) => {
              const st = inn.battingStats[p.id];
              const isCrease = p.id === inn.strikerId || p.id === inn.nonStrikerId;
              const isOut = outSet.has(p.id);
              if (!st && !isCrease && !isOut) {
                return `<tr><td>${esc(p.name)} <span class="muted">· yet to bat</span></td><td class="r" colspan="5">—</td></tr>`;
              }
              const r = st?.runs || 0;
              const b = st?.balls || 0;
              const sr = b > 0 ? Math.round((r / b) * 100) : 0;
              const statusText = isOut ? (st?.outText || 'out') : (p.id === inn.strikerId ? 'batting *' : 'not out');
              return `
                <tr>
                  <td>
                    <strong>${esc(p.name)}</strong>${p.id === inn.strikerId ? '*' : ''}
                    <div class="muted" style="font-size:11px;">${esc(statusText)}</div>
                  </td>
                  <td class="r"><strong>${r}</strong></td>
                  <td class="r">${b}</td>
                  <td class="r">${st?.fours || 0}</td>
                  <td class="r">${st?.sixes || 0}</td>
                  <td class="r">${sr}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="section-head">
          <span class="section-title">Bowling · Team ${inn.bowlingTeam}</span>
          <span class="muted num">Quota ${state.rules.maxOversPerBowler || 2} ov</span>
        </div>

        <table class="score-table">
          <thead>
            <tr>
              <th>Bowler</th>
              <th class="r">O</th>
              <th class="r">R</th>
              <th class="r">W</th>
              <th class="r">Econ</th>
            </tr>
          </thead>
          <tbody>
            ${bowlingSquad.map((p) => {
              const bs = inn.bowlingStats[p.id] || { balls: 0, runs: 0, wickets: 0 };
              const econ = bs.balls > 0 ? ((bs.runs / bs.balls) * 6).toFixed(1) : '0.0';
              const full = bs.balls >= maxQuotaBalls;
              return `
                <tr>
                  <td>
                    ${esc(p.name)} ${p.id === inn.bowlerId ? '<span class="badge badge-accent">bowling</span>' : ''}
                    ${full ? '<span class="badge badge-dark">quota</span>' : ''}
                  </td>
                  <td class="r">${formatOvers(bs.balls)}</td>
                  <td class="r">${bs.runs}</td>
                  <td class="r"><strong>${bs.wickets}</strong></td>
                  <td class="r">${econ}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ==================== TAB 3: PAY ==================== */
function attendanceWeight(p) {
  if (p.status === 'late' || p.status === 'left_early') return 0.6;
  return 1;
}

function attendanceLabel(p) {
  if (p.status === 'late') return 'Late';
  if (p.status === 'left_early') return 'Left early';
  return 'Full';
}

function computeSettlement() {
  const attendees = state.players.filter(isAvailable);
  const totalSpend = state.expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalWeight = attendees.reduce((sum, p) => sum + attendanceWeight(p), 0);

  const ledger = attendees.map((p) => {
    const paid = state.expenses
      .filter((e) => e.paidBy === p.id)
      .reduce((s, e) => s + Number(e.amount || 0), 0);
    const share = attendees.length === 0 ? 0 : (
      state.splitSettings.mode === 'equal'
        ? totalSpend / attendees.length
        : totalSpend * (attendanceWeight(p) / Math.max(0.1, totalWeight))
    );
    return {
      id: p.id,
      name: p.name,
      attendance: attendanceLabel(p),
      paid: Math.round(paid),
      share: Math.round(share),
      net: Math.round(paid - share),
    };
  });

  const debtors = ledger.filter((x) => x.net < -1).map((x) => ({ ...x, rem: -x.net })).sort((a, b) => b.rem - a.rem);
  const creditors = ledger.filter((x) => x.net > 1).map((x) => ({ ...x, rem: x.net })).sort((a, b) => b.rem - a.rem);
  const transfers = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amt = Math.min(debtors[i].rem, creditors[j].rem);
    if (amt > 0) {
      transfers.push({
        fromId: debtors[i].id,
        from: debtors[i].name,
        toId: creditors[j].id,
        to: creditors[j].name,
        amount: Math.round(amt),
      });
    }
    debtors[i].rem -= amt;
    creditors[j].rem -= amt;
    if (debtors[i].rem <= 1) i++;
    if (creditors[j].rem <= 1) j++;
  }

  const c = state.meta.currency;
  const actionMap = {};
  ledger.forEach((p) => {
    const outgoing = transfers.filter((t) => t.fromId === p.id);
    const incoming = transfers.filter((t) => t.toId === p.id);
    if (outgoing.length > 0) {
      actionMap[p.id] = outgoing.map((t) => `Pay ${t.to} ${c}${t.amount}`).join(', ');
    } else if (incoming.length > 0) {
      actionMap[p.id] = incoming.map((t) => `From ${t.from} ${c}${t.amount}`).join(', ');
    } else {
      actionMap[p.id] = 'Settled';
    }
  });

  return { attendees, totalSpend, ledger, transfers, actionMap };
}

function renderPay() {
  const { attendees, totalSpend, ledger, transfers, actionMap } = computeSettlement();
  const c = state.meta.currency;

  const me = attendees.find((p) => userProfile.name && p.name.toLowerCase() === userProfile.name.toLowerCase()) || attendees[0];
  const myOutgoing = me ? transfers.filter((t) => t.fromId === me.id) : [];
  const myIncoming = me ? transfers.filter((t) => t.toId === me.id) : [];

  let myBanner = 'All settled';
  if (me) {
    if (myOutgoing.length > 0) {
      myBanner = `${me.name}: Pay ${myOutgoing.map((t) => `${t.to} (${c}${t.amount})`).join(' & ')}`;
    } else if (myIncoming.length > 0) {
      myBanner = `${me.name}: Collect ${myIncoming.map((t) => `${c}${t.amount} from ${t.from}`).join(', ')}`;
    } else {
      myBanner = `${me.name}: Settled up`;
    }
  }

  return `
    <div class="dark-strip">
      <div class="strip-row">
        <div>
          <div class="muted num">${attendees.length} attendees</div>
          <div class="score-big num" style="margin-top:2px;">${esc(c)}${totalSpend}</div>
        </div>
        <button class="btn btn-sm btn-primary" id="btn-copy-settlement">Copy Summary</button>
      </div>
      <div class="strip-row" style="border-top:1px solid #2b2a2b; padding-top:10px;">
        <div class="seg-group">
          <button class="seg-btn ${state.splitSettings.mode === 'equal' ? 'active-accent' : ''}" data-split-mode="equal">Equal</button>
          <button class="seg-btn ${state.splitSettings.mode === 'prorated' ? 'active-accent' : ''}" data-split-mode="prorated">By Attendance</button>
        </div>
      </div>
    </div>

    <div class="notice-bar" style="margin-bottom:0;">
      <span>${esc(myBanner)}</span>
    </div>

    <div>
      <div class="section-head">
        <span class="section-title">Who Pays Whom</span>
      </div>
      ${transfers.length === 0 ? '<div class="muted">All settled</div>' : transfers.map((t) => {
        const settled = state.splitSettings.settledPlayerIds.includes(t.fromId);
        return `
          <div class="row-item">
            <div>
              <strong style="${settled ? 'text-decoration:line-through; color:var(--muted);' : ''}">
                ${esc(t.from)} → ${esc(t.to)}
              </strong>
              <div class="muted num">${esc(c)}${t.amount}</div>
            </div>
            <button class="btn btn-sm ${settled ? 'btn-primary' : ''}" data-toggle-settled="${t.fromId}">
              ${settled ? 'Paid' : 'Mark Paid'}
            </button>
          </div>
        `;
      }).join('')}
    </div>

    <div>
      <div class="section-head">
        <span class="section-title">Expenses</span>
      </div>
      ${state.expenses.length === 0 ? '<div class="muted">No expenses logged yet.</div>' : state.expenses.map((e) => `
        <div class="row-item">
          <div>
            <strong>${esc(e.title)}</strong>
            <div class="muted">${esc(playerName(e.paidBy))} · ${esc(e.category)}</div>
          </div>
          <strong class="num">${esc(c)}${e.amount}</strong>
        </div>
      `).join('')}
      <form id="form-add-expense" class="inline-form">
        <input class="input input-grow" name="title" placeholder="Drinks, water, snacks..." required />
        <input class="input" name="amount" type="number" placeholder="Amount" style="width:85px" required />
        <select class="select" name="paidBy">
          ${attendees.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}
        </select>
        <button class="btn btn-primary" type="submit" ${attendees.length === 0 ? 'disabled' : ''}>Add</button>
      </form>
    </div>

    <div>
      <div class="section-head">
        <span class="section-title">Per-Player Breakdown</span>
      </div>
      <table class="score-table">
        <thead>
          <tr>
            <th>Player</th>
            <th class="r">Share</th>
            <th class="r">Paid</th>
            <th>Pay / Collect</th>
          </tr>
        </thead>
        <tbody>
          ${ledger.map((l) => `
            <tr>
              <td>
                <strong>${esc(l.name)}</strong>
                <div class="muted" style="font-size:11px;">${esc(l.attendance)}</div>
              </td>
              <td class="r">${esc(c)}${l.share}</td>
              <td class="r">${esc(c)}${l.paid}</td>
              <td>
                <span class="badge ${l.net >= 0 ? 'badge-accent' : 'badge-dark'}">
                  ${esc(actionMap[l.id] || 'Settled')}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* ==================== EVENTS ==================== */
function bindEvents() {
  document.querySelectorAll('[data-gd-sub]').forEach((btn) => {
    btn.onclick = () => {
      gamedaySub = btn.dataset.gdSub;
      render();
    };
  });

  const toggleClockBtn = $('#btn-toggle-clock');
  if (toggleClockBtn) {
    toggleClockBtn.onclick = () => {
      slotTimerRunning = !slotTimerRunning;
      if (slotTimerRunning) {
        slotTimerHandle = setInterval(() => {
          if (slotTimerSeconds > 0) slotTimerSeconds--;
          const disp = $('#slot-clock-display');
          if (disp) disp.textContent = formatClock(slotTimerSeconds);
        }, 1000);
      } else clearInterval(slotTimerHandle);
      render();
    };
  }

  const alarmBtn = $('#btn-toggle-alarm');
  if (alarmBtn) {
    alarmBtn.onclick = () => {
      state.meta.alarm1HrEnabled = !state.meta.alarm1HrEnabled;
      saveState(`1-hr alarm ${state.meta.alarm1HrEnabled ? 'enabled' : 'disabled'}`);
    };
  }

  const testAlarmBtn = $('#btn-test-alarm');
  if (testAlarmBtn) {
    testAlarmBtn.onclick = async () => {
      const count = state.players.filter((p) => p.rsvp === 'in').length;
      const msg = `Reminder: ${state.meta.title} starts in 1 hr (${state.meta.slotStart}). ${count} players confirmed.`;
      if ('Notification' in window && Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') new Notification('PitchDay 1-Hr Alarm', { body: msg });
      }
      showToast(msg);
    };
  }

  document.querySelectorAll('[data-rsvp]').forEach((btn) => {
    btn.onclick = () => {
      const [id, rsvp] = btn.dataset.rsvp.split(':');
      const p = state.players.find((x) => x.id === id);
      if (p) {
        p.rsvp = rsvp;
        if (rsvp === 'out') p.checkedIn = false;
        else if (rsvp === 'in') p.checkedIn = true;
        syncRosterConsistency(p);
        saveState();
      }
    };
  });

  document.querySelectorAll('[data-checkin]').forEach((btn) => {
    btn.onclick = () => {
      const [id, status] = btn.dataset.checkin.split(':');
      const p = state.players.find((x) => x.id === id);
      if (p) {
        p.status = status;
        p.checkedIn = status !== 'absent';
        syncRosterConsistency(p);
        saveState();
      }
    };
  });

  document.querySelectorAll('[data-call-player]').forEach((link) => {
    link.onclick = (e) => {
      const p = state.players.find((x) => x.id === link.dataset.callPlayer);
      if (!p || !p.phone) {
        e.preventDefault();
        showToast(`No phone number saved for ${p ? p.name : 'player'}`);
      }
    };
  });

  const addPlayerForm = $('#form-add-player');
  if (addPlayerForm) {
    addPlayerForm.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(addPlayerForm);
      const newPlayer = {
        id: 'p' + Date.now(),
        name: fd.get('name').trim(),
        phone: (fd.get('phone') || '').trim(),
        role: fd.get('role'),
        rsvp: 'in',
        checkedIn: true,
        status: 'active',
        team: null,
        isCaptain: false,
      };
      state.players.push(newPlayer);
      syncRosterConsistency(newPlayer);
      saveState('Player added');
    };
  }

  const copyInviteBtn = $('#btn-copy-invite');
  if (copyInviteBtn) {
    copyInviteBtn.onclick = () => {
      const turf = state.turfOptions.find((t) => t.selected);
      const count = state.players.filter((p) => p.rsvp === 'in').length;
      const link = `${location.origin}/?room=${currentRoomCode}`;
      const text = `${state.meta.title} · ${turf ? turf.name : 'TBD'} (${state.meta.slotStart}–${state.meta.slotEnd}) · ${count}/${state.meta.minPlayers} in\nRoom Code: ${currentRoomCode}\n${link}`;
      navigator.clipboard?.writeText(text);
      showToast(`Invite & code ${currentRoomCode} copied`);
    };
  }

  document.querySelectorAll('[data-vote-turf]').forEach((btn) => {
    btn.onclick = () => {
      const t = state.turfOptions.find((x) => x.id === btn.dataset.voteTurf);
      if (t) {
        t.votes.push('v' + Date.now());
        saveState();
      }
    };
  });

  document.querySelectorAll('[data-lock-turf]').forEach((btn) => {
    btn.onclick = () => {
      state.turfOptions.forEach((t) => (t.selected = t.id === btn.dataset.lockTurf));
      const locked = state.turfOptions.find((t) => t.selected);
      const turfExp = state.expenses.find((e) => e.category === 'Turf');
      if (locked && turfExp) {
        turfExp.title = `Turf Booking (${locked.name})`;
        turfExp.amount = locked.price;
      }
      saveState(`Locked ${locked.name}`);
    };
  });

  document.querySelectorAll('[data-edit-turf]').forEach((btn) => {
    btn.onclick = () => { editingTurfId = btn.dataset.editTurf; render(); };
  });
  const cancelTurf = $('#btn-cancel-turf');
  if (cancelTurf) cancelTurf.onclick = () => { editingTurfId = null; render(); };
  document.querySelectorAll('[data-save-turf]').forEach((form) => {
    form.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const t = state.turfOptions.find((x) => x.id === form.dataset.saveTurf);
      if (t) {
        t.name = fd.get('name').trim();
        t.time = fd.get('time').trim();
        t.price = Number(fd.get('price'));
        if (t.selected) {
          const turfExp = state.expenses.find((ex) => ex.category === 'Turf');
          if (turfExp) { turfExp.title = `Turf Booking (${t.name})`; turfExp.amount = t.price; }
        }
      }
      editingTurfId = null;
      saveState('Turf updated');
    };
  });
  document.querySelectorAll('[data-del-turf]').forEach((btn) => {
    btn.onclick = () => {
      state.turfOptions = state.turfOptions.filter((x) => x.id !== btn.dataset.delTurf);
      saveState('Turf removed');
    };
  });

  document.querySelectorAll('[data-edit-gear]').forEach((btn) => {
    btn.onclick = () => { editingGearId = btn.dataset.editGear; render(); };
  });
  const cancelGear = $('#btn-cancel-gear');
  if (cancelGear) cancelGear.onclick = () => { editingGearId = null; render(); };
  document.querySelectorAll('[data-save-gear]').forEach((form) => {
    form.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const g = state.gear.find((x) => x.id === form.dataset.saveGear);
      if (g) {
        g.item = fd.get('item').trim();
        g.assignee = fd.get('assignee').trim();
        g.cost = Number(fd.get('cost') || 0);
      }
      editingGearId = null;
      saveState('Gear updated');
    };
  });
  document.querySelectorAll('[data-del-gear]').forEach((btn) => {
    btn.onclick = () => {
      state.gear = state.gear.filter((x) => x.id !== btn.dataset.delGear);
      saveState('Gear removed');
    };
  });

  document.querySelectorAll('[data-toggle-gear]').forEach((chk) => {
    chk.onchange = () => {
      const g = state.gear.find((x) => x.id === chk.dataset.toggleGear);
      if (g) {
        g.done = chk.checked;
        saveState();
      }
    };
  });

  const addTurfForm = $('#form-add-turf');
  if (addTurfForm) {
    addTurfForm.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(addTurfForm);
      state.turfOptions.push({
        id: 't' + Date.now(),
        name: fd.get('name').trim(),
        time: fd.get('time').trim(),
        price: Number(fd.get('price')),
        votes: [],
        selected: false,
      });
      saveState();
    };
  }

  const addGearForm = $('#form-add-gear');
  if (addGearForm) {
    addGearForm.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(addGearForm);
      state.gear.push({
        id: 'g' + Date.now(),
        item: fd.get('item').trim(),
        assignee: fd.get('assignee').trim(),
        cost: Number(fd.get('cost') || 0),
        done: false,
      });
      saveState();
    };
  }

  const balanceBtn = $('#btn-balance-teams');
  if (balanceBtn) {
    balanceBtn.onclick = () => {
      if (state.rules.locked) return;
      balanceAvailableTeams();
      saveState('Teams balanced');
    };
  }

  document.querySelectorAll('[data-captain]').forEach((btn) => {
    btn.onclick = () => {
      if (state.rules.locked) return;
      const target = state.players.find((x) => x.id === btn.dataset.captain);
      if (!target) return;
      state.players.forEach((p) => {
        if (p.team === target.team) p.isCaptain = p.id === target.id;
      });
      saveState(`${target.name} set as Team ${target.team} captain`);
    };
  });

  document.querySelectorAll('[data-swap-team]').forEach((btn) => {
    btn.onclick = () => {
      if (state.rules.locked) return;
      const p = state.players.find((x) => x.id === btn.dataset.swapTeam);
      if (p) {
        p.team = p.team === 'A' ? 'B' : 'A';
        p.isCaptain = false;
        saveState();
      }
    };
  });

  const flipTossBtn = $('#btn-flip-toss');
  if (flipTossBtn) {
    flipTossBtn.onclick = () => {
      if (state.rules.locked) return;
      state.toss.winner = Math.random() < 0.5 ? 'Team A' : 'Team B';
      state.toss.decision = Math.random() < 0.5 ? 'Bat' : 'Bowl';
      saveState(`${state.toss.winner} won toss (${state.toss.decision})`);
    };
  }

  const lockRulesBtn = $('#btn-lock-rules');
  if (lockRulesBtn) {
    lockRulesBtn.onclick = () => {
      state.rules.locked = !state.rules.locked;
      saveState(state.rules.locked ? 'Match setup locked' : 'Match setup unlocked');
    };
  }

  const qMinus = $('#btn-quota-minus');
  const qPlus = $('#btn-quota-plus');
  if (qMinus) qMinus.onclick = () => { if (!state.rules.locked) { state.rules.maxOversPerBowler = Math.max(1, (state.rules.maxOversPerBowler || 2) - 1); saveState(); } };
  if (qPlus) qPlus.onclick = () => { if (!state.rules.locked) { state.rules.maxOversPerBowler = (state.rules.maxOversPerBowler || 2) + 1; saveState(); } };

  document.querySelectorAll('[data-rule]').forEach((btn) => {
    btn.onclick = () => {
      if (state.rules.locked) return;
      const k = btn.dataset.rule;
      state.rules[k] = !state.rules[k];
      saveState();
    };
  });

  // Matches & Scorer
  const selMatch = $('#select-match');
  if (selMatch) {
    selMatch.onchange = () => {
      state.series.currentMatchIndex = Number(selMatch.value);
      saveState();
    };
  }

  const newMatchBtn = $('#btn-new-match');
  if (newMatchBtn) {
    newMatchBtn.onclick = () => {
      const num = state.series.matches.length + 1;
      const teamA = state.players.filter((p) => isAvailable(p) && (p.team === 'A' || p.team === 'J'));
      const teamB = state.players.filter((p) => isAvailable(p) && (p.team === 'B' || p.team === 'J'));
      state.series.matches.push({
        id: 'm' + Date.now(),
        name: `Match ${num}`,
        oversLimit: state.rules.oversPerMatch,
        status: 'live',
        winner: null,
        currentInnings: 0,
        innings: [
          { battingTeam: 'A', bowlingTeam: 'B', runs: 0, wickets: 0, balls: 0, extras: { wd: 0, nb: 0 }, strikerId: teamA[0]?.id || '', nonStrikerId: teamA[1]?.id || '', bowlerId: teamB[0]?.id || '', outIds: [], battingStats: {}, bowlingStats: {}, ballLog: [] },
          { battingTeam: 'B', bowlingTeam: 'A', runs: 0, wickets: 0, balls: 0, extras: { wd: 0, nb: 0 }, strikerId: teamB[0]?.id || '', nonStrikerId: teamB[1]?.id || '', bowlerId: teamA[0]?.id || '', outIds: [], battingStats: {}, bowlingStats: {}, ballLog: [] },
        ],
      });
      state.series.currentMatchIndex = state.series.matches.length - 1;
      saveState(`Started Match ${num}`);
    };
  }

  const match = state.series.matches[state.series.currentMatchIndex];
  const inn = match?.innings[match.currentInnings];

  if (inn) {
    ensureInningsMaps(inn);
    const selStriker = $('#sel-striker');
    const selNonStriker = $('#sel-nonstriker');
    const selBowler = $('#sel-bowler');
    if (selStriker) selStriker.onchange = () => { inn.strikerId = selStriker.value; saveState(); };
    if (selNonStriker) selNonStriker.onchange = () => { inn.nonStrikerId = selNonStriker.value; saveState(); };
    if (selBowler) selBowler.onchange = () => { inn.bowlerId = selBowler.value; saveState(); };

    const swapStrikeBtn = $('#btn-swap-strike');
    if (swapStrikeBtn) {
      swapStrikeBtn.onclick = () => {
        if (!inn.nonStrikerId) return;
        [inn.strikerId, inn.nonStrikerId] = [inn.nonStrikerId, inn.strikerId];
        saveState();
      };
    }

    document.querySelectorAll('[data-ball]').forEach((btn) => {
      btn.onclick = () => {
        const runs = Number(btn.dataset.ball);
        const batterId = inn.strikerId;
        const bowlerId = inn.bowlerId;
        if (!batterId || !bowlerId) return showToast('Select batter and bowler');

        if (!inn.battingStats[batterId]) inn.battingStats[batterId] = { runs: 0, balls: 0, fours: 0, sixes: 0, outText: 'not out' };
        if (!inn.bowlingStats[bowlerId]) inn.bowlingStats[bowlerId] = { balls: 0, runs: 0, wickets: 0 };

        inn.battingStats[batterId].runs += runs;
        inn.battingStats[batterId].balls += 1;
        if (runs === 4) inn.battingStats[batterId].fours += 1;
        if (runs === 6) inn.battingStats[batterId].sixes += 1;

        inn.bowlingStats[bowlerId].balls += 1;
        inn.bowlingStats[bowlerId].runs += runs;

        let swap = runs % 2 === 1;
        inn.runs += runs;
        inn.balls += 1;
        if (inn.balls % 6 === 0) swap = !swap;
        if (swap && inn.nonStrikerId) [inn.strikerId, inn.nonStrikerId] = [inn.nonStrikerId, inn.strikerId];
        else swap = false;

        inn.ballLog.push({ label: String(runs), runs, extra: null, wicket: false, swap, batterId, bowlerId });
        saveState(inn.balls % 6 === 0 ? 'Over complete' : undefined);
      };
    });

    document.querySelectorAll('[data-extra]').forEach((btn) => {
      btn.onclick = () => {
        const extra = btn.dataset.extra;
        const bowlerId = inn.bowlerId;
        if (bowlerId) {
          if (!inn.bowlingStats[bowlerId]) inn.bowlingStats[bowlerId] = { balls: 0, runs: 0, wickets: 0 };
          inn.bowlingStats[bowlerId].runs += 1;
        }
        if (extra === 'wide') inn.extras.wd = (inn.extras.wd || 0) + 1;
        else inn.extras.nb = (inn.extras.nb || 0) + 1;

        inn.runs += 1;
        inn.ballLog.push({ label: extra === 'wide' ? 'Wd' : 'NB', runs: 1, extra, wicket: false, swap: false, batterId: inn.strikerId, bowlerId });
        saveState();
      };
    });

    document.querySelectorAll('[data-wicket]').forEach((btn) => {
      btn.onclick = () => {
        const batterId = inn.strikerId;
        const bowlerId = inn.bowlerId;
        if (!batterId || !bowlerId) return;

        if (!inn.battingStats[batterId]) inn.battingStats[batterId] = { runs: 0, balls: 0, fours: 0, sixes: 0, outText: 'not out' };
        if (!inn.bowlingStats[bowlerId]) inn.bowlingStats[bowlerId] = { balls: 0, runs: 0, wickets: 0 };

        inn.battingStats[batterId].balls += 1;
        inn.battingStats[batterId].outText = `b ${playerName(bowlerId)}`;
        inn.bowlingStats[bowlerId].balls += 1;
        inn.bowlingStats[bowlerId].wickets += 1;

        inn.wickets += 1;
        inn.balls += 1;
        if (!inn.outIds.includes(batterId)) inn.outIds.push(batterId);

        const battingSquad = state.players.filter((p) => isAvailable(p) && (p.team === inn.battingTeam || p.team === 'J'));
        const nextBatter = battingSquad.find((p) => !inn.outIds.includes(p.id) && p.id !== inn.nonStrikerId);
        inn.strikerId = nextBatter ? nextBatter.id : '';

        const swap = inn.balls % 6 === 0 && inn.strikerId && inn.nonStrikerId;
        if (swap) [inn.strikerId, inn.nonStrikerId] = [inn.nonStrikerId, inn.strikerId];

        inn.ballLog.push({ label: 'W', runs: 0, extra: null, wicket: true, swap, batterId, bowlerId });
        saveState(`${playerName(batterId)} out`);
      };
    });

    const undoBtn = $('#btn-undo-ball');
    if (undoBtn) {
      undoBtn.onclick = () => {
        const last = inn.ballLog.pop();
        if (!last) return;
        inn.runs = Math.max(0, inn.runs - last.runs);
        if (!last.extra) inn.balls = Math.max(0, inn.balls - 1);

        if (last.extra === 'wide') inn.extras.wd = Math.max(0, (inn.extras.wd || 0) - 1);
        if (last.extra === 'noball') inn.extras.nb = Math.max(0, (inn.extras.nb || 0) - 1);

        if (last.bowlerId && inn.bowlingStats[last.bowlerId]) {
          const bs = inn.bowlingStats[last.bowlerId];
          bs.runs = Math.max(0, bs.runs - last.runs);
          if (!last.extra) bs.balls = Math.max(0, bs.balls - 1);
          if (last.wicket) bs.wickets = Math.max(0, bs.wickets - 1);
        }

        if (last.batterId && inn.battingStats[last.batterId] && !last.extra) {
          const bat = inn.battingStats[last.batterId];
          bat.runs = Math.max(0, bat.runs - last.runs);
          bat.balls = Math.max(0, bat.balls - 1);
          if (last.runs === 4) bat.fours = Math.max(0, bat.fours - 1);
          if (last.runs === 6) bat.sixes = Math.max(0, bat.sixes - 1);
          if (last.wicket) bat.outText = 'not out';
        }

        if (last.wicket) {
          inn.wickets = Math.max(0, inn.wickets - 1);
          inn.outIds = inn.outIds.filter((id) => id !== last.batterId);
          inn.strikerId = last.batterId;
        } else if (last.swap && inn.nonStrikerId) {
          [inn.strikerId, inn.nonStrikerId] = [inn.nonStrikerId, inn.strikerId];
        }

        saveState('Undone');
      };
    }

    const doSwitchOrEnd = () => {
      if (match.currentInnings === 0) {
        match.currentInnings = 1;
        saveState('Started Innings 2');
      } else {
        const r0 = match.innings[0].runs;
        const r1 = match.innings[1].runs;
        match.status = 'completed';
        match.winner = r0 > r1 ? match.innings[0].battingTeam : r1 > r0 ? match.innings[1].battingTeam : 'Tie';
        saveState(`${match.name} finished`);
      }
    };

    const switchInnBtn = $('#btn-switch-innings');
    if (switchInnBtn) switchInnBtn.onclick = () => { match.currentInnings = match.currentInnings === 0 ? 1 : 0; saveState(); };

    const finishMatchBtn = $('#btn-finish-match');
    if (finishMatchBtn) {
      finishMatchBtn.onclick = () => {
        const r0 = match.innings[0].runs;
        const r1 = match.innings[1].runs;
        match.status = 'completed';
        match.winner = r0 > r1 ? match.innings[0].battingTeam : r1 > r0 ? match.innings[1].battingTeam : 'Tie';
        saveState(`${match.name} finished`);
      };
    }

    const bannerSwitch = $('#btn-banner-switch');
    if (bannerSwitch) bannerSwitch.onclick = doSwitchOrEnd;

    const bannerEnd = $('#btn-banner-end');
    if (bannerEnd && finishMatchBtn) bannerEnd.onclick = finishMatchBtn.onclick;
  }

  // Pay
  document.querySelectorAll('[data-split-mode]').forEach((btn) => {
    btn.onclick = () => {
      state.splitSettings.mode = btn.dataset.splitMode;
      saveState();
    };
  });

  const addExpForm = $('#form-add-expense');
  if (addExpForm) {
    addExpForm.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(addExpForm);
      state.expenses.push({
        id: 'e' + Date.now(),
        title: fd.get('title').trim(),
        category: 'Refreshments',
        amount: Number(fd.get('amount')),
        paidBy: fd.get('paidBy'),
        splitMode: 'all_attended',
      });
      saveState('Expense added');
    };
  }

  document.querySelectorAll('[data-toggle-settled]').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.toggleSettled;
      const list = state.splitSettings.settledPlayerIds;
      const idx = list.indexOf(id);
      if (idx >= 0) list.splice(idx, 1);
      else list.push(id);
      saveState();
    };
  });

  const copySettleBtn = $('#btn-copy-settlement');
  if (copySettleBtn) {
    copySettleBtn.onclick = () => {
      const { totalSpend, transfers } = computeSettlement();
      const c = state.meta.currency;
      const lines = [
        `${state.meta.title} · Total ${c}${totalSpend}`,
        ...transfers.map((t) => `${t.from} → ${t.to}: ${c}${t.amount}`),
        `UPI: ${userProfile.upiId || 'Ask host'}`,
      ];
      navigator.clipboard?.writeText(lines.join('\n'));
      showToast('Summary copied');
    };
  }
}

/* ==================== HEADER, BOTTOM TABS & SIDE DRAWER ==================== */
$('#btn-room-pill').onclick = () => {
  navigator.clipboard?.writeText(currentRoomCode);
  showToast(`Room code ${currentRoomCode} copied`);
};

document.querySelectorAll('.tab-item').forEach((btn) => {
  btn.onclick = () => {
    activeTab = btn.dataset.tab;
    render();
  };
});

function renderDrawerBody() {
  document.querySelectorAll('.drawer-tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.drawer === drawerTab);
  });
  const body = $('#drawer-body');
  if (drawerTab === 'profile') {
    body.innerHTML = `
      <form id="form-profile" style="display:flex; flex-direction:column; gap:12px;">
        <div class="field-group">
          <label class="field-label">Name</label>
          <input class="input" name="name" value="${esc(userProfile.name)}" required />
        </div>
        <div class="field-group">
          <label class="field-label">Phone</label>
          <input class="input" name="phone" value="${esc(userProfile.phone)}" />
        </div>
        <div class="field-group">
          <label class="field-label">Role</label>
          <select class="select" name="role">
            ${['All-rounder', 'Batsman', 'Bowler'].map((r) => `<option ${userProfile.role === r ? 'selected' : ''}>${r}</option>`).join('')}
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">UPI ID</label>
          <input class="input" name="upiId" value="${esc(userProfile.upiId)}" />
        </div>
        <button class="btn btn-primary" type="submit">Save</button>
      </form>
      ${currentRoomCode ? `
        <hr style="border:none; border-top:1px solid var(--hairline);" />
        <button class="btn" id="btn-leave-room">Switch / Leave Room (${esc(currentRoomCode)})</button>
      ` : ''}
    `;
    $('#form-profile').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      userProfile = {
        name: fd.get('name').trim(),
        phone: (fd.get('phone') || '').trim(),
        role: fd.get('role'),
        upiId: (fd.get('upiId') || '').trim(),
      };
      saveLocalProfile();
      showToast('Profile saved');
      render();
    };
    const leaveBtn = $('#btn-leave-room');
    if (leaveBtn) leaveBtn.onclick = leaveRoom;
  } else if (drawerTab === 'settings') {
    if (!state) {
      body.innerHTML = '<div class="muted">Join or host a room to edit session settings.</div>';
      return;
    }
    body.innerHTML = `
      <form id="form-settings" style="display:flex; flex-direction:column; gap:12px;">
        <div class="field-group">
          <label class="field-label">Session Title</label>
          <input class="input" name="title" value="${esc(state.meta.title)}" required />
        </div>
        <div class="split-2" style="gap:10px;">
          <div class="field-group">
            <label class="field-label">Start</label>
            <input class="input" name="slotStart" value="${esc(state.meta.slotStart)}" />
          </div>
          <div class="field-group">
            <label class="field-label">End</label>
            <input class="input" name="slotEnd" value="${esc(state.meta.slotEnd)}" />
          </div>
        </div>
        <div class="split-2" style="gap:10px;">
          <div class="field-group">
            <label class="field-label">Min Players</label>
            <input class="input" name="minPlayers" type="number" value="${state.meta.minPlayers}" />
          </div>
          <div class="field-group">
            <label class="field-label">Currency</label>
            <input class="input" name="currency" value="${esc(state.meta.currency)}" />
          </div>
        </div>
        <button class="btn btn-primary" type="submit">Save</button>
      </form>
      <hr style="border:none; border-top:1px solid var(--hairline);" />
      <button class="btn" id="btn-reset-demo">Reset Room Data</button>
    `;
    $('#form-settings').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      state.meta.title = fd.get('title').trim();
      state.meta.slotStart = fd.get('slotStart').trim();
      state.meta.slotEnd = fd.get('slotEnd').trim();
      state.meta.minPlayers = Number(fd.get('minPlayers'));
      state.meta.currency = fd.get('currency').trim() || '₹';
      saveState('Settings saved');
    };
    $('#btn-reset-demo').onclick = async () => {
      const res = await apiCall(`/api/rooms/${currentRoomCode}/reset`, { method: 'POST' });
      const data = await res.json();
      state = data.room;
      render();
      showToast('Room reset');
    };
  } else {
    body.innerHTML = `
      <form id="form-support" style="display:flex; flex-direction:column; gap:10px;">
        <label class="field-label">Send feedback or report an issue</label>
        <textarea class="input" name="message" rows="4" placeholder="Type your message..." required></textarea>
        <button class="btn btn-primary" type="submit">Send</button>
      </form>
    `;
    $('#form-support').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const res = await apiCall('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: fd.get('message') }),
      });
      const data = await res.json();
      $('#drawer-backdrop').classList.add('hidden');
      showToast(`Ticket ${data.ticketId} sent`);
    };
  }
}

$('#btn-menu-drawer').onclick = () => {
  $('#drawer-backdrop').classList.remove('hidden');
  renderDrawerBody();
};
$('#drawer-close').onclick = () => $('#drawer-backdrop').classList.add('hidden');
$('#drawer-backdrop').onclick = (e) => {
  if (e.target === $('#drawer-backdrop')) $('#drawer-backdrop').classList.add('hidden');
};
document.querySelectorAll('.drawer-tab').forEach((btn) => {
  btn.onclick = () => {
    drawerTab = btn.dataset.drawer;
    renderDrawerBody();
  };
});

// Boot: check ?room=CODE query param or saved room in localStorage
(async function boot() {
  const params = new URLSearchParams(location.search);
  const urlRoom = params.get('room');
  if (urlRoom) {
    await enterRoom(urlRoom, false);
  } else if (currentRoomCode) {
    await enterRoom(currentRoomCode, false);
  } else {
    render();
  }
})();
