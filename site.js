'use strict';

const root = document.documentElement;
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');
const motionButton = document.querySelector('.motion-toggle');
const motionLabel = document.querySelector('.motion-label');
const systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const narrowScreen = window.matchMedia('(max-width: 800px)');
const finePointer = window.matchMedia('(pointer: fine)');
const hero = document.querySelector('.hero');
const openingStory = document.querySelector('.opening-story');
const openingContent = document.querySelector('.opening-content');
const openingScene = document.querySelector('.opening-scene');
const heroStage = document.querySelector('.hero-stage');
const heroBloom = document.querySelector('.hero-bloom');
const bloomFilm = document.querySelector('.bloom-film');
const heroTitle = document.querySelector('h1');
const intro = document.querySelector('.intro-statement');
const journey = document.querySelector('.journey');
const chapters = Array.from(document.querySelectorAll('.chapter'));
const journeyCurrent = document.querySelector('.journey-current');
const journeyTrack = document.querySelector('.journey-track i');
const orbitLine = document.querySelector('.orbit-line');
const orbitImage = document.querySelector('.orbit-inner img');
const aboutWindow = document.querySelector('.about-art-window');
const aboutImage = document.querySelector('.about-art-window img');
const reflection = document.querySelector('.reflection');
const reflectionImage = document.querySelector('.reflection-art img');
const progress = document.querySelector('.reading-progress');
let motionOn = !systemMotion.matches;
let frame = 0;
let pointerX = 0;
let pointerY = 0;
let pageHeight = root.scrollHeight;
let activeChapter = -1;
let filmRequested = false;
let filmReady = false;
let filmVisible = true;
let filmTarget = 0;
let filmTravel = 1;
let filmFrame = 0;
let filmClock = 0;
let filmLoadTimer = 0;
let filmController = null;
let filmObjectUrl = null;
const clamp = value => Math.max(0, Math.min(1, value));
const easeBetween = (start, end, value) => {
  const phase = clamp((value - start) / (end - start));
  return phase * phase * (3 - 2 * phase);
};

function closeMenu() {
  navigation.classList.remove('is-open');
  header.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
}
menuButton.addEventListener('click', () => {
  const opened = navigation.classList.toggle('is-open');
  header.classList.toggle('menu-open', opened);
  menuButton.setAttribute('aria-expanded', String(opened));
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!header.contains(event.target)) closeMenu();
});
narrowScreen.addEventListener('change', () => { closeMenu(); measure(); });
document.querySelector('#year').textContent = String(new Date().getFullYear());

// Reveal only after the observer is ready; the static document is always readable.
const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
  revealElements.forEach(element => revealObserver.observe(element));
} else {
  revealElements.forEach(element => element.classList.add('is-visible'));
}

function clearTransforms() {
  [heroBloom, heroTitle, intro, orbitLine, orbitImage, aboutImage, reflectionImage].forEach(element => element.style.removeProperty('transform'));
  pointerX = 0;
  pointerY = 0;
}
function stopFilm() {
  if (filmFrame) cancelAnimationFrame(filmFrame);
  filmFrame = 0;
  filmClock = 0;
}
function filmUnavailable() {
  clearTimeout(filmLoadTimer);
  if (filmController) filmController.abort();
  if (filmObjectUrl) { URL.revokeObjectURL(filmObjectUrl); filmObjectUrl = null; }
  filmReady = false;
  stopFilm();
  openingStory.classList.remove('bloom-ready');
  openingStory.classList.add('bloom-unavailable');
  measure();
}
function scheduleFilm() {
  if (!filmFrame && filmReady && filmVisible && motionOn && !document.hidden && !bloomFilm.seeking) {
    filmFrame = requestAnimationFrame(scrubFilm);
  }
}
function scrubFilm(now) {
  filmFrame = 0;
  if (!filmReady || !filmVisible || !motionOn || document.hidden) { filmClock = 0; return; }
  const difference = filmTarget - bloomFilm.currentTime;
  if (Math.abs(difference) < 1 / 48) { filmClock = 0; return; }
  const elapsed = filmClock ? Math.min(50, now - filmClock) : 16.7;
  filmClock = now;
  // Ease the playhead; allow one decode at a time so fast scrolls cannot queue old seeks.
  const next = Math.abs(difference) < .06 ? filmTarget : bloomFilm.currentTime + difference * (1 - Math.exp(-elapsed / 110));
  bloomFilm.currentTime = Math.max(0, Math.min(bloomFilm.duration - 1 / 24, next));
}
function loadBloomFilm() {
  if (filmRequested) return;
  filmRequested = true;
  const poster = document.querySelector('.bloom-poster');
  poster.src = poster.dataset.bloomPoster;
  bloomFilm.muted = true;
  bloomFilm.addEventListener('loadeddata', () => {
    if (!Number.isFinite(bloomFilm.duration) || bloomFilm.duration <= 0) { filmUnavailable(); return; }
    clearTimeout(filmLoadTimer);
    filmReady = true;
    openingStory.classList.remove('bloom-unavailable');
    openingStory.classList.add('bloom-ready');
    measure();
  }, { once: true });
  bloomFilm.addEventListener('seeked', scheduleFilm);
  bloomFilm.addEventListener('error', filmUnavailable);
  const source = narrowScreen.matches ? bloomFilm.dataset.filmMobileSrc : bloomFilm.dataset.filmSrc;
  filmController = new AbortController();
  // Wait for the page itself to finish loading so the film never competes with text and images.
  const startFilm = () => {
    filmLoadTimer = setTimeout(filmUnavailable, 20000);
    // A local object URL provides seekable media even when the host does not support byte-range requests.
    fetch(source, { signal: filmController.signal }).then(response => {
      if (!response.ok) throw new Error('Bloom film unavailable');
      return response.blob();
    }).then(blob => {
      if (filmController.signal.aborted || !blob.size) throw new Error('Bloom film unavailable');
      filmObjectUrl = URL.createObjectURL(blob);
      bloomFilm.src = filmObjectUrl;
      bloomFilm.preload = 'auto';
      bloomFilm.load();
    }).catch(filmUnavailable);
  };
  if (document.readyState === 'complete') startFilm();
  else window.addEventListener('load', startFilm, { once: true });
}
function setMotion(enabled) {
  motionOn = enabled && !systemMotion.matches;
  root.classList.toggle('motion-enabled', motionOn);
  root.classList.toggle('motion-reduced', !motionOn);
  motionButton.setAttribute('aria-pressed', String(motionOn));
  motionButton.setAttribute('aria-label', systemMotion.matches ? 'Decorative motion follows your device preference: reduced' : 'Enable decorative motion');
  motionButton.disabled = systemMotion.matches;
  motionLabel.textContent = systemMotion.matches ? 'Motion reduced' : motionOn ? 'Motion on' : 'Motion off';
  if (!motionOn) { clearTransforms(); stopFilm(); }
  else loadBloomFilm();
  measure();
}
motionButton.hidden = false;
motionButton.addEventListener('click', () => setMotion(!motionOn));
systemMotion.addEventListener('change', () => setMotion(!systemMotion.matches));
root.classList.add('js');

function measure() {
  const stageHeight = `${Math.ceil(heroStage.getBoundingClientRect().height)}px`;
  if (hero.style.getPropertyValue('--hero-stage-height') !== stageHeight) hero.style.setProperty('--hero-stage-height', stageHeight);
  if (openingStory.style.getPropertyValue('--opening-stage-height') !== stageHeight) openingStory.style.setProperty('--opening-stage-height', stageHeight);
  pageHeight = root.scrollHeight;
  const flowerHold = parseFloat(getComputedStyle(openingContent).paddingBottom) || 0;
  filmTravel = Math.max(1, openingStory.offsetHeight - openingScene.offsetHeight - flowerHold);
  scheduleFrame();
}
function scheduleFrame() {
  if (!frame && !document.hidden) frame = requestAnimationFrame(renderFrame);
}
function renderFrame() {
  frame = 0;
  const scroll = window.scrollY;
  const viewport = window.innerHeight;
  // Read geometry before writing styles, and only in a scheduled animation frame.
  const openingBounds = openingStory.getBoundingClientRect();
  const journeyBounds = journey.getBoundingClientRect();
  const chapterBounds = chapters.map(chapter => chapter.getBoundingClientRect());
  const introBounds = motionOn ? intro.getBoundingClientRect() : null;
  const aboutBounds = motionOn ? aboutWindow.getBoundingClientRect() : null;
  const reflectionBounds = motionOn ? reflection.getBoundingClientRect() : null;
  progress.style.transform = `scaleX(${clamp(scroll / Math.max(1, pageHeight - viewport))})`;
  const headerVisible = openingBounds.bottom <= -viewport * .75;
  header.classList.toggle('is-scrolled', headerVisible);
  if (header.inert !== !headerVisible) {
    header.inert = !headerVisible;
    if (!headerVisible) closeMenu();
  }
  let nearest = 0;
  let distance = Infinity;
  chapterBounds.forEach((bounds, index) => {
    const nextDistance = Math.abs(bounds.top + bounds.height / 2 - viewport / 2);
    if (nextDistance < distance) { distance = nextDistance; nearest = index; }
  });
  if (nearest !== activeChapter) {
    activeChapter = nearest;
    journeyCurrent.textContent = String(nearest + 1).padStart(2, '0');
    journeyTrack.style.transform = `translateX(${nearest * 100}%)`;
  }
  if (!motionOn) return;
  const movement = narrowScreen.matches ? .32 : 1;
  filmVisible = openingBounds.bottom > 0 && openingBounds.top < viewport;
  // Finish before the extra hold, leaving the full bloom pinned for another screen.
  const phase = clamp(-openingBounds.top / filmTravel);
  if (filmReady) {
    filmTarget = phase * Math.max(0, bloomFilm.duration - 1 / 24);
    if (filmVisible) scheduleFilm();
    else stopFilm();
  }
  if (filmVisible) {
    const growth = easeBetween(0, 1, phase);
    heroBloom.style.transform = `translate3d(${pointerX * 4}px,${pointerY * 3 - growth * 5 * movement}px,0) scale(${1 + growth * .035 * movement})`;
    heroTitle.style.transform = `translate3d(${-growth * 18 * movement}px,${-growth * 12 * movement}px,0)`;
  }
  if (introBounds.bottom > 0 && introBounds.top < viewport) {
    const phase = clamp((viewport - introBounds.top) / (viewport + introBounds.height));
    intro.style.transform = `translate3d(${(phase - .5) * 24 * movement}px,0,0)`;
  }
  if (journeyBounds.bottom > 0 && journeyBounds.top < viewport) {
    const phase = clamp((viewport - journeyBounds.top) / (viewport + journeyBounds.height));
    orbitLine.style.transform = `rotate(${-24 + phase * 120}deg) scaleX(1.19)`;
    orbitImage.style.transform = `scale(1.25) rotate(${(-10 + phase * 22) * movement}deg)`;
  }
  if (aboutBounds.bottom > 0 && aboutBounds.top < viewport && !aboutImage.classList.contains('headshot')) {
    const phase = clamp((viewport - aboutBounds.top) / (viewport + aboutBounds.height));
    aboutImage.style.transform = `translate3d(0,${(phase - .5) * 32 * movement}px,0) scale(1.09)`;
  }
  if (reflectionBounds.bottom > 0 && reflectionBounds.top < viewport) {
    const phase = clamp((viewport - reflectionBounds.top) / (viewport + reflectionBounds.height));
    reflectionImage.style.transform = `translate3d(0,${(phase - .5) * 100 * movement}px,0) scale(1.08)`;
  }
}
window.addEventListener('scroll', scheduleFrame, { passive: true });
window.addEventListener('resize', measure, { passive: true });
window.addEventListener('load', measure, { once: true });
document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', measure));
if (document.fonts) document.fonts.ready.then(measure);
if ('ResizeObserver' in window) new ResizeObserver(measure).observe(heroStage);
hero.addEventListener('pointermove', event => {
  if (!motionOn || !finePointer.matches || narrowScreen.matches) return;
  const bounds = heroStage.getBoundingClientRect();
  pointerX = (event.clientX - bounds.left) / bounds.width * 2 - 1;
  pointerY = (event.clientY - bounds.top) / bounds.height * 2 - 1;
  scheduleFrame();
});
hero.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; scheduleFrame(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopFilm();
  if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; }
  else if (!document.hidden) measure();
});
setMotion(motionOn);
measure();
