/**
 * Modular HTML loader for index.html.
 * Fetches the view partials, injects them into the shell, and only then boots
 * the app engine so that every getElementById() in app.js finds its element.
 */
(function () {
  const PARTIALS = [
    ['partials/header.html', 'appHeader'],
    ['partials/dashboard.html', 'appDashboard'],
    ['partials/quiz.html', 'appQuiz'],
    ['partials/results.html', 'appResults'],
    ['partials/modals.html', 'appModals']
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load ${src}`));
      document.body.appendChild(script);
    });
  }

  async function boot() {
    try {
      const loaded = await Promise.all(PARTIALS.map(async ([url, targetId]) => {
        const response = await fetch(url, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`Failed to load ${url} (${response.status})`);
        return { targetId, markup: await response.text() };
      }));

      loaded.forEach(({ targetId, markup }) => {
        const target = document.getElementById(targetId);
        if (target) target.innerHTML = markup;
      });

      // i18n and app.js loaded in sequence: DOM references now exist.
      await loadScript('js/i18n.js');
      await loadScript('js/app.js');
    } catch (error) {
      console.error('Modular loader error:', error);
      document.body.insertAdjacentHTML('afterbegin', `
        <div class="max-w-xl mx-auto mt-10 p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold">
          <i class="fa-solid fa-triangle-exclamation mr-2"></i>
          Could not load the application modules. Start the server with <code>npm start</code>
          and open <code>http://localhost:3000</code> (partials are fetched over HTTP).
        </div>
      `);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
