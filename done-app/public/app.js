// ---------- state ----------
let TOKEN = localStorage.getItem('done_token') || null;
let CURRENT_USER = null;
let SERVICES = [];
let SERVICES_BY_KEY = {};
let CATEGORIES = [];
let authMode = 'login';
let activeDetailKey = null;
let bookingsCache = [];

const ICON_COLORS = ['c-amber', 'c-green', 'c-blue', 'c-rose', 'c-purple', 'c-teal', 'c-gold', 'c-slate'];
function colorFor(key) {
  let h = 0;
  for (const c of key) h += c.charCodeAt(0);
  return ICON_COLORS[h % ICON_COLORS.length];
}

// ---------- API helper ----------
async function api(path, method = 'GET', body) {
  const headers = { 'Content-Type': 'application/json' };
  if (TOKEN) headers['Authorization'] = 'Bearer ' + TOKEN;
  const res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  let data = {};
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

// ---------- init ----------
async function init() {
  const clock = document.getElementById('clock');
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  try {
    const catRes = await api('/api/categories');
    CATEGORIES = catRes.categories;
    const svcRes = await api('/api/services');
    SERVICES = svcRes.services;
    SERVICES_BY_KEY = Object.fromEntries(SERVICES.map(s => [s.key, s]));
  } catch (e) {
    showToast('Could not reach the server. Is it running?', true);
    return;
  }

  buildFilterTabs();
  buildHomeSections();
  buildPlusSections();
  buildStarRow();

  if (TOKEN) {
    try {
      const me = await api('/api/me');
      CURRENT_USER = me.user;
      showApp();
    } catch (e) {
      TOKEN = null;
      localStorage.removeItem('done_token');
      showAuth();
    }
  } else {
    showAuth();
  }
}

function showAuth() {
  document.getElementById('authscreen').style.display = 'block';
  document.getElementById('mainapp').style.display = 'none';
  document.getElementById('navbar').style.display = 'none';
}

function showApp() {
  document.getElementById('authscreen').style.display = 'none';
  document.getElementById('mainapp').style.display = 'block';
  document.getElementById('navbar').style.display = 'flex';
  const firstName = (CURRENT_USER.name || '').split(' ')[0] || 'there';
  document.getElementById('home-greet-name').textContent = firstName;
  document.getElementById('concierge-greet-name').textContent = firstName;
  document.getElementById('profile-name').textContent = CURRENT_USER.name;
  document.getElementById('profile-email').textContent = CURRENT_USER.email;
  document.getElementById('profile-avatar').textContent = (CURRENT_USER.name || '?').trim()[0].toUpperCase();
  showTab('home');
}

// ---------- auth ----------
function setAuthMode(mode) {
  authMode = mode;
  document.getElementById('tab-login').classList.toggle('active', mode === 'login');
  document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');
  document.getElementById('signup-fields').style.display = mode === 'signup' ? 'block' : 'none';
  document.getElementById('auth-submit').textContent = mode === 'signup' ? 'Create account' : 'Log in';
  document.getElementById('auth-hint').innerHTML = mode === 'signup'
    ? 'Already have an account? <a onclick="setAuthMode(\'login\')">Log in</a>'
    : 'New to Done? <a onclick="setAuthMode(\'signup\')">Create an account</a>';
  document.getElementById('auth-error').textContent = '';
}

async function submitAuth() {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const errEl = document.getElementById('auth-error');
  errEl.textContent = '';
  try {
    let res;
    if (authMode === 'signup') {
      const name = document.getElementById('su-name').value.trim();
      const phone = document.getElementById('su-phone').value.trim();
      if (!name) { errEl.textContent = 'Please enter your name.'; return; }
      res = await api('/api/auth/signup', 'POST', { name, email, phone, password });
    } else {
      res = await api('/api/auth/login', 'POST', { email, password });
    }
    TOKEN = res.token;
    CURRENT_USER = res.user;
    localStorage.setItem('done_token', TOKEN);
    showApp();
  } catch (e) {
    errEl.textContent = e.message;
  }
}

async function logout() {
  try { await api('/api/auth/logout', 'POST'); } catch (e) {}
  TOKEN = null;
  CURRENT_USER = null;
  localStorage.removeItem('done_token');
  showAuth();
}

// ---------- home ----------
const HOME_QUICK_KEYS = ['cleaning', 'plumbing', 'electric', 'driver', 'beauty', 'chef', 'petcare'];
const HOME_POPULAR = [
  { key: 'physician', proName: 'Dr. Rana Saleh', tag: 'Physician' },
  { key: 'massage', proName: 'Layla H.', tag: 'Massage' },
  { key: 'electric', proName: 'Omar F.', tag: 'Electrician' },
];

function iconHtml(key) {
  const s = SERVICES_BY_KEY[key];
  return s ? `<i class="ti ${s.icon}"></i>` : '<i class="ti ti-sparkles"></i>';
}

function buildHomeSections() {
  const grid = document.getElementById('home-catgrid');
  grid.innerHTML = HOME_QUICK_KEYS.map(key => {
    const s = SERVICES_BY_KEY[key];
    if (!s) return '';
    return `<div class="catitem" onclick="openDetail('${key}')"><div class="icn ${colorFor(key)}">${iconHtml(key)}</div><span>${s.title.split(' ').slice(0, 2).join(' ')}</span></div>`;
  }).join('') + `<div class="catitem" onclick="showTab('services')"><div class="icn c-purple"><i class="ti ti-dots"></i></div><span>View all</span></div>`;

  const pop = document.getElementById('home-popular');
  pop.innerHTML = HOME_POPULAR.map(p => {
    const s = SERVICES_BY_KEY[p.key];
    if (!s) return '';
    return `<div class="procard" onclick="openDetail('${p.key}')"><div class="avatar">${iconHtml(p.key)}</div><h3>${p.proName}</h3><div class="meta">★ ${s.rating.toFixed(1)} · ${p.tag}</div></div>`;
  }).join('');
}

function buildPlusSections() {
  const vipServices = SERVICES.filter(s => s.category === 'vip');
  const scroll = document.getElementById('plus-scroll');
  scroll.innerHTML = vipServices.slice(0, 4).map(s =>
    `<div class="procard" onclick="openDetail('${s.key}')"><div class="avatar">${iconHtml(s.key)}</div><h3>${s.title}</h3><div class="meta">${s.priceLabel}</div></div>`
  ).join('');
  const cards = document.getElementById('plus-cards');
  cards.innerHTML = vipServices.slice(4).map(s => serviceCardHtml(s)).join('');
}

function serviceCardHtml(s) {
  return `<div class="servicecard" onclick="openDetail('${s.key}')">
    <div class="thumb"><i class="ti ${s.icon}"></i></div>
    <div class="info"><h3>${s.title}</h3>
      <div class="meta"><span>★ ${s.rating.toFixed(1)} (${s.reviews})</span><span class="price">${s.priceLabel}</span></div>
    </div>
  </div>`;
}

// ---------- tabs / nav ----------
function showTab(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.navitem').forEach(n => n.classList.remove('active'));
  const navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');
  document.getElementById('detailview').classList.remove('active');
  document.getElementById('bookform').classList.remove('active');
  if (id === 'bookings') renderBookings();
  if (id === 'profile') fillProfileFields();
}

// ---------- services tab ----------
function buildFilterTabs() {
  const wrap = document.getElementById('filtertabs');
  const browsable = CATEGORIES.filter(c => c.id !== 'vip');
  wrap.innerHTML = browsable.map((c, i) =>
    `<div class="filtertab ${i === 0 ? 'active' : ''}" data-cat="${c.id}" onclick="setServiceCategory('${c.id}', this)">${c.label}</div>`
  ).join('');
  currentCategory = browsable[0].id;
  renderServiceResults();
}
let currentCategory = 'home';
function setServiceCategory(id, el) {
  currentCategory = id;
  document.querySelectorAll('.filtertab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('service-search').value = '';
  renderServiceResults();
}

function renderServiceResults() {
  const q = document.getElementById('service-search').value.trim().toLowerCase();
  const results = document.getElementById('service-results');
  let list;
  if (q) {
    list = SERVICES.filter(s => s.category !== 'vip' && (s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)));
  } else {
    list = SERVICES.filter(s => s.category === currentCategory);
  }
  if (list.length === 0) {
    results.innerHTML = `<div class="emptystate">No services found.</div>`;
    return;
  }
  results.innerHTML = `<div class="section-label" style="margin-top:0;">${q ? 'Search results' : 'Featured'}</div>` +
    list.map(s => serviceCardHtml(s)).join('');
}

// ---------- detail overlay ----------
function openDetail(key) {
  const s = SERVICES_BY_KEY[key];
  if (!s) return;
  activeDetailKey = key;
  document.getElementById('detail-icon').innerHTML = `<i class="ti ${s.icon}"></i>`;
  document.getElementById('detail-title').textContent = s.title;
  document.getElementById('detail-rating').textContent = `${s.rating.toFixed(1)} (${s.reviews} reviews)`;
  document.getElementById('detail-desc').textContent = s.desc;
  document.getElementById('detail-price').innerHTML = `${s.priceLabel}<span>starting at</span>`;
  document.getElementById('detail-bookbtn').onclick = () => openBookForm(key);
  document.getElementById('detailview').classList.add('active');
}
function closeDetail() {
  document.getElementById('detailview').classList.remove('active');
}

// ---------- booking form ----------
function openBookForm(key) {
  const s = SERVICES_BY_KEY[key];
  if (!s) return;
  if (!TOKEN) { showToast('Please log in to book a service.', true); return; }
  activeDetailKey = key;
  document.getElementById('bookform-service-title').textContent = s.title;
  document.getElementById('bf-price').textContent = s.priceLabel;
  document.getElementById('bf-date').value = '';
  document.getElementById('bf-time').value = '';
  document.getElementById('bf-address').value = '';
  document.getElementById('bf-notes').value = '';
  document.getElementById('bf-error').textContent = '';
  document.getElementById('bookform').classList.add('active');
}
function closeBookForm() {
  document.getElementById('bookform').classList.remove('active');
}
async function submitBooking() {
  const date = document.getElementById('bf-date').value;
  const time = document.getElementById('bf-time').value;
  const address = document.getElementById('bf-address').value.trim();
  const notes = document.getElementById('bf-notes').value.trim();
  const errEl = document.getElementById('bf-error');
  if (!date || !time || !address) {
    errEl.textContent = 'Please fill in date, time, and address.';
    return;
  }
  try {
    await api('/api/bookings', 'POST', { serviceKey: activeDetailKey, date, time, address, notes });
    closeBookForm();
    closeDetail();
    showToast('Booking confirmed — you can track it under Bookings.');
    showTab('bookings');
  } catch (e) {
    errEl.textContent = e.message;
  }
}

// ---------- bookings tab ----------
async function renderBookings() {
  const list = document.getElementById('bookings-list');
  list.innerHTML = '<div class="spinner"></div>';
  try {
    const res = await api('/api/bookings');
    bookingsCache = res.bookings;
  } catch (e) {
    list.innerHTML = `<div class="emptystate">${e.message}</div>`;
    return;
  }
  if (bookingsCache.length === 0) {
    list.innerHTML = `<div class="emptystate">No bookings yet — browse services to book your first one.</div>`;
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookingsCache.filter(b => ['pending', 'confirmed', 'en_route'].includes(b.status) && b.date >= today);
  const past = bookingsCache.filter(b => !upcoming.includes(b));

  let html = '';
  if (upcoming.length) html += `<div class="section-label" style="margin-top:0;">Upcoming</div>` + upcoming.map(bookingCardHtml).join('');
  if (past.length) html += `<div class="section-label">Past</div>` + past.map(bookingCardHtml).join('');
  list.innerHTML = html;
}

function bookingCardHtml(b) {
  const canCancel = ['pending', 'confirmed', 'en_route'].includes(b.status);
  const statusLabel = { pending: 'PENDING', confirmed: 'CONFIRMED', en_route: 'EN ROUTE', done: 'DONE', cancelled: 'CANCELLED' }[b.status] || b.status.toUpperCase();
  return `<div class="bookingcard">
    <div class="idrow"><span>ID: #${b.id}</span><i class="ti ${b.serviceIcon}"></i></div>
    <h3>${b.serviceTitle}</h3>
    <div class="metarow"><i class="ti ti-calendar-event"></i> ${b.date} · ${b.time}</div>
    <div class="metarow"><i class="ti ti-map-pin"></i> ${escapeHtml(b.address)}</div>
    <div class="bottomrow">
      <span class="price">${b.priceLabel}</span>
      <span class="statuspill ${b.status}">${statusLabel}</span>
    </div>
    ${canCancel ? `<div class="cancellink" onclick="cancelBooking(${b.id})">Cancel booking</div>` : ''}
  </div>`;
}

async function cancelBooking(id) {
  try {
    await api(`/api/bookings/${id}/cancel`, 'PATCH');
    showToast('Booking cancelled.');
    renderBookings();
  } catch (e) {
    showToast(e.message, true);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- concierge ----------
async function sendConciergeMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;
  const log = document.getElementById('chat-log');
  log.innerHTML += `<div class="bubble user">${escapeHtml(message)}</div>`;
  input.value = '';
  log.scrollTop = log.scrollHeight;
  try {
    const res = await api('/api/concierge', 'POST', { message });
    let chips = (res.services || []).map(s =>
      `<span class="chip" onclick="openBookForm('${s.key}')">Book ${s.title}</span>`
    ).join('');
    log.innerHTML += `<div class="bubble ai">${escapeHtml(res.reply)}${chips ? '<br>' + chips : ''}</div>`;
  } catch (e) {
    log.innerHTML += `<div class="bubble ai">Sorry, I couldn't reach the concierge service just now.</div>`;
  }
  log.scrollTop = log.scrollHeight;
}

// ---------- profile ----------
function fillProfileFields() {
  document.getElementById('edit-name').value = CURRENT_USER.name || '';
  document.getElementById('edit-phone').value = CURRENT_USER.phone || '';
}
function toggleProfileEdit() {
  const el = document.getElementById('profile-edit');
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}
async function saveProfile() {
  const name = document.getElementById('edit-name').value.trim();
  const phone = document.getElementById('edit-phone').value.trim();
  try {
    const res = await api('/api/me', 'PUT', { name, phone });
    CURRENT_USER = res.user;
    document.getElementById('profile-name').textContent = CURRENT_USER.name;
    document.getElementById('profile-avatar').textContent = CURRENT_USER.name.trim()[0].toUpperCase();
    document.getElementById('profile-edit').style.display = 'none';
    showToast('Profile updated.');
  } catch (e) {
    showToast(e.message, true);
  }
}

// ---------- feedback ----------
let feedbackRating = 0;
function buildStarRow() {
  const row = document.getElementById('star-row');
  row.innerHTML = [1, 2, 3, 4, 5].map(n => `<i class="ti ti-star" data-n="${n}" onclick="setFeedbackRating(${n})"></i>`).join('');
}
function setFeedbackRating(n) {
  feedbackRating = n;
  document.querySelectorAll('#star-row i').forEach(i => {
    const filled = Number(i.dataset.n) <= n;
    i.className = filled ? 'ti ti-star-filled' : 'ti ti-star';
  });
}
async function submitFeedback() {
  const message = document.getElementById('feedback-text').value.trim();
  try {
    await api('/api/feedback', 'POST', { rating: feedbackRating || null, message });
    document.getElementById('feedback-text').value = '';
    setFeedbackRating(0);
    showToast('Thanks — your feedback was submitted.');
  } catch (e) {
    showToast(e.message, true);
  }
}

// ---------- toast ----------
let toastTimer = null;
function showToast(msg, isError) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (isError ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.classList.remove('show'); }, 3000);
}

document.addEventListener('DOMContentLoaded', init);
