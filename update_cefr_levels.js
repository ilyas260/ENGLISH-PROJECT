const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

async function updateSchemaAndData() {
  console.log('🚀 Updating database with CEFR Levels (A1, A2, B1, B2, C1)...');

  // 1. Add level column to themes if not exists
  await pool.query(`
    ALTER TABLE themes ADD COLUMN IF NOT EXISTS level VARCHAR(10) DEFAULT 'A1';
  `);

  // 2. Update existing themes with their accurate CEFR levels
  await pool.query(`UPDATE themes SET level = 'B1' WHERE id = 1`); // English Tenses
  await pool.query(`UPDATE themes SET level = 'B2' WHERE id = 2`); // Grammar, Modals & Conditionals
  await pool.query(`UPDATE themes SET level = 'A2' WHERE id = 3`); // Irregular Verbs Bootcamp
  // MISC is not a CEFR level: playful/silly themes live in their own category.
  await pool.query(`UPDATE themes SET level = 'MISC' WHERE id = 4`); // Cats & Dogs Animal Idioms (silly memes)
  await pool.query(`UPDATE themes SET level = 'MISC' WHERE id = 5`); // Internet Slang & Gen-Z (Sabiri & Jamal Alpha)
  await pool.query(`UPDATE themes SET level = 'B2' WHERE id = 6`); // Tricky Idioms & False Friends
  await pool.query(`UPDATE themes SET level = 'A1' WHERE id = 7`); // Everyday English & Street Banter
  await pool.query(`UPDATE themes SET level = 'MISC' WHERE id = 8`); // Cinema, Netflix & Pop Culture Quotes

  // 3. Insert new themes for A1, B2, and C1 to ensure every level has comprehensive lessons!

  // Theme 9: A1 - Beginner Basics: To Be, Have Got & Daily Routine
  await pool.query(`
    INSERT INTO themes (id, title, description, color_theme, icon, level, lesson_title, lesson_content)
    VALUES (
      9,
      'A1 Starter: Verb To Be, Have Got & Daily Routine',
      'The essential foundation: master I am, You are, He has, asking simple questions, numbers and everyday objects.',
      'emerald',
      'fa-seedling',
      'A1',
      'Lesson A1: The Building Blocks of English',
      '<h3>🌱 1. The Verb "TO BE" (Être)</h3>
<p>• Positive: <b>I am</b> (I''m), <b>You are</b> (You''re), <b>He / She / It is</b> (He''s), <b>We are</b>, <b>They are</b>.</p>
<p>• Negative: Add <b>NOT</b>: <i>"I am not tired."</i> / <i>"He is not (isn''t) ready."</i></p>
<p>• Question: Invert Subject and Verb: <i>"Are you ready?"</i> / <i>"Is he your brother?"</i></p>
<hr class="my-3 border-black">
<h3>👜 2. Possession: "HAVE GOT" (Avoir)</h3>
<p>• <b>I / You / We / They have got</b> (<i>"I''ve got two brothers."</i>)</p>
<p>• <b>He / She / It has got</b> (<i>"She has got a cat."</i>)</p>
<p>• Negative: <i>"I haven''t got a car."</i> / <i>"He hasn''t got any cash."</i></p>
<hr class="my-3 border-black">
<h3>📅 3. Days of the Week & Daily Objects</h3>
<p>• Always use <b>ON</b> for days: <i>"On Monday, on Friday."</i></p>
<p>• Always use <b>AT</b> for time: <i>"At 8:00 AM."</i></p>
<p>• Indefinite article: <b>A</b> before consonants (<i>a book, a dog</i>), <b>AN</b> before vowels (<i>an apple, an hour</i>).</p>'
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      color_theme = EXCLUDED.color_theme,
      icon = EXCLUDED.icon,
      level = EXCLUDED.level,
      lesson_title = EXCLUDED.lesson_title,
      lesson_content = EXCLUDED.lesson_content;
  `);

  // Theme 10: B2 - Professional & Business English
  await pool.query(`
    INSERT INTO themes (id, title, description, color_theme, icon, level, lesson_title, lesson_content)
    VALUES (
      10,
      'B2 Business English, Emails & Professional Pitch',
      'Sound like an executive: polite email phrases, negotiating deadlines, job interview answers, and business idioms.',
      'indigo',
      'fa-briefcase',
      'B2',
      'Lesson B2: Professional & Corporate Communication',
      '<h3>✉️ 1. Professional Email Etiquette</h3>
<p>• Opening: <i>"Dear Mr. Smith,"</i> / <i>"I hope this email finds you well."</i> (Avoid: "Hey man").</p>
<p>• Enclosing files: <b>"Please find attached the latest report."</b></p>
<p>• Polite sign-off: <i>"Kind regards,"</i> / <i>"Best regards,"</i> / <i>"Sincerely,"</i>.</p>
<hr class="my-3 border-black">
<h3>💼 2. Key Corporate Vocabulary & Idioms</h3>
<p>• <b>"Touch base"</b> = Briefly connect or talk to someone for an update.</p>
<p>• <b>"Circle back"</b> = Return to a discussion topic later.</p>
<p>• <b>"Think outside the box"</b> = Think creatively and unconventionally.</p>
<p>• <b>"Ballpark figure"</b> = A rough, approximate estimate of a cost or number.</p>
<hr class="my-3 border-black">
<h3>🤝 3. Polite Disagreements in Meetings</h3>
<p>• <i>"With all due respect, I see it differently."</i></p>
<p>• <i>"Could you elaborate on that point?"</i></p>'
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      color_theme = EXCLUDED.color_theme,
      icon = EXCLUDED.icon,
      level = EXCLUDED.level,
      lesson_title = EXCLUDED.lesson_title,
      lesson_content = EXCLUDED.lesson_content;
  `);

  // Theme 11: C1 - Advanced Inversion, Nuances & Rhetoric
  await pool.query(`
    INSERT INTO themes (id, title, description, color_theme, icon, level, lesson_title, lesson_content)
    VALUES (
      11,
      'C1 Mastery: Inversion, Cleft Sentences & Nuances',
      'Reach native bilingual sophistication: negative inversion (Seldom have I), subtle nuances, and high-level vocabulary.',
      'purple',
      'fa-crown',
      'C1',
      'Lesson C1: Advanced Inversion & Master Stylistics',
      '<h3>👑 1. Negative Inversion for Dramatic Emphasis</h3>
<p>When starting a sentence with a negative or restrictive adverb, invert the auxiliary and the subject (like a question):</p>
<p>• <b>Seldom / Rarely:</b> <i>"Seldom have I witnessed such brilliance."</i> (Instead of: "I have seldom witnessed...")</p>
<p>• <b>Hardly / Scarcely ... when:</b> <i>"Hardly had we arrived when the storm began."</i></p>
<p>• <b>Not only ... but also:</b> <i>"Not only did she pass the exam, but she also scored the highest mark."</i></p>
<p>• <b>Under no circumstances:</b> <i>"Under no circumstances should you press this red button."</i></p>
<hr class="my-3 border-black">
<h3>✨ 2. Cleft Sentences for Laser Focus</h3>
<p>• <i>"What surprised me most was his complete honesty."</i></p>
<p>• <i>"It was John who solved the riddle, not Sarah."</i></p>
<hr class="my-3 border-black">
<h3>🎯 3. Advanced Nuances</h3>
<p>• <b>"Notwithstanding"</b> = Despite / In spite of (<i>"Notwithstanding the rain, the festival went ahead."</i>)</p>
<p>• <b>"Albeit"</b> = Although (<i>"He accepted the offer, albeit with some hesitation."</i>)</p>'
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      color_theme = EXCLUDED.color_theme,
      icon = EXCLUDED.icon,
      level = EXCLUDED.level,
      lesson_title = EXCLUDED.lesson_title,
      lesson_content = EXCLUDED.lesson_content;
  `);

  // Theme 12: C1 - Sophisticated Idioms & Formal Rhetoric
  await pool.query(`
    INSERT INTO themes (id, title, description, color_theme, icon, level, lesson_title, lesson_content)
    VALUES (
      12,
      'C1 Sophisticated Idioms & Literary English',
      'Flawless command of rare idioms, Oxford expressions, and rhetoric to impress any native English speaker.',
      'amber',
      'fa-feather-pointed',
      'C1',
      'Lesson C1: Sophisticated English Idioms',
      '<h3>🏛️ Elite English Expressions</h3>
<p>• <b>"Play devil''s advocate"</b> = Argue against an idea just to test the strength of the argument.</p>
<p>• <b>"Burn the candle at both ends"</b> = Overwork yourself from early morning until late night.</p>
<p>• <b>"Through the grapevine"</b> = Hearing news via informal rumors and gossip.</p>
<p>• <b>"Face the music"</b> = Accept the unpleasant consequences of one''s actions.</p>
<p>• <b>"A double-edged sword"</b> = Something having both favorable and unfavorable consequences.</p>'
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      color_theme = EXCLUDED.color_theme,
      icon = EXCLUDED.icon,
      level = EXCLUDED.level,
      lesson_title = EXCLUDED.lesson_title,
      lesson_content = EXCLUDED.lesson_content;
  `);

  // Ensure sequence continues
  await pool.query("SELECT setval('themes_id_seq', (SELECT MAX(id) FROM themes))");

  // 4. Delete existing questions for 9, 10, 11, 12 to avoid duplicates
  await pool.query('DELETE FROM exercises WHERE theme_id IN (9, 10, 11, 12)');

  // 5. Insert new exercises for themes 9, 10, 11, 12
  const newExercises = [
    // THEME 9: A1 Starter (15 Questions)
    { t: 9, type: 'multiple_choice', q: 'Choose the correct form of to be: "Sarah _______ a doctor at the hospital."', opts: ['am', 'is', 'are', 'be'], a: 'is', c: ['is'] },
    { t: 9, type: 'fill_blank', q: 'Complete with a or an: "I eat _______ apple every morning."', opts: [], a: 'an', c: ['an'] },
    { t: 9, type: 'true_false', q: 'The pronoun "they" is used for plural people and objects.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
    { t: 9, type: 'multiple_choice', q: 'Choose the correct preposition: "I always play football _______ Sundays."', opts: ['in', 'at', 'on', 'to'], a: 'on', c: ['on'] },
    { t: 9, type: 'fill_blank', q: 'Complete with have or has: "He _______ got two dogs."', opts: [], a: 'has', c: ['haz'] },
    { t: 9, type: 'multiple_choice', q: 'What is the opposite of "COLD"?', opts: ['Fast', 'Hot', 'Big', 'Old'], a: 'Hot', c: ['hot'] },
    { t: 9, type: 'fill_blank', q: 'Question form: "_______ is your name?" (What or Where)', opts: [], a: 'What', c: ['what'] },
    { t: 9, type: 'true_false', q: 'In English, the days of the week (Monday, Tuesday, etc.) always start with a capital letter.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
    { t: 9, type: 'multiple_choice', q: 'Choose the plural of "cat":', opts: ['Cats', 'Cates', 'Catz', 'Caten'], a: 'Cats', c: ['cats'] },
    { t: 9, type: 'fill_blank', q: 'Complete: "She _______ not like waking up early." (does or do)', opts: [], a: 'does', c: ['dose'] },
    { t: 9, type: 'multiple_choice', q: 'How do you reply politely to "Thank you very much"?', opts: ["You're welcome!", "I don't care", "Give me more", "Never mind"], a: "You're welcome!", c: ['you are welcome', 'youre welcome'] },
    { t: 9, type: 'fill_blank', q: 'Time preposition: "The meeting starts _______ 9:00 AM." (at, on, in)', opts: [], a: 'at', c: ['at'] },
    { t: 9, type: 'true_false', q: '"I am have a car" is grammatically correct in English.', opts: ['True', 'False'], a: 'False', c: ['f', 'no'] },
    { t: 9, type: 'multiple_choice', q: 'What number comes after twelve (12)?', opts: ['Eleven', 'Thirteen', 'Twenty', 'Fourteen'], a: 'Thirteen', c: ['thirteen', '13'] },
    { t: 9, type: 'fill_blank', q: 'Complete: "We _______ students at this academy." (are, is, am)', opts: [], a: 'are', c: ['are'] },

    // THEME 10: B2 Business English (15 Questions)
    { t: 10, type: 'multiple_choice', q: 'In an email, how do you formally refer to attached documents?', opts: ['Look at this file', 'Please find attached the requested report', 'I put files below', 'See my paper'], a: 'Please find attached the requested report', c: ['please find attached'] },
    { t: 10, type: 'fill_blank', q: 'Business idiom: "Let\'s _______ base next Monday to review the budget." (touch or kick)', opts: [], a: 'touch', c: ['tuch'] },
    { t: 10, type: 'true_false', q: 'A "ballpark figure" refers to an exact, penny-accurate accounting calculation.', opts: ['True', 'False'], a: 'False', c: ['f', 'no'] },
    { t: 10, type: 'multiple_choice', q: 'What does "THINK OUTSIDE THE BOX" mean in corporate culture?', opts: ['Work in the garden', 'Think creatively and unconventionally', 'Leave the office early', 'Clean your desk'], a: 'Think creatively and unconventionally', c: ['think creatively'] },
    { t: 10, type: 'fill_blank', q: 'Corporate idiom: "Let\'s circle _______ to this issue after lunch." (back or front)', opts: [], a: 'back', c: ['bak'] },
    { t: 10, type: 'multiple_choice', q: 'Choose the most professional sign-off for a formal job application letter:', opts: ['Cheers mate', 'Sincerely yours,', 'XOXO', 'Later!'], a: 'Sincerely yours,', c: ['sincerely', 'best regards'] },
    { t: 10, type: 'fill_blank', q: 'The final date by which a project must be submitted is the "dead_______".', opts: [], a: 'line', c: ['lyne'] },
    { t: 10, type: 'true_false', q: '"To step down" means to resign or leave a leadership position.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
    { t: 10, type: 'multiple_choice', q: 'What is a "WIN-WIN" situation in negotiations?', opts: ['One party wins everything', 'An outcome where both parties benefit mutually', 'Neither party is satisfied', 'The contract is cancelled'], a: 'An outcome where both parties benefit mutually', c: ['both benefit'] },
    { t: 10, type: 'fill_blank', q: 'Corporate acronym: CEO stands for Chief _______ Officer.', opts: [], a: 'Executive', c: ['executive'] },
    { t: 10, type: 'multiple_choice', q: 'If someone asks you for a "BALLPARK ESTIMATE", they want:', opts: ['Tickets to baseball', 'A rough approximation of cost or time', 'A legal contract', 'A written complaint'], a: 'A rough approximation of cost or time', c: ['rough approximation'] },
    { t: 10, type: 'fill_blank', q: 'Complete: "I am writing to express my _______ in the marketing position." (interest or hate)', opts: [], a: 'interest', c: ['intrest'] },
    { t: 10, type: 'true_false', q: '"Blue-collar workers" usually refers to manual or industrial labor, while "white-collar" refers to office/professional roles.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
    { t: 10, type: 'multiple_choice', q: 'What does "TO CUT CORNERS" mean in project management?', opts: ['Trim square paper', 'Do something hastily or poorly to save money or time', 'Hire more workers', 'Double the budget'], a: 'Do something hastily or poorly to save money or time', c: ['save money poorly'] },
    { t: 10, type: 'fill_blank', q: 'To postpone a meeting until a later date: to "put it on the back _______". (burner or stove)', opts: [], a: 'burner', c: ['stove'] },

    // THEME 11: C1 Advanced Inversion & Nuances (15 Questions)
    { t: 11, type: 'multiple_choice', q: 'Negative inversion: "Seldom _______ such an impressive performance!"', opts: ['I have seen', 'have I seen', 'I saw', 'did I saw'], a: 'have I seen', c: ['have i seen'] },
    { t: 11, type: 'fill_blank', q: 'Complete inversion: "Hardly had we arrived _______ the storm broke out." (when or than)', opts: [], a: 'when', c: ['wen'] },
    { t: 11, type: 'true_false', q: 'In negative inversion, the auxiliary verb comes BEFORE the subject (e.g. "Rarely do we encounter...").', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
    { t: 11, type: 'multiple_choice', q: 'Choose the correct C1 formal phrase: "_______ the bad weather, the flight landed on time."', opts: ['Notwithstanding', 'Although', 'Despite of', 'Whereas'], a: 'Notwithstanding', c: ['notwithstanding', 'despite'] },
    { t: 11, type: 'fill_blank', q: 'Complete formal conjunction: "He accepted the promotion, _______ with some hesitation." (meaning: although)', opts: [], a: 'albeit', c: ['allbeit'] },
    { t: 11, type: 'multiple_choice', q: 'Inversion: "Not only _______ late, but he also forgot the key documents!"', opts: ['he arrived', 'did he arrive', 'was he arrived', 'he was'], a: 'did he arrive', c: ['did he arrive'] },
    { t: 11, type: 'fill_blank', q: 'Complete inversion: "Under no circumstances _______ you share this password." (should or you should)', opts: [], a: 'should', c: ['must'] },
    { t: 11, type: 'true_false', q: '"What I appreciate most about him is his unwavering dedication" is an example of a pseudo-cleft sentence.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
    { t: 11, type: 'multiple_choice', q: 'Conditional without IF: "_______ I known the truth, I would have acted differently."', opts: ['Had', 'Have', 'If had', 'Did'], a: 'Had', c: ['had'] },
    { t: 11, type: 'fill_blank', q: 'Complete correlative: "No sooner had he sat down _______ the telephone rang." (than or when)', opts: [], a: 'than', c: ['then'] },
    { t: 11, type: 'multiple_choice', q: 'Which sentence demonstrates flawless C1 formal inversion?', opts: ['Little did she know what lay ahead', 'Little she knew what lay ahead', 'Little did she knew what lay ahead', 'Little had she knew'], a: 'Little did she know what lay ahead', c: ['little did she know'] },
    { t: 11, type: 'fill_blank', q: 'Subjunctive mood: "It is imperative that he _______ present at the hearing." (be or is)', opts: [], a: 'be', c: ['be'] },
    { t: 11, type: 'true_false', q: '"Only by working together can we succeed" requires subject-auxiliary inversion after "only by...".', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
    { t: 11, type: 'multiple_choice', q: 'Choose the word meaning "unavoidable / certain to happen":', opts: ['Inevitable', 'Feasible', 'Ambiguous', 'Superficial'], a: 'Inevitable', c: ['inevitable'] },
    { t: 11, type: 'fill_blank', q: 'Conditional without IF: "_______ you require further assistance, do not hesitate to contact us." (Should or If)', opts: [], a: 'Should', c: ['should'] },

    // THEME 12: C1 Sophisticated Idioms (15 Questions)
    { t: 12, type: 'multiple_choice', q: 'What does it mean to "PLAY DEVIL\'S ADVOCATE"?', opts: ['Worship evil spirits', 'Argue against an idea just to test its validity and logic', 'Betray your friends', 'Refuse to participate in a debate'], a: 'Argue against an idea just to test its validity and logic', c: ['argue against idea'] },
    { t: 12, type: 'fill_blank', q: 'Idiom: "A double-edged _______." (meaning: has both positive and negative consequences)', opts: [], a: 'sword', c: ['sord', 'blade'] },
    { t: 12, type: 'true_false', q: '"To face the music" means to accept unpleasant consequences or criticism for one\'s past actions.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
    { t: 12, type: 'multiple_choice', q: 'If someone is "BURNING THE CANDLE AT BOTH ENDS", they are:', opts: ['Having a romantic dinner', 'Overworking themselves without enough rest', 'Saving electricity', 'Wasting wax'], a: 'Overworking themselves without enough rest', c: ['overworking'] },
    { t: 12, type: 'fill_blank', q: 'Complete idiom: "I heard it through the _______." (meaning: through rumors / gossip)', opts: [], a: 'grapevine', c: ['grape vine'] },
    { t: 12, type: 'multiple_choice', q: 'What is a "PYRRHIC VICTORY"?', opts: ['A victory won by cheating', 'A victory achieved at such devastating cost that it feels like a defeat', 'A football tournament trophy', 'An easy victory'], a: 'A victory achieved at such devastating cost that it feels like a defeat', c: ['victory at devastating cost'] },
    { t: 12, type: 'fill_blank', q: 'To leave no possibility of returning: "To _______ one\'s bridges." (burn or build)', opts: [], a: 'burn', c: ['burnn'] },
    { t: 12, type: 'true_false', q: '"Bite the bullet" originally came from soldiers biting on lead bullets to endure pain during field surgeries.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
    { t: 12, type: 'multiple_choice', q: 'What does "THE LION\'S SHARE" mean?', opts: ['The smallest leftover portion', 'The largest or greatest part of something', 'A meat-only diet', 'A safari souvenir'], a: 'The largest or greatest part of something', c: ['largest part', 'biggest part'] },
    { t: 12, type: 'fill_blank', q: 'Complete: "Take it with a grain of _______." (meaning: do not believe it completely)', opts: [], a: 'salt', c: ['solt'] },
    { t: 12, type: 'multiple_choice', q: 'To "steal someone\'s thunder" means:', opts: ['Make a thunderstorm sound', 'Take credit for someone else\'s idea or outshine them before they speak', 'Rob someone at night', 'Yell loudly'], a: 'Take credit for someone else\'s idea or outshine them before they speak', c: ['take credit'] },
    { t: 12, type: 'fill_blank', q: 'Complete: "The ball is in your _______." (meaning: it is your turn to act or make a decision)', opts: [], a: 'court', c: ['cort'] },
    { t: 12, type: 'true_false', q: '"Spill the beans" originated in ancient Greece where people voted using black and white beans.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
    { t: 12, type: 'multiple_choice', q: 'What does "A BLESSING IN DISGUISE" mean?', opts: ['A magic potion', 'Something that seems bad at first but results in something good', 'A costume party blessing', 'An apology'], a: 'Something that seems bad at first but results in something good', c: ['good thing in disguise'] },
    { t: 12, type: 'fill_blank', q: 'Complete idiom: "Barking up the wrong _______."', opts: [], a: 'tree', c: ['tre'] }
  ];

  for (const ex of newExercises) {
    await pool.query(
      `INSERT INTO exercises (theme_id, question_type, question_text, options_json, correct_answer, close_answers_json)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6::jsonb)`,
      [ex.t, ex.type, ex.q, JSON.stringify(ex.opts), ex.a, JSON.stringify(ex.c)]
    );
  }

  const levelsOverview = await pool.query(`
    SELECT level, COUNT(DISTINCT t.id)::int as themes_count, COUNT(e.id)::int as questions_count
    FROM themes t
    LEFT JOIN exercises e ON e.theme_id = t.id
    GROUP BY level
    ORDER BY level
  `);

  console.log('✅ CEFR LEVELS SETUP COMPLETED:');
  levelsOverview.rows.forEach(r => {
    console.log(`  Level ${r.level}: ${r.themes_count} Themes, ${r.questions_count} Questions`);
  });

  const totalThemes = await pool.query('SELECT COUNT(*)::int as c FROM themes');
  const totalQuestions = await pool.query('SELECT COUNT(*)::int as c FROM exercises');
  console.log(`🎉 GRAND TOTAL: ${totalThemes.rows[0].c} Themes and ${totalQuestions.rows[0].c} Questions!`);

  process.exit(0);
}

updateSchemaAndData().catch(e => {
  console.error('Update error:', e);
  process.exit(1);
});
