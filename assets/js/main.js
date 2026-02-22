/*
  Portfólio — Ítalo Arruda
  ------------------------------------------------------
  JS puro, leve e totalmente offline.
  Recursos:
  - Menu mobile + acessibilidade
  - Smooth scroll com offset do nav
  - ScrollSpy (link ativo)
  - Reveal on scroll
  - Contadores no hero
  - Accordion + filtro de projetos
  - Copiar e-mail/telefone + toast
  - Toggle de tema (dark/light)
*/

(() => {
  const root = document.documentElement;
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const toast = document.querySelector('.toast');
  const toastMsg = toast ? toast.querySelector('.toast__msg') : null;

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  // -------------------------
  // Helpers
  // -------------------------
  const navHeight = () => nav?.getBoundingClientRect().height || 0;

  const setUseHref = (btn, symbolId) => {
    const use = btn?.querySelector('use');
    if (use) use.setAttribute('href', symbolId);
  };

  const showToast = (msg) => {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.hidden = false;
    toast.style.opacity = '1';

    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      toast.style.opacity = '0';
      // aguarda o fade
      window.setTimeout(() => (toast.hidden = true), 200);
    }, 1800);
  };

  const copyText = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}

    // Fallback
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  };

  // -------------------------
  // Footer year
  // -------------------------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // -------------------------
  // Theme
  // -------------------------
  // Default = light. Só grava preferência quando usuário alternar.
  const storedTheme = localStorage.getItem('theme');
  const applyTheme = (theme) => {
    const isLight = theme === 'light';
    if (isLight) {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }

    // Ícone mostra a ação (se estou em dark → mostrar sol para ir ao light)
    if (themeToggle) {
      setUseHref(themeToggle, isLight ? '#i-moon' : '#i-sun');
      themeToggle.setAttribute('aria-label', isLight ? 'Ativar tema escuro' : 'Ativar tema claro');
    }
  };

  applyTheme(storedTheme || 'light');

  themeToggle?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('theme', next);
    showToast(next === 'light' ? 'Tema claro ativado' : 'Tema escuro ativado');
  });

  // -------------------------
  // Nav: scroll shadow
  // -------------------------
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('nav--scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // -------------------------
  // Mobile menu
  // -------------------------
  const closeMenu = () => {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menu');
    setUseHref(navToggle, '#i-menu');
  };

  const openMenu = () => {
    if (!navLinks || !navToggle) return;
    navLinks.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Fechar menu');
    setUseHref(navToggle, '#i-x');
  };

  navToggle?.addEventListener('click', () => {
    const isOpen = navLinks?.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  // Fecha ao clicar fora
  document.addEventListener('click', (e) => {
    if (!navLinks?.classList.contains('is-open')) return;
    const inside = navLinks.contains(e.target) || navToggle?.contains(e.target);
    if (!inside) closeMenu();
  });

  // Fecha com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Fecha ao clicar em links
  $$('.nav__links a').forEach((a) => a.addEventListener('click', closeMenu));

  // -------------------------
  // Smooth scroll (offset nav)
  // -------------------------
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const id = a.getAttribute('href');
    if (!id || id === '#') return;

    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();

    const y = target.getBoundingClientRect().top + window.scrollY - navHeight() - 14;
    window.scrollTo({ top: Math.max(y, 0), behavior: 'smooth' });
  });

  // -------------------------
  // Reveal on scroll
  // -------------------------
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    // fallback
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  // -------------------------
  // Counters (one-time)
  // -------------------------
  const counterEls = $$('[data-counter]');
  const animateCounter = (el) => {
    const target = Number(el.getAttribute('data-counter') || '0');
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(eased * target);
      el.textContent = String(value);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    };

    requestAnimationFrame(tick);
  };

  const startCounters = () => counterEls.forEach(animateCounter);

  if (counterEls.length) {
    let done = false;
    const hero = document.querySelector('.stats');

    if (hero && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !done) {
            done = true;
            startCounters();
            io.disconnect();
          }
        },
        { threshold: 0.35 }
      );
      io.observe(hero);
    } else {
      startCounters();
    }
  }

  // -------------------------
  // Accordion
  // -------------------------
  const acc = document.querySelector('[data-accordion]');
  const accItems = $$('.acc-item', acc || document);

  const setExpanded = (item, expanded) => {
    const head = $('.acc-head', item);
    if (!head) return;
    item.classList.toggle('is-open', expanded);
    head.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  };

  accItems.forEach((item) => {
    const head = $('.acc-head', item);
    if (!head) return;

    head.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // fecha os outros (comportamento de accordion)
      accItems.forEach((it) => {
        if (it !== item) setExpanded(it, false);
      });

      setExpanded(item, !isOpen);
    });
  });

  // -------------------------
  // Project filters
  // -------------------------
  const filterBtns = $$('.filter');
  const applyFilter = (key) => {
    accItems.forEach((item) => {
      const tags = (item.getAttribute('data-tags') || '').split(/\s+/).filter(Boolean);
      const show = key === 'all' || tags.includes(key);
      item.hidden = !show;

      // fecha se for ocultar
      if (!show) setExpanded(item, false);
    });
  };

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-filter') || 'all';
      filterBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      applyFilter(key);

      const label = btn.textContent?.trim() || 'Filtro';
      showToast(`Filtro: ${label}`);

      // leva para o topo da lista
      const y = (acc?.getBoundingClientRect().top || 0) + window.scrollY - navHeight() - 14;
      window.scrollTo({ top: Math.max(y, 0), behavior: 'smooth' });
    });
  });

  // -------------------------
  // Copy buttons
  // -------------------------
  document.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-copy]');
    if (!el) return;

    const value = el.getAttribute('data-copy') || '';
    if (!value) return;

    const ok = await copyText(value);
    showToast(ok ? 'Copiado para a área de transferência' : 'Não foi possível copiar');
  });

  // -------------------------
  // ScrollSpy
  // -------------------------
  const anchors = $$('.nav__links a[href^="#"]').filter((a) => a.getAttribute('href') !== '#');
  const sections = anchors
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const setActive = (id) => {
    anchors.forEach((a) => {
      const href = a.getAttribute('href');
      a.classList.toggle('is-active', href === `#${id}`);
    });
  };

  if (sections.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        // pega a seção mais visível
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        setActive(visible.target.id);
      },
      { rootMargin: `-${Math.round(navHeight())}px 0px -65% 0px`, threshold: [0.2, 0.35, 0.5, 0.7] }
    );

    sections.forEach((s) => io.observe(s));
  } else {
    // fallback simples
    window.addEventListener(
      'scroll',
      () => {
        let current = 'home';
        sections.forEach((sec) => {
          const top = sec.offsetTop - navHeight() - 20;
          if (window.scrollY >= top) current = sec.id;
        });
        setActive(current);
      },
      { passive: true }
    );
  }
})();
