/* ---------- Intersection Observer untuk animasi ---------- */
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      // show parent section or gallery
      entry.target.classList.add('show');
      // stagger children for gallery-like blocks
      if(entry.target.matches('.grid-gallery') || entry.target.matches('.masonry') || entry.target.matches('.super-combo')){
        const children = entry.target.querySelectorAll('img, .m-item');
        children.forEach((c, i) => setTimeout(()=> c.classList.add('show'), i * 80));
      }
      // reveal gallery horizontal items individually nicely
      if(entry.target.matches('.gallery')){
        entry.target.querySelectorAll('img').forEach((img, i) => setTimeout(()=> img.classList.add('show'), i*80));
      }
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

// Observe main blocks
document.querySelectorAll('.hero-content, section, .gallery, .grid-gallery, .masonry, .carousel, .parallax-grid, .super-combo, .about img').forEach(el => observer.observe(el));
// Observe images individually for better staggered reveal
document.querySelectorAll('.gallery img, .grid-gallery img, .masonry .m-item img, .super-combo img').forEach(img => observer.observe(img));

/* ---------- Parallax (subtle, only for .parallax elements) ---------- */
// Disable parallax on small screens to preserve perf
function handleParallax() {
  const enable = window.innerWidth > 768;
  document.querySelectorAll('.parallax').forEach(el => {
    if(!enable){
      el.style.transform = '';
      return;
    }
  });
}
window.addEventListener('resize', handleParallax);
window.addEventListener('load', handleParallax);

window.addEventListener('scroll', () => {
  if(window.innerWidth <= 768) return; // skip parallax on mobile for perf
  const speed = 0.12;
  document.querySelectorAll('.parallax').forEach(el => {
    const rect = el.getBoundingClientRect();
    const offset = (rect.top - window.innerHeight / 2) * speed * -1;
    const limited = Math.max(Math.min(offset, 70), -70);
    el.style.transform = `translateY(${limited}px)`;
  });
});

/* ---------- Carousel logic ---------- */
(function(){
  const track = document.querySelector('.carousel-track');
  if(!track) return;
  const items = Array.from(track.children);
  let idx = 0, total = items.length;
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  function goTo(i){ idx = (i + total) % total; track.style.transform = `translateX(-${idx * 100}%)`; }
  nextBtn && nextBtn.addEventListener('click', ()=> { goTo(idx+1); reset(); });
  prevBtn && prevBtn.addEventListener('click', ()=> { goTo(idx-1); reset(); });

  let autoplay = setInterval(()=> goTo(idx+1), 4500);
  function reset(){ clearInterval(autoplay); autoplay = setInterval(()=> goTo(idx+1), 4500); }

  const carousel = document.querySelector('.carousel');
  carousel.addEventListener('mouseenter', ()=> clearInterval(autoplay));
  carousel.addEventListener('mouseleave', ()=> reset());
  goTo(0);

  // keyboard
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowLeft') prevBtn && prevBtn.click();
    if(e.key === 'ArrowRight') nextBtn && nextBtn.click();
  });
})();

/* ---------- Lightbox (click on any gallery image) ---------- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightPrev = document.getElementById('lightPrev');
const lightNext = document.getElementById('lightNext');

// Gather all gallery images across mega galleries
const gallerySelectors = '.gallery img, .grid-gallery img, .masonry img, .carousel-item img, .parallax-grid img, .super-combo img';
const galleryImgs = Array.from(document.querySelectorAll(gallerySelectors));
let currentIndex = 0;

galleryImgs.forEach((img, i) => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', ()=> openLightbox(i));
});

function openLightbox(idx){
  currentIndex = idx;
  lightboxImg.src = galleryImgs[currentIndex].src;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}
function closeLightbox(){
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}
function showPrev(){ currentIndex = (currentIndex - 1 + galleryImgs.length) % galleryImgs.length; lightboxImg.src = galleryImgs[currentIndex].src; }
function showNext(){ currentIndex = (currentIndex + 1) % galleryImgs.length; lightboxImg.src = galleryImgs[currentIndex].src; }

lightboxClose.addEventListener('click', closeLightbox);
lightPrev.addEventListener('click', showPrev);
lightNext.addEventListener('click', showNext);

// keyboard navigation for lightbox
document.addEventListener('keydown', (e)=>{
  if(!lightbox.classList.contains('open')) return;
  if(e.key === 'Escape') closeLightbox();
  if(e.key === 'ArrowLeft') showPrev();
  if(e.key === 'ArrowRight') showNext();
});

// click outside image to close
lightbox.addEventListener('click', (e)=>{
  if(e.target === lightbox) closeLightbox();
});

/* ---------- show horizontal gallery images already visible on load ---------- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.gallery img.zoom-in').forEach(img => {
    const rect = img.getBoundingClientRect();
    if(rect.top < window.innerHeight && rect.bottom >= 0) img.classList.add('show');
  });
});