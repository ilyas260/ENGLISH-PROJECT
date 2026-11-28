/**
 * BAAMBOOZLE ENGLISH GAME - CLIENT ENGINE
 * Pure Vanilla JavaScript (ES6+) with Neubrutalism UI, Audio Synth,
 * Levenshtein fuzzy matching for close answers, and PostgreSQL API bridge.
 */

// ====================================================================
// 1. STATE & CONSTANTS
// ====================================================================
const API_BASE = ''; // Same origin

const state = {
  currentUser: null,        // { id, username, email, total_score, isGuest }
  dbOnline: false,
  soundEnabled: true,
  currentLevelFilter: 'ALL', // 'ALL' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'MISC' (slang/silly extras)
  themes: [],
  currentTheme: null,
  exercises: [],
  currentIndex: 0,
  quizScore: 0,
  correctCount: 0,
  closeCount: 0,
  wrongCount: 0,
  currentStreak: 0,
  maxStreak: 0,
  stickers: {
    correct: [
      '/assets/stickers/correct/kam_saharna_graduation.jpg',
      '/assets/stickers/correct/achraf_laugh.jpg',
      '/assets/stickers/correct/popcat.gif',
      '/assets/stickers/correct/dicaprio_toast.gif',
      '/assets/stickers/correct/pinterest_1149684611123917780.mp4'
    ],
    close: [
      '/assets/stickers/close/blinking_guy.gif',
      '/assets/stickers/close/dog_side_eye.gif',
      '/assets/stickers/close/math_lady_confused.gif',
      '/assets/stickers/close/pinterest_850969292106372554.mp4'
    ],
    wrong: [
      '/assets/stickers/wrong/rabi_yehdik.jpg',
      '/assets/stickers/wrong/ali_rabie_disaster.jpg',
      '/assets/stickers/wrong/steve_carell_no.gif',
      '/assets/stickers/wrong/confused_travolta.gif',
      '/assets/stickers/wrong/pinterest_880876008353183755.mp4'
    ]
  }
};

// Fallback seed data in case PostgreSQL is offline during first launch
const FALLBACK_THEMES = [
  {
    id: 1,
    title: 'Internet Slang & Gen-Z Talk',
    description: 'Learn the real talk: Rizz, Cap, Goat, and texting abbreviations so you never sound like an old bot!',
    color_theme: 'amber',
    icon: 'fa-fire',
    level: 'MISC',
    exercise_count: 5
  },
  {
    id: 4,
    title: 'Cats & Dogs: Animal Idioms & Silly Memes',
    description: 'Learn the goofiest pet idioms in English — raining cats and dogs, copycats and more!',
    color_theme: 'amber',
    icon: 'fa-paw',
    level: 'MISC',
    exercise_count: 3
  },
  {
    id: 2,
    title: 'Tricky Idioms & False Friends',
    description: 'Avoid embarrassing English faux-pas: don\'t translate word-for-word from French!',
    color_theme: 'emerald',
    icon: 'fa-ghost',
    level: 'B2',
    exercise_count: 5
  },
  {
    id: 3,
    title: 'Travel & Survival English',
    description: 'Essential phrases at the airport, ordering food, and surviving awkward travel encounters.',
    color_theme: 'indigo',
    icon: 'fa-plane-departure',
    level: 'A1',
    exercise_count: 3
  }
];

// -------------------------------------------------------------------
// CEFR vs. MISC: playful themes (Gen-Z slang, memes, animal idioms,
// pop culture) are NOT a CEFR level – they live in their own "MISC"
// category. Older databases may still label them A1/B1/B2, so titles
// are also checked when themes are loaded.
// -------------------------------------------------------------------
const MISC_THEME_PATTERN = /gen[-\s]?z|slang|streamer|pop culture|cat(?:s)?\s*(?:&|and)\s*dog|dog(?:s)?\s*(?:&|and)\s*cat|meme|silly/i;

function normalizeLevel(level) {
  const value = (level || 'A1').toString().toUpperCase();
  return ['A1', 'A2', 'B1', 'B2', 'C1', 'MISC'].includes(value) ? value : 'A1';
}

function withNormalizedLevel(theme) {
  if (!theme) return theme;
  const isMisc = MISC_THEME_PATTERN.test(theme.title || '');
  return { ...theme, level: isMisc ? 'MISC' : normalizeLevel(theme.level) };
}

const FALLBACK_EXERCISES = {
  1: [
    {
      id: 1,
      theme_id: 1,
      question_type: 'multiple_choice',
      question_text: 'What does the slang word "NO CAP" mean in English conversation?',
      options_json: [
        'No hats allowed inside',
        'I am totally telling the truth / For real',
        'I am out of money',
        'I do not care at all'
      ],
      correct_answer: 'I am totally telling the truth / For real',
      close_answers_json: ['telling the truth', 'for real', 'no lie']
    },
    {
      id: 2,
      theme_id: 1,
      question_type: 'fill_blank',
      question_text: 'Fill in the slang: "He has so much natural charm with girls, he has infinite ________."',
      options_json: [],
      correct_answer: 'rizz',
      close_answers_json: ['riz', 'rizzz', 'rizzzz', 'charisma']
    },
    {
      id: 3,
      theme_id: 1,
      question_type: 'true_false',
      question_text: 'In modern English texting, sending just "K" usually sounds cheerful and friendly.',
      options_json: ['True', 'False'],
      correct_answer: 'False',
      close_answers_json: ['f', 'no', 'fake']
    },
    {
      id: 4,
      theme_id: 1,
      question_type: 'multiple_choice',
      question_text: 'If someone says "Let him cook!", what are they actually saying?',
      options_json: [
        'He should prepare dinner right now',
        'Give him space to show his talent / do his thing',
        'Turn on the oven',
        'He is burning something'
      ],
      correct_answer: 'Give him space to show his talent / do his thing',
      close_answers_json: ['let him do his thing', 'let him show his talent']
    },
    {
      id: 5,
      theme_id: 1,
      question_type: 'fill_blank',
      question_text: 'What does the abbreviation "GOAT" stand for? "Greatest Of All ________."',
      options_json: [],
      correct_answer: 'Time',
      close_answers_json: ['times', 'tyme', 'the time']
    }
  ],
  2: [
    {
      id: 6,
      theme_id: 2,
      question_type: 'multiple_choice',
      question_text: 'If you want to say "break a leg" to an actor before a show, what do you mean?',
      options_json: [
        'I hope you fall on stage',
        'Good luck!',
        'You need to stretch first',
        'Hurry up!'
      ],
      correct_answer: 'Good luck!',
      close_answers_json: ['good luck', 'all the best']
    },
    {
      id: 7,
      theme_id: 2,
      question_type: 'fill_blank',
      question_text: 'Complete with the right adverb: "I thought he was British, but ________ he is from Australia!" (meaning: in reality)',
      options_json: [],
      correct_answer: 'actually',
      close_answers_json: ['actuly', 'actualy', 'acctually', 'in reality']
    },
    {
      id: 8,
      theme_id: 2,
      question_type: 'true_false',
      question_text: 'In English, the word "sensible" means sensitive / emotional (like the French word "sensible").',
      options_json: ['True', 'False'],
      correct_answer: 'False',
      close_answers_json: ['f', 'no', 'faux']
    },
    {
      id: 9,
      theme_id: 2,
      question_type: 'multiple_choice',
      question_text: 'What does the idiom "once in a blue moon" mean?',
      options_json: [
        'Every single night',
        'Very rarely',
        'Only during the winter',
        'When you feel depressed'
      ],
      correct_answer: 'Very rarely',
      close_answers_json: ['rarely', 'seldom']
    },
    {
      id: 10,
      theme_id: 2,
      question_type: 'fill_blank',
      question_text: 'Complete the idiom: "It is raining ________ and dogs outside!"',
      options_json: [],
      correct_answer: 'cats',
      close_answers_json: ['cat', 'catz', 'kitten']
    }
  ],
  3: [
    {
      id: 11,
      theme_id: 3,
      question_type: 'multiple_choice',
      question_text: 'In a restaurant in London, what do you ask for when you want to pay the bill?',
      options_json: [
        'The recipe, please',
        'The check or the bill, please',
        'The ticket, please',
        'The addition, please'
      ],
      correct_answer: 'The check or the bill, please',
      close_answers_json: ['the bill', 'the check']
    },
    {
      id: 12,
      theme_id: 3,
      question_type: 'true_false',
      question_text: 'At an airport, "boarding pass" means the permission document you show to get onto the airplane.',
      options_json: ['True', 'False'],
      correct_answer: 'True',
      close_answers_json: ['t', 'yes', 'vrai']
    },
    {
      id: 13,
      theme_id: 3,
      question_type: 'fill_blank',
      question_text: 'When asking for directions politely: "Excuse me, could you ________ me the way to the station?"',
      options_json: [],
      correct_answer: 'tell',
      close_answers_json: ['show', 'give', 'tel']
    }
  ],
  4: [
    {
      id: 14,
      theme_id: 4,
      question_type: 'fill_blank',
      question_text: 'Complete the silly idiom: "It is raining ________ and dogs outside!"',
      options_json: [],
      correct_answer: 'cats',
      close_answers_json: ['cat', 'catz', 'kitten']
    },
    {
      id: 15,
      theme_id: 4,
      question_type: 'multiple_choice',
      question_text: 'Someone copies everything you do. What do you call them?',
      options_json: ['A copycat', 'A doggo', 'A kitten', 'A bookworm'],
      correct_answer: 'A copycat',
      close_answers_json: ['copy cat', 'copycat', 'copy-cat']
    },
    {
      id: 16,
      theme_id: 4,
      question_type: 'true_false',
      question_text: '"Cat got your tongue?" is a real idiom used when someone is suddenly speechless.',
      options_json: ['True', 'False'],
      correct_answer: 'True',
      close_answers_json: ['t', 'yes', 'vrai']
    }
  ]
};

// Funny Punchlines for Meme Reactions (featuring Sabyry, VodkaFunky, Jamal Alpha, Pinterest Memes, Cats & Dogs)
const REACTION_MESSAGES = {
  correct: [
    { title: 'كم سهرنا من الليالي! 🎓😂', feedback: 'اووووي هههههها! Hard work and studying paid off! Flawless 200 IQ English!' },
    { title: 'VODKAFUNKY HYPE! 🔥🎉', feedback: 'Bobony family in the house! 200 IQ English masterclass!' },
    { title: 'SABYRY LAUGH OF VICTORY! 😂👑', feedback: 'Nari nari! Sabyry is screaming of joy on stream! Clean hit!' },
    { title: 'JAMAL ALPHA APPROVED! 👑✨', feedback: 'Storytelling masterclass! You answered like an English legend!' },
    { title: 'RONALDO SIUUU! ⚽⭐', feedback: 'Simplesmente o melhor! Flawless English grammar!' },
    { title: 'CAT VIBING TO 200 IQ! 🐱🎧', feedback: 'Look at that cat grooving to your flawless English grammar!' },
    { title: 'DOGE GIVING THUMBS UP! 🐶👍', feedback: 'Much smart! Very correct! Infinite English rizz!' },
    { title: 'PURE GENIUS! 🏆', feedback: 'No cap, you have that infinite English rizz!' }
  ],
  close: [
    { title: 'VODKAFUNKY THINKING... 🤔', feedback: 'Chouf chouf, so close! Just a tiny typo, awarded +50 points!' },
    { title: 'SABYRY IN DOUBT! 🤏', feedback: 'Almost had it in the bag! Right vibe, just check your spelling!' },
    { title: 'DOG SIDE-EYE ALERT! 👀🐶', feedback: 'That dog is looking at your typo! Right idea, +50 points awarded!' },
    { title: 'CAT DOING CONFUSED MATH! 🐱➗', feedback: 'Calculation almost perfect! Just a small spelling slip!' },
    { title: 'JAMAL ALPHA: WAIT A MINUTE... 🧐', feedback: 'So close! Just a minor spelling typo! Awarded +50 points!' }
  ],
  wrong: [
    { title: 'أنا عملت مصيبة! 🤦‍♂️😂', feedback: 'Ali Rabie style! Huge catastrophe committed on the English language! 0 points!' },
    { title: 'يا خويا واش نقلك... 🤦‍♂️💀', feedback: 'ربي يهديك نشالله! Total disaster for English grammar! Zero points!' },
    { title: 'RABI YEHDIK NCHALLAH! 🤦‍♂️', feedback: 'Even the ancestors are crying tears of despair at that answer!' },
    { title: 'VODKAFUNKY RAGE! 🤬💥', feedback: 'Wili wili! Vodka is throwing his headset on stream! Emotional damage!' },
    { title: 'SABYRY SCREAM! 😱💀', feedback: 'Mochkila kbira! Sabyry can\'t believe that answer! 0 points!' },
    { title: 'JAMAL ALPHA SHOCKED! 😱💀', feedback: 'Mochkila hadi! Even the best storytelling couldn\'t save that answer!' },
    { title: 'CRYING CAT MEME! 😿💔', feedback: 'The kitten is crying tears of grammatical sadness!' },
    { title: 'DOGE BONK! 🐕💥', feedback: 'Emotional damage! Go straight to grammar jail!' },
    { title: 'EMOTIONAL DAMAGE! 💀', feedback: 'Critical hit! Zero points awarded on this one!' }
  ]
};

// ====================================================================
// NO-REPEAT STICKER & PUNCHLINE TRACKING (DIFFERENT STICKER EVERY QUESTION)
// ====================================================================
const stickerHistory = {
  correct: [],
  close: [],
  wrong: []
};

const punchlineHistory = {
  correct: [],
  close: [],
  wrong: []
};

function resetSessionHistories() {
  stickerHistory.correct = [];
  stickerHistory.close = [];
  stickerHistory.wrong = [];
  punchlineHistory.correct = [];
  punchlineHistory.close = [];
  punchlineHistory.wrong = [];
}

function getUniqueSticker(category) {
  const allStickers = state.stickers[category] || [];
  if (allStickers.length === 0) return '/assets/stickers/correct/achraf_laugh.jpg';

  let available = allStickers.filter(s => !stickerHistory[category].includes(s));
  if (available.length === 0) {
    stickerHistory[category] = [];
    available = allStickers;
  }

  const chosen = available[Math.floor(Math.random() * available.length)];
  stickerHistory[category].push(chosen);
  return chosen;
}

function getUniquePunchline(category) {
  const allPunchlines = REACTION_MESSAGES[category] || [];
  if (allPunchlines.length === 0) return { title: 'AWESOME!', feedback: 'Great job!' };

  let available = allPunchlines.filter(p => !punchlineHistory[category].includes(p.title));
  if (available.length === 0) {
    punchlineHistory[category] = [];
    available = allPunchlines;
  }

  const chosen = available[Math.floor(Math.random() * available.length)];
  punchlineHistory[category].push(chosen.title);
  return chosen;
}

// ====================================================================
// 2. RETRO WEB AUDIO API SYNTHESIZER (NO EXTERNAL AUDIO FILES REQUIRED)
// ====================================================================
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, type, duration, startTime = 0, gainLevel = 0.15) {
  if (!state.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

    gain.gain.setValueAtTime(gainLevel, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  } catch (e) {
    console.debug('Audio playback note:', e.message);
  }
}

function playSuccessSound() {
  // Upbeat arcade arpeggio
  playTone(523.25, 'triangle', 0.1, 0, 0.2);       // C5
  playTone(659.25, 'triangle', 0.1, 0.08, 0.2);    // E5
  playTone(783.99, 'triangle', 0.12, 0.16, 0.2);   // G5
  playTone(1046.50, 'square', 0.25, 0.24, 0.15);   // C6
}

function playCloseSound() {
  // Quirky wobble tone
  playTone(440, 'sine', 0.12, 0, 0.2);
  playTone(554.37, 'triangle', 0.14, 0.1, 0.2);
  playTone(493.88, 'sine', 0.2, 0.22, 0.18);
}

function playWrongSound() {
  // Low arcade buzzer
  playTone(220, 'sawtooth', 0.18, 0, 0.2);
  playTone(174.61, 'sawtooth', 0.35, 0.15, 0.25);
}

function playClickSound() {
  playTone(800, 'sine', 0.04, 0, 0.05);
}

function playVictoryFanfare() {
  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
  notes.forEach((freq, i) => {
    playTone(freq, 'triangle', 0.2, i * 0.12, 0.25);
  });
}

// ====================================================================
// 3. FUZZY MATCHING & LEVENSHTEIN TOLERANCE (FOR CLOSE ANSWERS)
// ====================================================================
function cleanString(str) {
  if (!str) return '';
  return str.toString()
    .trim()
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '')
    .replace(/\s+/g, ' ');
}

function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const d = [];

  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return d[m][n];
}

/**
 * Evaluates user answer against correct answer and close tolerances
 * Returns: 'correct' (+100) | 'close' (+50) | 'wrong' (0)
 */
function evaluateAnswer(userAnswer, exercise) {
  const cleanUser = cleanString(userAnswer);
  const cleanCorrect = cleanString(exercise.correct_answer);

  // Exact Match
  if (cleanUser === cleanCorrect) {
    return 'correct';
  }

  // Check explicit close answers list from PostgreSQL JSONB
  let closeAnswers = exercise.close_answers_json || [];
  if (typeof closeAnswers === 'string') {
    try { closeAnswers = JSON.parse(closeAnswers); } catch (e) { closeAnswers = []; }
  }

  for (const alt of closeAnswers) {
    if (cleanUser === cleanString(alt)) {
      return 'close';
    }
  }

  // Levenshtein fuzzy distance tolerance (for typos in fill-in-the-blank)
  if (cleanCorrect.length >= 4) {
    const dist = levenshteinDistance(cleanUser, cleanCorrect);
    // Allow 1 typo for 4-6 chars, up to 2 typos for 7+ chars
    const maxAllowedDist = cleanCorrect.length <= 6 ? 1 : 2;
    if (dist <= maxAllowedDist) {
      return 'close';
    }
  }

  return 'wrong';
}

// ====================================================================
// 4. DOM ELEMENTS CACHE
// ====================================================================
const DOM = {
  // Screens
  dashboardSection: document.getElementById('dashboardSection'),
  quizSection: document.getElementById('quizSection'),
  resultsSection: document.getElementById('resultsSection'),

  // Header
  btnGoHome: document.getElementById('btnGoHome'),
  dbStatusPill: document.getElementById('dbStatusPill'),
  dbStatusText: document.getElementById('dbStatusText'),
  btnSoundToggle: document.getElementById('btnSoundToggle'),
  soundIcon: document.getElementById('soundIcon'),
  currentUserName: document.getElementById('currentUserName'),
  currentUserScore: document.getElementById('currentUserScore'),
  btnOpenLeaderboard: document.getElementById('btnOpenLeaderboard'),
  btnLogout: document.getElementById('btnLogout'),

  // Dashboard
  dashTotalScore: document.getElementById('dashTotalScore'),
  dashGreetingName: document.getElementById('dashGreetingName'),
  dashProgressPercent: document.getElementById('dashProgressPercent'),
  dashProgressBar: document.getElementById('dashProgressBar'),
  themesGrid: document.getElementById('themesGrid'),
  levelCounterBadge: document.getElementById('levelCounterBadge'),
  levelFilterContainer: document.getElementById('levelFilterContainer'),

  // Quiz Arena
  btnBackToDashboard: document.getElementById('btnBackToDashboard'),
  lessonBannerTitle: document.getElementById('lessonBannerTitle'),
  lessonBannerSubtitle: document.getElementById('lessonBannerSubtitle'),
  quizGrammarRule: document.getElementById('quizGrammarRule'),
  quizThemeBadge: document.getElementById('quizThemeBadge'),
  quizLevelBadge: document.getElementById('quizLevelBadge'),
  quizCurrentScore: document.getElementById('quizCurrentScore'),
  quizStreakContainer: document.getElementById('quizStreakContainer'),
  quizStreakCount: document.getElementById('quizStreakCount'),
  quizQuestionProgress: document.getElementById('quizQuestionProgress'),
  quizProgressPercent: document.getElementById('quizProgressPercent'),
  quizProgressBar: document.getElementById('quizProgressBar'),
  questionCard: document.getElementById('questionCard'),
  questionTypeBadge: document.getElementById('questionTypeBadge'),
  questionPrompt: document.getElementById('questionPrompt'),
  answerArea: document.getElementById('answerArea'),

  // Reaction Modal
  reactionModal: document.getElementById('reactionModal'),
  reactionModalCard: document.getElementById('reactionModalCard'),
  reactionScoreBadge: document.getElementById('reactionScoreBadge'),
  reactionMediaContainer: document.getElementById('reactionMediaContainer'),
  reactionStickerImg: document.getElementById('reactionStickerImg'),
  reactionStickerVideo: document.getElementById('reactionStickerVideo'),
  reactionTitle: document.getElementById('reactionTitle'),
  reactionFeedback: document.getElementById('reactionFeedback'),
  btnNextQuestion: document.getElementById('btnNextQuestion'),

  // Results Screen
  finalTitle: document.getElementById('finalTitle'),
  finalSubtitle: document.getElementById('finalSubtitle'),
  finalScoreStar: document.getElementById('finalScoreStar'),
  finalEarnedScoreBadge: document.getElementById('finalEarnedScoreBadge'),
  finalMediaContainer: document.getElementById('finalMediaContainer'),
  finalStickerImg: document.getElementById('finalStickerImg'),
  finalStickerVideo: document.getElementById('finalStickerVideo'),
  finalEarnedScore: document.getElementById('finalEarnedScore'),
  finalAccuracy: document.getElementById('finalAccuracy'),
  finalCorrectCount: document.getElementById('finalCorrectCount'),
  finalMaxStreak: document.getElementById('finalMaxStreak'),
  finalDbSaveBanner: document.getElementById('finalDbSaveBanner'),
  btnReplayQuiz: document.getElementById('btnReplayQuiz'),
  btnChooseOtherThemes: document.getElementById('btnChooseOtherThemes'),

  // Leaderboard Modal
  leaderboardModal: document.getElementById('leaderboardModal'),
  btnCloseLeaderboard: document.getElementById('btnCloseLeaderboard'),
  leaderboardList: document.getElementById('leaderboardList'),
  btnRefreshLeaderboard: document.getElementById('btnRefreshLeaderboard'),

  // Lesson Modal
  lessonModal: document.getElementById('lessonModal'),
  lessonModalTitle: document.getElementById('lessonModalTitle'),
  lessonModalBody: document.getElementById('lessonModalBody'),
  btnCloseLesson: document.getElementById('btnCloseLesson'),
  btnCloseLessonBottom: document.getElementById('btnCloseLessonBottom'),
  btnStartFromLesson: document.getElementById('btnStartFromLesson'),

  // Settings Modal
  settingsModal: document.getElementById('settingsModal'),
  btnCloseSettings: document.getElementById('btnCloseSettings'),
  btnSettingsSoundToggle: document.getElementById('btnSettingsSoundToggle'),
  btnSettingsLogout: document.getElementById('btnSettingsLogout'),
  settingsUserName: document.getElementById('settingsUserName'),
  settingsUserScore: document.getElementById('settingsUserScore'),
  settingsDbText: document.getElementById('settingsDbText')
};

// ====================================================================
// 5. NAVIGATION & SCREEN CONTROLLER
// ====================================================================
// Signed-out sessions go back to the dedicated authentication page.
function redirectToLogin() {
  window.location.replace('login.html');
}

function showScreen(screenName) {
  // Hide all screens
  DOM.dashboardSection.classList.add('hidden');
  DOM.quizSection.classList.add('hidden');
  DOM.resultsSection.classList.add('hidden');

  // Show target
  if (screenName === 'auth') {
    redirectToLogin();
    return;
  } else if (screenName === 'dashboard') {
    DOM.dashboardSection.classList.remove('hidden');
    renderDashboard();
  } else if (screenName === 'quiz') {
    DOM.quizSection.classList.remove('hidden');
  } else if (screenName === 'results') {
    DOM.resultsSection.classList.remove('hidden');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getCompletedThemes() {
  const userId = state.currentUser ? (state.currentUser.id || state.currentUser.username) : 'guest';
  try {
    const raw = localStorage.getItem(`baamboozle_completed_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function markThemeCompleted(themeId) {
  if (!themeId) return;
  const userId = state.currentUser ? (state.currentUser.id || state.currentUser.username) : 'guest';
  const completed = getCompletedThemes();
  if (!completed.includes(themeId)) {
    completed.push(themeId);
    localStorage.setItem(`baamboozle_completed_${userId}`, JSON.stringify(completed));
  }
  updateDashboardProgress();
}

function updateDashboardProgress() {
  const score = state.currentUser ? (state.currentUser.total_score || 0) : 0;
  const completed = getCompletedThemes();
  const totalThemes = (state.themes && state.themes.length > 0) ? state.themes.length : 12;
  const completedCount = completed.length;

  // Dynamic Progress Calculation:
  // - Completed themes account for up to 80%
  // - Total XP accounts for up to 20%
  // - If score > 0 with 0 completed themes, scale smoothly
  let percent = 0;
  if (completedCount > 0) {
    const themeWeight = (completedCount / totalThemes) * 80;
    const xpBonus = Math.min(20, Math.round((score / 500) * 20));
    percent = Math.min(100, Math.round(themeWeight + xpBonus));
  } else if (score > 0) {
    percent = Math.min(100, Math.max(5, Math.round((score / 500) * 100)));
  }

  // Update Dynamic DOM Elements
  if (DOM.dashProgressPercent) {
    DOM.dashProgressPercent.textContent = `${percent}%`;
  }
  if (DOM.dashProgressBar) {
    DOM.dashProgressBar.style.width = `${percent}%`;
  }
  if (DOM.dashTotalScore) {
    DOM.dashTotalScore.textContent = `${score} XP`;
  }

  // Update SVG Circular Progress Ring (Circumference ~ 251.32)
  const circleEl = document.getElementById('dashProgressCircle');
  if (circleEl) {
    const circumference = 251.32;
    const offset = circumference - (percent / 100) * circumference;
    circleEl.style.strokeDashoffset = offset;
  }

  // Completed themes counters and labels matching reference image
  const masteredEl = document.getElementById('dashMasteredText');
  if (masteredEl) {
    masteredEl.textContent = `${completedCount} thème${completedCount > 1 ? 's' : ''} maîtrisé${completedCount > 1 ? 's' : ''} sur ${totalThemes}`;
  }

  const nextRankSub = document.getElementById('dashNextRankSub');
  if (nextRankSub) {
    nextRankSub.textContent = `${completedCount} / ${totalThemes} thèmes maîtrisés`;
  }

  const completedEl = document.getElementById('dashCompletedThemes');
  if (completedEl) {
    completedEl.textContent = `${completedCount}/${totalThemes} Themes`;
  }

  // Rank Badge and Milestone
  const rankEl = document.getElementById('dashUserRank');
  const milestoneEl = document.getElementById('dashMilestoneText');
  let rank = '<i class="fa-solid fa-seedling text-emerald-400 text-[10px]"></i> Novice Explorer';
  let nextMilestone = '100 XP';
  let nextRankTitle = 'English Champion';

  if (score >= 1000 || percent >= 100) {
    rank = '<i class="fa-solid fa-crown text-amber-400 text-[10px]"></i> English Champion';
    nextMilestone = 'Max Mastered! 🎉';
    nextRankTitle = 'Grand Master';
  } else if (score >= 600 || percent >= 75) {
    rank = '<i class="fa-solid fa-award text-yellow-400 text-[10px]"></i> Grammar Master';
    nextMilestone = '1,000 XP';
    nextRankTitle = 'English Champion';
  } else if (score >= 300 || percent >= 45) {
    rank = '<i class="fa-solid fa-star text-blue-400 text-[10px]"></i> Skilled Speaker';
    nextMilestone = '600 XP';
    nextRankTitle = 'Grammar Master';
  } else if (score >= 100 || percent >= 20) {
    rank = '<i class="fa-solid fa-medal text-amber-400 text-[10px]"></i> Active Learner';
    nextMilestone = '300 XP';
    nextRankTitle = 'Skilled Speaker';
  }

  if (rankEl) rankEl.innerHTML = rank;
  if (milestoneEl) milestoneEl.textContent = nextMilestone;
  const nextRankTitleEl = document.getElementById('dashNextRankTitle');
  if (nextRankTitleEl) nextRankTitleEl.textContent = nextRankTitle;
}

function updateHeaderUser() {
  const user = state.currentUser;
  const name = user ? (user.username || 'Learner') : '';
  const score = user ? (user.total_score || 0) : 0;

  // The top bar only carries account controls when someone is actually signed
  // in. During authentication (login.html) this whole area is not rendered.
  const controls = document.getElementById('userControls');
  if (controls) controls.classList.toggle('hidden', !user);

  if (DOM.currentUserName) DOM.currentUserName.textContent = name;
  if (DOM.currentUserScore) DOM.currentUserScore.textContent = `${score.toLocaleString()} XP`;
  if (DOM.dashTotalScore) DOM.dashTotalScore.textContent = `${score.toLocaleString()} XP`;
  if (DOM.dashGreetingName) DOM.dashGreetingName.textContent = name;

  updateDashboardProgress();
}

// ====================================================================
// 6. DATABASE CONNECTIVITY & API CALLS
// ====================================================================
async function checkDatabaseHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (res.ok) {
      const data = await res.json();
      state.dbOnline = true;
      DOM.dbStatusPill.className = 'hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-medium cursor-pointer transition-all';
      DOM.dbStatusText.textContent = 'Cloud Synced';
    } else {
      throw new Error('Not connected');
    }
  } catch (err) {
    state.dbOnline = false;
    DOM.dbStatusPill.className = 'hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-700 text-xs font-medium cursor-pointer transition-all';
    DOM.dbStatusText.textContent = 'Offline';
  }
}

async function fetchStickersList() {
  try {
    const res = await fetch(`${API_BASE}/api/stickers`);
    if (res.ok) {
      const data = await res.json();
      if (data.correct && data.correct.length > 0) state.stickers.correct = data.correct;
      if (data.close && data.close.length > 0) state.stickers.close = data.close;
      if (data.wrong && data.wrong.length > 0) state.stickers.wrong = data.wrong;
    }
  } catch (e) {
    console.debug('Stickers scan fallback active');
  }
}

async function loadThemes() {
  try {
    const res = await fetch(`${API_BASE}/api/themes`);
    if (res.ok) {
      const data = await res.json();
      state.themes = data.map(withNormalizedLevel);
      return;
    }
  } catch (err) {
    console.warn('Using fallback themes:', err.message);
  }
  state.themes = FALLBACK_THEMES.map(withNormalizedLevel);
}

async function loadThemeExercises(themeId) {
  try {
    const res = await fetch(`${API_BASE}/api/themes/${themeId}/exercises`);
    if (res.ok) {
      const data = await res.json();
      return data.exercises;
    }
  } catch (err) {
    console.warn('Using fallback exercises for theme', themeId);
  }
  return FALLBACK_EXERCISES[themeId] || FALLBACK_EXERCISES[1];
}

async function saveScoreToBackend(themeId, score) {
  const payload = {
    userId: state.currentUser && !state.currentUser.isGuest ? state.currentUser.id : null,
    themeId: themeId,
    score: score
  };

  try {
    const res = await fetch(`${API_BASE}/api/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const result = await res.json();
      if (result.updatedTotalScore !== null && state.currentUser) {
        state.currentUser.total_score = result.updatedTotalScore;
        localStorage.setItem('baamboozle_user', JSON.stringify(state.currentUser));
        updateHeaderUser();
      }
      return true;
    }
  } catch (err) {
    console.warn('Could not save score to PG server:', err.message);
  }

  // Fallback save locally if guest or server offline
  if (state.currentUser) {
    state.currentUser.total_score = (state.currentUser.total_score || 0) + score;
    localStorage.setItem('baamboozle_user', JSON.stringify(state.currentUser));
    updateHeaderUser();
  }
  return false;
}

// ====================================================================
// 7. AUTHENTICATION
// Login / sign-up / guest access live in login.html + js/login.js.
// This engine only maintains the session and redirects when signed out.
// ====================================================================


// ====================================================================
// BOTTOM NAVIGATION DOCK & SETTINGS MODAL
// ====================================================================
function openSettingsModal() {
  if (!DOM.settingsModal) return;
  if (DOM.settingsUserName) {
    DOM.settingsUserName.textContent = state.currentUser ? state.currentUser.username : 'Guest Hero';
  }
  if (DOM.settingsUserScore) {
    DOM.settingsUserScore.textContent = `${state.currentUser ? (state.currentUser.total_score || 0) : 0} Total Points`;
  }
  if (DOM.settingsDbText) {
    DOM.settingsDbText.textContent = state.dbOnline ? 'Connected (PostgreSQL sync)' : 'Local Storage Mode';
    DOM.settingsDbText.className = state.dbOnline ? 'text-[11px] text-emerald-600 font-semibold block' : 'text-[11px] text-amber-600 font-semibold block';
  }
  if (DOM.btnSettingsSoundToggle) {
    DOM.btnSettingsSoundToggle.textContent = state.soundEnabled ? 'ON' : 'OFF';
    DOM.btnSettingsSoundToggle.className = state.soundEnabled 
      ? 'px-3 py-1.5 rounded-xl font-bold text-xs bg-blue-600 text-white cursor-pointer shadow-sm'
      : 'px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-200 text-slate-700 cursor-pointer shadow-sm';
  }
  DOM.settingsModal.classList.remove('hidden');
}

function setupSettingsModal() {
  if (DOM.btnCloseSettings) {
    DOM.btnCloseSettings.addEventListener('click', () => {
      playClickSound();
      DOM.settingsModal.classList.add('hidden');
    });
  }

  if (DOM.btnSettingsSoundToggle) {
    DOM.btnSettingsSoundToggle.addEventListener('click', () => {
      if (DOM.btnSoundToggle) DOM.btnSoundToggle.click();
      DOM.btnSettingsSoundToggle.textContent = state.soundEnabled ? 'ON' : 'OFF';
      DOM.btnSettingsSoundToggle.className = state.soundEnabled 
        ? 'px-3 py-1.5 rounded-xl font-bold text-xs bg-blue-600 text-white cursor-pointer shadow-sm'
        : 'px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-200 text-slate-700 cursor-pointer shadow-sm';
    });
  }

  if (DOM.btnSettingsLogout) {
    DOM.btnSettingsLogout.addEventListener('click', () => {
      DOM.settingsModal.classList.add('hidden');
      if (DOM.btnLogout) DOM.btnLogout.click();
    });
  }
}

// ====================================================================
// 8. THEMES DASHBOARD RENDERING & CEFR LEVEL FILTERING
// ====================================================================
function setLevelFilter(level) {
  state.currentLevelFilter = level;
  const buttons = document.querySelectorAll('.level-tab-btn');

  buttons.forEach(btn => {
    const btnLvl = btn.getAttribute('data-level');
    if (btnLvl === level) {
      btn.className = 'level-tab-btn px-3.5 py-1.5 rounded-full font-extrabold text-xs transition-all bg-indigo-50 text-indigo-700 border border-indigo-200 cursor-pointer shadow-xs';
    } else {
      btn.className = 'level-tab-btn px-3 py-1.5 rounded-full font-bold text-xs transition-all bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 cursor-pointer';
    }
  });

  const levelBadge = document.getElementById('dashLevelBadge');
  if (levelBadge) {
    if (level === 'ALL') {
      levelBadge.textContent = 'TOUS NIVEAUX';
    } else if (level === 'A1') {
      levelBadge.textContent = 'A1 • DÉBUTANT';
    } else if (level === 'A2') {
      levelBadge.textContent = 'A2 • ÉLÉMENTAIRE';
    } else if (level === 'B1') {
      levelBadge.textContent = 'B1 • INTERMÉDIAIRE';
    } else if (level === 'B2') {
      levelBadge.textContent = 'B2 ET +';
    }
  }

  renderDashboard();
}

function renderDashboard() {
  updateHeaderUser();
  DOM.themesGrid.innerHTML = '';

  const levelStyles = {
    A1: { badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80', dot: 'bg-emerald-500', label: 'A1 Beginner' },
    A2: { badge: 'bg-amber-50 text-amber-700 border border-amber-200/80', dot: 'bg-amber-500', label: 'A2 Elementary' },
    B1: { badge: 'bg-orange-50 text-orange-700 border border-orange-200/80', dot: 'bg-orange-500', label: 'B1 Intermediate' },
    B2: { badge: 'bg-purple-50 text-purple-700 border border-purple-200/80', dot: 'bg-purple-500', label: 'B2 Upper-Int' },
    C1: { badge: 'bg-rose-50 text-rose-700 border border-rose-200/80', dot: 'bg-rose-500', label: 'C1 Advanced' },
    MISC: { badge: 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200/80', dot: 'bg-fuchsia-500', label: 'MISC Silly Stuff' },
  };

  const activeLevel = state.currentLevelFilter || 'ALL';
  const filteredThemes = activeLevel === 'ALL'
    ? state.themes
    : state.themes.filter(t => withNormalizedLevel(t).level === activeLevel.toUpperCase());

  const completedList = getCompletedThemes();

  if (DOM.levelCounterBadge) {
    DOM.levelCounterBadge.textContent = `${filteredThemes.length} Theme${filteredThemes.length > 1 ? 's' : ''} (${activeLevel})`;
  }

  if (filteredThemes.length === 0) {
    DOM.themesGrid.innerHTML = `
      <div class="app-card rounded-3xl p-8 text-center">
        <span class="text-3xl block mb-2">🔍</span>
        <h4 class="text-base font-extrabold text-slate-900 mb-1">No themes found for level ${activeLevel}</h4>
        <p class="text-xs text-slate-500 mb-4">Try selecting another level or view all levels.</p>
        <button id="btnResetFilter" class="btn-royal px-5 py-2.5 rounded-2xl font-bold text-xs uppercase cursor-pointer">
          Show All Levels
        </button>
      </div>
    `;
    const resetBtn = document.getElementById('btnResetFilter');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        setLevelFilter('ALL');
      });
    }
    return;
  }

function getThemeVisuals(theme) {
  const title = (theme.title || '').toLowerCase();
  let iconName = theme.icon || 'fa-book-open';
  let color = theme.color_theme || 'indigo';

  if (title.includes('everyday') || title.includes('conversation') || title.includes('dialogue') || title.includes('présenter')) {
    iconName = 'fa-book-open';
    color = 'indigo';
  } else if (title.includes('café') || title.includes('cafe') || title.includes('coffee') || title.includes('oral') || title.includes('compréhension') || title.includes('listen')) {
    iconName = 'fa-headphones';
    color = 'emerald';
  } else if (title.includes('routine') || title.includes('habitudes') || title.includes('daily') || title.includes('gramm')) {
    iconName = 'fa-clipboard-list';
    color = 'amber';
  } else if (title.includes('cat') || title.includes('dog') || title.includes('animal')) {
    iconName = 'fa-paw';
    color = 'amber';
  } else if (title.includes('irregular') || title.includes('verb')) {
    iconName = 'fa-bolt';
    color = 'indigo';
  } else if (title.includes('tense') || title.includes('time')) {
    iconName = 'fa-clock';
    color = 'blue';
  } else if (title.includes('modal') || title.includes('conditional')) {
    iconName = 'fa-wand-magic-sparkles';
    color = 'purple';
  } else if (title.includes('slang') || title.includes('gen-z')) {
    iconName = 'fa-fire';
    color = 'rose';
  } else if (title.includes('idiom') || title.includes('false friend')) {
    iconName = 'fa-masks-theater';
    color = 'emerald';
  } else if (title.includes('travel') || title.includes('airport')) {
    iconName = 'fa-plane-departure';
    color = 'cyan';
  } else if (title.includes('food') || title.includes('restaurant')) {
    iconName = 'fa-utensils';
    color = 'orange';
  }

  const palette = {
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
  };

  const scheme = palette[color] || palette.indigo;
  return {
    iconHtml: `<i class="fa-solid ${iconName} ${scheme.text} text-base sm:text-lg"></i>`,
    containerClasses: `${scheme.bg} ${scheme.border}`
  };
}

  filteredThemes.forEach((theme, idx) => {
    const isCompleted = completedList.includes(theme.id);
    const vis = getThemeVisuals(theme);
    const totalCount = filteredThemes.length;
    const lessonNum = (idx % totalCount) + 1;
    const duration = 8 + (idx % 3) * 2;
    const topicSub = theme.description || 'Se présenter et faire connaissance';

    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-200 group';

    card.innerHTML = `
      <div class="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
        <!-- Squircle Icon matching reference image -->
        <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${vis.containerClasses} border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
          ${vis.iconHtml}
        </div>

        <!-- Theme Details -->
        <div class="flex-1 min-w-0">
          <h4 class="text-sm sm:text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
            ${theme.title}
          </h4>
          <p class="text-xs text-slate-400 font-medium truncate mt-0.5">
            <span>${topicSub}</span>
            <span class="text-slate-300 mx-1">•</span>
            <span>${duration} min - ${(typeof t === 'function' ? t('next.lesson') : 'Leçon')} ${lessonNum} / ${totalCount}</span>
          </p>
        </div>
      </div>

      <!-- Center-Right Progress / Status (Matching screenshot) -->
      <div class="hidden sm:flex flex-shrink-0 items-center justify-end pr-2">
        ${isCompleted ? `
          <div class="flex flex-col items-start gap-1 w-24 sm:w-28">
            <span class="text-[10px] font-black uppercase tracking-wider text-indigo-600">${typeof t === 'function' ? t('next.inProgress') : 'EN COURS'}</span>
            <div class="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div class="h-full bg-indigo-600 rounded-full" style="width: 45%;"></div>
            </div>
          </div>
        ` : `
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            ${typeof t === 'function' ? t('next.discover') : 'À DÉCOUVRIR'}
          </span>
        `}
      </div>

      <!-- Action Button (Matching screenshot) -->
      <div class="flex items-center gap-2 flex-shrink-0">
        ${theme.lesson_content ? `
          <button class="btn-lesson h-9 px-3 rounded-xl text-xs font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hidden md:flex items-center gap-1.5 transition-all cursor-pointer" data-theme-id="${theme.id}" title="Lire la leçon">
            <i class="fa-solid fa-book-open text-xs"></i>
            <span class="hidden lg:inline">${typeof t === 'function' ? t('next.lesson') : 'Leçon'}</span>
          </button>
        ` : ''}
        ${isCompleted ? `
          <button class="btn-start h-9 sm:h-10 px-4 sm:px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95" data-theme-id="${theme.id}">
            <span>${typeof t === 'function' ? t('next.resume') : 'Reprendre'}</span>
            <i class="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        ` : `
          <button class="btn-start h-9 sm:h-10 px-4 sm:px-5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95" data-theme-id="${theme.id}">
            <span>${typeof t === 'function' ? t('next.start') : 'Commencer'}</span>
            <i class="fa-solid fa-chevron-right text-[10px] text-slate-400"></i>
          </button>
        `}
      </div>
    `;

    const startBtn = card.querySelector('.btn-start');
    startBtn.addEventListener('click', () => {
      playClickSound();
      startQuizForTheme(theme);
    });

    const lessonBtn = card.querySelector('.btn-lesson');
    if (lessonBtn) {
      lessonBtn.addEventListener('click', () => {
        playClickSound();
        openLessonModal(theme);
      });
    }

    DOM.themesGrid.appendChild(card);
  });
}

// ====================================================================
// PEDAGOGICAL LESSON RENDERER (Clean EdTech Structure + Native Audio)
// ====================================================================
function renderTensesLesson() {
  return `
    <div class="space-y-4">
      <!-- Interactive Audio Tip Banner -->
      <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3">
        <div>
          <span class="text-[10px] font-black uppercase tracking-wider text-blue-200 block">Interactive Masterclass</span>
          <h4 class="text-sm sm:text-base font-black">The Ultimate English Tenses Blueprint</h4>
          <p class="text-xs text-blue-100 mt-0.5">Click any example sentence to listen to crystal-clear native pronunciation 🎧</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl flex-shrink-0">
          ⏳
        </div>
      </div>

      <!-- Section 1: Present Simple vs Present Continuous -->
      <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">1</span>
            <h5 class="text-sm font-black text-slate-900">Present Simple vs Present Continuous</h5>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Routines vs Right Now</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Present Simple -->
          <div class="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-200/80 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-black text-emerald-900 uppercase">Present Simple</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-emerald-700 border border-emerald-200">Daily Routine</span>
              </div>
              <p class="text-xs text-slate-600 mb-2">Used for routines, permanent habits, and universal facts.</p>
              <div class="bg-white p-2 rounded-lg border border-emerald-200/70 text-[11px] font-semibold text-emerald-800 mb-2.5">
                <b>Keywords:</b> always, usually, often, every day, never
              </div>
            </div>
            <div class="space-y-1.5">
              <div class="lesson-speak-chip bg-white hover:bg-emerald-50 p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 flex items-center justify-between cursor-pointer transition-all group" data-text="I drink coffee every morning.">
                <span class="text-xs font-medium text-slate-800 italic">"I <b class="text-emerald-700 underline">drink</b> coffee every morning."</span>
                <i class="fa-solid fa-volume-high text-xs text-slate-400 group-hover:text-emerald-600"></i>
              </div>
              <div class="lesson-speak-chip bg-white hover:bg-emerald-50 p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 flex items-center justify-between cursor-pointer transition-all group" data-text="The sun rises in the east.">
                <span class="text-xs font-medium text-slate-800 italic">"The sun <b class="text-emerald-700 underline">rises</b> in the east."</span>
                <i class="fa-solid fa-volume-high text-xs text-slate-400 group-hover:text-emerald-600"></i>
              </div>
            </div>
          </div>

          <!-- Present Continuous -->
          <div class="bg-blue-50/50 rounded-xl p-3.5 border border-blue-200/80 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-black text-blue-900 uppercase">Present Continuous</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-blue-700 border border-blue-200">Happening Now</span>
              </div>
              <p class="text-xs text-slate-600 mb-2">Used for actions happening right at this exact moment.</p>
              <div class="bg-white p-2 rounded-lg border border-blue-200/70 text-[11px] font-mono font-bold text-blue-900 mb-2.5">
                <b>Formula:</b> AM / IS / ARE + Verb-ING
              </div>
            </div>
            <div class="space-y-1.5">
              <div class="lesson-speak-chip bg-white hover:bg-blue-50 p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 flex items-center justify-between cursor-pointer transition-all group" data-text="I am studying English right now.">
                <span class="text-xs font-medium text-slate-800 italic">"I <b class="text-blue-700 underline">am studying</b> English right now."</span>
                <i class="fa-solid fa-volume-high text-xs text-slate-400 group-hover:text-blue-600"></i>
              </div>
              <div class="lesson-speak-chip bg-white hover:bg-blue-50 p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 flex items-center justify-between cursor-pointer transition-all group" data-text="Look! It is raining outside.">
                <span class="text-xs font-medium text-slate-800 italic">"Look! It <b class="text-blue-700 underline">is raining</b> outside."</span>
                <i class="fa-solid fa-volume-high text-xs text-slate-400 group-hover:text-blue-600"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Past Simple vs Present Perfect -->
      <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">2</span>
            <h5 class="text-sm font-black text-slate-900">Past Simple vs Present Perfect</h5>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Finished vs Experience</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Past Simple -->
          <div class="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 flex flex-col justify-between">
            <div>
              <span class="text-xs font-black text-slate-900 uppercase block mb-1">Past Simple (Finished)</span>
              <p class="text-xs text-slate-600 mb-2">Finished action at a specific known time (yesterday, in 2021, 2 hours ago).</p>
            </div>
            <div class="space-y-1.5">
              <div class="lesson-speak-chip bg-white hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer transition-all group" data-text="I visited London in 2021.">
                <span class="text-xs font-medium text-slate-800 italic">"I <b class="text-indigo-700 underline">visited</b> London in 2021."</span>
                <i class="fa-solid fa-volume-high text-xs text-slate-400 group-hover:text-indigo-600"></i>
              </div>
              <div class="lesson-speak-chip bg-white hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer transition-all group" data-text="Yesterday, she bought a new car.">
                <span class="text-xs font-medium text-slate-800 italic">"Yesterday, she <b class="text-indigo-700 underline">bought</b> a car."</span>
                <i class="fa-solid fa-volume-high text-xs text-slate-400 group-hover:text-indigo-600"></i>
              </div>
            </div>
          </div>

          <!-- Present Perfect -->
          <div class="bg-indigo-50/50 rounded-xl p-3.5 border border-indigo-200/80 flex flex-col justify-between">
            <div>
              <span class="text-xs font-black text-indigo-900 uppercase block mb-1">Present Perfect (Life Experience)</span>
              <p class="text-xs text-slate-600 mb-2">Past action with an ongoing impact or connection to the present.</p>
              <div class="bg-white p-2 rounded-lg border border-indigo-200/70 text-[11px] font-mono font-bold text-indigo-900 mb-2.5">
                <b>Formula:</b> HAVE / HAS + Past Participle (V3)
              </div>
            </div>
            <div class="space-y-1.5">
              <div class="lesson-speak-chip bg-white hover:bg-indigo-50 p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 flex items-center justify-between cursor-pointer transition-all group" data-text="I have lived here for 5 years.">
                <span class="text-xs font-medium text-slate-800 italic">"I <b class="text-indigo-700 underline">have lived</b> here for 5 years."</span>
                <i class="fa-solid fa-volume-high text-xs text-slate-400 group-hover:text-indigo-600"></i>
              </div>
              <div class="lesson-speak-chip bg-white hover:bg-indigo-50 p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 flex items-center justify-between cursor-pointer transition-all group" data-text="Have you ever seen a ghost?">
                <span class="text-xs font-medium text-slate-800 italic">"<b class="text-indigo-700 underline">Have you ever seen</b> a ghost?"</span>
                <i class="fa-solid fa-volume-high text-xs text-slate-400 group-hover:text-indigo-600"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Golden Rule Callout -->
        <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 flex items-start gap-3 mt-3">
          <div class="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
            <i class="fa-solid fa-lightbulb"></i>
          </div>
          <div class="text-xs">
            <span class="font-extrabold uppercase tracking-wide text-amber-900 block mb-0.5">Golden Rule: "FOR" vs "SINCE"</span>
            <p class="leading-relaxed text-amber-950">
              • Use <b>FOR</b> with a <u>duration</u> (<i>for 2 hours, for 10 years</i>).<br>
              • Use <b>SINCE</b> with a <u>specific starting point</u> (<i>since 2015, since Monday, since 8:00 AM</i>).
            </p>
          </div>
        </div>
      </div>

      <!-- Section 3: Future - Will vs Going To -->
      <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-black">3</span>
            <h5 class="text-sm font-black text-slate-900">Future Forms: "Will" vs "Going To"</h5>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">Decisions vs Plans</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="bg-purple-50/50 rounded-xl p-3.5 border border-purple-200/80 flex flex-col justify-between">
            <div>
              <span class="text-xs font-black text-purple-900 uppercase block mb-1">WILL + Verb</span>
              <p class="text-xs text-slate-600 mb-2">Spontaneous decisions made on the spot, offers, promises.</p>
            </div>
            <div class="lesson-speak-chip bg-white hover:bg-purple-50 p-2.5 rounded-lg border border-slate-200 hover:border-purple-300 flex items-center justify-between cursor-pointer transition-all group" data-text="The phone is ringing. I will answer it!">
              <span class="text-xs font-medium text-slate-800 italic">"The phone is ringing. I <b class="text-purple-700 underline">will answer</b> it!"</span>
              <i class="fa-solid fa-volume-high text-xs text-slate-400 group-hover:text-purple-600"></i>
            </div>
          </div>

          <div class="bg-cyan-50/50 rounded-xl p-3.5 border border-cyan-200/80 flex flex-col justify-between">
            <div>
              <span class="text-xs font-black text-cyan-900 uppercase block mb-1">BE GOING TO + Verb</span>
              <p class="text-xs text-slate-600 mb-2">Pre-planned intentions, or predictions based on visible evidence.</p>
            </div>
            <div class="lesson-speak-chip bg-white hover:bg-cyan-50 p-2.5 rounded-lg border border-slate-200 hover:border-cyan-300 flex items-center justify-between cursor-pointer transition-all group" data-text="Look at those dark clouds! It is going to rain.">
              <span class="text-xs font-medium text-slate-800 italic">"Look at those clouds! It <b class="text-cyan-700 underline">is going to rain</b>."</span>
              <i class="fa-solid fa-volume-high text-xs text-slate-400 group-hover:text-cyan-600"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderConditionalsLesson() {
  return `
    <div class="space-y-4">
      <div class="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3">
        <div>
          <span class="text-[10px] font-black uppercase tracking-wider text-emerald-200 block">Grammar Blueprint</span>
          <h4 class="text-sm sm:text-base font-black">Conditionals & Modal Verbs Made Simple</h4>
          <p class="text-xs text-emerald-100 mt-0.5">Understand If-clauses and master modal obligations easily.</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl flex-shrink-0">
          🔮
        </div>
      </div>

      <!-- Conditionals Cards -->
      <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
        <h5 class="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">The 4 English Conditionals</h5>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Zero -->
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span class="px-2 py-0.5 rounded text-[10px] font-black bg-slate-200 text-slate-800 uppercase">Zero Conditional</span>
            <p class="text-xs text-slate-600 my-1">Scientific facts & general truths.</p>
            <div class="bg-white p-1.5 rounded text-[11px] font-mono font-bold text-slate-800 mb-2">If + Present, Present</div>
            <div class="lesson-speak-chip bg-white p-2 rounded border border-slate-200 flex items-center justify-between cursor-pointer group" data-text="If you heat ice, it melts.">
              <span class="text-xs italic">"If you heat ice, it <b class="text-blue-700">melts</b>."</span>
              <i class="fa-solid fa-volume-high text-xs text-slate-400 group-hover:text-blue-600"></i>
            </div>
          </div>

          <!-- First -->
          <div class="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-200 text-emerald-900 uppercase">First Conditional</span>
            <p class="text-xs text-slate-600 my-1">Real & probable future outcome.</p>
            <div class="bg-white p-1.5 rounded text-[11px] font-mono font-bold text-emerald-900 mb-2">If + Present, WILL + Verb</div>
            <div class="lesson-speak-chip bg-white p-2 rounded border border-slate-200 flex items-center justify-between cursor-pointer group" data-text="If you study hard, you will pass.">
              <span class="text-xs italic">"If you study, you <b class="text-emerald-700">will pass</b>."</span>
              <i class="fa-solid fa-volume-high text-xs text-slate-400 group-hover:text-emerald-600"></i>
            </div>
          </div>

          <!-- Second -->
          <div class="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
            <span class="px-2 py-0.5 rounded text-[10px] font-black bg-blue-200 text-blue-900 uppercase">Second Conditional</span>
            <p class="text-xs text-slate-600 my-1">Imaginary / hypothetical in present.</p>
            <div class="bg-white p-1.5 rounded text-[11px] font-mono font-bold text-blue-900 mb-2">If + Past Simple, WOULD + Verb</div>
            <div class="lesson-speak-chip bg-white p-2 rounded border border-slate-200 flex items-center justify-between cursor-pointer group" data-text="If I won a million dollars, I would travel the world.">
              <span class="text-xs italic">"If I won, I <b class="text-blue-700">would travel</b>."</span>
              <i class="fa-solid fa-volume-high text-xs text-slate-400 group-hover:text-blue-600"></i>
            </div>
          </div>

          <!-- Third -->
          <div class="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200">
            <span class="px-2 py-0.5 rounded text-[10px] font-black bg-purple-200 text-purple-900 uppercase">Third Conditional</span>
            <p class="text-xs text-slate-600 my-1">Past regret (cannot be changed).</p>
            <div class="bg-white p-1.5 rounded text-[11px] font-mono font-bold text-purple-900 mb-2">If + Had + V3, WOULD HAVE + V3</div>
            <div class="lesson-speak-chip bg-white p-2 rounded border border-slate-200 flex items-center justify-between cursor-pointer group" data-text="If I had trained harder, I would have won.">
              <span class="text-xs italic">"If I had trained, I <b class="text-purple-700">would have won</b>."</span>
              <i class="fa-solid fa-volume-high text-xs text-slate-400 group-hover:text-purple-600"></i>
            </div>
          </div>
        </div>

        <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <i class="fa-solid fa-lightbulb text-amber-600"></i>
          <span><b>Golden Rule:</b> In hypothetical English, always say <i>"If I <b>WERE</b> you"</i> (never "If I was you").</span>
        </div>
      </div>
    </div>
  `;
}

function renderIrregularVerbsLesson() {
  const verbs = [
    { v1: 'Go', v2: 'Went', v3: 'Gone', ex: 'I went to school yesterday.' },
    { v1: 'Eat', v2: 'Ate', v3: 'Eaten', ex: 'Have you eaten breakfast?' },
    { v1: 'Drive', v2: 'Drove', v3: 'Driven', ex: 'She drove to the coast.' },
    { v1: 'Write', v2: 'Wrote', v3: 'Written', ex: 'He has written a great book.' },
    { v1: 'Break', v2: 'Broke', v3: 'Broken', ex: 'Who broke this glass?' },
    { v1: 'Drink', v2: 'Drank', v3: 'Drunk', ex: 'I drank two cups of coffee.' },
    { v1: 'Speak', v2: 'Spoke', v3: 'Spoken', ex: 'English is spoken worldwide.' },
    { v1: 'Fly', v2: 'Flew', v3: 'Flown', ex: 'We flew over the Alps.' },
    { v1: 'Swim', v2: 'Swam', v3: 'Swum', ex: 'He has swum in the ocean.' },
    { v1: 'Begin', v2: 'Began', v3: 'Begun', ex: 'The show has already begun.' }
  ];

  return `
    <div class="space-y-4">
      <div class="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3">
        <div>
          <span class="text-[10px] font-black uppercase tracking-wider text-indigo-200 block">Quick Reference</span>
          <h4 class="text-sm sm:text-base font-black">Top Irregular Verbs Bootcamp</h4>
          <p class="text-xs text-indigo-100 mt-0.5">Master the 3 forms: Base (V1), Past (V2), and Past Participle (V3).</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl flex-shrink-0">
          ⚡
        </div>
      </div>

      <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <i class="fa-solid fa-bolt text-amber-500 mt-0.5"></i>
        <div>
          <b>The Golden Law:</b><br>
          • Use <b>V2</b> for simple past: <i>"I <u>drank</u> coffee yesterday."</i><br>
          • Use <b>V3</b> with Have/Has/Had: <i>"I have <u>drunk</u> three cups already."</i>
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th class="py-2.5 px-3">Base Form (V1)</th>
              <th class="py-2.5 px-3">Past Simple (V2)</th>
              <th class="py-2.5 px-3">Past Participle (V3)</th>
              <th class="py-2.5 px-3 text-right">Audio</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${verbs.map(v => `
              <tr class="hover:bg-slate-50/80 transition-colors">
                <td class="py-2.5 px-3 font-bold text-slate-900">${v.v1}</td>
                <td class="py-2.5 px-3 font-bold text-indigo-700">${v.v2}</td>
                <td class="py-2.5 px-3 font-bold text-blue-700">${v.v3}</td>
                <td class="py-2.5 px-3 text-right">
                  <button class="lesson-speak-chip w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-600 text-slate-500 hover:text-white inline-flex items-center justify-center transition-all cursor-pointer" data-text="${v.v1}, ${v.v2}, ${v.v3}. ${v.ex}" title="Listen">
                    <i class="fa-solid fa-volume-high text-[11px]"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAnimalIdiomsLesson() {
  const idioms = [
    { type: 'cat', term: 'Raining cats and dogs', meaning: 'Raining very heavily outside.', ex: 'Take an umbrella, it is raining cats and dogs!' },
    { type: 'cat', term: 'Let the cat out of the bag', meaning: 'Accidentally reveal a secret.', ex: 'He let the cat out of the bag about the surprise party.' },
    { type: 'cat', term: 'Cat got your tongue?', meaning: 'Why are you suddenly speechless or silent?', ex: 'What is wrong? Cat got your tongue?' },
    { type: 'dog', term: 'Barking up the wrong tree', meaning: 'Looking in the wrong place or blaming the wrong person.', ex: 'If you think I took it, you are barking up the wrong tree.' },
    { type: 'dog', term: 'Top dog', meaning: 'The leader or dominant person in a group.', ex: 'After years of hard work, she became the top dog of the firm.' },
    { type: 'dog', term: 'Dog-eat-dog world', meaning: 'A ruthless and fiercely competitive environment.', ex: 'Wall Street is a dog-eat-dog world.' }
  ];

  return `
    <div class="space-y-4">
      <div class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3">
        <div>
          <span class="text-[10px] font-black uppercase tracking-wider text-amber-200 block">Expressive English</span>
          <h4 class="text-sm sm:text-base font-black">Animal Idioms with Cats & Dogs</h4>
          <p class="text-xs text-amber-100 mt-0.5">Learn native figures of speech inspired by pets and everyday wildlife.</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl flex-shrink-0">
          🐾
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${idioms.map(idm => `
          <div class="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 shadow-2xs space-y-2 transition-all">
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${idm.type === 'cat' ? 'bg-amber-100 text-amber-800' : 'bg-orange-100 text-orange-800'}">
                ${idm.type === 'cat' ? '🐱 Cat Idiom' : '🐶 Dog Idiom'}
              </span>
              <button class="lesson-speak-chip w-6 h-6 rounded-md bg-slate-100 hover:bg-amber-500 text-slate-500 hover:text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer" data-text="${idm.term}. ${idm.ex}">
                <i class="fa-solid fa-volume-high"></i>
              </button>
            </div>
            <h5 class="text-sm font-black text-slate-900 leading-snug">"${idm.term}"</h5>
            <p class="text-xs text-slate-600">${idm.meaning}</p>
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200/80 text-[11px] italic text-slate-700">
              "${idm.ex}"
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderSlangLesson() {
  const terms = [
    { word: 'Rizz', def: 'Charisma, charm, and magnetic attraction when speaking to people.', ex: 'He has effortless rizz when telling stories.' },
    { word: 'No Cap', def: 'Telling 100% the truth without lying or exaggerating.', ex: 'That movie was incredible, no cap!' },
    { word: 'Let him cook', def: 'Give him space to show his skill or finish his argument.', ex: 'Hold on, let him cook!' },
    { word: 'GOAT', def: 'Acronym for "Greatest Of All Time" (like sports legends).', ex: 'Messi is the undisputed GOAT.' },
    { word: 'Sus', def: 'Suspicious, shady, or untrustworthy behaviour.', ex: 'That excuse sounds super sus.' },
    { word: 'Bet', def: 'Slang for "Yes!", "Deal!", or "Sounds good!"', ex: 'Want to grab lunch? Bet!' }
  ];

  return `
    <div class="space-y-4">
      <div class="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3">
        <div>
          <span class="text-[10px] font-black uppercase tracking-wider text-purple-200 block">Modern Vocabulary</span>
          <h4 class="text-sm sm:text-base font-black">Gen-Z & Streamer Slang Dictionary</h4>
          <p class="text-xs text-purple-100 mt-0.5">Understand viral English phrases from Twitch, YouTube, and Discord.</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl flex-shrink-0">
          🔥
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${terms.map(item => `
          <div class="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 shadow-2xs space-y-2 transition-all">
            <div class="flex items-center justify-between">
              <span class="text-base font-black text-purple-700 tracking-tight">${item.word}</span>
              <button class="lesson-speak-chip w-6 h-6 rounded-md bg-purple-50 hover:bg-purple-600 text-purple-600 hover:text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer" data-text="${item.word}. ${item.ex}">
                <i class="fa-solid fa-volume-high"></i>
              </button>
            </div>
            <p class="text-xs text-slate-600">${item.def}</p>
            <div class="bg-purple-50/50 p-2 rounded-lg border border-purple-100 text-[11px] italic text-purple-900">
              "${item.ex}"
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderFalseFriendsLesson() {
  const traps = [
    { eng: 'Actually', fake: 'Actuellement (Currently)', real: 'In fact / En réalité', ex: 'Actually, I disagree with that statement.' },
    { eng: 'Sensible', fake: 'Sensible (Sensitive)', real: 'Reasonable / Raisonnable / Sensé', ex: 'It is a sensible decision to save money.' },
    { eng: 'Eventually', fake: 'Éventuellement (Possibly)', real: 'In the end / Finalement', ex: 'He worked hard and eventually succeeded.' },
    { eng: 'Library', fake: 'Librairie (Bookshop)', real: 'Bibliothèque (Borrowing books)', ex: 'I borrowed three books from the public library.' },
    { eng: 'Deception', fake: 'Déception (Disappointment)', real: 'Treachery / Tromperie', ex: 'His betrayal was a masterclass in deception.' }
  ];

  return `
    <div class="space-y-4">
      <div class="bg-gradient-to-r from-rose-600 via-orange-600 to-rose-700 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3">
        <div>
          <span class="text-[10px] font-black uppercase tracking-wider text-rose-200 block">Critical Traps</span>
          <h4 class="text-sm sm:text-base font-black">Dangerous False Friends (Faux-Amis)</h4>
          <p class="text-xs text-rose-100 mt-0.5">Words that look like French but have completely different English meanings!</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl flex-shrink-0">
          ⚠️
        </div>
      </div>

      <div class="space-y-2.5">
        ${traps.map(item => `
          <div class="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-rose-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="text-sm font-black text-slate-900">${item.eng}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">❌ NOT: ${item.fake}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">✅ TRUE: ${item.real}</span>
              </div>
              <p class="text-xs text-slate-600 italic">"${item.ex}"</p>
            </div>
            <button class="lesson-speak-chip w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-600 text-slate-600 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer flex-shrink-0 self-end sm:self-center" data-text="${item.eng}. ${item.ex}">
              <i class="fa-solid fa-volume-high"></i>
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderGenericPedagogicalLesson(theme) {
  let raw = theme.lesson_content || '<p>Detailed lesson notes for this module are being prepared. You can jump directly into the quiz exercises below!</p>';
  // Clean raw HTML by removing ugly borders
  raw = raw.replace(/<hr class="my-3 border-black">/g, '<hr class="my-4 border-slate-200">');
  raw = raw.replace(/border-2 border-black/g, 'border border-slate-200 rounded-xl overflow-hidden');
  return `
    <div class="space-y-4">
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3">
        <div>
          <span class="text-[10px] font-black uppercase tracking-wider text-blue-200 block">Course Module</span>
          <h4 class="text-sm sm:text-base font-black">${theme.lesson_title || theme.title}</h4>
          <p class="text-xs text-blue-100 mt-0.5">Read through the grammar notes and vocabulary below before starting practice.</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl flex-shrink-0">
          📖
        </div>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        ${raw}
      </div>
    </div>
  `;
}

function renderPedagogicalLesson(theme) {
  if (!theme) return '<p>No lesson content.</p>';
  const themeId = theme.id;
  const title = (theme.title || '').toLowerCase();

  if (themeId === 1 || title.includes('tenses')) return renderTensesLesson();
  if (themeId === 2 || title.includes('conditional') || title.includes('modal')) return renderConditionalsLesson();
  if (themeId === 3 || title.includes('irregular')) return renderIrregularVerbsLesson();
  if (themeId === 4 || title.includes('animal') || title.includes('cats & dogs')) return renderAnimalIdiomsLesson();
  if (themeId === 5 || title.includes('slang') || title.includes('gen-z')) return renderSlangLesson();
  if (themeId === 6 || title.includes('false friend') || title.includes('faux-amis')) return renderFalseFriendsLesson();

  return renderGenericPedagogicalLesson(theme);
}

// Open Lesson Modal
function openLessonModal(theme) {
  if (!theme) return;

  if (DOM.lessonModalTitle) {
    DOM.lessonModalTitle.textContent = theme.lesson_title || theme.title;
  }

  const levelBadge = document.getElementById('lessonModalLevelBadge');
  if (levelBadge) {
    const lvl = (theme.level || 'A1').toUpperCase();
    levelBadge.textContent = `${lvl} Mastery`;
  }

  if (DOM.lessonModalBody) {
    DOM.lessonModalBody.innerHTML = renderPedagogicalLesson(theme);

    // Attach click listeners to all audio speak chips
    DOM.lessonModalBody.querySelectorAll('.lesson-speak-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = chip.getAttribute('data-text');
        if (text) {
          playClickSound();
          speakText(text);
          chip.classList.add('ring-2', 'ring-blue-500');
          setTimeout(() => chip.classList.remove('ring-2', 'ring-blue-500'), 800);
        }
      });
    });
  }

  DOM.btnStartFromLesson.onclick = () => {
    playClickSound();
    DOM.lessonModal.classList.add('hidden');
    startQuizForTheme(theme);
  };

  DOM.lessonModal.classList.remove('hidden');
}

DOM.btnCloseLesson.addEventListener('click', () => {
  playClickSound();
  DOM.lessonModal.classList.add('hidden');
});

DOM.btnCloseLessonBottom.addEventListener('click', () => {
  playClickSound();
  DOM.lessonModal.classList.add('hidden');
});

// ====================================================================
// 9. QUIZ ENGINE (BAAMBOOZLE QUESTIONS & MATCHING)
// ====================================================================
async function startQuizForTheme(theme) {
  resetSessionHistories();
  state.currentTheme = theme;
  state.currentIndex = 0;
  state.quizScore = 0;
  state.correctCount = 0;
  state.closeCount = 0;
  state.wrongCount = 0;
  state.currentStreak = 0;
  state.maxStreak = 0;

  // Load exercises from DB
  const exercises = await loadThemeExercises(theme.id);
  state.exercises = exercises;

  if (DOM.quizLevelBadge) {
    DOM.quizLevelBadge.textContent = (theme.level || 'A1').toUpperCase();
  }
  DOM.quizThemeBadge.textContent = theme.title;
  showScreen('quiz');
  renderCurrentQuestion();
}

function updateQuizHeaderStats() {
  if (DOM.quizCurrentScore) DOM.quizCurrentScore.textContent = state.quizScore;
  if (DOM.quizStreakCount) DOM.quizStreakCount.textContent = state.currentStreak;

  // Animate streak container if streak > 1
  if (DOM.quizStreakContainer) {
    if (state.currentStreak >= 2) {
      DOM.quizStreakContainer.classList.add('animate-bounce');
    } else {
      DOM.quizStreakContainer.classList.remove('animate-bounce');
    }
  }

  const total = (state.exercises && state.exercises.length) ? state.exercises.length : 1;
  const current = state.currentIndex + 1;
  const percent = Math.round((current / total) * 100);

  if (DOM.quizQuestionProgress) DOM.quizQuestionProgress.textContent = `Question ${current} of ${total}`;
  if (DOM.quizProgressPercent) DOM.quizProgressPercent.textContent = `${percent}%`;
  if (DOM.quizProgressBar) DOM.quizProgressBar.style.width = `${percent}%`;
}

function renderCurrentQuestion() {
  const exercise = state.exercises[state.currentIndex];
  if (!exercise) {
    finishQuiz();
    return;
  }

  updateQuizHeaderStats();
  if (DOM.questionCard) DOM.questionCard.classList.remove('shake-card');
  if (DOM.questionPrompt) DOM.questionPrompt.textContent = exercise.question_text;
  if (DOM.answerArea) DOM.answerArea.innerHTML = '';

  // Update London Banner & Grammar rule if elements exist
  if (DOM.lessonBannerTitle && state.currentTheme) {
    DOM.lessonBannerTitle.textContent = state.currentTheme.title || 'English Masterclass';
  }
  if (DOM.lessonBannerSubtitle && state.currentTheme) {
    DOM.lessonBannerSubtitle.textContent = state.currentTheme.description || 'We use it to talk about habits, routines and facts.';
  }
  if (DOM.quizGrammarRule) {
    if (exercise.question_type === 'multiple_choice') {
      DOM.quizGrammarRule.innerHTML = `
        <p>• Identify the correct verb form, tense or idiom.</p>
        <p>• Look at subject-verb agreement (e.g. <i>She likes</i> vs <i>They like</i>).</p>
      `;
    } else if (exercise.question_type === 'fill_blank') {
      DOM.quizGrammarRule.innerHTML = `
        <p>• Type your answer directly. Minor typos are accepted (+50 pts)!</p>
      `;
    } else {
      DOM.quizGrammarRule.innerHTML = `
        <p>• Evaluate whether the statement follows standard English rules.</p>
      `;
    }
  }

  const qType = exercise.question_type;

  // Update Badge safely
  if (DOM.questionTypeBadge) {
    if (qType === 'multiple_choice') {
      DOM.questionTypeBadge.innerHTML = '<i class="fa-solid fa-list-check mr-1 text-blue-600"></i> Practice Time!';
    } else if (qType === 'fill_blank') {
      DOM.questionTypeBadge.innerHTML = '<i class="fa-solid fa-pen mr-1 text-purple-600"></i> Fill in the Blank';
    } else if (qType === 'true_false') {
      DOM.questionTypeBadge.innerHTML = '<i class="fa-solid fa-scale-balanced mr-1 text-emerald-600"></i> True or False';
    }
  }

  if (qType === 'multiple_choice') {
    renderMultipleChoice(exercise);
  } else if (qType === 'fill_blank') {
    renderFillInBlank(exercise);
  } else if (qType === 'true_false') {
    renderTrueFalse(exercise);
  }
}

// Type 1: Multiple Choice (Pill Buttons matching Screen 3)
function renderMultipleChoice(exercise) {
  let options = exercise.options_json || [];
  if (typeof options === 'string') {
    try { options = JSON.parse(options); } catch (e) { options = []; }
  }

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2';

  const letters = ['A', 'B', 'C', 'D'];

  options.forEach((optText, i) => {
    const btn = document.createElement('button');
    const letter = letters[i] || `${i + 1}`;

    btn.className = `option-pill w-full py-4 px-5 rounded-2xl font-bold text-slate-800 text-left flex items-center justify-between gap-3 cursor-pointer text-sm sm:text-base shadow-sm hover:border-blue-400 group`;
    btn.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 font-extrabold text-xs flex items-center justify-center font-mono group-hover:bg-blue-700 group-hover:text-white transition-colors">
          ${letter}
        </span>
        <span class="leading-snug">${optText}</span>
      </div>
      <i class="fa-regular fa-circle-check text-slate-300 group-hover:text-blue-500 text-lg transition-colors"></i>
    `;

    btn.addEventListener('click', () => {
      handleAnswerSubmission(optText);
    });

    grid.appendChild(btn);
  });

  DOM.answerArea.appendChild(grid);
}

// Type 2: Fill in the Blank (Input + Royal Blue Submit Button)
function renderFillInBlank(exercise) {
  const container = document.createElement('div');
  container.className = 'space-y-4 pt-2 max-w-lg mx-auto';

  container.innerHTML = `
    <div class="relative">
      <input type="text" id="blankInput" autocomplete="off" placeholder="Type your answer here..."
        class="w-full px-5 py-4 text-base sm:text-lg font-bold bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 text-slate-900 text-center placeholder-slate-400 transition-all shadow-inner">
    </div>
    <button id="btnCheckBlank" class="btn-royal w-full py-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md">
      <span>Next Question</span>
      <i class="fa-solid fa-arrow-right text-xs"></i>
    </button>
    <p class="text-[11px] text-center font-semibold text-slate-500">
      💡 Tip: Minor spelling typos are accepted (+50 points)!
    </p>
  `;

  DOM.answerArea.appendChild(container);

  const input = container.querySelector('#blankInput');
  const btn = container.querySelector('#btnCheckBlank');

  setTimeout(() => input.focus(), 100);

  const submit = () => {
    const val = input.value.trim();
    if (!val) {
      input.focus();
      return;
    }
    handleAnswerSubmission(val);
  };

  btn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
  });
}

// Type 3: True or False (Clean Split Cards)
function renderTrueFalse(exercise) {
  const container = document.createElement('div');
  container.className = 'grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2';

  container.innerHTML = `
    <button class="py-6 px-4 rounded-3xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-900 font-extrabold text-xl sm:text-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all shadow-sm active:scale-[0.98] group" data-val="True">
      <span class="text-3xl group-hover:scale-110 transition-transform">✅</span>
      <span>TRUE</span>
    </button>
    <button class="py-6 px-4 rounded-3xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 text-rose-900 font-extrabold text-xl sm:text-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all shadow-sm active:scale-[0.98] group" data-val="False">
      <span class="text-3xl group-hover:scale-110 transition-transform">❌</span>
      <span>FALSE</span>
    </button>
  `;

  container.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const choice = btn.getAttribute('data-val');
      handleAnswerSubmission(choice);
    });
  });

  DOM.answerArea.appendChild(container);
}

// ====================================================================
// 10. ANSWER EVALUATION & MEME REACTION POPUP
// ====================================================================
function handleAnswerSubmission(userAnswer) {
  const exercise = state.exercises[state.currentIndex];
  const verdict = evaluateAnswer(userAnswer, exercise);

  let pointsAwarded = 0;
  let punchline = null;

  if (verdict === 'correct') {
    pointsAwarded = 100;
    state.quizScore += 100;
    state.correctCount++;
    state.currentStreak++;
    if (state.currentStreak > state.maxStreak) {
      state.maxStreak = state.currentStreak;
    }

    playSuccessSound();
    fireConfetti();

    punchline = getUniquePunchline('correct');
    const stickerSrc = getUniqueSticker('correct');

    setupReactionModal({
      badgeText: '+100 POINTS! 🚀',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/10',
      title: punchline.title,
      feedback: `Spot on! Correct answer: "${exercise.correct_answer}"`,
      stickerSrc: stickerSrc
    });

  } else if (verdict === 'close') {
    pointsAwarded = 50;
    state.quizScore += 50;
    state.closeCount++;
    // Streak kept alive or soft maintained
    state.currentStreak++;
    if (state.currentStreak > state.maxStreak) {
      state.maxStreak = state.currentStreak;
    }

    playCloseSound();

    punchline = getUniquePunchline('close');
    const stickerSrc = getUniqueSticker('close');

    setupReactionModal({
      badgeText: '+50 POINTS (CLOSE!) 🤏',
      badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-amber-500/10',
      title: punchline.title,
      feedback: `Almost there! Target was "${exercise.correct_answer}". Awarded +50 pts!`,
      stickerSrc: stickerSrc
    });

  } else {
    // Wrong
    pointsAwarded = 0;
    state.wrongCount++;
    state.currentStreak = 0;

    playWrongSound();

    // Trigger Shake animation on the card
    DOM.questionCard.classList.remove('shake-card');
    void DOM.questionCard.offsetWidth; // trigger reflow
    DOM.questionCard.classList.add('shake-card');

    punchline = getUniquePunchline('wrong');
    const stickerSrc = getUniqueSticker('wrong');

    setTimeout(() => {
      setupReactionModal({
        badgeText: '+0 POINTS (BIG OOF) 💀',
        badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-rose-500/10',
        title: punchline.title,
        feedback: `Correct answer was: "${exercise.correct_answer}"`,
        stickerSrc: stickerSrc
      });
    }, 400);
  }
}

function getRandomElement(arr) {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

function setMediaDisplay(imgEl, videoEl, src) {
  if (!src) return;
  const isVideo = /\.(mp4|webm|ogg)$/i.test(src);
  if (isVideo) {
    if (imgEl) imgEl.classList.add('hidden');
    if (videoEl) {
      videoEl.src = src;
      videoEl.classList.remove('hidden');
      videoEl.currentTime = 0;
      videoEl.play().catch(e => console.debug('Video autoplay note:', e.message));
    }
  } else {
    if (videoEl) {
      videoEl.pause();
      videoEl.classList.add('hidden');
      videoEl.src = '';
    }
    if (imgEl) {
      imgEl.src = src;
      imgEl.classList.remove('hidden');
    }
  }
}

function setupReactionModal({ badgeText, badgeClass, title, feedback, stickerSrc }) {
  DOM.reactionScoreBadge.textContent = badgeText;
  DOM.reactionScoreBadge.className = `inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-4 shadow-lg ${badgeClass}`;

  DOM.reactionTitle.textContent = title;
  DOM.reactionFeedback.textContent = feedback;

  setMediaDisplay(DOM.reactionStickerImg, DOM.reactionStickerVideo, stickerSrc);

  DOM.reactionModal.classList.remove('hidden');
}

DOM.btnNextQuestion.addEventListener('click', () => {
  playClickSound();
  if (DOM.reactionStickerVideo) {
    DOM.reactionStickerVideo.pause();
    DOM.reactionStickerVideo.src = '';
  }
  DOM.reactionModal.classList.add('hidden');
  state.currentIndex++;
  if (state.currentIndex < state.exercises.length) {
    renderCurrentQuestion();
  } else {
    finishQuiz();
  }
});

// Keyboard Enter to advance
window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !DOM.reactionModal.classList.contains('hidden')) {
    DOM.btnNextQuestion.click();
  }
});

// ====================================================================
// 11. CONFETTI BURST (CANVAS CONFETTI)
// ====================================================================
function fireConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#FACC15', '#EC4899', '#8B5CF6', '#10B981', '#3B82F6']
    });
  }
}

function fireBigVictoryConfetti() {
  if (typeof confetti !== 'function') return;
  const count = 200;
  const defaults = { origin: { y: 0.7 } };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

// ====================================================================
// 12. FINAL RESULTS & AUTO-SAVE TO POSTGRESQL
// ====================================================================
async function finishQuiz() {
  showScreen('results');
  playVictoryFanfare();
  fireBigVictoryConfetti();

  const totalQuestions = state.exercises.length;
  const accuracy = Math.round((state.correctCount / totalQuestions) * 100);

  DOM.finalEarnedScore.textContent = `+${state.quizScore} XP`;
  if (DOM.finalScoreStar) {
    DOM.finalScoreStar.textContent = `${state.correctCount} / ${totalQuestions}`;
  }
  if (DOM.finalAccuracy) {
    DOM.finalAccuracy.textContent = `${accuracy}%`;
  }
  if (DOM.finalCorrectCount) {
    DOM.finalCorrectCount.textContent = `${state.correctCount}/${totalQuestions}`;
  }
  if (DOM.finalMaxStreak) {
    DOM.finalMaxStreak.textContent = `${state.maxStreak} 🔥`;
  }

  // Select performance tier and giant meme sticker or video
  let finalMedia = '';
  if (accuracy >= 80) {
    DOM.finalTitle.textContent = 'Great Job! 👑';
    DOM.finalSubtitle.textContent = 'You mastered this English challenge with flying colors!';
    finalMedia = state.stickers.correct[0] || '';
  } else if (accuracy >= 50) {
    DOM.finalTitle.textContent = 'Well Done! 🎯';
    DOM.finalSubtitle.textContent = 'Solid run! A few more rounds and your English will be unstoppable.';
    finalMedia = state.stickers.close[0] || '';
  } else {
    DOM.finalTitle.textContent = 'Keep Practicing! 💪';
    DOM.finalSubtitle.textContent = 'You survived the battlefield! Dust yourself off and try again!';
    finalMedia = state.stickers.wrong[0] || '';
  }
  setMediaDisplay(DOM.finalStickerImg, DOM.finalStickerVideo, finalMedia);

  // Auto-save score in PostgreSQL and mark theme completed
  if (state.currentTheme && state.currentTheme.id) {
    markThemeCompleted(state.currentTheme.id);
  }
  const saved = await saveScoreToBackend(state.currentTheme.id, state.quizScore);
  if (DOM.finalDbSaveBanner) {
    if (saved) {
      DOM.finalDbSaveBanner.innerHTML = `
        <i class="fa-solid fa-cloud-arrow-up text-emerald-600"></i>
        <span>Score saved to PostgreSQL table <span class="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-xs">scores</span>!</span>
      `;
      DOM.finalDbSaveBanner.className = 'mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-center gap-2';
    } else {
      DOM.finalDbSaveBanner.innerHTML = `
        <i class="fa-solid fa-hard-drive text-amber-600"></i>
        <span>Saved to local profile (${state.currentUser ? state.currentUser.total_score : state.quizScore} total pts).</span>
      `;
      DOM.finalDbSaveBanner.className = 'mb-6 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-bold text-amber-800 flex items-center justify-center gap-2';
    }
  }
}

// Results Action Buttons
DOM.btnReplayQuiz.addEventListener('click', () => {
  playClickSound();
  if (state.currentTheme) {
    startQuizForTheme(state.currentTheme);
  } else {
    showScreen('dashboard');
  }
});

DOM.btnChooseOtherThemes.addEventListener('click', () => {
  playClickSound();
  showScreen('dashboard');
});

DOM.btnBackToDashboard.addEventListener('click', () => {
  playClickSound();
  showScreen('dashboard');
});

DOM.btnGoHome.addEventListener('click', () => {
  playClickSound();
  if (state.currentUser) {
    showScreen('dashboard');
  } else {
    showScreen('auth');
  }
});

// ====================================================================
// 13. LEADERBOARD MODAL (Classement)
// ====================================================================
function updateNavTabs(active) {
  const tabDash = document.getElementById('navTabDashboard');
  const tabLess = document.getElementById('navTabLessons');
  const tabLead = document.getElementById('navTabLeaderboard');

  const activeClass = 'bg-white text-indigo-600 font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-xl shadow-xs transition-all cursor-pointer';
  const inactiveClass = 'text-slate-500 hover:text-slate-900 font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-xl hover:bg-white/50 transition-all cursor-pointer';

  if (tabDash) tabDash.className = active === 'dashboard' ? activeClass : inactiveClass;
  if (tabLess) tabLess.className = active === 'lessons' ? activeClass : inactiveClass;
  if (tabLead) tabLead.className = active === 'leaderboard' ? activeClass : inactiveClass;
}

function openLeaderboardModal() {
  playClickSound();
  updateNavTabs('leaderboard');
  loadAndDisplayLeaderboard();
  const modal = DOM.leaderboardModal || document.getElementById('leaderboardModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function closeLeaderboardModal() {
  playClickSound();
  updateNavTabs('dashboard');
  const modal = DOM.leaderboardModal || document.getElementById('leaderboardModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Bind leaderboard triggers
if (DOM.btnOpenLeaderboard) {
  DOM.btnOpenLeaderboard.addEventListener('click', openLeaderboardModal);
}
if (DOM.btnCloseLeaderboard) {
  DOM.btnCloseLeaderboard.addEventListener('click', closeLeaderboardModal);
}
if (DOM.btnRefreshLeaderboard) {
  DOM.btnRefreshLeaderboard.addEventListener('click', () => {
    playClickSound();
    const icon = DOM.btnRefreshLeaderboard.querySelector('i');
    if (icon) icon.classList.add('fa-spin');
    loadAndDisplayLeaderboard().finally(() => {
      setTimeout(() => {
        if (icon) icon.classList.remove('fa-spin');
      }, 500);
    });
  });
}

// Close modal when clicking outside the card
const lbModalEl = DOM.leaderboardModal || document.getElementById('leaderboardModal');
if (lbModalEl) {
  lbModalEl.addEventListener('click', (e) => {
    if (e.target === lbModalEl) {
      closeLeaderboardModal();
    }
  });
}

// Wire header profile pill and score pill
const profilePill = document.getElementById('userProfilePill');
if (profilePill) {
  profilePill.addEventListener('click', () => {
    playClickSound();
    if (DOM.settingsModal) {
      DOM.settingsModal.classList.remove('hidden');
    }
  });
}

const headerScorePill = document.getElementById('headerScorePill');
if (headerScorePill) {
  headerScorePill.addEventListener('click', openLeaderboardModal);
}

function getLeaderboardAvatar(username) {
  const name = username || 'Player';
  const clean = name.replace(/[^a-zA-Z0-9]/g, '');
  const initials = (clean.length >= 2 ? clean.slice(0, 2) : (clean || 'PL')).toUpperCase();

  const colors = [
    { bg: 'bg-indigo-600', text: 'text-white' },
    { bg: 'bg-blue-600', text: 'text-white' },
    { bg: 'bg-emerald-600', text: 'text-white' },
    { bg: 'bg-slate-700', text: 'text-white' },
    { bg: 'bg-purple-600', text: 'text-white' },
    { bg: 'bg-teal-600', text: 'text-white' },
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return { initials, ...colors[hash % colors.length] };
}

function renderLeaderboardItem(entry, idx) {
  const isCurrent = state.currentUser && (
    state.currentUser.username === entry.username || 
    state.currentUser.id === entry.id
  );
  const avatar = getLeaderboardAvatar(entry.username);
  const score = (entry.total_score || 0).toLocaleString();

  // Clean numeric rank badge (no emojis)
  let rankHtml = '';
  if (idx === 0) {
    rankHtml = `
      <div class="w-7 h-7 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-2xs flex-shrink-0" title="1ère place">
        1
      </div>
    `;
  } else if (idx === 1) {
    rankHtml = `
      <div class="w-7 h-7 rounded-lg bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center shadow-2xs flex-shrink-0" title="2ème place">
        2
      </div>
    `;
  } else if (idx === 2) {
    rankHtml = `
      <div class="w-7 h-7 rounded-lg bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-2xs flex-shrink-0" title="3ème place">
        3
      </div>
    `;
  } else {
    rankHtml = `
      <div class="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center flex-shrink-0">
        ${idx + 1}
      </div>
    `;
  }

  // Row container styling (clean enterprise look)
  let containerClasses = 'p-3 rounded-2xl border transition-all duration-150 flex items-center gap-3 ';
  if (isCurrent) {
    containerClasses += 'bg-indigo-50/80 border-indigo-200/90 shadow-2xs';
  } else if (idx === 0) {
    containerClasses += 'bg-amber-50/40 border-amber-200/80 shadow-2xs';
  } else {
    containerClasses += 'bg-white hover:bg-slate-50/80 border-slate-200/80 shadow-2xs';
  }

  const item = document.createElement('div');
  item.className = containerClasses;

  item.innerHTML = `
    <!-- Rank Badge -->
    ${rankHtml}

    <!-- Avatar with Initials -->
    <div class="w-9 h-9 rounded-xl ${avatar.bg} text-white font-black text-xs flex items-center justify-center shadow-2xs flex-shrink-0 select-none">
      ${avatar.initials}
    </div>

    <!-- Player Details -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-0.5">
        <span class="font-bold text-sm text-slate-900 truncate tracking-tight">
          ${entry.username}
        </span>
        ${isCurrent ? `
          <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-indigo-600 text-white tracking-wide">
            VOUS
          </span>
        ` : ''}
        ${idx === 0 ? `
          <span class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200/70 hidden sm:inline">
            PREMIER
          </span>
        ` : ''}
      </div>
      <p class="text-[11px] font-medium text-slate-400 truncate">
        Niveau A2 • Actif cette semaine
      </p>
    </div>

    <!-- XP Badge (Clean typography with vector bolt) -->
    <div class="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 font-mono font-black text-xs flex items-center gap-1.5 shadow-2xs flex-shrink-0">
      <i class="fa-solid fa-bolt text-amber-500 text-[10px]"></i>
      <span>${score} XP</span>
    </div>
  `;

  return item;
}

async function loadAndDisplayLeaderboard() {
  const listEl = DOM.leaderboardList || document.getElementById('leaderboardList');
  if (!listEl) return;

  listEl.innerHTML = `
    <div class="text-center py-8 text-xs text-slate-400 animate-pulse">
      <i class="fa-solid fa-spinner fa-spin mr-1.5 text-indigo-500"></i> Chargement des scores en direct...
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/api/leaderboard`);
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        listEl.innerHTML = '';
        list.forEach((entry, idx) => {
          listEl.appendChild(renderLeaderboardItem(entry, idx));
        });
        return;
      }
    }
  } catch (err) {
    console.warn('Leaderboard fetch note:', err.message);
  }

  // Fallback demo rankings
  const currentName = state.currentUser ? (state.currentUser.username || 'MemeMaster') : 'MemeMaster';
  const currentScore = state.currentUser ? (state.currentUser.total_score || 4950) : 4950;

  const fallbackList = [
    { username: currentName, total_score: currentScore },
    { username: 'QuizWizard', total_score: 1800 },
    { username: 'EnglishNinja', total_score: 950 },
    { username: 'Sarah_Polyglot', total_score: 520 },
    { username: 'demo', total_score: 100 }
  ];

  listEl.innerHTML = '';
  fallbackList.forEach((entry, idx) => {
    listEl.appendChild(renderLeaderboardItem(entry, idx));
  });
}

// Sound FX toggle
DOM.btnSoundToggle.addEventListener('click', () => {
  state.soundEnabled = !state.soundEnabled;
  if (state.soundEnabled) {
    DOM.soundIcon.className = 'fa-solid fa-volume-high text-blue-600';
    playClickSound();
  } else {
    DOM.soundIcon.className = 'fa-solid fa-volume-xmark text-slate-400';
  }
});

// ====================================================================
// 14. QUICK ACCESS BAR: LESSONS, QUIZZES, SPEAKING, VOCABULARY
// ====================================================================

// Speaking Practice Data
const SPEAKING_PHRASES = [
  { phrase: "Break a leg! You'll do fantastic tonight.", category: "Everyday Idiom", meaning: "Used to wish someone good luck before a speech or performance." },
  { phrase: "Could you please tell me how to get to the station?", category: "Travel & Directions", meaning: "Polite request for directions in English." },
  { phrase: "I look forward to meeting you next Monday.", category: "Professional English", meaning: "Standard closing phrase expressing positive anticipation." },
  { phrase: "It is raining cats and dogs outside right now!", category: "Weather Idiom", meaning: "Raining very heavily or pouring with rain." },
  { phrase: "Actually, I have been studying English for three years.", category: "Tenses & Pronunciation", meaning: "Present perfect continuous with duration (for 3 years)." },
  { phrase: "Actions speak louder than words in business.", category: "Life Wisdom & Proverbs", meaning: "What you do is more significant than what you say." },
  { phrase: "Once in a blue moon, I treat myself to a luxury dinner.", category: "Frequency Idiom", meaning: "Something that happens very rarely." }
];

// Vocabulary Flashcards Data
const VOCABULARY_CARDS = [
  { word: "Sensible", phonetic: "/ˈsen.sə.bəl/ • adjective", level: "B1 Intermediate", definition: "Having or showing good sense or practical judgment (not foolish).", example: "It would be sensible to take an umbrella—look at those clouds!" },
  { word: "Actually", phonetic: "/ˈæk.tʃu.ə.li/ • adverb", level: "A2 Elementary", definition: "In fact or in reality; used to correct or clarify information.", example: "I thought he was British, but actually he comes from Australia." },
  { word: "Unprecedented", phonetic: "/ʌnˈpres.ɪ.den.tɪd/ • adjective", level: "B2 Upper-Int", definition: "Never having happened or existed before.", example: "The team achieved unprecedented success in this year's championship." },
  { word: "Serendipity", phonetic: "/ˌser.ənˈdɪp.ə.ti/ • noun", level: "C1 Advanced", definition: "The occurrence of events by chance in a happy or beneficial way.", example: "Finding my dream job while traveling was pure serendipity." },
  { word: "Resilient", phonetic: "/rɪˈzɪl.jənt/ • adjective", level: "B2 Upper-Int", definition: "Able to recover quickly from difficult conditions or setbacks.", example: "Language learners are resilient; they turn mistakes into lessons." },
  { word: "Gorgeous", phonetic: "/ˈɡɔː.dʒəs/ • adjective", level: "A1 Beginner", definition: "Extremely beautiful or pleasant.", example: "The weather in London today is absolutely gorgeous!" },
  { word: "Eloquent", phonetic: "/ˈel.ə.kwənt/ • adjective", level: "C1 Advanced", definition: "Fluent, persuasive, and expressive in speech or writing.", example: "Her eloquent presentation persuaded the entire committee." }
];

let currentSpeakingIdx = 0;
let currentVocabIdx = 0;

function speakText(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
}

function updateSpeakingUI() {
  const item = SPEAKING_PHRASES[currentSpeakingIdx];
  const catEl = document.getElementById('speakingCategory');
  const phraseEl = document.getElementById('speakingPhraseText');
  const meanEl = document.getElementById('speakingMeaningText');
  if (catEl) catEl.textContent = item.category;
  if (phraseEl) phraseEl.textContent = `"${item.phrase}"`;
  if (meanEl) meanEl.textContent = `Meaning: ${item.meaning}`;
}

function updateVocabUI() {
  const item = VOCABULARY_CARDS[currentVocabIdx];
  const wordEl = document.getElementById('vocabWord');
  const phonEl = document.getElementById('vocabPhonetic');
  const defEl = document.getElementById('vocabDefinition');
  const badgeEl = document.getElementById('vocabLevelBadge');
  const counterEl = document.getElementById('vocabCardCounter');
  if (wordEl) wordEl.textContent = item.word;
  if (phonEl) phonEl.textContent = item.phonetic;
  if (defEl) defEl.textContent = item.definition;
  if (badgeEl) badgeEl.textContent = item.level;
  if (counterEl) counterEl.textContent = `Card ${currentVocabIdx + 1} of ${VOCABULARY_CARDS.length}`;
}

function setupQuickAccessBar() {
  const btnLessons = document.getElementById('btnQuickLessons');
  const btnQuizzes = document.getElementById('btnQuickQuizzes');
  const btnSpeaking = document.getElementById('btnQuickSpeaking');
  const btnVocab = document.getElementById('btnQuickVocabulary');
  const btnSeeAll = document.getElementById('btnSeeAllLessons');

  const speakingModal = document.getElementById('speakingModal');
  const vocabModal = document.getElementById('vocabModal');

  // Resume Journey Button from Hero Banner
  const btnResumeJourney = document.getElementById('btnResumeJourney');
  if (btnResumeJourney) {
    btnResumeJourney.addEventListener('click', () => {
      playClickSound();
      if (state.themes && state.themes.length > 0) {
        startQuizForTheme(state.themes[0]);
      }
    });
  }

  // Language Switcher Toggle (FR <-> EN)
  const btnLangToggle = document.getElementById('btnLangToggle');
  if (btnLangToggle) {
    btnLangToggle.addEventListener('click', () => {
      playClickSound();
      const current = localStorage.getItem('app_lang') || 'fr';
      const nextLang = current === 'fr' ? 'en' : 'fr';
      if (typeof setLanguage === 'function') {
        setLanguage(nextLang);
      }
      renderDashboard();
    });
  }

  // See All Activities
  const btnSeeAllActivities = document.getElementById('btnSeeAllActivities');
  if (btnSeeAllActivities) {
    btnSeeAllActivities.addEventListener('click', () => {
      playClickSound();
      setLevelFilter('ALL');
      const el = document.getElementById('themesGrid');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Learn Next Words Button (from Daily Goal widget)
  const btnLearnNextWords = document.getElementById('btnLearnNextWords');
  if (btnLearnNextWords) {
    btnLearnNextWords.addEventListener('click', () => {
      playClickSound();
      updateVocabUI();
      if (vocabModal) vocabModal.classList.remove('hidden');
    });
  }

  // Navigation Tabs in Header
  const navTabDashboard = document.getElementById('navTabDashboard');
  const navTabLessons = document.getElementById('navTabLessons');
  const navTabLeaderboard = document.getElementById('navTabLeaderboard');

  if (navTabDashboard) {
    navTabDashboard.addEventListener('click', () => {
      playClickSound();
      showScreen('dashboard');
      updateNavTabs('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  if (navTabLessons) {
    navTabLessons.addEventListener('click', () => {
      playClickSound();
      showScreen('dashboard');
      updateNavTabs('lessons');
      const el = document.getElementById('themesGrid');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }
  if (navTabLeaderboard) {
    navTabLeaderboard.addEventListener('click', () => {
      openLeaderboardModal();
    });
  }

  if (btnLessons) {
    btnLessons.addEventListener('click', () => {
      playClickSound();
      if (state.themes && state.themes.length > 0) {
        openLessonModal(state.themes[0]);
      }
    });
  }

  if (btnSeeAll) {
    btnSeeAll.addEventListener('click', () => {
      playClickSound();
      const el = document.getElementById('themesGrid');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const btnSeeAllThemes = document.getElementById('btnSeeAllThemes');
  if (btnSeeAllThemes) {
    btnSeeAllThemes.addEventListener('click', () => {
      playClickSound();
      setLevelFilter('ALL');
    });
  }

  if (btnQuizzes) {
    btnQuizzes.addEventListener('click', () => {
      playClickSound();
      if (state.themes && state.themes.length > 0) {
        const randomTheme = state.themes[Math.floor(Math.random() * state.themes.length)];
        startQuizForTheme(randomTheme);
      }
    });
  }

  if (btnSpeaking) {
    btnSpeaking.addEventListener('click', () => {
      playClickSound();
      updateSpeakingUI();
      if (speakingModal) speakingModal.classList.remove('hidden');
    });
  }

  const btnCloseSpeaking = document.getElementById('btnCloseSpeaking');
  if (btnCloseSpeaking) {
    btnCloseSpeaking.addEventListener('click', () => {
      playClickSound();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (speakingModal) speakingModal.classList.add('hidden');
    });
  }

  const btnPlaySpeech = document.getElementById('btnPlaySpeech');
  if (btnPlaySpeech) {
    btnPlaySpeech.addEventListener('click', () => {
      playClickSound();
      speakText(SPEAKING_PHRASES[currentSpeakingIdx].phrase);
    });
  }

  const btnNextSpeaking = document.getElementById('btnNextSpeaking');
  if (btnNextSpeaking) {
    btnNextSpeaking.addEventListener('click', () => {
      playClickSound();
      currentSpeakingIdx = (currentSpeakingIdx + 1) % SPEAKING_PHRASES.length;
      updateSpeakingUI();
      speakText(SPEAKING_PHRASES[currentSpeakingIdx].phrase);
    });
  }

  const btnPrevSpeaking = document.getElementById('btnPrevSpeaking');
  if (btnPrevSpeaking) {
    btnPrevSpeaking.addEventListener('click', () => {
      playClickSound();
      currentSpeakingIdx = (currentSpeakingIdx - 1 + SPEAKING_PHRASES.length) % SPEAKING_PHRASES.length;
      updateSpeakingUI();
      speakText(SPEAKING_PHRASES[currentSpeakingIdx].phrase);
    });
  }

  // Vocab Modal Handlers
  if (btnVocab) {
    btnVocab.addEventListener('click', () => {
      playClickSound();
      updateVocabUI();
      if (vocabModal) vocabModal.classList.remove('hidden');
    });
  }

  const btnTodayGoal = document.getElementById('btnTodayGoalCard');
  if (btnTodayGoal) {
    btnTodayGoal.addEventListener('click', () => {
      playClickSound();
      updateVocabUI();
      if (vocabModal) vocabModal.classList.remove('hidden');
    });
  }

  const btnCloseVocab = document.getElementById('btnCloseVocab');
  if (btnCloseVocab) {
    btnCloseVocab.addEventListener('click', () => {
      playClickSound();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (vocabModal) vocabModal.classList.add('hidden');
    });
  }

  const btnPlayVocab = document.getElementById('btnPlayVocabWord');
  if (btnPlayVocab) {
    btnPlayVocab.addEventListener('click', () => {
      playClickSound();
      speakText(VOCABULARY_CARDS[currentVocabIdx].word);
    });
  }

  const btnNextVocab = document.getElementById('btnNextVocab');
  if (btnNextVocab) {
    btnNextVocab.addEventListener('click', () => {
      playClickSound();
      currentVocabIdx = (currentVocabIdx + 1) % VOCABULARY_CARDS.length;
      updateVocabUI();
      speakText(VOCABULARY_CARDS[currentVocabIdx].word);
    });
  }

  const btnPrevVocab = document.getElementById('btnPrevVocab');
  if (btnPrevVocab) {
    btnPrevVocab.addEventListener('click', () => {
      playClickSound();
      currentVocabIdx = (currentVocabIdx - 1 + VOCABULARY_CARDS.length) % VOCABULARY_CARDS.length;
      updateVocabUI();
      speakText(VOCABULARY_CARDS[currentVocabIdx].word);
    });
  }
}

// ====================================================================
// NOTIFICATIONS SYSTEM
// ====================================================================
function setupNotifications() {
  const btnBell = document.getElementById('btnNotificationBell');
  const dropdown = document.getElementById('notifDropdown');
  const badge = document.getElementById('notifBadge');
  const btnMarkAll = document.getElementById('btnMarkAllNotifs');
  const countBadge = document.getElementById('notifCountBadge');
  const notifItems = document.querySelectorAll('.notif-item');

  if (!btnBell || !dropdown) return;

  // Toggle notification dropdown
  btnBell.addEventListener('click', (e) => {
    e.stopPropagation();
    playClickSound();
    dropdown.classList.toggle('hidden');
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!dropdown.classList.contains('hidden') && !dropdown.contains(e.target) && !btnBell.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });

  // Mark all as read
  if (btnMarkAll) {
    btnMarkAll.addEventListener('click', (e) => {
      e.stopPropagation();
      playClickSound();
      if (badge) badge.classList.add('hidden');
      if (countBadge) {
        countBadge.textContent = '0 New';
        countBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200';
      }
      notifItems.forEach(item => {
        item.classList.remove('bg-blue-50/50', 'border-blue-100/80');
        item.classList.add('bg-slate-50', 'border-slate-200/80');
      });
    });
  }

  // Clicking an item marks it read and can open corresponding view
  notifItems.forEach(item => {
    item.addEventListener('click', () => {
      playClickSound();
      item.classList.remove('bg-blue-50/50', 'border-blue-100/80');
      item.classList.add('bg-slate-50', 'border-slate-200/80');
      
      const id = item.getAttribute('data-id');
      if (id === '3') {
        dropdown.classList.add('hidden');
        const speakingModal = document.getElementById('speakingModal');
        if (speakingModal) speakingModal.classList.remove('hidden');
      } else if (id === '2') {
        dropdown.classList.add('hidden');
        if (DOM.btnOpenLeaderboard) DOM.btnOpenLeaderboard.click();
      }
    });
  });
}

// ====================================================================
// 15. INITIALIZATION
// ====================================================================
async function initApp() {
  // The app is private: authentication is handled exclusively by login.html
  const storedUser = localStorage.getItem('baamboozle_user');
  if (!storedUser) {
    redirectToLogin();
    return;
  }
  try {
    state.currentUser = JSON.parse(storedUser);
    if (!state.currentUser) throw new Error('Empty session');
  } catch (e) {
    localStorage.removeItem('baamboozle_user');
    redirectToLogin();
    return;
  }

  setupQuickAccessBar();
  setupNotifications();
  setupSettingsModal();

  // Apply saved or default language
  if (typeof setLanguage === 'function') {
    setLanguage(localStorage.getItem('app_lang') || 'fr');
  }

  // Logout always returns to the dedicated login page
  if (DOM.btnLogout) {
    DOM.btnLogout.addEventListener('click', () => {
      playClickSound();
      state.currentUser = null;
      localStorage.removeItem('baamboozle_user');
      redirectToLogin();
    });
  }

  // Bind CEFR Level + Misc category selector tabs
  const levelBtns = document.querySelectorAll('.level-tab-btn');
  levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      setLevelFilter(btn.getAttribute('data-level'));
    });
  });

  // Top bar now follows the signed-in account
  updateHeaderUser();

  // Check Database and scan stickers
  await Promise.all([
    checkDatabaseHealth(),
    fetchStickersList(),
    loadThemes()
  ]);

  showScreen('dashboard');
}

// Start once the DOM is ready. loader.js injects the partials before loading
// this file, so document.readyState is usually already "complete" here.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}