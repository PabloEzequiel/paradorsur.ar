const heroSlides = [
  { src: 'images/slide/01-hero-exterior-color.jpg', alt: 'Exterior de los departamentos de Parador Sur' },
  { src: 'images/slide/02-patio-exterior-031.jpg', alt: 'Patio y accesos a los departamentos bajo las medias sombras' },
  { src: 'images/slide/03-dos-living.jpg', alt: 'Cocina y comedor de un departamento de dos ambientes' },
  { src: 'images/slide/04-mono-living.jpg', alt: 'Interior y espacio de estar del monoambiente' },
  { src: 'images/slide/05-exterior-noche.jpg', alt: 'Parador Sur iluminado de noche' },
  { src: 'images/slide/06-parsur-dos-018.jpg', alt: 'Vista exterior de los departamentos de Parador Sur' }
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
  nextHeroImage.alt = slide.alt;
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
  heroPause.setAttribute('aria-label', userPaused ? 'Reanudar presentación de fotos' : 'Pausar presentación de fotos');
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

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
function closeMenu() {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
}
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
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
    checkout.setCustomValidity('La salida debe ser posterior a la entrada.');
    checkout.reportValidity();
    return;
  }
  const formatDate = (value) => new Date(`${value}T12:00:00`).toLocaleDateString('es-AR');
  const guests = document.querySelector('#guests').value;
  const message = `Hola, quiero consultar disponibilidad en Parador Sur del ${formatDate(checkin.value)} al ${formatDate(checkout.value)} para ${guests} personas.`;
  window.open(`https://wa.me/5492934411532?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});

document.querySelector('#year').textContent = new Date().getFullYear();

const galleries = {
  mono: {
    title: 'MONOAMBIENTE',
    photos: [
      { src: 'images/dt-mono/parsur-mono-001.jpg', alt: 'Acceso exterior y portón del monoambiente', caption: 'Monoambiente · acceso exterior' },
      { src: 'images/dt-mono/parsur-mono-002.jpg', alt: 'Fachada rosa y patio del monoambiente', caption: 'Monoambiente · fachada y patio' },
      { src: 'images/dt-mono/parsur-mono-003.jpg', alt: 'Sofá del monoambiente junto al acceso', caption: 'Monoambiente · estar y sofá' },
      { src: 'images/dt-mono/parsur-mono-005.jpg', alt: 'Comedor y acceso del monoambiente', caption: 'Monoambiente · comedor' },
      { src: 'images/dt-mono/parsur-mono-006.jpg', alt: 'Sofá y mesa del monoambiente', caption: 'Monoambiente · sofá y estar' },
      { src: 'images/dt-mono/parsur-mono-007.jpg', alt: 'Cama del monoambiente con ropa de cama', caption: 'Monoambiente · cama' },
      { src: 'images/dt-mono/parsur-mono-008.jpg', alt: 'Otra vista de la cama del monoambiente', caption: 'Monoambiente · dormitorio' },
      { src: 'images/dt-mono/parsur-mono-009.jpg', alt: 'Pasillo de acceso al monoambiente', caption: 'Monoambiente · pasillo' },
      { src: 'images/dt-mono/parsur-mono-010.jpg', alt: 'Heladera y sector de cocina', caption: 'Monoambiente · cocina' },
      { src: 'images/dt-mono/parsur-mono-011.jpg', alt: 'Mesada y cocina del monoambiente', caption: 'Monoambiente · mesada y cocina' },
      { src: 'images/dt-mono/parsur-mono-012.jpg', alt: 'Cocina y sector de lavado', caption: 'Monoambiente · cocina y lavadero' },
      { src: 'images/dt-mono/parsur-mono-013.jpg', alt: 'Heladera y acceso al monoambiente', caption: 'Monoambiente · heladera y acceso' },
      { src: 'images/dt-mono/parsur-mono-014.jpg', alt: 'Ducha del baño del monoambiente', caption: 'Monoambiente · ducha' },
      { src: 'images/dt-mono/parsur-mono-016.jpg', alt: 'Comedor junto a la pared de ladrillo', caption: 'Monoambiente · comedor interior' },
      { src: 'images/dt-mono/parsur-mono-017.jpg', alt: 'Comedor junto a la pared de ladrillo', caption: 'Monoambiente · comedor interior' },
      { src: 'images/dt-mono/parsur-mono-018.jpg', alt: 'Portal de acceso exterior del complejo', caption: 'Monoambiente · acceso' },
      { src: 'images/dt-mono/parsur-mono-019.jpg', alt: 'Estructura exterior naranja junto a los departamentos', caption: 'Monoambiente · exterior' },
      { src: 'images/dt-mono/parsur-mono-020.jpg', alt: 'Espacios para vehículos frente a los departamentos', caption: 'Monoambiente · exterior y estacionamiento' },
      { src: 'images/dt-mono/parsur-mono-021.jpg', alt: 'Frente y portón del complejo Parador Sur', caption: 'Monoambiente · frente del complejo' },
      { src: 'images/dt-mono/parsur-mono-022.jpg', alt: 'Vista amplia del comedor y sector de estar', caption: 'Monoambiente · comedor y estar' }
    ]
  },
  dos: {
    title: 'DOS AMBIENTES',
    photos: [
      { src: 'images/dt-dosamb/parsur-dos-001.jpg', alt: 'Patio y accesos bajo las medias sombras', caption: 'Dos ambientes · patio y accesos' },
      { src: 'images/dt-dosamb/parsur-dos-002.jpg', alt: 'Dormitorio con cama matrimonial', caption: 'Dos ambientes · dormitorio' },
      { src: 'images/dt-dosamb/parsur-dos-003.jpg', alt: 'Baño del departamento de dos ambientes', caption: 'Dos ambientes · baño' },
      { src: 'images/dt-dosamb/parsur-dos-004.jpg', alt: 'Comedor y cocina del departamento de dos ambientes', caption: 'Dos ambientes · cocina y comedor' },
      { src: 'images/dt-dosamb/parsur-dos-005.jpg', alt: 'Vista del comedor y la cocina', caption: 'Dos ambientes · comedor' },
      { src: 'images/dt-dosamb/parsur-dos-006.jpg', alt: 'Vista de la costa de Las Grutas', caption: 'Dos ambientes · costa de Las Grutas' },
      { src: 'images/dt-dosamb/parsur-dos-007.jpg', alt: 'Acceso al dormitorio desde el estar', caption: 'Dos ambientes · acceso al dormitorio' },
      { src: 'images/dt-dosamb/parsur-dos-008.jpg', alt: 'Lavamanos y espejo del baño', caption: 'Dos ambientes · lavamanos' },
      { src: 'images/dt-dosamb/parsur-dos-009.jpg', alt: 'Mesa de comedor y sector de cocina', caption: 'Dos ambientes · cocina comedor' },
      { src: 'images/dt-dosamb/parsur-dos-010.jpg', alt: 'Mesa de comedor y vista hacia el estar', caption: 'Dos ambientes · comedor y estar' },
      { src: 'images/dt-dosamb/parsur-dos-011.jpg', alt: 'Sofá cama y acceso al baño del departamento de dos ambientes', caption: 'Dos ambientes · estar y acceso al baño' },
      { src: 'images/dt-dosamb/parsur-dos-012.jpg', alt: 'Dormitorio y espacio de guardado', caption: 'Dos ambientes · dormitorio y guardado' },
      { src: 'images/dt-dosamb/parsur-dos-013.jpg', alt: 'Vista del baño y la ducha', caption: 'Dos ambientes · baño y ducha' },
      { src: 'images/dt-dosamb/parsur-dos-014.jpg', alt: 'Estar con sofá y mesa de comedor', caption: 'Dos ambientes · estar y comedor' },
      { src: 'images/dt-dosamb/parsur-dos-015.jpg', alt: 'Acceso exterior al departamento de dos ambientes', caption: 'Dos ambientes · acceso exterior' },
      { src: 'images/dt-dosamb/parsur-dos-016.jpg', alt: 'Parrilla junto al acceso del departamento', caption: 'Dos ambientes · parrilla' },
      { src: 'images/dt-dosamb/parsur-dos-017.jpg', alt: 'Vista exterior del complejo Parador Sur', caption: 'Dos ambientes · exterior del complejo' },
      { src: 'images/dt-dosamb/parsur-dos-018.jpg', alt: 'Frente de los departamentos con portón y vereda', caption: 'Dos ambientes · frente del complejo' }
    ]
  },
  costa: {
    title: 'LAS GRUTAS',
    photos: [
      { src: 'images/img-lasgrutas/playa-panoramica.jpg', alt: 'Vista panorámica de la playa de Las Grutas', caption: 'Las Grutas · playa' },
      { src: 'images/img-lasgrutas/mar-las-grutas.jpg', alt: 'Mar y formaciones rocosas de Las Grutas', caption: 'Las Grutas · paisaje' },
      { src: 'images/img-lasgrutas/playa-las-grutas.jpg', alt: 'Playa y rocas de Las Grutas', caption: 'Las Grutas · costa' },
      { src: 'images/img-lasgrutas/playa-terrazas.jpg', alt: 'Playa de Terrazas al Mar', caption: 'Terrazas al Mar · playa' }
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
let galleryIndex = 0;
let galleryOpener;

function buildGalleryThumbnails() {
  const buttons = activeGallery.photos.map((photo, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Foto ${index + 1}: ${photo.caption}`);
    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = '';
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
  galleryPhoto.src = photo.src;
  galleryPhoto.alt = photo.alt;
  galleryCaption.textContent = photo.caption;
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
    activeGallery = galleries[button.dataset.gallery];
    galleryTitle.textContent = `PARADOR SUR · ${activeGallery.title}`;
    buildGalleryThumbnails();
    galleryDialog.showModal();
    showGalleryPhoto(0);
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
