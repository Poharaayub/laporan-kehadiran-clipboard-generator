document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi ikon Lucide
  try { if (window.lucide?.createIcons) window.lucide.createIcons(); } catch (e) {}

  // ====== NAV BOTTOM / TAB ======
  const barButtons = Array.from(document.querySelectorAll('.bar-item'));
  const panes = Array.from(document.querySelectorAll('.tab-pane'));

  // Buka tab awal (dari hash kalau ada)
  const initial = (location.hash || '').replace('#', '') || 'tab-beranda';
  setActive(initial);

  // Klik bottom bar
  barButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      setActive(target);
      history.replaceState(null, '', `#${target}`);
    });
  });

  // Tombol "All Members" di Beranda -> buka tab members
  document.getElementById('beranda-members')?.addEventListener('click', () => {
    setActive('tab-members');
    history.replaceState(null, '', '#tab-members');
  });

  // Ubah tab saat hash berubah (deep link)
  window.addEventListener('hashchange', () => {
    const id = (location.hash || '').replace('#', '') || 'tab-beranda';
    setActive(id);
  });

  function setActive(targetId) {
    barButtons.forEach(b => b.classList.toggle('is-active', b.getAttribute('data-target') === targetId));
    panes.forEach(p => p.classList.toggle('is-active', p.id === targetId));
    refreshIcons();
  }

  function refreshIcons() {
    try { window.lucide?.createIcons?.(); } catch (e) {}
  }

  // ====== Jadwal: sembunyikan loader ketika iframe selesai load ======
  const jadwalIframe  = document.getElementById('jadwal-iframe');
  const jadwalLoader  = document.getElementById('jadwal-loader');
  if (jadwalIframe && jadwalLoader) {
    const hideLoader = () => { jadwalLoader.style.display = 'none'; };
    jadwalIframe.addEventListener('load', hideLoader);
    // fallback: auto-hide jika load lama
    setTimeout(hideLoader, 8000);
  }

  // ====== Animasi: Ripple (ringan) ======
  initPressAndRipple('.app-button, .bar-item');

  function initPressAndRipple(selector) {
    const nodes = document.querySelectorAll(selector);
    nodes.forEach(el => {
      // pastikan posisi relatif untuk ripple
      const style = getComputedStyle(el);
      if (style.position === 'static') el.style.position = 'relative';
      if (style.overflow === 'visible') el.style.overflow = 'hidden';

      el.addEventListener('pointerdown', (e) => {
        // ripple
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.2;
        const ripple = document.createElement('span');
        ripple.className = 'ripple-circle';
        Object.assign(ripple.style, {
          position: 'absolute',
          borderRadius: '50%',
          background: 'rgba(255,255,255,.15)',
          width: `${size}px`,
          height: `${size}px`,
          left: `${e.clientX - rect.left - size / 2}px`,
          top:  `${e.clientY - rect.top  - size / 2}px`,
          pointerEvents: 'none',
          animation: 'rippleCircle .5s ease-out'
        });
        el.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
      });
    });

    // Keyframes ripple (fallback jika belum ada)
    if (!document.getElementById('kf-ripple')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'kf-ripple';
      styleEl.textContent = `
        @keyframes rippleCircle {
          from { transform: scale(0); opacity: .35; }
          to   { transform: scale(1); opacity: 0; }
        }
      `;
      document.head.appendChild(styleEl);
    }
  }

  // ====== Bounce Scroll ala Android ======
  initBounceScroll();

  function initBounceScroll() {
    const content = document.querySelector('.app-content') || document.documentElement;
    let startY = 0, pulling = false, atTop = false, atBottom = false;
    const damp = (dy) => Math.max(-90, Math.min(90, dy * 0.35));

    window.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
      const s = document.scrollingElement || document.documentElement;
      atTop = s.scrollTop <= 0;
      const maxScroll = s.scrollHeight - s.clientHeight - 1;
      atBottom = s.scrollTop >= maxScroll;
      pulling = false;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 1) return;
      const dy = e.touches[0].clientY - startY;
      if ((atTop && dy > 0) || (atBottom && dy < 0)) {
        e.preventDefault();
        pulling = true;
        content.style.transform = `translateY(${damp(dy)}px)`;
      }
    }, { passive: false });

    const end = () => {
      if (!pulling) return;
      pulling = false;
      content.style.transition = 'transform 320ms cubic-bezier(.22,.61,.36,1)';
      content.style.transform = 'translateY(0px)';
      content.addEventListener('transitionend', () => content.style.transition = '', { once: true });
    };

    window.addEventListener('touchend', end, { passive: true });
    window.addEventListener('touchcancel', end, { passive: true });
  }
});