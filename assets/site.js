/* Optional interactions: all pages and email links remain usable without JavaScript. */
(() => {
  'use strict';

  // Mobile navigation.
  const header = document.querySelector('.header');
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.getElementById('primary-nav');
  const mobile = window.matchMedia('(max-width: 620px)');

  function closeMenu(restoreFocus = false) {
    if (!header || !toggle) {
      return;
    }

    const wasOpen = header.dataset.menuOpen === 'true';
    header.dataset.menuOpen = 'false';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    toggle.textContent = 'Menu';
    if (wasOpen && restoreFocus) {
      toggle.focus();
    }
  }

  if (header && toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = header.dataset.menuOpen !== 'true';
      header.dataset.menuOpen = String(open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute(
        'aria-label',
        open ? 'Close navigation menu' : 'Open navigation menu',
      );
      toggle.textContent = open ? 'Close' : 'Menu';
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) {
        closeMenu();
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeMenu(true);
      }
    });
    document.addEventListener('click', event => {
      if (!header.contains(event.target)) {
        closeMenu();
      }
    });
    document.addEventListener('focusin', event => {
      if (!header.contains(event.target)) {
        closeMenu();
      }
    });
    mobile.addEventListener?.('change', () => closeMenu());
    window.addEventListener('hashchange', () => closeMenu());
    window.addEventListener('pageshow', () => closeMenu());
    closeMenu();
    // Activate the compact menu only after its handlers are ready.
    document.documentElement.classList.add('has-js');
  }

  // Copy the email address, with honest feedback when copying is blocked.
  document.querySelectorAll('[data-copy-email]').forEach((button) => {
    const status = document.getElementById(button.getAttribute('aria-describedby'));
    const address = document.getElementById(button.dataset.emailTarget);
    button.addEventListener('click', async () => {
      button.disabled = true;
      if (status) {
        status.textContent = 'Copying email address…';
      }

      try {
        if (!navigator.clipboard?.writeText) {
          throw new Error('Clipboard unavailable');
        }

        await navigator.clipboard.writeText(button.dataset.copyEmail);

        if (status) {
          status.textContent =
            'Email address copied. Paste it into your preferred email service.';
        }
      } catch {
        let selected = false;

        try {
          if (address) {
            const range = document.createRange();
            range.selectNodeContents(address);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            selected = selection.toString() === button.dataset.copyEmail;
          }
        } catch {
          // The address remains visible for manual copying.
        }

        if (status) {
          status.textContent = selected
            ? 'Automatic copying was blocked. The address is selected; copy it using your device’s copy command.'
            : 'Automatic copying was blocked. Select and copy the email address above, or choose Write in Gmail.';
        }
      } finally {
        button.disabled = false;
      }
    });
    button.hidden = false;
  });

  // Optional section animations and reduced-motion preferences.
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  let observer;

  function setupMotion() {
    observer?.disconnect();
    for (const animation of running) {
      animation.cancel();
    }

    running.clear();

    if (motion.matches || !window.IntersectionObserver || !Element.prototype.animate) {
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          observer.unobserve(entry.target);

          // Content stays visible if animations are unavailable.
          const animation = entry.target.animate(
            [
              { opacity: 0, transform: 'translateY(10px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 420, easing: 'cubic-bezier(.2,.65,.3,1)' },
          );

          running.add(animation);
          animation.finished.then(
            () => running.delete(animation),
            () => running.delete(animation),
          );
        }
      },
      { threshold: 0.08 },
    );

    document
      .querySelectorAll(
        '.hero > div, .hero-aside, .page-heading, .project, .prose-section, ' +
          '.contact-list, .contact-aside, .contact-strip',
      )
      .forEach((element) => observer.observe(element));
  }

  motion.addEventListener?.('change', setupMotion);
  setupMotion();
})();
