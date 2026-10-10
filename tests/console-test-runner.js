(function () {
  'use strict';

  const baseCases = window.SwimFestTestCases || [];
  const pages = [...new Set(baseCases.map(test => test.page).filter(Boolean))];
  const coverageCases = pages.map(page => ({
    id: `TID-${page.replace(/[^a-z0-9]/gi, '-').toUpperCase()}`,
    chapter: 'All',
    page,
    selector: '',
    name: 'Component test-ID coverage',
    expected: 'Every actionable element and icon has a unique generated data-testid.',
    mode: 'coverage'
  }));
  const allCases = [...coverageCases, ...baseCases];
  let results = [];
  const frameCache = new Map();

  const $ = id => document.getElementById(id);
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  function setStatus(test, status, evidence, componentTestId) {
    return {
      id: test.id,
      chapter: test.chapter,
      page: test.page || 'Infrastructure / manual',
      name: test.name,
      expected: test.expected,
      status,
      evidence,
      componentTestId: componentTestId || ''
    };
  }

  async function loadPage(page, cache) {
    if (cache.has(page)) return cache.get(page);
    const request = new Promise((resolve, reject) => {
      const frame = document.createElement('iframe');
      frame.title = `Live feature test: ${page}`;
      frame.setAttribute('aria-hidden', 'true');
      frame.style.cssText = 'position:fixed;left:-200vw;top:0;width:1280px;height:800px;border:0;visibility:hidden;';
      let timer;
      const cleanupTimer = () => clearTimeout(timer);
      frame.addEventListener('load', () => {
        cleanupTimer();
        try {
          resolve({
            frame,
            document: frame.contentDocument,
            window: frame.contentWindow
          });
        } catch (error) {
          reject(new Error(`Cannot inspect live page ${page}: ${error.message}`));
        }
      }, { once: true });
      frame.addEventListener('error', () => {
        cleanupTimer();
        reject(new Error(`Browser could not load live page ${page}.`));
      }, { once: true });
      timer = setTimeout(() => reject(new Error(`Timed out loading live page ${page}.`)), 30000);
      frame.src = new URL(`../${page}`, window.location.href).href;
      document.body.appendChild(frame);
    });
    cache.set(page, request);
    return request;
  }

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  async function waitForStateOptions(doc, timeoutMs = 12000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const options = doc.querySelectorAll('#stateGrid .state-option');
      if (options.length) return options.length;
      await wait(150);
    }
    return 0;
  }

  async function runLiveCheck(test, loaded) {
    const doc = loaded.document;
    const win = loaded.window;

    if (test.liveCheck === 'state-selection') {
      const previous = win.localStorage.getItem('swimfest_state') || 'Tamil Nadu';
      const selector = doc.querySelector('#stateSelector');
      selector.click();
      const loadedOptions = await waitForStateOptions(doc);
      const option = [...doc.querySelectorAll('#stateGrid .state-option')]
        .find(item => item.dataset.state === 'Gujarat');
      if (!option) return {
        status: 'FAIL',
        evidence: `State picker did not populate its list after waiting for the live page (options=${loadedOptions}).`
      };
      option.click();
      await wait(80);
      const stateText = doc.querySelector('#currentState').textContent.trim();
      const sectionText = doc.querySelector('.state-tag')?.textContent.trim();
      const storedState = win.localStorage.getItem('swimfest_state');
      selector.click();
      await wait(50);
      const restore = [...doc.querySelectorAll('#stateGrid .state-option')]
        .find(item => item.dataset.state === previous);
      if (restore) restore.click();
      const succeeded = stateText === 'Gujarat' && storedState === 'Gujarat' && sectionText === '(Gujarat)';
      return {
        status: succeeded ? 'PASS' : 'FAIL',
        evidence: `Selected Gujarat: button="${stateText}", section="${sectionText}", stored="${storedState}". Original state restored to ${previous}.`
      };
    }

    if (test.liveCheck === 'state-catalog') {
      const selector = doc.querySelector('#stateSelector');
      selector.click();
      await waitForStateOptions(doc);
      const options = [...doc.querySelectorAll('#stateGrid .state-option')];
      const names = options.map(option => option.dataset.state || option.textContent.trim());
      const requiredStates = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
      ];
      const missing = requiredStates.filter(name => !names.includes(name));
      selector.click();
      const exactCatalog = names.length === 36 && missing.length === 0;
      return {
        status: exactCatalog ? 'PASS' : 'FAIL',
        evidence: `${names.length} options found; 28-state checklist ${missing.length ? `missing ${missing.join(', ')}` : 'complete'}. Requirement expects 28 states + 8 union territories (36 entries).`
      };
    }

    if (test.liveCheck === 'sticky-header') {
      const nav = doc.querySelector('#navbar');
      const style = win.getComputedStyle(nav);
      const sticky = style.position === 'sticky' && style.top === '0px' && Number(style.zIndex) >= 9999;
      return {
        status: sticky ? 'PASS' : 'FAIL',
        evidence: `Live computed style: position=${style.position}; top=${style.top}; z-index=${style.zIndex}; spec requires sticky; 0px; >=9999.`
      };
    }

    if (test.liveCheck === 'anchor-scroll') {
      const link = doc.querySelector(test.selector);
      const target = doc.querySelector('#upcoming-tournaments');
      const originalScrollIntoView = target.scrollIntoView.bind(target);
      let scrollOptions = null;
      target.scrollIntoView = options => {
        scrollOptions = options;
        originalScrollIntoView(options);
      };
      link.click();
      await wait(900);
      const top = Math.round(target.getBoundingClientRect().top);
      const reached = !!scrollOptions && scrollOptions.behavior === 'smooth';
      return {
        status: reached ? 'PASS' : 'FAIL',
        evidence: `UPCOMING activation called scrollIntoView with behavior=${scrollOptions?.behavior || 'not called'}; target top=${top}px.`
      };
    }

    if (test.liveCheck === 'logo-reset') {
      const search = doc.querySelector('#searchInput');
      const category = doc.querySelector('#categoryFilter');
      const status = doc.querySelector('#statusFilter');
      search.value = 'spec-probe';
      category.value = 'U-12';
      status.value = 'entries-open';
      search.dispatchEvent(new win.Event('input', { bubbles: true }));
      category.dispatchEvent(new win.Event('change', { bubbles: true }));
      status.dispatchEvent(new win.Event('change', { bubbles: true }));
      win.scrollTo(0, 500);
      doc.querySelector('#logo').click();
      await wait(800);
      const outcome = {
        top: Math.round(win.scrollY),
        search: search.value,
        category: category.value,
        status: status.value
      };
      search.value = '';
      category.value = 'all';
      status.value = 'all';
      search.dispatchEvent(new win.Event('input', { bubbles: true }));
      category.dispatchEvent(new win.Event('change', { bubbles: true }));
      status.dispatchEvent(new win.Event('change', { bubbles: true }));
      return {
        status: outcome.top < 5 && !outcome.search && outcome.category === 'all' && outcome.status === 'all' ? 'PASS' : 'FAIL',
        evidence: `After logo activation: scrollY=${outcome.top}; search="${outcome.search}"; category=${outcome.category}; status=${outcome.status}.`
      };
    }

    if (test.liveCheck === 'mobile-menu') {
      const frame = loaded.frame;
      const originalWidth = frame.style.width;
      frame.style.width = '390px';
      await wait(120);
      const button = doc.querySelector('#mobileMenuBtn');
      const buttonVisible = win.getComputedStyle(button).display !== 'none';
      button.click();
      const opened = doc.querySelector('#mobileMenu').classList.contains('active');
      const link = doc.querySelector('#mobileMenu a[href="#upcoming-tournaments"]');
      if (link) link.click();
      const closed = !doc.querySelector('#mobileMenu').classList.contains('active');
      frame.style.width = originalWidth;
      return {
        status: buttonVisible && opened && closed ? 'PASS' : 'FAIL',
        evidence: `At 390px viewport: toggle visible=${buttonVisible}; opened=${opened}; closed after navigation=${closed}.`
      };
    }

    if (test.liveCheck === 'host-prompt') {
      doc.querySelector(test.selector).click();
      await wait(60);
      const prompt = doc.querySelector('#hostPromptOverlay');
      const text = prompt?.innerText || '';
      const loginPromptShown = /log in or sign up as an Organizer/i.test(text);
      prompt?.querySelector('.host-prompt-cancel')?.click();
      const dismissed = !doc.querySelector('#hostPromptOverlay');
      return {
        status: loginPromptShown && dismissed ? 'PASS' : 'FAIL',
        evidence: `Organizer login prompt shown=${loginPromptShown}; cancel dismissed=${dismissed}.`
      };
    }

    if (test.liveCheck === 'fallback-state') {
      const previous = win.localStorage.getItem('swimfest_state') || 'Tamil Nadu';
      doc.querySelector('#stateSelector').click();
      await waitForStateOptions(doc);
      [...doc.querySelectorAll('#stateGrid .state-option')]
        .find(item => item.dataset.state === 'Gujarat')?.click();
      const cardText = doc.querySelector('.host-card')?.innerText || '';
      doc.querySelector('#stateSelector').click();
      await wait(40);
      [...doc.querySelectorAll('#stateGrid .state-option')]
        .find(item => item.dataset.state === previous)?.click();
      const followsSelectedState = /Gujarat/i.test(cardText);
      return {
        status: followsSelectedState ? 'PASS' : 'FAIL',
        evidence: `After selecting Gujarat, fallback text was "${cardText.replace(/\s+/g, ' ').trim()}"; the displayed card should identify the selected state.`
      };
    }

    if (test.liveCheck === 'catalog-refresh') {
      if (!win.sb) {
        return {
          status: 'BLOCKED',
          evidence: 'The live page has no initialized Supabase client; state-specific catalog refresh cannot be verified.'
        };
      }
      const { data, error } = await win.sb
        .from('tournaments')
        .select('state')
        .limit(1);
      return {
        status: 'BLOCKED',
        evidence: error
          ? `Live read-only Supabase probe failed (${error.message}); catalog refresh remains unverified.`
          : `Supabase responded (${(data || []).length} probe row(s)), but no isolated, deterministic event fixture is available to assert the selected-state catalog safely.`
      };
    }

    if (test.liveCheck === 'directory-filters') {
      const grid = doc.querySelector('#upcomingCards');
      const fixtures = [
        { name: 'Spec Fixture Freestyle', venue: 'North Pool', categories: 'U-12', status: 'entries-open' },
        { name: 'Spec Fixture Butterfly', venue: 'South Pool', categories: 'U-14', status: 'live-now' }
      ].map(data => {
        const card = doc.createElement('div');
        card.className = 'event-card';
        card.dataset.name = data.name;
        card.dataset.venue = data.venue;
        card.dataset.categories = data.categories;
        card.dataset.status = data.status;
        grid.appendChild(card);
        return card;
      });
      const search = doc.querySelector('#searchInput');
      const category = doc.querySelector('#categoryFilter');
      const status = doc.querySelector('#statusFilter');
      search.value = 'Freestyle';
      search.dispatchEvent(new win.Event('input', { bubbles: true }));
      const searchWorks = !fixtures[0].classList.contains('hidden') && fixtures[1].classList.contains('hidden');
      search.value = '';
      category.value = 'U-12';
      category.dispatchEvent(new win.Event('change', { bubbles: true }));
      const categoryWorks = !fixtures[0].classList.contains('hidden') && fixtures[1].classList.contains('hidden');
      category.value = 'all';
      status.value = 'entries-open';
      status.dispatchEvent(new win.Event('change', { bubbles: true }));
      const statusWorks = !fixtures[0].classList.contains('hidden') && fixtures[1].classList.contains('hidden');
      search.value = '';
      category.value = 'all';
      status.value = 'all';
      [search, category, status].forEach((control, index) =>
        control.dispatchEvent(new win.Event(index === 0 ? 'input' : 'change', { bubbles: true })));
      fixtures.forEach(card => card.remove());
      const passed = searchWorks && categoryWorks && statusWorks;
      return {
        status: passed ? 'PASS' : 'FAIL',
        evidence: `Live page event handlers with temporary, non-persisted fixtures: keyword=${searchWorks}; category=${categoryWorks}; status=${statusWorks}.`
      };
    }

    return {
      status: 'BLOCKED',
      evidence: 'No safe live interaction is configured for this case; execute it with the documented test environment and seed data.'
    };
  }

  async function execute(test, cache) {
    if (test.mode === 'manual') {
      return setStatus(test, 'BLOCKED',
        'This specification scenario needs the documented test setup, role/data fixtures, or integration infrastructure.');
    }

    let loaded;
    try {
      loaded = await loadPage(test.page, cache);
    } catch (error) {
      return setStatus(test, 'FAIL', error.message);
    }
    const pageUrl = loaded.window.location.pathname.split('/').pop();
    if (pageUrl !== test.page) {
      return setStatus(test, 'BLOCKED',
        `Live route redirected to ${pageUrl}; authenticate with an approved ${test.page} test role before checking its specified features.`);
    }
    const page = loaded.document;

    const targets = page.querySelectorAll(
      'header,nav,main,footer,section,article,form,dialog,table,[role="button"],[role="dialog"],[id],' +
      '.event-card,.host-card,[class*="-section"],[class*="-grid"],[class*="-card"],' +
      '[class*="-modal"],[class*="-panel"],[class*="-toolbar"],[class*="-table"],' +
      '[class*="-control"],[class*="-nav"],a,button,input,select,textarea,i,svg,img'
    );
    const testIds = new Set();
    const untagged = [];
    const duplicates = [];
    for (const target of targets) {
      const testId = target.getAttribute('data-testid');
      if (!testId) {
        untagged.push(target.tagName.toLowerCase());
      } else if (testIds.has(testId)) {
        duplicates.push(testId);
      } else {
        testIds.add(testId);
      }
    }

    if (test.mode === 'coverage') {
      if (untagged.length || duplicates.length) {
        const details = [
          untagged.length ? `${untagged.length} component(s) without test IDs` : '',
          duplicates.length ? `duplicate test IDs: ${duplicates.join(', ')}` : ''
        ].filter(Boolean).join('; ');
        return setStatus(test, 'FAIL', details);
      }
      return setStatus(test, 'PASS', `${targets.length} live page components, controls, and icons have unique test IDs.`);
    }

    const element = test.selector ? page.querySelector(test.selector) : null;
    if (!element) {
      return setStatus(test, 'FAIL', `Required component not found: ${test.selector || '(no selector)'}`);
    }

    const componentTestId = element.getAttribute('data-testid');
    if (!componentTestId) {
      return setStatus(test, 'FAIL', `Component exists but has no data-testid: ${test.selector}`);
    }

    if (test.mode === 'behavior' && test.liveCheck) {
      const liveResult = await runLiveCheck(test, loaded);
      return setStatus(test, liveResult.status, liveResult.evidence, componentTestId);
    }

    if (test.mode === 'behavior') {
      return setStatus(test, 'BLOCKED',
        `Live component exists (${componentTestId}), but its behavior needs authenticated test data or service integration not available to this check.`,
        componentTestId);
    }

    return setStatus(test, 'PASS',
      `Component found in the loaded live website and identified as ${componentTestId}.`,
      componentTestId);
  }

  function updateSummary() {
    const totals = results.reduce((counts, result) => {
      counts[result.status] += 1;
      return counts;
    }, { PASS: 0, FAIL: 0, BLOCKED: 0 });
    $('totalCount').textContent = String(results.length);
    $('passCount').textContent = String(totals.PASS);
    $('failCount').textContent = String(totals.FAIL);
    $('blockedCount').textContent = String(totals.BLOCKED);
    $('downloadCsv').disabled = false;
    $('downloadHtml').disabled = false;
    populateChapters();
    renderResults();
  }

  function populateChapters() {
    const filter = $('chapterFilter');
    const selected = filter.value;
    const chapters = [...new Set(results.map(result => result.chapter))]
      .sort((a, b) => a === 'All' ? 1 : b === 'All' ? -1 : Number(a) - Number(b));
    filter.innerHTML = '<option value="all">All chapters</option>';
    for (const chapter of chapters) {
      const option = document.createElement('option');
      option.value = chapter;
      option.textContent = chapter === 'All' ? 'All components' : `Chapter ${chapter}`;
      filter.appendChild(option);
    }
    if ([...filter.options].some(option => option.value === selected)) filter.value = selected;
  }

  function renderResults() {
    const chapter = $('chapterFilter').value;
    const status = $('statusFilter').value;
    const shown = results.filter(result =>
      (chapter === 'all' || result.chapter === chapter) &&
      (status === 'all' || result.status === status)
    );
    $('shownCount').textContent = `Showing ${shown.length} of ${results.length} cases`;
    $('resultsBody').innerHTML = shown.map(result => `
      <tr>
        <td><code>${escapeHtml(result.id)}</code></td>
        <td>${escapeHtml(result.chapter === 'All' ? result.chapter : `Chapter ${result.chapter}`)}</td>
        <td>${escapeHtml(result.page)}<br><strong>${escapeHtml(result.name)}</strong>
          ${result.componentTestId ? `<br><code>${escapeHtml(result.componentTestId)}</code>` : ''}
        </td>
        <td>${escapeHtml(result.expected)}</td>
        <td><span class="status ${result.status}">${result.status}</span></td>
        <td>${escapeHtml(result.evidence)}</td>
      </tr>`).join('') || '<tr><td colspan="6">No matching tests.</td></tr>';
  }

  function csvCell(value) {
    return `"${String(value).replace(/"/g, '""')}"`;
  }

  function download(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadCsv() {
    const columns = ['Test ID', 'Spec chapter', 'Page', 'Component', 'Component test ID',
      'Expected result / test step', 'Result', 'Evidence'];
    const rows = results.map(result => [
      result.id, result.chapter, result.page, result.name, result.componentTestId,
      result.expected, result.status, result.evidence
    ]);
    const csv = '\uFEFF' + [columns, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
    download('swimfest-test-results.csv', csv, 'text/csv;charset=utf-8');
  }

  function downloadHtml() {
    const generated = new Date().toISOString();
    const body = results.map(result => `<tr>
      <td>${escapeHtml(result.id)}</td><td>${escapeHtml(result.chapter)}</td>
      <td>${escapeHtml(result.page)} — ${escapeHtml(result.name)}</td>
      <td>${escapeHtml(result.expected)}</td><td>${escapeHtml(result.status)}</td>
      <td>${escapeHtml(result.evidence)}</td></tr>`).join('');
    const totals = results.reduce((counts, result) => {
      counts[result.status] += 1;
      return counts;
    }, { PASS: 0, FAIL: 0, BLOCKED: 0 });
    const report = `<!doctype html><html lang="en"><meta charset="utf-8"><title>SwimFest Test Results</title>
      <style>body{font:14px Arial,sans-serif;margin:24px;color:#172033}table{border-collapse:collapse;width:100%}
      th,td{border:1px solid #d5dde7;padding:8px;text-align:left;vertical-align:top}th{background:#edf2f7}
      .PASS{color:#146c43}.FAIL{color:#a21b16}.BLOCKED{color:#805000}</style>
      <h1>SwimFest Spec Test Results</h1><p>Generated ${escapeHtml(generated)}</p>
      <p>Total: ${results.length} | Success: ${totals.PASS} | Failures: ${totals.FAIL} | Blocked/manual: ${totals.BLOCKED}</p>
      <p>PASS verifies UI markup/test-ID contracts only. BLOCKED cases need a safe authenticated or infrastructure test environment.</p>
      <table><thead><tr><th>Test ID</th><th>Spec</th><th>Page/component</th><th>Expected</th><th>Status</th><th>Evidence</th></tr></thead>
      <tbody>${body}</tbody></table></html>`;
    download('swimfest-test-results.html', report, 'text/html;charset=utf-8');
  }

  async function runTests() {
    $('runTests').disabled = true;
    $('runStatus').textContent = `Opening the live website for ${allCases.length} spec checks…`;
    frameCache.forEach(request => request.then(({ frame }) => frame.remove()).catch(() => {}));
    frameCache.clear();
    results = [];
    try {
      const pages = [...new Set(allCases.filter(test => test.page).map(test => test.page))];
      for (let index = 0; index < pages.length; index += 4) {
        const batch = pages.slice(index, index + 4);
        $('runStatus').textContent = `Loading live routes ${index + 1}–${index + batch.length} of ${pages.length}…`;
        await Promise.all(batch.map(page => loadPage(page, frameCache).catch(() => null)));
      }
      $('runStatus').textContent = `Comparing ${allCases.length} spec cases with live page behavior…`;
      for (const test of allCases) {
        try {
          results.push(await execute(test, frameCache));
        } catch (error) {
          results.push(setStatus(test, 'FAIL', `Live test threw an error: ${error.message}`));
        }
      }
    } finally {
      await Promise.all([...frameCache.values()].map(request =>
        request.then(({ frame }) => frame.remove()).catch(() => {})
      ));
      frameCache.clear();
    }
    updateSummary();
    const failures = results.filter(result => result.status === 'FAIL').length;
    $('runStatus').textContent = failures
      ? `Completed with ${failures} failure(s). Review the evidence column.`
      : 'Completed against live browser pages. Review blocked cases for role/data/infrastructure setup.';
    $('runTests').disabled = false;
  }

  $('runTests').addEventListener('click', runTests);
  $('downloadCsv').addEventListener('click', downloadCsv);
  $('downloadHtml').addEventListener('click', downloadHtml);
  $('chapterFilter').addEventListener('change', renderResults);
  $('statusFilter').addEventListener('change', renderResults);
  runTests();
})();
