// Если мини‑апп открыт в Telegram
const tg = window.Telegram ? window.Telegram.WebApp : null;

// Применяем тему из Telegram, если доступна
function applyTelegramTheme() {
  if (!tg) return;
  document.body.setAttribute('data-tg', '1');
  const t = tg.themeParams || {};
  const map = {
    '--tg-bg': t.bg_color,
    '--tg-card': t.secondary_bg_color || t.bg_color,
    '--tg-text': t.text_color,
    '--tg-muted': t.hint_color,
    '--tg-button': t.button_color,
    '--tg-border': t.section_separator_color,
  };
  Object.entries(map).forEach(([k, v]) => v && document.documentElement.style.setProperty(k, v));
  tg.expand();
  tg.ready();
}

const CURRENCY = '₽';

const PRODUCTS = [
  // Акции
  { id: 'bs-30gems', game: 'Brawl Stars', title: '30 гемов', price: 200, oldPrice: 250, tag: 'Скидка', image: 'art/brawl-gems.png', promo: true },
  { id: 'bs-brawlpass', game: 'Brawl Stars', title: 'Бравл Пасс', price: 699, oldPrice: 779, tag: 'Скидка', image: 'art/brawl-pass.png', promo: true },
  { id: 'pubg-80uc', game: 'PUBG Mobile', title: '80 UC', price: 499, oldPrice: 549, tag: 'Скидка', image: 'art/pubg-uc.png', promo: true },
  // Новинки
  { id: 'robux-400', game: 'Roblox', title: '400 Robux', price: 399, image: 'art/robux.png', isNew: true },
  { id: 'steam-500', game: 'Steam', title: 'Кошелёк 500', price: 500, image: 'art/steam.png', isNew: true },
  { id: 'mo-600', game: 'mo.co', title: '600 кредитов', price: 459, image: 'art/moco.png', isNew: true },
];

const GAMES = [
  { id:'brawl-stars', name:'Brawl Stars', icon:'art/icon-brawl.png' },
  { id:'moco', name:'mo.co', icon:'art/icon-moco.png' },
  { id:'pubgm', name:'PUBG mo...', icon:'art/icon-pubg.png' },
  { id:'roblox', name:'Roblox', icon:'art/icon-roblox.png' },
  { id:'steam', name:'Steam', icon:'art/icon-steam.png' },
];

const cart = new Map();

function formatPrice(n) { return `${n.toLocaleString('ru-RU')} ${CURRENCY}`; }

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function render() {
  // Горизонтальная полоса игр
  const strip = document.getElementById('gamesStrip');
  strip.innerHTML = '';
  GAMES.forEach(g => {
    strip.appendChild(el(`
      <a class="app-icon" href="#" data-game="${g.id}" title="${g.name}">
        <img src="${g.icon}" alt="${g.name}">
        <div class="label">${g.name}</div>
      </a>
    `));
  });

  // Акции
  const promos = document.getElementById('promoCards');
  promos.innerHTML = '';
  PRODUCTS.filter(p => p.promo).forEach(p => promos.appendChild(card(p)));

  // Новинки
  const news = document.getElementById('newCards');
  news.innerHTML = '';
  PRODUCTS.filter(p => p.isNew).forEach(p => news.appendChild(card(p)));
}

function card(p) {
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const node = el(`
    <article class="card">
      <div class="thumb" style="position:relative">
        ${discount ? `<span class="badge">Скидка −${discount}%</span>` : ''}
        <img src="${p.image}" alt="${p.title}" style="max-width:78%; height:auto;">
      </div>
      <div class="body">
        <div class="game">
          <img src="${iconFor(p.game)}" alt="" style="width:18px;height:18px;border-radius:4px">
          <span>${p.game}</span>
        </div>
        <div class="title">${p.title}</div>
        <div class="price-row">
          <div class="price">${formatPrice(p.price)}</div>
          ${p.oldPrice ? `<div class="old">${formatPrice(p.oldPrice)}</div>` : ''}
        </div>
        <div class="actions">
          <button class="btn outline" data-buy="${p.id}">В корзину</button>
          <button class="btn" data-info="${p.id}">Подробнее</button>
        </div>
      </div>
    </article>
  `);
  return node;
}

function iconFor(game) {
  const g = GAMES.find(x => game.startsWith(x.name));
  return g ? g.icon : 'art/generic.png';
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1600);
}

function openCart(open = true) {
  const drawer = document.getElementById('cartDrawer');
  drawer.classList.toggle('open', open);
  drawer.setAttribute('aria-hidden', String(!open));
}

function updateCartUI() {
  const list = document.getElementById('cartItems');
  const total = document.getElementById('cartTotal');
  list.innerHTML = '';

  let sum = 0;
  for (const [id, qty] of cart) {
    const p = PRODUCTS.find(x => x.id === id);
    const line = p.price * qty;
    sum += line;
    list.appendChild(el(`
      <div class="cart-item">
        <div class="info">
          <strong>${p.title}</strong>
          <span style="color:var(--muted); font-size:13px">${p.game}</span>
          <span>${qty} × ${formatPrice(p.price)}</span>
        </div>
        <div class="line">
          <strong>${formatPrice(line)}</strong>
          <div style="display:flex; gap:6px; margin-top:8px; justify-content:flex-end">
            <button class="btn" data-dec="${p.id}" style="padding:6px 10px">−</button>
            <button class="btn" data-inc="${p.id}" style="padding:6px 10px">+</button>
            <button class="btn" data-del="${p.id}" style="padding:6px 10px">Удалить</button>
          </div>
        </div>
      </div>
    `));
  }

  total.textContent = formatPrice(sum);
  if (tg) {
    if (sum > 0) {
      tg.MainButton.setText(`Оплатить ${sum.toLocaleString('ru-RU')} ${CURRENCY} (${itemsCount()}шт)`);
      tg.MainButton.show();
    } else {
      tg.MainButton.hide();
    }
  }
}

function itemsCount() {
  let c = 0;
  for (const [, qty] of cart) c += qty;
  return c;
}

function addToCart(id, qty = 1) {
  cart.set(id, (cart.get(id) || 0) + qty);
  updateCartUI();
  toast('Добавлено в корзину');
  openCart(true);
}

function decFromCart(id) {
  const q = cart.get(id) || 0;
  if (q <= 1) cart.delete(id);
  else cart.set(id, q - 1);
  updateCartUI();
}

function removeFromCart(id) {
  cart.delete(id);
  updateCartUI();
}

function bindEvents() {
  document.body.addEventListener('click', (e) => {
    const buy = e.target.closest('[data-buy]');
    if (buy) { addToCart(buy.getAttribute('data-buy')); }

    const info = e.target.closest('[data-info]');
    if (info) {
      const p = PRODUCTS.find(x => x.id === info.getAttribute('data-info'));
      alert(`${p.title}\n\nИгра: ${p.game}\nЦена: ${formatPrice(p.price)}${p.oldPrice ? `\nСтарая цена: ${formatPrice(p.oldPrice)}` : ''}`);
    }

    const dec = e.target.closest('[data-dec]');
    if (dec) decFromCart(dec.getAttribute('data-dec'));

    const inc = e.target.closest('[data-inc]');
    if (inc) addToCart(inc.getAttribute('data-inc'));

    const del = e.target.closest('[data-del]');
    if (del) removeFromCart(del.getAttribute('data-del'));
  });

  document.getElementById('closeCart').addEventListener('click', () => openCart(false));
  document.getElementById('checkoutBtn').addEventListener('click', onCheckout);
}

function onCheckout() {
  const payload = buildPayload();
  if (tg) {
    tg.HapticFeedback.selectionChanged();
    tg.sendData(JSON.stringify(payload));
    // Обычно тут ждём подтверждение оплаты с сервера/бота
    toast('Заявка отправлена в бота');
  } else {
    alert('Мини‑апп открыт вне Telegram. В реальном боте заказ отправится через tg.sendData().\n\n' + JSON.stringify(payload, null, 2));
  }
}

function buildPayload() {
  const items = [];
  let sum = 0;
  for (const [id, qty] of cart) {
    const p = PRODUCTS.find(x => x.id === id);
    items.push({ id, title: p.title, game: p.game, price: p.price, qty });
    sum += p.price * qty;
  }
  return {
    type: 'checkout',
    items, total: sum, currency: CURRENCY, ts: Date.now()
  };
}

function initMainButton() {
  if (!tg) return;
  tg.MainButton.onClick(onCheckout);
  updateCartUI();
}

function boot() {
  applyTelegramTheme();
  render();
  bindEvents();
  initMainButton();
}
boot();
