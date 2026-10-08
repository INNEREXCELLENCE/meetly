// Meetly time options: full 24 hours, 30-minute increments.
window.MEETLY_TIME_OPTIONS = Array.from({length: 48}, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0');
  const m = i % 2 ? '30' : '00';
  return `${h}:${m}`;
});
