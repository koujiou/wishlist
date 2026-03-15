
// Handle email confirmation redirect — Supabase puts tokens in the URL hash
if (window.location.hash && window.location.hash.includes('access_token')) {
  window.supabaseClient.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      // Clean the ugly hash out of the URL without reloading
      history.replaceState(null, '', window.location.pathname);
    }
  });
}

/*=============== SHARED ELEMENTS ===============*/
const header = document.getElementById('header');

/*=============== SEARCH ===============*/
const searchButton  = document.getElementById('search-button'),
      searchClose   = document.getElementById('search-close'),
      searchContent = document.getElementById('search-content');

if (searchButton) searchButton.addEventListener('click', () => searchContent.classList.toggle('show-search'));
if (searchClose)  searchClose.addEventListener('click',  () => searchContent.classList.remove('show-search'));

/*=============== LOGIN / PROFILE POPUP ===============*/
const loginButton  = document.getElementById('login-button'),
      loginClose   = document.getElementById('login-close'),
      loginContent = document.getElementById('login-content');

if (loginButton) {
  loginButton.addEventListener('click', () => {
    loginContent.classList.add('show-login');
    if (currentUser) showProfilePanel();
    else { showAuthForm(); resetAuthPopup(); }
  });
}
if (loginClose) loginClose.addEventListener('click', () => loginContent.classList.remove('show-login'));
if (loginContent) loginContent.addEventListener('click', e => { if (e.target === loginContent) loginContent.classList.remove('show-login'); });

/*=============== ADD SHADOW HEADER ===============*/
const shadowHeader = () => {
  if (!header) return;
  window.scrollY >= 50 ? header.classList.add('shadow-header') : header.classList.remove('shadow-header');
};
window.addEventListener('scroll', shadowHeader);

/*=============== HOME SWIPER ===============*/
let swiperHome = new Swiper('.home__swiper', {
  loop: true, spaceBetween: -24, grabCursor: true, slidesPerView: 'auto', centeredSlides: true,
  autoplay: { delay: 3000, disableOnInteraction: false },
  breakpoints: { 1220: { spaceBetween: -32 } },
});

/*=============== SHOW SCROLL UP ===============*/
const scrollUpEl  = document.getElementById('scroll-up');
const navMenu     = document.getElementById('nav-menu');
const navScrollUp = document.getElementById('nav-scroll-up');
const scrollUp = () => {
  const scrolled = window.scrollY >= 350;
  if (scrollUpEl) scrollUpEl.classList.toggle('show-scroll', scrolled);
  if (navMenu)    navMenu.classList.toggle('nav-scrolled', scrolled);
};
window.addEventListener('scroll', scrollUp);
if (navScrollUp) navScrollUp.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('section[id]');
const scrollActive = () => {
  const scrollY = window.scrollY;
  sections.forEach(section => {
    const id = section.id, top = section.offsetTop - 50, height = section.offsetHeight,
          link = document.querySelector('.nav__menu a[href*=' + id + ']');
    if (!link) return;
    link.classList.toggle('active-link', scrollY > top && scrollY <= top + height);
  });
};
window.addEventListener('scroll', scrollActive);
document.getElementById('startBtn').addEventListener('click', function(e) {
  e.preventDefault(); document.getElementById('lists').scrollIntoView({ behavior: 'smooth' });
});

/*=============== DARK LIGHT THEME ===============*/
const themeButton = document.getElementById('theme-button');
const lightTheme = 'light-theme', iconTheme = 'ri-sun-line';
const selectedTheme = localStorage.getItem('selected-theme');
const selectedIcon  = localStorage.getItem('selected-icon');
const getCurrentTheme = () => document.body.classList.contains(lightTheme) ? 'dark' : 'light';
const getCurrentIcon  = () => themeButton.classList.contains(iconTheme) ? 'ri-moon-line' : 'ri-sun-line';
if (selectedTheme) {
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](lightTheme);
  themeButton.classList[selectedIcon === 'ri-moon-line' ? 'add' : 'remove'](iconTheme);
}
themeButton.addEventListener('click', () => {
  document.body.classList.toggle(lightTheme); themeButton.classList.toggle(iconTheme);
  localStorage.setItem('selected-theme', getCurrentTheme()); localStorage.setItem('selected-icon', getCurrentIcon());
});

/*=============== SCROLL REVEAL ===============*/
const sr = ScrollReveal({
  origin: 'bottom', distance: '48px', duration: 800, delay: 150,
  easing: 'cubic-bezier(0.5, 0, 0, 1)', reset: false, viewFactor: 0.12, mobile: true, desktop: true,
});
sr.reveal('.home__data', { delay: 100 });
sr.reveal('.home__images', { delay: 300 });
sr.reveal('.featured__container, .new__container, .join__data, .testimonial__container, .footer', { interval: 150 });
sr.reveal('.services__card', { interval: 100 });
sr.reveal('.discount__data', { origin: 'left', delay: 100 });
sr.reveal('.discount__images', { origin: 'right', delay: 100 });
sr.reveal('.list-card', { interval: 80, origin: 'bottom' });

/*=============== SUPABASE AUTH ===============*/
let currentMode = 'login';
let currentUser = null;

const submitBtn   = document.getElementById('auth-submit-btn');
const toggleLink  = document.getElementById('auth-toggle-link');
const toggleLabel = document.getElementById('auth-toggle-label');
const authTitle   = document.getElementById('auth-title');
const forgotLink  = document.getElementById('auth-forgot');
const feedback    = document.getElementById('auth-feedback');
const emailInput  = document.getElementById('login-email');
const passInput   = document.getElementById('login-pass');

function setFeedback(msg, isError = false) {
  feedback.textContent = msg;
  feedback.style.color = isError ? '#e53e3e' : '#38a169';
}

function setMode(mode) {
  currentMode = mode; setFeedback('');
  const authSubtitle = document.getElementById('auth-subtitle');
  if (mode === 'login') {
    authTitle.textContent = 'Willkommen zurück';
    if (authSubtitle) authSubtitle.textContent = 'Melde dich in deinem Account an';
    submitBtn.querySelector('span').textContent = 'Login';
    toggleLabel.textContent = 'Noch kein Account?'; toggleLink.textContent = ' Registrieren';
    passInput.autocomplete = 'current-password'; forgotLink.style.display = 'block';
  } else {
    authTitle.textContent = 'Account erstellen';
    if (authSubtitle) authSubtitle.textContent = 'Kostenlos registrieren';
    submitBtn.querySelector('span').textContent = 'Registrieren';
    toggleLabel.textContent = 'Bereits ein Account?'; toggleLink.textContent = ' Einloggen';
    passInput.autocomplete = 'new-password'; forgotLink.style.display = 'none';
  }
}

async function handleAuth() {
  const email = emailInput.value.trim(), password = passInput.value;
  if (!email || !password) { setFeedback('Bitte fülle alle Felder aus.', true); return; }
  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = currentMode === 'login' ? 'Anmelden…' : 'Registrieren…';
  setFeedback('');
  try {
    if (currentMode === 'login') {
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
      console.log('login result:', { data, error });
      if (error) throw error;
      if (!data.user) throw new Error('Login fehlgeschlagen. Bitte E-Mail-Adresse bestätigen.');
      // Set immediately — don't wait for the async onAuthStateChange event
      currentUser = data.user ?? data.session?.user ?? null;
      submitBtn.disabled = false;
      setFeedback('✓ Willkommen zurück, ' + data.user.email);
      await applyAuthState();
      setTimeout(() => { loginContent.classList.remove('show-login'); resetAuthPopup(); }, 1200);
    } else {
      const { data, error } = await window.supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://koujiou.github.io/wishlist/'
        }
      });
      console.log('signup result:', { data, error });
      if (error) throw error;
      submitBtn.disabled = false;
      setFeedback('✉️ Bestätigungs-E-Mail gesendet! Bitte prüfe dein Postfach.');
      setTimeout(() => { setMode('login'); emailInput.value = email; passInput.value = ''; setFeedback('✓ Jetzt kannst du dich einloggen.', false); }, 3500);
    }
  } catch (err) {
    console.error('Auth error:', err);
    setFeedback(err.message || 'Ein Fehler ist aufgetreten.', true);
    submitBtn.disabled = false; setMode(currentMode);
  }
}

function resetAuthPopup() {
  if (emailInput) emailInput.value = '';
  if (passInput)  passInput.value  = '';
  setMode('login');
}
window.resetAuthPopup = resetAuthPopup;

submitBtn.addEventListener('click', handleAuth);
toggleLink.addEventListener('click', e => { e.preventDefault(); setMode(currentMode === 'login' ? 'signup' : 'login'); });
[emailInput, passInput].forEach(input => input.addEventListener('keydown', e => { if (e.key === 'Enter') handleAuth(); }));

/*=============== PROFILE PANEL ===============*/
const authForm     = document.getElementById('auth-form');
const profilePanel = document.getElementById('profile-panel');
const profileEmail = document.getElementById('profile-email');
const logoutBtn    = document.getElementById('logout-btn');

function showProfilePanel() {
  if (authForm)     authForm.style.display     = 'none';
  if (profilePanel) profilePanel.style.display = 'flex';
  if (profileEmail && currentUser) profileEmail.textContent = currentUser.email;
}
function showAuthForm() {
  if (profilePanel) profilePanel.style.display = 'none';
  if (authForm)     authForm.style.display     = '';
}
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    loginContent.classList.remove('show-login');
    // Clear localStorage immediately so UI reacts now
    Object.keys(localStorage)
      .filter(k => k.startsWith('sb-'))
      .forEach(k => localStorage.removeItem(k));
    currentUser = null;
    await applyAuthState();
    // Also tell Supabase server-side (fire and forget — don't await)
    window.supabaseClient.auth.signOut().catch(() => {});
  });
}

/*=============== LISTS ===============*/
const addListBtn     = document.getElementById('add-list-btn');
const modalOverlay   = document.getElementById('modal-overlay');
const modalCancel    = document.getElementById('modal-cancel');
const modalClose     = document.getElementById('modal-close');
const modalCreate    = document.getElementById('modal-create');
const listNameInput  = document.getElementById('list-name-input');
const emojiGrid      = document.getElementById('emoji-grid');
const emojiCustom    = document.getElementById('emoji-custom');
const modalFeedback  = document.getElementById('modal-feedback');
const listsContainer = document.getElementById('lists');

const EMOJIS = ['❤️','⭐','🔖','🛒','🎁','📚','🎮','🎵','✈️','🏠','👗','💄','🍕','☕','🌸','🏋️','💡','🎨','📷','🐶','🌍','💎','🔑','🎯'];
let selectedEmoji = '⭐';

// ── Auth initialisation ───────────────────────────────────
let authReady = false;

const authFallbackTimer = setTimeout(() => {
  if (authReady) return;
  authReady = true;
  console.warn('Auth restore timed out — showing login UI (storage kept).');
  currentUser = null;
  applyAuthState();
}, 5000);

// Listener attached FIRST — always active, even if getSession() hangs
window.supabaseClient.auth.onAuthStateChange((event, session) => {
  console.log('supabase auth event:', event, session);
  currentUser = session?.user ?? null;
  applyAuthState();
});

// getSession as best-effort fast restore — if it resolves before
// onAuthStateChange fires, we apply state immediately
(async function initAuth() {
  try {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!authReady) {
      currentUser = session?.user ?? null;
      await applyAuthState();
    }
  } catch (err) {
    console.warn('getSession() failed:', err);
  } finally {
    authReady = true;
    clearTimeout(authFallbackTimer);
  }
})();

// ── Email confirmation hash handler ──────────────────────
// When user clicks the confirmation link, Supabase redirects back
// with #access_token=... in the URL. getSession() picks it up automatically.
if (window.location.hash.includes('access_token')) {
  window.supabaseClient.auth.getSession().then(({ data: { session }, error }) => {
    if (error) { console.error('Hash session error:', error); return; }
    if (session) {
      // Clean the ugly token out of the URL bar
      history.replaceState(null, '', window.location.pathname);
    }
  });
}

// ── Single function that syncs UI to auth state ───────────
async function applyAuthState() {
  if (loginButton) {
    loginButton.className = (currentUser ? 'ri-user-smile-line' : 'ri-user-3-line') + ' login-button';
    loginButton.id = 'login-button';
  }

  if (currentUser) {
    if (addListBtn) addListBtn.style.display = 'flex';
    hideLoginPrompt();
    await loadLists();
  } else {
    if (addListBtn) addListBtn.style.display = 'none';
    showAuthForm();
    renderLists([]);
    showLoginPrompt();
  }
}



function showLoginPrompt() {
  if (!listsContainer || document.getElementById('lists-login-prompt')) return;
  listsContainer.querySelectorAll('.list-card, .lists__empty, #lists-empty-msg').forEach(el => el.remove());
  const msg = document.createElement('div');
  msg.id = 'lists-login-prompt'; msg.className = 'lists__login-prompt';
  msg.innerHTML = '<i class="ri-lock-line"></i><p>Bitte melde dich an, um Listen zu erstellen.</p><button class="button" id="prompt-login-btn">Anmelden</button>';
  listsContainer.appendChild(msg);
  document.getElementById('prompt-login-btn').addEventListener('click', () => { showAuthForm(); resetAuthPopup(); loginContent.classList.add('show-login'); });
}
function hideLoginPrompt() { document.getElementById('lists-login-prompt')?.remove(); }

async function loadLists() {
  try {
    const { data, error } = await window.supabaseClient.from('lists').select('*').order('created_at', { ascending: true });
    if (error) { console.error('loadLists error:', error.message); renderLists([]); return; }
    renderLists(data);
  } catch (err) { console.error('loadLists crashed:', err); renderLists([]); }
}

function renderLists(lists) {
  if (!listsContainer) return;
  listsContainer.querySelectorAll('.list-card').forEach(c => c.remove());
  document.getElementById('lists-empty-msg')?.remove();
  if (lists.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'lists__empty'; empty.id = 'lists-empty-msg';
    empty.textContent = 'Noch keine Listen. Erstelle deine erste!';
    listsContainer.appendChild(empty); return;
  }
  lists.forEach(list => addCardToDOM(list));
}

function addCardToDOM(list) {
  if (!listsContainer) return;
  document.getElementById('lists-empty-msg')?.remove();
  const card = document.createElement('div');
  card.className = 'list-card'; card.dataset.id = list.id;
  card.innerHTML = `
    <span class="list-card__emoji">${list.emoji || '⭐'}</span>
    <span class="list-card__name">${list.name}</span>
    <button class="list-card__delete" aria-label="Liste löschen"><i class="ri-delete-bin-line"></i></button>
  `;
  card.addEventListener('click', e => { if (!e.target.closest('.list-card__delete')) openItemsModal(list); });
  card.querySelector('.list-card__delete').addEventListener('click', async e => { e.stopPropagation(); await deleteList(list.id, card); });
  listsContainer.appendChild(card);
  if (typeof sr !== 'undefined') sr.reveal(card, { origin: 'bottom', distance: '24px', duration: 500 });
}

async function deleteList(id, cardEl) {
  cardEl.style.transition = 'opacity 0.25s, transform 0.25s'; cardEl.style.opacity = '0'; cardEl.style.transform = 'scale(0.9)';
  const { error } = await window.supabaseClient.from('lists').delete().eq('id', id);
  if (error) { cardEl.style.opacity = '1'; cardEl.style.transform = 'scale(1)'; console.error('Löschfehler:', error.message); return; }
  setTimeout(() => {
    cardEl.remove();
    if (listsContainer && !listsContainer.querySelector('.list-card')) {
      const empty = document.createElement('p'); empty.className = 'lists__empty'; empty.id = 'lists-empty-msg';
      empty.textContent = 'Noch keine Listen. Erstelle deine erste!'; listsContainer.appendChild(empty);
    }
  }, 250);
}

if (emojiGrid) {
  EMOJIS.forEach(emoji => {
    const btn = document.createElement('button'); btn.type = 'button';
    btn.className = 'modal__emoji-btn' + (emoji === selectedEmoji ? ' selected' : ''); btn.textContent = emoji;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal__emoji-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected'); selectedEmoji = emoji; if (emojiCustom) emojiCustom.value = '';
    });
    emojiGrid.appendChild(btn);
  });
}
if (emojiCustom) emojiCustom.addEventListener('input', () => {
  if (emojiCustom.value.trim()) { document.querySelectorAll('.modal__emoji-btn').forEach(b => b.classList.remove('selected')); selectedEmoji = emojiCustom.value.trim(); }
});

function openModal() {
  if (!currentUser) { showAuthForm(); loginContent.classList.add('show-login'); return; }
  modalOverlay.classList.add('show-modal'); if (listNameInput) listNameInput.focus();
}
function closeModal() {
  modalOverlay.classList.remove('show-modal');
  if (listNameInput) listNameInput.value = ''; if (emojiCustom) emojiCustom.value = '';
  if (modalFeedback) modalFeedback.textContent = ''; selectedEmoji = '⭐';
  document.querySelectorAll('.modal__emoji-btn').forEach((b, i) => b.classList.toggle('selected', EMOJIS[i] === '⭐'));
}
async function createList() {
  const name = listNameInput?.value.trim(); const icon = emojiCustom?.value.trim() || selectedEmoji;
  if (!name) { modalFeedback.textContent = 'Bitte gib einen Namen ein.'; modalFeedback.style.color = '#e53e3e'; listNameInput?.focus(); return; }
  modalCreate.disabled = true; modalFeedback.textContent = 'Wird gespeichert…'; modalFeedback.style.color = 'hsl(228,20%,60%)';
  const { data, error } = await window.supabaseClient.from('lists').insert({ name, emoji: icon, user_id: currentUser.id }).select().single();
  modalCreate.disabled = false;
  if (error) { modalFeedback.textContent = 'Fehler: ' + error.message; modalFeedback.style.color = '#e53e3e'; return; }
  modalFeedback.textContent = '✓ Liste erstellt!'; modalFeedback.style.color = '#38a169';
  addCardToDOM(data); setTimeout(closeModal, 700);
}

if (addListBtn)   addListBtn.addEventListener('click', openModal);
if (modalCancel)  modalCancel.addEventListener('click', closeModal);
if (modalClose)   modalClose.addEventListener('click', closeModal);
if (modalCreate)  modalCreate.addEventListener('click', createList);
if (modalOverlay) modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
if (listNameInput) listNameInput.addEventListener('keydown', e => { if (e.key === 'Enter') createList(); });

/*=============== LIST ITEMS MODAL ===============*/
const SCRAPINGANT_KEY = '230f405485df4bfeba159d5b3fc9992f';

const itemsOverlay  = document.getElementById('items-overlay');
const itemsListEl   = document.getElementById('items-list');
const itemsClose    = document.getElementById('items-close');
const itemsUrlInput = document.getElementById('item-url-input');
const itemsScrapeBtn = document.getElementById('item-scrape-btn');
const itemsAddBtn   = document.getElementById('item-add-btn');
const itemsFeedback = document.getElementById('items-feedback');
const scrapePreview = document.getElementById('scrape-preview');
const scrapeImg     = document.getElementById('scrape-img');
const scrapeTitel   = document.getElementById('scrape-titel');
const scrapePreis   = document.getElementById('scrape-preis');

let activeList   = null;
let scrapedData  = {}; // holds last scraped result

// ── Open / close ─────────────────────────────────────────
async function openItemsModal(list) {
  activeList = list;
  document.getElementById('items-list-emoji').textContent = list.emoji || '⭐';
  document.getElementById('items-list-name').textContent  = list.name;
  itemsOverlay.classList.add('show-modal');
  await loadItems(list.id);
}

function closeItemsModal() {
  itemsOverlay.classList.remove('show-modal');
  activeList  = null;
  scrapedData = {};
  if (itemsListEl)   itemsListEl.innerHTML      = '';
  if (itemsUrlInput) itemsUrlInput.value         = '';
  if (itemsFeedback) itemsFeedback.textContent   = '';
  if (scrapePreview) scrapePreview.style.display = 'none';
  if (scrapeImg)     scrapeImg.src               = '';
  if (scrapeTitel)   scrapeTitel.value           = '';
  if (scrapePreis)   scrapePreis.value           = '';
}

// ── Load & render saved items ────────────────────────────
async function loadItems(listId) {
  if (!itemsListEl) return;
  itemsListEl.innerHTML = '<p class="items-modal__loading">Lädt…</p>';
  try {
    const { data, error } = await window.supabaseClient
      .from('items').select('*').eq('list_id', listId).order('created_at', { ascending: true });
    if (error) { itemsListEl.innerHTML = '<p class="items-modal__empty">Fehler beim Laden.</p>'; return; }
    renderItems(data);
  } catch (err) {
    console.error('loadItems crashed:', err);
    itemsListEl.innerHTML = '<p class="items-modal__empty">Fehler beim Laden.</p>';
  }
}

function renderItems(items) {
  if (!itemsListEl) return;
  itemsListEl.innerHTML = '';
  if (items.length === 0) {
    itemsListEl.innerHTML = '<p class="items-modal__empty">Noch keine Produkte. Füge das erste über einen Link hinzu!</p>';
    return;
  }
  items.forEach(item => appendItemCard(item));
}

function appendItemCard(item) {
  itemsListEl.querySelector('.items-modal__empty')?.remove();
  const card = document.createElement('div');
  card.className = 'item-card'; card.dataset.id = item.id;
  const preis  = item.preis != null ? `<span class="item-card__preis">€${parseFloat(item.preis).toFixed(2)}</span>` : '';
  const bild   = item.bild  ? `<div class="item-card__img-wrap"><img src="${item.bild}" alt="${item.produkttitel}" class="item-card__img" onerror="this.parentElement.style.display='none'"/></div>` : '';
  const linkBtn = item.link ? `<a href="${item.link}" target="_blank" rel="noopener" class="item-card__link" aria-label="Produkt öffnen"><i class="ri-external-link-line"></i></a>` : '';
  card.innerHTML = `${bild}<div class="item-card__body"><span class="item-card__titel">${item.produkttitel}</span>${preis}</div>${linkBtn}<button class="item-card__delete" aria-label="Produkt löschen"><i class="ri-delete-bin-line"></i></button>`;
  card.querySelector('.item-card__delete').addEventListener('click', async e => { e.stopPropagation(); await deleteItem(item.id, card); });
  itemsListEl.appendChild(card);
}

// ── ScrapingAnt scraper ──────────────────────────────────
async function scrapeProduct() {
  const url = itemsUrlInput?.value.trim();
  if (!url) {
    setItemsFeedback('Bitte füge einen Produkt-Link ein.', true); return;
  }

  itemsScrapeBtn.disabled = true;
  scrapePreview.style.display = 'none';
  setItemsFeedback('Produkt wird geladen…', false, true);

  try {
    const apiUrl = `https://api.scrapingant.com/v2/general?url=${encodeURIComponent(url)}&x-api-key=${SCRAPINGANT_KEY}&browser=false`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`ScrapingAnt Fehler: ${res.status}`);

    const html   = await res.text();
    const parser = new DOMParser();
    const doc    = parser.parseFromString(html, 'text/html');

    // ── Extract product data ─────────────────────────────
    // 1. Try JSON-LD first (most reliable for product pages)
    let titel = '', bild = '', preis = '';

    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const script of jsonLdScripts) {
      try {
        const obj = JSON.parse(script.textContent);
        const product = Array.isArray(obj)
          ? obj.find(o => o['@type'] === 'Product')
          : obj['@type'] === 'Product' ? obj : obj['@graph']?.find?.(o => o['@type'] === 'Product');
        if (product) {
          titel = product.name || '';
          bild  = product.image?.url || product.image?.[0]?.url || product.image || '';
          const offers = Array.isArray(product.offers) ? product.offers[0] : product.offers;
          if (offers?.price) preis = String(offers.price);
          break;
        }
      } catch {}
    }

    // 2. Fall back to Open Graph / meta tags
    const og = (prop) => doc.querySelector(`meta[property="${prop}"]`)?.content
                      || doc.querySelector(`meta[name="${prop}"]`)?.content || '';

    if (!titel) titel = og('og:title') || og('twitter:title') || doc.title || '';
    if (!bild)  bild  = og('og:image') || og('twitter:image') || '';
    if (!preis) preis = og('product:price:amount') || og('og:price:amount') || '';

    // 3. Site-specific fallbacks for Thalia
    if (!preis) {
      const priceEl = doc.querySelector('[class*="price"] [class*="value"], .product-price, [itemprop="price"]');
      if (priceEl) preis = priceEl.getAttribute('content') || priceEl.textContent.trim().replace(/[^\d.,]/g, '');
    }

    // Clean up title — strip site name suffix (e.g. " | Thalia")
    titel = titel.replace(/\s*[\|–\-]\s*(Thalia|Amazon|Zalando|eBay|Otto|MediaMarkt).*$/i, '').trim();

    // Clean up price — keep only digits and comma/dot
    preis = preis.replace(/[^\d.,]/g, '').replace(',', '.').trim();

    if (!titel) throw new Error('Kein Produkttitel gefunden. Versuche einen anderen Link.');

    // Store for saving
    scrapedData = { titel, bild, preis, link: url };

    // Show preview
    scrapeImg.src = bild || '';
    scrapeImg.parentElement.style.display = bild ? 'block' : 'none';
    scrapeTitel.value = titel;
    scrapePreis.value = preis;
    scrapePreview.style.display = 'flex';
    setItemsFeedback('', false);

  } catch (err) {
    console.error('Scrape error:', err);
    setItemsFeedback(err.message || 'Fehler beim Laden des Produkts.', true);
  } finally {
    itemsScrapeBtn.disabled = false;
  }
}

// ── Save scraped product ─────────────────────────────────
async function saveScrapedItem() {
  if (!activeList || !currentUser) return;

  const titel = scrapeTitel?.value.trim();
  const preis = scrapePreis?.value.trim();
  const preisNum = preis ? parseFloat(preis.replace(',', '.')) : null;

  if (!titel) { setItemsFeedback('Bitte gib einen Produkttitel ein.', true); return; }

  itemsAddBtn.disabled = true;
  setItemsFeedback('Wird gespeichert…', false, true);

  const { data, error } = await window.supabaseClient
    .from('items')
    .insert({
      produkttitel: titel,
      preis:  preisNum,
      bild:   scrapedData.bild   || null,
      link:   scrapedData.link   || null,
      list_id: activeList.id,
      user_id: currentUser.id,
    })
    .select().single();

  itemsAddBtn.disabled = false;

  if (error) { setItemsFeedback('Fehler: ' + error.message, true); return; }

  setItemsFeedback('✓ Produkt gespeichert!', false);
  appendItemCard(data);

  // Reset scraper
  itemsUrlInput.value         = '';
  scrapePreview.style.display = 'none';
  scrapeImg.src               = '';
  scrapeTitel.value           = '';
  scrapePreis.value           = '';
  scrapedData                 = {};
  setTimeout(() => setItemsFeedback('', false), 2000);
}

function setItemsFeedback(msg, isError = false, isNeutral = false) {
  if (!itemsFeedback) return;
  itemsFeedback.textContent = msg;
  itemsFeedback.style.color = isError ? '#e53e3e' : isNeutral ? 'hsl(228,20%,60%)' : '#38a169';
}

// ── Delete item ──────────────────────────────────────────
async function deleteItem(id, cardEl) {
  cardEl.style.transition = 'opacity 0.2s, transform 0.2s';
  cardEl.style.opacity = '0'; cardEl.style.transform = 'scale(0.95)';
  const { error } = await window.supabaseClient.from('items').delete().eq('id', id);
  if (error) { cardEl.style.opacity = '1'; cardEl.style.transform = 'scale(1)'; console.error('Item Löschfehler:', error.message); return; }
  setTimeout(() => {
    cardEl.remove();
    if (itemsListEl && !itemsListEl.querySelector('.item-card'))
      itemsListEl.innerHTML = '<p class="items-modal__empty">Noch keine Produkte. Füge das erste über einen Link hinzu!</p>';
  }, 200);
}

// ── Event listeners ──────────────────────────────────────
if (itemsClose)    itemsClose.addEventListener('click', closeItemsModal);
if (itemsScrapeBtn) itemsScrapeBtn.addEventListener('click', scrapeProduct);
if (itemsAddBtn)   itemsAddBtn.addEventListener('click', saveScrapedItem);
if (itemsOverlay)  itemsOverlay.addEventListener('click', e => { if (e.target === itemsOverlay) closeItemsModal(); });
if (itemsUrlInput) itemsUrlInput.addEventListener('keydown', e => { if (e.key === 'Enter') scrapeProduct(); });

