const shots = [...document.querySelectorAll('.shot')];
const dialog = document.querySelector('dialog');
const viewer = dialog.querySelector('.viewer img');
let current = 0;
function show(index) {
  current = (index + shots.length) % shots.length;
  const shot = shots[current];
  viewer.src = shot.dataset.full;
  viewer.alt = shot.querySelector('img').alt;
  if (!dialog.open) dialog.showModal();
}
shots.forEach((shot, index) => shot.addEventListener('click', () => show(index)));
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.querySelector('.prev').addEventListener('click', () => show(current - 1));
dialog.querySelector('.next').addEventListener('click', () => show(current + 1));
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
window.addEventListener('keydown', event => {
  if (!dialog.open) return;
  if (event.key === 'ArrowRight') show(current + 1);
  if (event.key === 'ArrowLeft') show(current - 1);
});
