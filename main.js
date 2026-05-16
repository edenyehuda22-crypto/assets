'use strict';

/* ============================================================
   HEADER SCROLL EFFECT
   ============================================================ */
const header = document.getElementById('top') ? document.querySelector('.site-header') : document.querySelector('.site-header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}, { passive: true });

/* ============================================================
   HAMBURGER MENU
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
  });
}

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = Math.round(eased * target);

    if (target >= 1000000) {
      el.textContent = (current / 1000000).toFixed(1) + 'M+';
    } else if (target >= 1000) {
      el.textContent = current.toLocaleString('he-IL') + '+';
    } else {
      el.textContent = current;
    }

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const counters = document.querySelectorAll('.stat-num');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counters.forEach(c => counterObserver.observe(c));

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 100);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));

/* ============================================================
   DONATION WIDGET
   ============================================================ */
const impactMap = {
  50:   { icon: '🍞', text: '50 ₪ = אוכל ל-5 ילדים ליומיים שלמים' },
  120:  { icon: '💧', text: '120 ₪ = מים נקיים לשבועיים עבור משפחה שלמה' },
  300:  { icon: '💊', text: '300 ₪ = ערכת תרופות בסיסיות לילד חולה' },
  500:  { icon: '📚', text: '500 ₪ = ציוד לימוד לכיתה שלמה' },
  1000: { icon: '🏥', text: '1,000 ₪ = טיפול רפואי מלא לילד פצוע' },
};

let selectedAmount = 120;
let donationType = 'one-time';

const amountBtns = document.querySelectorAll('.amount-btn');
const customInputWrap = document.getElementById('customInputWrap');
const customAmountInput = document.getElementById('customAmount');
const impactPreview = document.getElementById('impactPreview');
const donateBtnText = document.getElementById('donateBtnText');

function updateImpactPreview(amount) {
  const match = impactMap[amount] || { icon: '❤️', text: `${amount.toLocaleString('he-IL')} ₪ = עזרה ישירה לילד` };
  const iconEl = impactPreview.querySelector('.impact-preview-icon');
  const textEl = impactPreview.querySelector('.impact-preview-text');
  iconEl.textContent = match.icon;
  textEl.textContent = match.text;
}

function updateDonateBtn(amount) {
  const formatted = Number(amount).toLocaleString('he-IL');
  const suffix = donationType === 'monthly' ? '/חודש' : '';
  donateBtnText.textContent = `תרמו ${formatted} ₪${suffix} עכשיו`;
}

amountBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    amountBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (btn.dataset.amount === 'custom') {
      customInputWrap.style.display = 'block';
      customAmountInput.focus();
      selectedAmount = parseInt(customAmountInput.value, 10) || 0;
    } else {
      customInputWrap.style.display = 'none';
      selectedAmount = parseInt(btn.dataset.amount, 10);
      updateImpactPreview(selectedAmount);
      updateDonateBtn(selectedAmount);
    }
  });
});

customAmountInput.addEventListener('input', () => {
  const val = parseInt(customAmountInput.value, 10);
  if (val > 0) {
    selectedAmount = val;
    updateImpactPreview(val);
    updateDonateBtn(val);
  }
});

/* ---- Donation type tabs ---- */
const typeTabs = document.querySelectorAll('.type-tab');
typeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    typeTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    donationType = tab.dataset.type;
    updateDonateBtn(selectedAmount);
  });
});

/* ---- Payment method selection ---- */
const paymentIcons = document.querySelectorAll('.payment-icon');
paymentIcons.forEach(icon => {
  icon.addEventListener('click', () => {
    paymentIcons.forEach(i => i.classList.remove('selected'));
    icon.classList.add('selected');
  });
});

/* ---- Submit donation ---- */
function submitDonation() {
  const name = document.getElementById('donorName').value.trim();
  const email = document.getElementById('donorEmail').value.trim();

  if (!name) {
    document.getElementById('donorName').style.borderColor = 'var(--c-primary)';
    document.getElementById('donorName').focus();
    return;
  }
  if (!email || !email.includes('@')) {
    document.getElementById('donorEmail').style.borderColor = 'var(--c-primary)';
    document.getElementById('donorEmail').focus();
    return;
  }

  const btn = document.getElementById('donateBtn');
  btn.disabled = true;
  donateBtnText.textContent = 'מעבד תשלום...';
  btn.style.opacity = '.7';

  setTimeout(() => {
    btn.disabled = false;
    btn.style.opacity = '1';
    donateBtnText.textContent = `תרמו ${selectedAmount.toLocaleString('he-IL')} ₪ עכשיו`;
    showToast();
    addRecentDonor(name, selectedAmount);
  }, 1800);
}

/* ============================================================
   TOAST NOTIFICATION
   ============================================================ */
function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4500);
}

/* ============================================================
   RECENT DONORS (live feed simulation)
   ============================================================ */
const donorNames = ['יוסי', 'מרים', 'אחמד', 'רינה', 'סמיר', 'תמר', 'חלידה', 'דוד', 'פאטמה', 'נועה'];
const donorAmounts = [50, 100, 150, 200, 300, 500, 1000];

function addRecentDonor(name, amount) {
  const container = document.getElementById('recentDonors');
  const item = document.createElement('div');
  item.className = 'donor-item';
  item.style.animation = 'fadeInUp .4s ease';
  item.innerHTML = `
    <span class="donor-avatar">${name[0]}</span>
    <span>${name} — ${Number(amount).toLocaleString('he-IL')} ₪</span>
    <span class="donor-time">עכשיו</span>
  `;
  container.insertBefore(item, container.children[1]);
  if (container.querySelectorAll('.donor-item').length > 5) {
    container.lastElementChild.remove();
  }
}

function simulateLiveDonors() {
  setInterval(() => {
    const name = donorNames[Math.floor(Math.random() * donorNames.length)];
    const amount = donorAmounts[Math.floor(Math.random() * donorAmounts.length)];
    addRecentDonor(name, amount);
  }, 12000);
}
simulateLiveDonors();

/* ============================================================
   STORIES SLIDER
   ============================================================ */
const storyCards = document.querySelectorAll('.story-card');
const dots = document.querySelectorAll('.dot');
let currentStory = 0;

function showStory(index) {
  storyCards.forEach(c => c.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  currentStory = (index + storyCards.length) % storyCards.length;
  storyCards[currentStory].classList.add('active');
  dots[currentStory].classList.add('active');
}

document.getElementById('nextStory')?.addEventListener('click', () => showStory(currentStory + 1));
document.getElementById('prevStory')?.addEventListener('click', () => showStory(currentStory - 1));
dots.forEach((dot, i) => dot.addEventListener('click', () => showStory(i)));

let autoSlide = setInterval(() => showStory(currentStory + 1), 6000);
document.getElementById('storiesSlider')?.addEventListener('mouseenter', () => clearInterval(autoSlide));
document.getElementById('storiesSlider')?.addEventListener('mouseleave', () => {
  autoSlide = setInterval(() => showStory(currentStory + 1), 6000);
});

/* ============================================================
   VIDEO MODAL
   ============================================================ */
function openModal(url) {
  const modal = document.getElementById('videoModal');
  document.getElementById('modalIframe').src = url;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('videoModal');
  modal.classList.remove('open');
  document.getElementById('modalIframe').src = '';
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-a');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-a').style.maxHeight = '0';
    });

    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

/* ============================================================
   SMOOTH SCROLL FOR NAV LINKS
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ============================================================
   STICKY BAR VISIBILITY
   ============================================================ */
const stickyBar = document.getElementById('stickyBar');
const donateSection = document.getElementById('donate');

window.addEventListener('scroll', () => {
  if (!donateSection || !stickyBar) return;
  const rect = donateSection.getBoundingClientRect();
  if (rect.top > window.innerHeight || rect.bottom < 0) {
    stickyBar.style.display = 'flex';
  } else {
    stickyBar.style.display = 'none';
  }
}, { passive: true });

/* ============================================================
   THERMOMETER ANIMATION
   ============================================================ */
const thermoFill = document.getElementById('thermoFill');
const thermoObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      thermoFill.style.height = '67%';
      thermoObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

if (thermoFill) {
  thermoFill.style.height = '0%';
  thermoObserver.observe(thermoFill);
}

/* ============================================================
   INIT
   ============================================================ */
updateImpactPreview(120);
updateDonateBtn(120);
