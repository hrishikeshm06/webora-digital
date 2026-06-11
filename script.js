/* Webora Digital Solution - production behavior */
(function () {
'use strict';

const CONTACT_EMAIL = 'hello.weboradigital@gmail.com';
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/' + encodeURIComponent(CONTACT_EMAIL);
const PAGE_TITLES = {
home: 'Webora Digital - Performance Marketing Agency in Mumbai',
about: 'About Webora Digital - Founder-Led Marketing Agency',
services: 'Services - Meta Ads, Google Ads, Lead Generation',
frameworks: 'Growth Frameworks - Webora Digital',
contact: 'Contact Webora Digital - Free Marketing Audit',
privacy: 'Privacy Policy - Webora Digital',
terms: 'Terms & Conditions - Webora Digital'
};

const PAGE_DESCRIPTIONS = {
home: 'Mumbai-based performance marketing agency for Meta Ads, Google Ads, lead generation, social media and website development.',
about: 'Learn about Webora Digital Solution and founder Hrishikesh More.',
services: 'Explore Webora Digital services including Meta Ads, Google Ads, social media, websites and lead generation.',
frameworks: 'Sample marketing frameworks that show how Webora Digital approaches growth for different industries.',
contact: 'Request a free digital marketing audit from Webora Digital Solution.',
privacy: 'Privacy policy for Webora Digital Solution.',
terms: 'Terms and conditions for Webora Digital Solution.'
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function $(selector, scope) {
return (scope || document).querySelector(selector);
}

function $all(selector, scope) {
return Array.from((scope || document).querySelectorAll(selector));
}

function updateMeta(pageName) {
document.title = PAGE_TITLES[pageName] || PAGE_TITLES.home;
const description = $('meta[name="description"]');
if (description) {
description.setAttribute('content', PAGE_DESCRIPTIONS[pageName] || PAGE_DESCRIPTIONS.home);
}
}

function updateActiveNav(pageName) {
$all('.nav-links a, .mobile-menu a').forEach((link) => {
const action = link.getAttribute('onclick') || '';
const isActive = action.includes("showPage('" + pageName + "')") || action.includes('showPage("' + pageName + '")');
link.classList.toggle('active', isActive);
if (isActive) {
link.setAttribute('aria-current', 'page');
} else {
link.removeAttribute('aria-current');
}
});
}

function revealVisibleItems() {
$all('.page.active .reveal').forEach((el) => {
const rect = el.getBoundingClientRect();
if (rect.top < window.innerHeight - 40) {
el.classList.add('visible');
}
});
}

function initRevealObserver() {
const revealItems = $all('.reveal');

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((el) => el.classList.add('visible'));
  return;
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealItems.forEach((el) => observer.observe(el));
}

function setHash(pageName) {
const desiredHash = pageName === 'home' ? '' : '#' + pageName;
const currentHash = window.location.hash || '';
if (currentHash !== desiredHash) {
history.pushState({ page: pageName }, '', desiredHash || window.location.pathname);
}
}

window.showPage = function showPage(pageName, options) {
const target = document.getElementById('page-' + pageName);
if (!target) {
pageName = 'home';
}

$all('.page').forEach((page) => page.classList.remove('active'));
(document.getElementById('page-' + pageName) || document.getElementById('page-home')).classList.add('active');

updateMeta(pageName);
updateActiveNav(pageName);
window.closeMobile();

if (!options || options.updateHash !== false) {
  setHash(pageName);
}

window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
window.setTimeout(revealVisibleItems, prefersReducedMotion ? 0 : 120);
};

window.toggleMobile = function toggleMobile() {
const menu = $('#mobileMenu');
const button = $('#hamburger');
if (!menu) return;

const isOpen = menu.classList.toggle('open');
document.body.classList.toggle('mobile-menu-open', isOpen);

if (button) {
  button.classList.toggle('open', isOpen);
  button.setAttribute('aria-expanded', String(isOpen));
}
};

window.closeMobile = function closeMobile() {
const menu = $('#mobileMenu');
const button = $('#hamburger');
if (menu) menu.classList.remove('open');
document.body.classList.remove('mobile-menu-open');
if (button) {
button.classList.remove('open');
button.setAttribute('aria-expanded', 'false');
}
};

function showFieldError(field, message) {
field.setAttribute('aria-invalid', 'true');
let error = field.parentElement.querySelector('.field-error');
if (!error) {
error = document.createElement('p');
error.className = 'field-error';
field.parentElement.appendChild(error);
}
error.textContent = message;
}

function clearFieldErrors(form) {
$all('[aria-invalid="true"]', form).forEach((field) => field.removeAttribute('aria-invalid'));
$all('.field-error', form).forEach((error) => error.remove());
}

function validateForm(form) {
clearFieldErrors(form);
let valid = true;

$all('[required]', form).forEach((field) => {
  if (!field.value.trim()) {
    valid = false;
    showFieldError(field, 'This field is required.');
  }
});

const email = $('input[type="email"]', form);
if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
  valid = false;
  showFieldError(email, 'Please enter a valid email address.');
}

const url = $('input[type="url"]', form);
if (url && url.value.trim()) {
  try {
    new URL(url.value.trim());
  } catch (error) {
    valid = false;
    showFieldError(url, 'Please enter a full URL, including https://');
  }
}

return valid;
}

function buildWhatsAppMessage(form) {
const data = new FormData(form);
const fullName = [data.get('first_name'), data.get('last_name')].filter(Boolean).join(' ').trim();
const lines = [
'Hello Webora Digital, I would like to request a free marketing audit.',
fullName ? 'Name: ' + fullName : '',
data.get('email') ? 'Email: ' + data.get('email') : '',
data.get('phone') ? 'Phone: ' + data.get('phone') : '',
data.get('industry') ? 'Business type: ' + data.get('industry') : '',
data.get('website') ? 'Website: ' + data.get('website') : '',
data.get('message') ? 'Challenge: ' + data.get('message') : ''
].filter(Boolean);

return 'https://wa.me/918104092497?text=' + encodeURIComponent(lines.join('\n'));
}

window.handleFormSubmit = async function handleFormSubmit(event, successId) {
event.preventDefault();
const form = event.target;
const success = document.getElementById(successId);
const submitButton = $('button[type="submit"]', form);

if (!validateForm(form)) {
  const firstInvalid = $('[aria-invalid="true"]', form);
  if (firstInvalid) firstInvalid.focus();
  return;
}

if (form.elements._honey && form.elements._honey.value) {
  return;
}

const originalText = submitButton ? submitButton.textContent : '';
if (submitButton) {
  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';
}

try {
  const response = await fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: new FormData(form)
  });

  if (!response.ok) throw new Error('Form service unavailable');

  form.reset();
  if (success) success.classList.add('show');
  window.setTimeout(() => success && success.classList.remove('show'), 8000);
} catch (error) {
  const whatsappUrl = buildWhatsAppMessage(form);
  if (success) {
    success.innerHTML = 'Could not send by email right now. <a href="' + whatsappUrl + '" target="_blank" rel="noopener noreferrer">Continue on WhatsApp</a>.';
    success.classList.add('show');
  } else {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }
} finally {
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}
};

function handleNavScroll() {
const nav = $('#mainNav');
if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
}

function initKeyboardSupport() {
$all('[onclick][role="button"], .nav-logo, .hamburger').forEach((el) => {
el.setAttribute('tabindex', el.getAttribute('tabindex') || '0');
el.addEventListener('keydown', (event) => {
if (event.key === 'Enter' || event.key === ' ') {
event.preventDefault();
el.click();
}
});
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') window.closeMobile();
});
}

function initHashRouting() {
const pageFromHash = (window.location.hash || '#home').replace('#', '').trim() || 'home';
window.showPage(document.getElementById('page-' + pageFromHash) ? pageFromHash : 'home', { updateHash: false });

window.addEventListener('popstate', () => {
  const page = (window.location.hash || '#home').replace('#', '') || 'home';
  window.showPage(document.getElementById('page-' + page) ? page : 'home', { updateHash: false });
});
}

document.addEventListener('DOMContentLoaded', () => {
initRevealObserver();
initKeyboardSupport();
initHashRouting();
handleNavScroll();
revealVisibleItems();

window.addEventListener('scroll', handleNavScroll, { passive: true });
window.addEventListener('resize', revealVisibleItems);
document.addEventListener('click', (event) => {
  const menu = $('#mobileMenu');
  const hamburger = $('#hamburger');
  if (menu && menu.classList.contains('open') && !menu.contains(event.target) && !hamburger.contains(event.target)) {
    window.closeMobile();
  }
});
});
})();


