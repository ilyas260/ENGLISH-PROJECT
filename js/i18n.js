/**
 * i18n.js — Internationalisation FR / EN pour English Learning App
 * Usage : setLanguage('fr') ou setLanguage('en')
 * Les éléments HTML doivent avoir l'attribut data-i18n="clé"
 */

const TRANSLATIONS = {
  fr: {
    /* ── Header ── */
    'nav.dashboard':     'Tableau de bord',
    'nav.lessons':       'Mes leçons',
    'nav.leaderboard':   'Classement',
    'header.synced':     'Synchronisé',
    'lang.toggle':       'EN',

    /* ── Dashboard greeting ── */
    'dash.supra':        "Votre espace d'apprentissage",
    'dash.subtitle':     "Un peu de pratique aujourd'hui, plus de confiance demain.",

    /* ── Hero card ── */
    'hero.level':        'A2 • ÉLÉMENTAIRE',
    'hero.motto':        'Chaque leçon vous rapproche de votre prochain niveau.',
    'hero.themes':       '2 thèmes maîtrisés sur 12. Continuez sur votre lancée !',
    'hero.keepGoing':    'Continuez sur votre lancée !',
    'hero.cta':          'Reprendre mon parcours',
    'hero.cap':          'PROCHAIN CAP',
    'hero.capName':      'English Champion',
    'hero.capSub':       'Chaque effort compte.',
    'hero.mastered':     '/ 12 thèmes maîtrisés',

    /* ── Quick access ── */
    'quick.title':       'Un peu de pratique ?',
    'quick.all':         'Toutes les activités',
    'quick.lessons':     'Leçons',
    'quick.lessonsSub':  'Apprendre pas à pas',
    'quick.quiz':        'Quiz',
    'quick.quizSub':     'Tester ses acquis',
    'quick.oral':        'Expression orale',
    'quick.oralSub':     'Prendre la parole',
    'quick.vocab':       'Vocabulaire',
    'quick.vocabSub':    'Enrichir ses mots',

    /* ── Next step section ── */
    'next.title':        'Votre prochaine étape',
    'next.subtitle':     'Des leçons adaptées à votre niveau.',
    'next.path':         'Voir le parcours',
    'next.inProgress':   'EN COURS',
    'next.discover':     'À DÉCOUVRIR',
    'next.resume':       'Reprendre',
    'next.start':        'Commencer',
    'next.lesson':       'Leçon',

    /* ── CEFR filter ── */
    'cefr.all':          'Tous',

    /* ── Widgets ── */
    'widget.daily':        'Objectif du jour',
    'widget.dailySub':     'Chaque petit pas compte.',
    'widget.dailyGoal':    '10 nouveaux mots',
    'widget.dailyLearned': '6 mots appris aujourd\'hui',
    'widget.dailyCta':     'Apprendre mes 4 prochains mots',
    'widget.streak':       'Votre régularité',
    'widget.streakDays':   '5 jours de suite',
    'widget.streakSub':    'Une belle semaine d\'apprentissage.',
    'widget.streakCont':   'Continuez aujourd\'hui pour garder votre série.',
    'widget.tip':          'L\'ASTUCE DU JOUR',
    'widget.tipTitle':     '15 minutes par jour font la différence.',
    'widget.tipSub':       'La régularité vaut mieux qu\'une longue session.',

    /* ── Footer ── */
    'footer.left':       'English Learning',
    'footer.right':      'Votre anglais, à votre rythme.',
    'footer.help':       'Centre d\'aide',
    'footer.privacy':    'Confidentialité',

    /* ── Notifications ── */
    'notif.title':       'Notifications',
    'notif.new':         'Nouvelles',
    'notif.markAll':     'Tout marquer comme lu',

    /* ── Leaderboard modal ── */
    'lb.title':          'Classement Mondial',
    'lb.subtitle':       'Meilleurs scores et progression des apprenants',
    'lb.refresh':        'Actualiser',
    'lb.live':           'Mis à jour en direct',
  },

  en: {
    /* ── Header ── */
    'nav.dashboard':     'Dashboard',
    'nav.lessons':       'My Lessons',
    'nav.leaderboard':   'Leaderboard',
    'header.synced':     'Synced',
    'lang.toggle':       'FR',

    /* ── Dashboard greeting ── */
    'dash.supra':        'Your Learning Space',
    'dash.subtitle':     'A little practice today, more confidence tomorrow.',

    /* ── Hero card ── */
    'hero.level':        'A2 • ELEMENTARY',
    'hero.motto':        'Each lesson brings you closer to your next level.',
    'hero.themes':       '2 themes mastered out of 12. Keep up the momentum!',
    'hero.keepGoing':    'Keep up the momentum!',
    'hero.cta':          'Resume my path',
    'hero.cap':          'NEXT MILESTONE',
    'hero.capName':      'English Champion',
    'hero.capSub':       'Every effort counts.',
    'hero.mastered':     '/ 12 themes mastered',

    /* ── Quick access ── */
    'quick.title':       'A little practice?',
    'quick.all':         'All activities',
    'quick.lessons':     'Lessons',
    'quick.lessonsSub':  'Learn step by step',
    'quick.quiz':        'Quiz',
    'quick.quizSub':     'Test your knowledge',
    'quick.oral':        'Speaking',
    'quick.oralSub':     'Take the floor',
    'quick.vocab':       'Vocabulary',
    'quick.vocabSub':    'Enrich your words',

    /* ── Next step section ── */
    'next.title':        'Your next step',
    'next.subtitle':     'Lessons adapted to your level.',
    'next.path':         'See the path',
    'next.inProgress':   'IN PROGRESS',
    'next.discover':     'TO DISCOVER',
    'next.resume':       'Resume',
    'next.start':        'Start',
    'next.lesson':       'Lesson',

    /* ── CEFR filter ── */
    'cefr.all':          'All',

    /* ── Widgets ── */
    'widget.daily':        'Daily goal',
    'widget.dailySub':     'Every small step counts.',
    'widget.dailyGoal':    '10 new words',
    'widget.dailyLearned': '6 words learned today',
    'widget.dailyCta':     'Learn my next 4 words',
    'widget.streak':       'Your streak',
    'widget.streakDays':   '5-day streak',
    'widget.streakSub':    'A great learning week.',
    'widget.streakCont':   'Keep going today to maintain your streak.',
    'widget.tip':          'TIP OF THE DAY',
    'widget.tipTitle':     '15 minutes a day makes the difference.',
    'widget.tipSub':       'Consistency beats a long session.',

    /* ── Footer ── */
    'footer.left':       'English Learning',
    'footer.right':      'Your English, at your pace.',
    'footer.help':       'Help Center',
    'footer.privacy':    'Privacy',

    /* ── Notifications ── */
    'notif.title':       'Notifications',
    'notif.new':         'New',
    'notif.markAll':     'Mark all as read',

    /* ── Leaderboard modal ── */
    'lb.title':          'World Leaderboard',
    'lb.subtitle':       'Best scores and learner progress',
    'lb.refresh':        'Refresh',
    'lb.live':           'Live update',
  }
};

/**
 * Applique la langue à tous les éléments [data-i18n].
 * @param {string} lang  'fr' | 'en'
 */
function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) lang = 'fr';
  localStorage.setItem('app_lang', lang);
  document.documentElement.lang = lang === 'fr' ? 'fr-FR' : 'en-US';

  const dict = TRANSLATIONS[lang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) {
      el.textContent = dict[key];
    }
  });

  /* Met à jour le label du bouton toggle (affiche le drapeau ou code de la langue OPPOSÉE) */
  const langLabel = document.getElementById('langLabel');
  if (langLabel) {
    langLabel.textContent = dict['lang.toggle'];
  }
}

/**
 * Retourne la traduction d'une clé pour la langue courante.
 * @param {string} key
 * @returns {string}
 */
function t(key) {
  const lang = localStorage.getItem('app_lang') || 'fr';
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['fr'];
  return dict[key] !== undefined ? dict[key] : key;
}

/* Expose globalement */
window.setLanguage = setLanguage;
window.t = t;
window.TRANSLATIONS = TRANSLATIONS;
