async function initializeSite() {
  const languageButtons = [...document.querySelectorAll('.language-options button[data-language]')];
  let currentLanguage = document.documentElement.dataset.language || 'es';
  let locale;

  async function fetchLocale(language) {
    const response = await fetch(`locales/${language}.json?v=band-property-selection-2`);
    if (!response.ok) throw new Error(`Could not load ${language} translations`);
    return response.json();
  }

  try {
    locale = await fetchLocale(currentLanguage);
  } catch (error) {
    if (currentLanguage === 'es') throw error;
    currentLanguage = 'es';
    locale = await fetchLocale('es');
  }

  function translated(path) {
    const value = path.split('.').reduce((part, key) => part?.[key], locale);
    if (typeof value !== 'string') throw new Error(`Missing translation: ${currentLanguage}.${path}`);
    return value;
  }

  function applyStaticTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = translated(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-highlight]').forEach((element) => {
      const text = translated(element.dataset.i18n);
      const highlight = element.dataset.i18nHighlight;
      const index = text.indexOf(highlight);
      if (index < 0) return;
      const mark = document.createElement('span');
      mark.className = 'intro-place';
      mark.textContent = highlight;
      element.replaceChildren(document.createTextNode(text.slice(0, index)), mark, document.createTextNode(text.slice(index + highlight.length)));
    });
    document.querySelectorAll('[data-i18n-leading]').forEach((element) => {
      const textNode = [...element.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
      if (textNode) textNode.textContent = `${translated(element.dataset.i18nLeading)} `;
    });
    document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
      element.alt = translated(element.dataset.i18nAlt);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
      element.setAttribute('aria-label', translated(element.dataset.i18nAriaLabel));
    });
    document.title = locale.meta.title;
    document.querySelector('meta[name="description"]').content = locale.meta.description;
    document.querySelector('#email-link').href = `mailto:silvidd@gmail.com?subject=${encodeURIComponent(locale.contact.emailSubject)}`;
    document.querySelectorAll('[data-contact-whatsapp]').forEach((link) => {
      link.href = `https://wa.me/${link.dataset.contactWhatsapp}?text=${encodeURIComponent(locale.contact.whatsappMessage)}`;
    });
    document.documentElement.lang = locale.languageTag;
    document.documentElement.dataset.language = currentLanguage;
    languageButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.language === currentLanguage));
    });
  }

const themeToggle = document.querySelector('#theme-toggle');
const themeLabel = themeToggle.querySelector('.theme-toggle-label');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

function savedTheme() {
  try { return localStorage.getItem('paradorsur-theme'); } catch { return null; }
}

function setTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content = dark ? '#111f29' : '#ffffff';
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', dark ? locale.theme.lightAction : locale.theme.darkAction);
  themeLabel.textContent = dark ? locale.theme.lightLabel : locale.theme.darkLabel;
}

setTheme(document.documentElement.dataset.theme || 'light');
themeToggle.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(theme);
  try { localStorage.setItem('paradorsur-theme', theme); } catch {}
});
systemTheme.addEventListener('change', () => {
  if (!savedTheme()) setTheme(systemTheme.matches ? 'dark' : 'light');
});

const heroSlides = [
  { src: 'images/slide/01-hero-exterior-color.jpg' },
  { src: 'images/slide/02-patio-exterior-031.jpg' },
  { src: 'images/slide/03-dos-living.jpg' },
  { src: 'images/slide/04-mono-living.jpg' },
  { src: 'images/slide/05-exterior-noche.jpg' },
  { src: 'images/slide/06-parsur-dos-018.jpg' }
];
const hero = document.querySelector('.hero');
let heroImage = document.querySelector('#hero-image');
let nextHeroImage = document.querySelector('#hero-image-next');
const heroCounter = document.querySelector('#hero-counter');
const heroPause = document.querySelector('#hero-pause');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let slideIndex = 0;
let slideRequest = 0;
let slideTimer;
let userPaused = reducedMotion.matches;

async function showSlide(index) {
  const targetIndex = (index + heroSlides.length) % heroSlides.length;
  const slide = heroSlides[targetIndex];
  const request = ++slideRequest;
  // Keep the current photo visible until the next one is ready.
  const loaded = new Image();
  loaded.src = slide.src;
  try {
    await loaded.decode();
  } catch {
    return;
  }
  if (request !== slideRequest) return;
  nextHeroImage.src = slide.src;
  nextHeroImage.alt = locale.hero.slides[targetIndex];
  nextHeroImage.dataset.slideIndex = String(targetIndex);
  hero.dataset.slideIndex = String(targetIndex);
  nextHeroImage.removeAttribute('aria-hidden');
  nextHeroImage.classList.add('is-visible');
  heroImage.classList.remove('is-visible');
  heroImage.classList.add('hero-image-next');
  heroImage.setAttribute('aria-hidden', 'true');
  [heroImage, nextHeroImage] = [nextHeroImage, heroImage];
  slideIndex = targetIndex;
  heroCounter.textContent = `${String(slideIndex + 1).padStart(2, '0')} / ${String(heroSlides.length).padStart(2, '0')}`;
}

function scheduleSlide() {
  clearTimeout(slideTimer);
  if (userPaused || document.hidden) return;
  slideTimer = setTimeout(async () => {
    await showSlide(slideIndex + 1);
    scheduleSlide();
  }, 4000);
}
function updatePauseButton() {
  heroPause.setAttribute('aria-pressed', String(userPaused));
  heroPause.setAttribute('aria-label', userPaused ? locale.hero.resume : locale.hero.pause);
  heroPause.firstElementChild.textContent = userPaused ? '▶' : 'Ⅱ';
  scheduleSlide();
}
function manualSlide(direction) {
  userPaused = true;
  updatePauseButton();
  showSlide(slideIndex + direction);
}
document.querySelector('#hero-prev').addEventListener('click', () => manualSlide(-1));
document.querySelector('#hero-next').addEventListener('click', () => manualSlide(1));
heroPause.addEventListener('click', () => {
  userPaused = !userPaused;
  updatePauseButton();
});
// Keyboard navigation pauses the slideshow; Play can restart it while focused.
hero.addEventListener('focusin', (event) => {
  if (event.target === heroPause) return;
  userPaused = true;
  updatePauseButton();
});
document.addEventListener('visibilitychange', scheduleSlide);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) userPaused = true;
  updatePauseButton();
});
heroImage.classList.add('is-visible');
updatePauseButton();

const bandTrack = document.querySelector('.photo-band-track');
const bandPhotos = PHOTO_BAND_SLIDES.map(({ file, altKey }) => {
  const button = document.createElement('button');
  button.className = 'photo-band-slide';
  button.type = 'button';
  button.dataset.i18nAriaLabel = altKey;
  button.setAttribute('aria-label', translated(altKey));
  const image = document.createElement('img');
  image.src = `images/slide-horizontal/${file}`;
  image.alt = translated(altKey);
  image.dataset.i18nAlt = altKey;
  image.loading = 'lazy';
  image.draggable = false;
  button.append(image);
  return button;
});
bandTrack.replaceChildren(...bandPhotos);
let bandVisible = false;
let bandHovered = false;
let bandInteractedAt = 0;
function bandStep() { return bandTrack.children[1].getBoundingClientRect().left - bandTrack.children[0].getBoundingClientRect().left; }
function bandOffset() { return (bandTrack.clientWidth - bandStep()) / 2; }
function bandIndex() { return Math.round((bandTrack.scrollLeft + bandOffset()) / bandStep()); }
function bandScrollTo(index, behavior = 'instant') {
  bandTrack.scrollTo({ left: index * bandStep() - bandOffset(), behavior });
}
function bandClone(photo) {
  const clone = photo.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  clone.tabIndex = -1;
  return clone;
}
bandTrack.prepend(...bandPhotos.map(bandClone));
bandTrack.append(...bandPhotos.map(bandClone));
function centerBand() {
  const step = bandStep();
  if (!step) return;
  const count = bandPhotos.length;
  const index = bandIndex();
  if (index < count || index >= count * 2) {
    bandScrollTo(count + ((index % count) + count) % count);
  }
}
bandScrollTo(bandPhotos.length + (window.matchMedia('(min-width:621px)').matches ? 1 : 0));
bandTrack.addEventListener('scrollend', centerBand);
function moveBand(direction) {
  centerBand();
  bandScrollTo(bandIndex() + direction, reducedMotion.matches ? 'instant' : 'smooth');
}
new ResizeObserver(() => {
  bandScrollTo(bandPhotos.length + (window.matchMedia('(min-width:621px)').matches ? 1 : 0));
}).observe(bandTrack);
new IntersectionObserver(([entry]) => { bandVisible = entry.isIntersecting; }).observe(bandTrack);
let bandDrag;
let bandSuppressClickUntil = 0;
bandTrack.addEventListener('pointerdown', (event) => {
  bandInteractedAt = Date.now();
  if (event.pointerType === 'mouse' && event.button === 0) {
    bandDrag = { x: event.clientX, left: bandTrack.scrollLeft, moved: false, id: event.pointerId };
  }
});
bandTrack.addEventListener('pointermove', (event) => {
  if (!bandDrag) return;
  const dx = event.clientX - bandDrag.x;
  if (Math.abs(dx) > 6 && !bandDrag.moved) {
    bandDrag.moved = true;
    bandTrack.setPointerCapture(event.pointerId);
    bandTrack.classList.add('is-dragging');
  }
  if (bandDrag.moved) {
    event.preventDefault();
    bandTrack.scrollLeft = bandDrag.left - dx;
  }
});
function finishBandDrag() {
  if (!bandDrag) return;
  const moved = bandDrag.moved;
  if (bandTrack.hasPointerCapture(bandDrag.id)) bandTrack.releasePointerCapture(bandDrag.id);
  bandDrag = undefined;
  bandTrack.classList.remove('is-dragging');
  if (moved) {
    bandSuppressClickUntil = Date.now() + 350;
    bandScrollTo(bandIndex(), reducedMotion.matches ? 'instant' : 'smooth');
  }
}
bandTrack.addEventListener('pointerup', finishBandDrag);
bandTrack.addEventListener('pointercancel', finishBandDrag);
bandTrack.addEventListener('lostpointercapture', finishBandDrag);
bandTrack.addEventListener('pointerleave', () => { if (bandDrag && !bandDrag.moved) bandDrag = undefined; });
bandTrack.addEventListener('click', (event) => {
  if (Date.now() < bandSuppressClickUntil) return;
  const slide = event.target.closest('.photo-band-slide');
  if (!slide) return;
  bandInteractedAt = Date.now();
  bandScrollTo([...bandTrack.children].indexOf(slide), reducedMotion.matches ? 'instant' : 'smooth');
});
bandTrack.addEventListener('wheel', () => { bandInteractedAt = Date.now(); }, { passive: true });
bandTrack.addEventListener('mouseenter', () => { bandHovered = true; });
bandTrack.addEventListener('mouseleave', () => { bandHovered = false; });
document.querySelector('#band-prev').addEventListener('click', () => { bandInteractedAt = Date.now(); moveBand(-1); });
document.querySelector('#band-next').addEventListener('click', () => { bandInteractedAt = Date.now(); moveBand(1); });
setInterval(() => {
  if (!bandDrag && !reducedMotion.matches && bandVisible && !bandHovered && !document.hidden && !bandTrack.parentElement.contains(document.activeElement) && Date.now() - bandInteractedAt > 8000) moveBand(1);
}, 5000);

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
function closeMenu() {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', locale.nav.open);
}
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? locale.nav.close : locale.nav.open);
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

const checkin = document.querySelector('#checkin');
const checkout = document.querySelector('#checkout');
const form = document.querySelector('#inquiry-form');
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
checkin.min = today;
checkout.min = today;
checkin.addEventListener('change', () => {
  checkout.min = checkin.value || today;
  checkout.setCustomValidity('');
});
checkout.addEventListener('change', () => checkout.setCustomValidity(''));

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (checkout.value <= checkin.value) {
    checkout.setCustomValidity(locale.inquiry.dateError);
    checkout.reportValidity();
    return;
  }
  const formatDate = (value) => new Date(`${value}T12:00:00`).toLocaleDateString(locale.dateLocale);
  const guests = document.querySelector('#guests').value;
  const message = locale.inquiry.whatsappMessage
    .replace('{start}', formatDate(checkin.value))
    .replace('{end}', formatDate(checkout.value))
    .replace('{guests}', guests);
  window.open(`https://wa.me/5491136248893?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});

document.querySelector('#year').textContent = new Date().getFullYear();

const galleries = {
  mono: {
    photos: [
      { src: 'images/dt-mono/parsur-mono-001.jpg' },
      { src: 'images/dt-mono/parsur-mono-002.jpg' },
      { src: 'images/dt-mono/parsur-mono-003.jpg' },
      { src: 'images/dt-mono/parsur-mono-005.jpg' },
      { src: 'images/dt-mono/parsur-mono-006.jpg' },
      { src: 'images/dt-mono/parsur-mono-007.jpg' },
      { src: 'images/dt-mono/parsur-mono-008.jpg' },
      { src: 'images/dt-mono/parsur-mono-009.jpg' },
      { src: 'images/dt-mono/parsur-mono-010.jpg' },
      { src: 'images/dt-mono/parsur-mono-011.jpg' },
      { src: 'images/dt-mono/parsur-mono-012.jpg' },
      { src: 'images/dt-mono/parsur-mono-013.jpg' },
      { src: 'images/dt-mono/parsur-mono-014.jpg?v=20261026' },
      { src: 'images/dt-mono/parsur-mono-016.jpg' },
      { src: 'images/dt-mono/parsur-mono-017.jpg' },
      { src: 'images/dt-mono/parsur-mono-018.jpg' },
      { src: 'images/dt-mono/parsur-mono-019.jpg' },
      { src: 'images/dt-mono/parsur-mono-020.jpg' },
      { src: 'images/dt-mono/parsur-mono-021.jpg' },
      { src: 'images/dt-mono/parsur-mono-022.jpg' }
    ]
  },
  dos: {
    photos: [
      { src: 'images/dt-dosamb/parsur-dos-001.jpg' },
      { src: 'images/dt-dosamb/parsur-dos-002.jpg' },
      { src: 'images/dt-dosamb/parsur-dos-003.jpg' },
      { src: 'images/dt-dosamb/parsur-dos-004.jpg' },
      { src: 'images/dt-dosamb/parsur-dos-005.jpg' },
      { src: 'images/dt-dosamb/parsur-dos-007.jpg' },
      { src: 'images/dt-dosamb/parsur-dos-008.jpg' },
      { src: 'images/dt-dosamb/parsur-dos-009.jpg' },
      { src: 'images/dt-dosamb/parsur-dos-010.jpg' },
      { src: 'images/dt-dosamb/parsur-dos-011.jpg' },
      { src: 'images/dt-dosamb/parsur-dos-012.jpg' },
      { src: 'images/dt-dosamb/parsur-dos-013.jpg' },
      { src: 'images/dt-dosamb/parsur-dos-014.jpg' },
      { src: 'images/dt-dosamb/parsur-dos-015.jpg' },
      { src: 'images/dt-dosamb/parsur-dos-016.jpg' },
      { src: 'images/dt-dosamb/parsur-dos-017.jpg' },
      { src: 'images/dt-dosamb/parsur-dos-018.jpg' }
    ]
  },
  costa: {
    photos: [
      { src: 'images/slide-lasgrutas/lasgrutas-001-vista-desde-la-gruta.jpg' },
      { src: 'images/slide-lasgrutas/lasgrutas-002-gruta-al-atardecer.jpg' },
      { src: 'images/slide-lasgrutas/lasgrutas-003-playa-terrazas-al-mar.jpg' },
      { src: 'images/slide-lasgrutas/lasgrutas-004-dunas-y-mar.jpg' },
      { src: 'images/slide-lasgrutas/lasgrutas-005-arcoiris-en-la-playa.jpg' },
      { src: 'images/slide-lasgrutas/lasgrutas-006-carreta-frente-al-mar.jpg' },
      { src: 'images/slide-lasgrutas/lasgrutas-007-costa-y-oleaje.jpg' },
      { src: 'images/slide-lasgrutas/lasgrutas-008-playa-en-verano.jpg' },
      { src: 'images/slide-lasgrutas/lasgrutas-009-playa-de-conchillas.jpg' },
      { src: 'images/slide-lasgrutas/lasgrutas-010-playa-tranquila.jpg' },
      { src: 'images/slide-lasgrutas/lasgrutas-011-paseo-en-lancha.jpg' },
      { src: 'images/slide-lasgrutas/lasgrutas-012-buceo.png' },
      { src: 'images/slide-lasgrutas/lasgrutas-013-fondo-marino.png' },
      { src: 'images/slide-lasgrutas/lasgrutas-014-playa-puerto-sao-2023.jpg' },
      { src: 'images/slide-lasgrutas/lasgrutas-015-pileton-terrazas-al-mar-2023.jpg' },
      { src: 'images/slide-lasgrutas/lasgrutas-016-playa-2023.jpg' },
      { src: 'images/slide-lasgrutas/lasgrutas-017-playa-terrazas-2023.jpg' }
    ]
  }
};
const galleryDialog = document.querySelector('#gallery-dialog');
const galleryPhoto = document.querySelector('#gallery-photo');
const galleryCaption = document.querySelector('#gallery-caption');
const galleryCounter = document.querySelector('#gallery-counter');
const galleryTitle = document.querySelector('#gallery-title-modal');
const galleryThumbnails = document.querySelector('#gallery-thumbnails');
let activeGallery;
let activeGalleryName;
let galleryIndex = 0;
let galleryOpener;
galleryPhoto.addEventListener('load', () => { galleryPhoto.hidden = false; });

function buildGalleryThumbnails() {
  const buttons = activeGallery.photos.map((photo, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    const caption = locale.gallery[activeGalleryName].photos[index].caption;
    button.setAttribute('aria-label', locale.gallery.photoLabel.replace('{number}', String(index + 1)).replace('{caption}', caption));
    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 96;
    image.height = 72;
    button.append(image);
    button.addEventListener('click', () => showGalleryPhoto(index));
    return button;
  });
  galleryThumbnails.replaceChildren(...buttons);
}

function showGalleryPhoto(index) {
  galleryIndex = (index + activeGallery.photos.length) % activeGallery.photos.length;
  const photo = activeGallery.photos[galleryIndex];
  const translatedPhoto = locale.gallery[activeGalleryName].photos[galleryIndex];
  galleryPhoto.hidden = true;
  galleryPhoto.src = photo.src;
  galleryPhoto.alt = translatedPhoto.alt;
  if (galleryPhoto.complete && galleryPhoto.naturalWidth) galleryPhoto.hidden = false;
  galleryCaption.textContent = translatedPhoto.caption;
  galleryCounter.textContent = `${galleryIndex + 1} / ${activeGallery.photos.length}`;
  [...galleryThumbnails.children].forEach((button, photoIndex) => {
    if (photoIndex === galleryIndex) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
    if (photoIndex === galleryIndex) {
      galleryThumbnails.scrollTo({ left: Math.max(0, button.offsetLeft - galleryThumbnails.offsetLeft - (galleryThumbnails.clientWidth - button.offsetWidth) / 2), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
  });
}

document.querySelectorAll('[data-gallery]').forEach((button) => {
  button.addEventListener('click', () => {
    galleryOpener = button;
    activeGalleryName = button.dataset.gallery;
    activeGallery = galleries[activeGalleryName];
    galleryTitle.textContent = `${locale.gallery.titlePrefix}${locale.gallery[activeGalleryName].title}`;
    buildGalleryThumbnails();
    showGalleryPhoto(0);
    galleryDialog.showModal();
    document.body.classList.add('gallery-open');
  });
});
document.querySelector('#gallery-prev').addEventListener('click', () => showGalleryPhoto(galleryIndex - 1));
document.querySelector('#gallery-next').addEventListener('click', () => showGalleryPhoto(galleryIndex + 1));
document.querySelector('#gallery-close').addEventListener('click', () => galleryDialog.close());
galleryDialog.addEventListener('click', (event) => {
  if (event.target === galleryDialog) galleryDialog.close();
});
galleryDialog.addEventListener('close', () => {
  document.body.classList.remove('gallery-open');
  galleryOpener?.focus();
});
document.addEventListener('keydown', (event) => {
  if (!galleryDialog.open) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showGalleryPhoto(galleryIndex + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});

function applyLanguage() {
  applyStaticTranslations();
  setTheme(document.documentElement.dataset.theme || 'light');
  updatePauseButton();
  menuButton.setAttribute('aria-label', nav.classList.contains('open') ? locale.nav.close : locale.nav.open);
  heroImage.alt = locale.hero.slides[Number(heroImage.dataset.slideIndex ?? slideIndex)];
  if (nextHeroImage.getAttribute('src')) {
    nextHeroImage.alt = locale.hero.slides[Number(nextHeroImage.dataset.slideIndex ?? slideIndex)];
  }
  checkout.setCustomValidity('');
  if (galleryDialog.open) {
    galleryTitle.textContent = `${locale.gallery.titlePrefix}${locale.gallery[activeGalleryName].title}`;
    buildGalleryThumbnails();
    showGalleryPhoto(galleryIndex);
  }
}

applyLanguage();
document.documentElement.classList.remove('i18n-loading');
languageButtons.forEach((button) => button.addEventListener('click', async () => {
  const nextLanguage = button.dataset.language;
  if (nextLanguage === currentLanguage) return;
  languageButtons.forEach((item) => { item.disabled = true; });
  try {
    const nextLocale = await fetchLocale(nextLanguage);
    currentLanguage = nextLanguage;
    locale = nextLocale;
    applyLanguage();
    closeMenu();
    try { localStorage.setItem('paradorsur-language', nextLanguage); } catch {}
  } catch (error) {
    console.error(error);
  } finally {
    languageButtons.forEach((item) => { item.disabled = false; });
  }
}));

}

initializeSite().catch((error) => {
  document.documentElement.classList.remove('i18n-loading');
  console.error(error);
});
