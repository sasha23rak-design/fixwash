const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const img = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

// ===== Mobile menu =====
const burger = $('#burger');
const nav = $('#nav');
if (burger && nav) {
  const close = () => {
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', false);
  };
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
  });
  $$('a', nav).forEach((a) => a.addEventListener('click', close));
}

// ===== Reveal on scroll =====
const revealTargets = $$(
  '.section__head, .adv__card, .step, .review, .stat, .price-card, .post, .gallery__item, .chem, .calc, .modes, .lead, .compare, .faq-wrap, .contacts'
);
revealTargets.forEach((el) => el.classList.add('reveal'));
const revealObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      revealObserver.unobserve(e.target);
    }),
  { threshold: 0.1 }
);
revealTargets.forEach((el) => revealObserver.observe(el));

// ===== Animated counters =====
const countObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const decimals = Number(el.dataset.decimals || 0);
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / 1600, 1);
        const v = target * (1 - Math.pow(1 - p, 3));
        el.textContent =
          v.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    }),
  { threshold: 0.5 }
);
$$('[data-count]').forEach((el) => countObserver.observe(el));

// ===== Modes panel =====
const MODES = [
  { title: 'Вода под давлением', time: '≈ 1–2 минуты', img: '1636740659486-3cde6eba6371',
    text: 'Сбивает песок и крупную грязь, чтобы потом не тереть её по кузову. Держите пистолет на расстоянии 30–40 см и ведите сверху вниз.' },
  { title: 'Активная пена', time: '≈ 1 минута + 2 минуты выдержки', img: '1608506375591-b90e1f955e4b',
    text: 'Главный режим бесконтактной мойки. Наносите снизу вверх и дайте пене поработать 2 минуты — она растворит дорожную плёнку без касания.' },
  { title: 'Шампунь', time: '≈ 1–2 минуты', img: '1607860108855-64acf2078ed9',
    text: 'Для сильных загрязнений после трассы. pH-нейтральный состав безопасен для лака, плёнки и керамики и не сушит резиновые уплотнители.' },
  { title: 'Антимошка', time: '≈ 30 секунд', img: '1615041611611-e53c16da999b',
    text: 'Размягчает следы насекомых и смолу на бампере, капоте и зеркалах. Нанесите точечно перед пеной и подождите минуту.' },
  { title: 'Диски', time: '≈ 1 минута', img: '1708805283017-c662be2c7a44',
    text: 'Кислотно-нейтральное средство растворяет тормозную пыль. Обработайте каждое колесо и смойте водой через 1–2 минуты.' },
  { title: 'Горячий воск', time: '≈ 1 минута', img: '1632257426088-3d3788a2ca18',
    text: 'Создаёт гидрофобный слой: вода скатывается каплями, грязь меньше липнет, а кузов блестит. Эффект держится до 3 недель.' },
  { title: 'Осмос', time: '≈ 1 минута', img: '1611239179213-d972da54091a',
    text: 'Финальный смыв водой без солей. После него машина высыхает сама — без пятен, разводов и белого налёта. Вытирать не нужно.' },
  { title: 'Пылесос и воздух', time: '≈ 3–5 минут', img: '1610647752706-3bb12232b3ab',
    text: 'Мощный пылесос для салона и багажника, сжатый воздух — для щелей, замков и уплотнителей. Особенно важно зимой, чтобы ничего не примёрзло.' },
];

const modeButtons = $$('.mode');
if (modeButtons.length) {
  const modeImg = $('#modeImg');
  modeButtons.forEach((btn) =>
    btn.addEventListener('click', () => {
      const m = MODES[btn.dataset.mode];
      modeButtons.forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-selected', b === btn);
      });
      $('#modeTitle').textContent = m.title;
      $('#modeTime').textContent = m.time;
      $('#modeText').textContent = m.text;
      modeImg.classList.add('is-fading');
      const next = new Image();
      next.src = img(m.img);
      next.onload = () => {
        modeImg.src = next.src;
        modeImg.alt = `Режим «${m.title}»`;
        modeImg.classList.remove('is-fading');
      };
    })
  );
  // Preload images so switching is instant
  MODES.forEach((m) => (new Image().src = img(m.img)));
}

// ===== Calculator =====
const PROGRAMS = {
  express: { wash: 6, vacuum: 0, steps: ['Вода', 'Активная пена', 'Смыв'] },
  standard: { wash: 9, vacuum: 0, steps: ['Вода', 'Активная пена', 'Шампунь', 'Смыв', 'Горячий воск'] },
  premium: { wash: 12, vacuum: 4, steps: ['Антимошка', 'Диски', 'Вода', 'Активная пена', 'Шампунь', 'Воск', 'Осмос', 'Пылесос'] },
};
const RATES = { wash: 30, vacuum: 10 };
const calc = { body: 1, program: 'express' };

function renderCalc() {
  const p = PROGRAMS[calc.program];
  const r = RATES;
  const washMin = Math.round(p.wash * calc.body);
  const price = washMin * r.wash + p.vacuum * r.vacuum;
  $('#calcPrice').textContent = price.toLocaleString('ru-RU');
  $('#calcMin').textContent = washMin + p.vacuum;
  $('#calcSteps').innerHTML = p.steps.map((s) => `<li>${s}</li>`).join('');
}

const segs = $$('.seg');
if (segs.length && $('#calcPrice')) {
  segs.forEach((seg) =>
    $$('.seg__btn', seg).forEach((btn) =>
      btn.addEventListener('click', () => {
        $$('.seg__btn', seg).forEach((b) => b.classList.toggle('is-active', b === btn));
        const k = btn.dataset.k;
        calc[seg.dataset.name] = seg.dataset.name === 'body' ? parseFloat(k) : k;
        renderCalc();
      })
    )
  );
  renderCalc();
}

// ===== Lead form (bonus card) =====
const leadForm = $('#leadForm');
if (leadForm) {
  const phone = leadForm.elements.phone;
  phone.addEventListener('input', () => {
    let d = phone.value.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (!d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
    let out = '+7';
    if (p[0]) out += ` (${p[0]}`;
    if (p[0].length === 3) out += ')';
    if (p[1]) out += ` ${p[1]}`;
    if (p[2]) out += `-${p[2]}`;
    if (p[3]) out += `-${p[3]}`;
    phone.value = out;
  });

  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = $('#leadError');
    const data = Object.fromEntries(new FormData(leadForm));
    $$('.is-invalid', leadForm).forEach((el) => el.classList.remove('is-invalid'));
    const fail = (msg, field) => {
      err.textContent = msg;
      if (field) {
        leadForm.elements[field].classList.add('is-invalid');
        leadForm.elements[field].focus();
      }
    };
    if (!data.name.trim()) return fail('Как к вам обращаться?', 'name');
    if (data.phone.replace(/\D/g, '').length < 11) return fail('Введите номер телефона полностью', 'phone');
    if (!data.agree) return fail('Нужно согласие на обработку данных');
    submitLead(data);
  });
}

function submitLead(data) {
  // Демо-режим: заявка никуда не отправляется. Здесь подключается Telegram-бот, CRM или SMS-сервис.
  console.log('Новая бонусная карта FIXWASH:', data);
  $('#leadFields').hidden = true;
  $('#leadDone').hidden = false;
}

// ===== FAQ: only one open at a time =====
const faqItems = $$('.faq__item');
faqItems.forEach((item) =>
  item.addEventListener('toggle', () => {
    if (item.open) faqItems.forEach((other) => other !== item && (other.open = false));
  })
);

// ===== Blog filter =====
const chips = $$('.chip');
if (chips.length) {
  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.toggle('is-active', c === chip));
      const cat = chip.dataset.cat;
      $$('.posts .post').forEach((post) =>
        post.classList.toggle('is-hidden', cat !== 'all' && post.dataset.cat !== cat)
      );
    })
  );
}

// ===== Hide mobile CTA near the lead form and footer =====
const mobileCta = $('.mobile-cta');
const ctaZone = $('#bonus') || $('.article-cta');
if (mobileCta && ctaZone) {
  new IntersectionObserver(([entry]) => mobileCta.classList.toggle('is-hidden', entry.isIntersecting), {
    threshold: 0.15,
  }).observe(ctaZone);
}
