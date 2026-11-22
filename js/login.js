/**
 * LOGIN PAGE ENGINE
 * Handles Sign In / Create Account / Guest access on login.html.
 * On success it stores the session in localStorage (same key as the app) and
 * sends the user to index.html, where the top bar follows that account.
 */
(function () {
  const USER_KEY = 'baamboozle_user';
  const $ = (id) => document.getElementById(id);

  // Optional sound hooks (no-ops on this page – the app audio engine isn't loaded)
  const sfx = (name) => {
    const fn = window[name];
    if (typeof fn === 'function') fn();
  };

  function showAlert(message, isSuccess = false) {
    const el = $('authCardAlert');
    if (!el) return;
    el.textContent = message;
    el.className = isSuccess
      ? 'p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 block'
      : 'p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 block';
  }

  function clearAlert() {
    const el = $('authCardAlert');
    if (!el) return;
    el.textContent = '';
    el.className = 'hidden mx-6 sm:mx-8 mt-4 p-3 rounded-2xl text-xs font-bold flex items-center gap-2';
  }

  function finishLogin(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    sfx('playSuccessSound');
    window.location.replace('index.html');
  }

  async function postJSON(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed.');
    return data;
  }

  document.addEventListener('DOMContentLoaded', () => {
    // --- Existing session: show a shortcut, never a profile in the top bar ---
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user && user.username) {
          const banner = $('sessionBanner');
          const link = $('continueToApp');
          if (banner) {
            banner.innerHTML = `
              <div class="flex items-center justify-between gap-3 p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                <span><i class="fa-solid fa-circle-check text-emerald-500 mr-2"></i>
                  Already signed in as <b>${user.username}</b>${user.isGuest ? ' (guest)' : ''}.</span>
                <a href="index.html" class="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-extrabold hover:bg-blue-700 transition-all">Open app →</a>
              </div>`;
            banner.classList.remove('hidden');
          }
          if (link) link.classList.remove('hidden');
        }
      } catch (err) {
        localStorage.removeItem(USER_KEY);
      }
    }

    const tabLogin = $('tabCardLogin');
    const tabRegister = $('tabCardRegister');
    const formLogin = $('formCardLogin');
    const formRegister = $('formCardRegister');

    const activeTab = 'flex-1 py-3.5 text-xs sm:text-sm font-black text-blue-700 border-b-2 border-blue-600 bg-white transition-all cursor-pointer';
    const idleTab = 'flex-1 py-3.5 text-xs sm:text-sm font-bold text-slate-400 border-b-2 border-transparent hover:text-slate-700 transition-all cursor-pointer';

    if (tabLogin && tabRegister) {
      tabLogin.addEventListener('click', () => {
        sfx('playClickSound');
        clearAlert();
        tabLogin.className = activeTab;
        tabRegister.className = idleTab;
        if (formLogin) formLogin.classList.remove('hidden');
        if (formRegister) formRegister.classList.add('hidden');
      });

      tabRegister.addEventListener('click', () => {
        sfx('playClickSound');
        clearAlert();
        tabRegister.className = activeTab;
        tabLogin.className = idleTab;
        if (formRegister) formRegister.classList.remove('hidden');
        if (formLogin) formLogin.classList.add('hidden');
      });
    }

    // --- Sign in ---
    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAlert();
        sfx('playClickSound');
        const login = ($('loginCardInput') || {}).value?.trim() || '';
        const password = ($('loginCardPassword') || {}).value || '';
        try {
          const data = await postJSON('/api/auth/login', { login, password });
          finishLogin({ ...data.user, isGuest: false });
        } catch (err) {
          sfx('playWrongSound');
          showAlert(err.message || 'Unable to reach the server. You can play as guest below.');
        }
      });
    }

    // --- Create account ---
    if (formRegister) {
      formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAlert();
        sfx('playClickSound');
        const username = ($('regCardUsername') || {}).value?.trim() || '';
        const email = ($('regCardEmail') || {}).value?.trim() || '';
        const password = ($('regCardPassword') || {}).value || '';
        try {
          const data = await postJSON('/api/auth/register', { username, email, password });
          finishLogin({ ...data.user, isGuest: false });
        } catch (err) {
          sfx('playWrongSound');
          showAlert(err.message || 'Unable to reach the server. Please try again.');
        }
      });
    }

    // --- Guest access (all three entry points) ---
    function playAsGuest() {
      sfx('playClickSound');
      finishLogin({
        id: null,
        username: 'Guest_Hero_' + Math.floor(Math.random() * 900 + 100),
        total_score: 0,
        isGuest: true
      });
    }
    ['btnCardPlayAsGuest', 'btnCardPlayAsGuest2', 'btnOnboardingStart'].forEach((id) => {
      const btn = $(id);
      if (btn) btn.addEventListener('click', playAsGuest);
    });

    // --- Demo credentials autofill ---
    const demoHint = $('demoCredentialsHintCard');
    if (demoHint) {
      demoHint.addEventListener('click', () => {
        sfx('playClickSound');
        const user = $('loginCardInput');
        const pwd = $('loginCardPassword');
        if (user) user.value = 'MemeMaster';
        if (pwd) pwd.value = '123456';
        demoHint.classList.add('bg-blue-100', 'ring-2', 'ring-blue-400');
        setTimeout(() => demoHint.classList.remove('bg-blue-100', 'ring-2', 'ring-blue-400'), 700);
      });
    }

    // --- Password visibility toggles ---
    [['btnTogglePwdLogin', 'loginCardPassword'], ['btnTogglePwdReg', 'regCardPassword']].forEach(([btnId, inputId]) => {
      const btn = $(btnId);
      const input = $(inputId);
      if (!btn || !input) return;
      btn.addEventListener('click', () => {
        const hidden = input.type === 'password';
        input.type = hidden ? 'text' : 'password';
        const icon = btn.querySelector('i');
        if (icon) icon.className = hidden ? 'fa-solid fa-eye-slash text-sm' : 'fa-solid fa-eye text-sm';
      });
    });
  });
})();
