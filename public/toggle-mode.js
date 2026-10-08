// Meetly: selection is always toggle mode.
// Any element with data-slot toggles immediately when clicked.
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-slot]');
  if (!el) return;
  if (el.matches('button, [role="button"], .time-slot, .slot, .time-cell')) {
    e.preventDefault();
    el.classList.toggle('selected');
    el.classList.toggle('active');
    el.setAttribute('aria-pressed', el.classList.contains('selected') ? 'true' : 'false');
  }
});
