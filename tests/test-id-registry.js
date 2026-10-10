(function (global) {
  'use strict';

  const componentSelector = [
    'header', 'nav', 'main', 'footer', 'section', 'article', 'form', 'dialog',
    'table', '[role="button"]', '[role="dialog"]', '[id]',
    '.event-card', '.host-card', '[class*="-section"]', '[class*="-grid"]',
    '[class*="-card"]', '[class*="-modal"]', '[class*="-panel"]',
    '[class*="-toolbar"]', '[class*="-table"]', '[class*="-control"]',
    '[class*="-nav"]'
  ].join(',');
  const controlSelector = 'a,button,input,select,textarea,[role="button"]';
  const iconSelector = 'i,svg,img';

  function slug(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48);
  }

  function pagePrefix(doc, pageName) {
    const path = pageName || (doc.location && doc.location.pathname) || 'page';
    return slug(path.split(/[\\/]/).pop().replace(/\.[^.]+$/, '')) || 'page';
  }

  function accessibleName(element) {
    const label = element.getAttribute('aria-label') ||
      element.getAttribute('title') ||
      element.getAttribute('name') ||
      element.getAttribute('placeholder') ||
      element.innerText ||
      element.textContent ||
      element.className;
    return String(label || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  }

  function tagDocument(doc, pageName) {
    if (!doc || !doc.querySelectorAll) return 0;

    const prefix = pagePrefix(doc, pageName);
    const used = new Set(Array.from(doc.querySelectorAll('[data-testid]'))
      .map(element => element.getAttribute('data-testid')));
    const counts = new Map();
    const elements = Array.from(doc.querySelectorAll(
      `${componentSelector},${controlSelector},${iconSelector}`
    ));

    for (const element of elements) {
      if (element.hasAttribute('data-testid')) continue;

      let base;
      if (element.id) {
        base = `${prefix}-${slug(element.id)}`;
      } else if (element.matches(iconSelector)) {
        const parentId = element.parentElement &&
          element.parentElement.getAttribute('data-testid');
        const iconClasses = typeof element.className === 'string'
          ? element.className
          : element.getAttribute('class');
        base = `${parentId || prefix}-icon-${slug(iconClasses || element.tagName)}`;
      } else {
        const tag = element.tagName.toLowerCase();
        const name = slug(accessibleName(element)) || tag;
        const parent = element.closest('[data-testid]');
        base = `${parent ? parent.getAttribute('data-testid') : prefix}-${tag}-${name}`;
      }

      const count = counts.get(base) || 0;
      counts.set(base, count + 1);
      let testId = count ? `${base}-${count + 1}` : base;
      let suffix = count + 1;
      while (used.has(testId)) {
        suffix += 1;
        testId = `${base}-${suffix}`;
      }
      element.setAttribute('data-testid', testId);
      used.add(testId);
    }

    return elements.length;
  }

  global.SwimFestTestIds = { tagDocument };

  if (global.document) {
    tagDocument(global.document);
    new MutationObserver(() => tagDocument(global.document))
      .observe(global.document.documentElement, { childList: true, subtree: true });
  }
})(window);
