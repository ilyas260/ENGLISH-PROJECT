const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

async function addThemes() {
  console.log('Inserting Theme 7 & Theme 8...');

  // Theme 7: Everyday English & Social Banter
  await pool.query(`
    INSERT INTO themes (id, title, description, color_theme, icon, lesson_title, lesson_content)
    VALUES (
      7,
      'Everyday English & Street Banter',
      'Master natural English conversations: coffee shop orders, hanging out with friends, and polite small talk.',
      'lime',
      'fa-comments',
      'Lesson 7: Natural Everyday English & Small Talk',
      '<h3>☕ 1. Ordering Food & Coffee Like a Native</h3>
<p>• Avoid: <i>"I want a coffee"</i> (too blunt/rude). Use: <b>"Could I get a latte, please?"</b> or <b>"Can I have a cappuccino to go?"</b></p>
<p>• <b>"For here or to go?"</b> = Will you drink it in the shop or take it with you?</p>
<hr class="my-3 border-black">
<h3>👋 2. Natural Greetings & Catching Up</h3>
<p>• <i>"What''s up?" / "How''s it going?" / "How have you been?"</i> (Reply: <i>"Not much, you?"</i> or <i>"Pretty good!"</i>).</p>
<p>• <b>"Catch you later!"</b> = See you soon.</p>
<p>• <b>"Hit me up"</b> = Call or text me later.</p>
<hr class="my-3 border-black">
<h3>🗣️ 3. Polite Ways to Agree & Disagree</h3>
<p>• Agreeing: <i>"I couldn''t agree more!"</i> / <i>"Tell me about it!"</i> / <i>"Exactly!"</i></p>
<p>• Disagreeing politely: <i>"I see your point, but..."</i> / <i>"I am not so sure about that."</i></p>'
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      lesson_title = EXCLUDED.lesson_title,
      lesson_content = EXCLUDED.lesson_content;
  `);

  // Theme 8: Cinema, Hollywood & Netflix Series
  await pool.query(`
    INSERT INTO themes (id, title, description, color_theme, icon, lesson_title, lesson_content)
    VALUES (
      8,
      'Cinema, Netflix & Pop Culture Quotes',
      'Iconic lines from Breaking Bad, Peaky Blinders, Star Wars, Marvel, and unforgettable movie moments!',
      'rose',
      'fa-clapperboard',
      'Lesson 8: Famous Cinema & Series Quotes Guide',
      '<h3>🎬 1. Legendary Catchphrases in English</h3>
<p>• <b>"May the Force be with you"</b> (Star Wars) = Used to wish someone divine strength and luck.</p>
<p>• <b>"I am the one who knocks!"</b> (Walter White / Breaking Bad) = Showing absolute dominance.</p>
<p>• <b>"By order of the Peaky Blinders!"</b> (Peaky Blinders) = Imposing authority in Birmingham style.</p>
<p>• <b>"Winter is coming"</b> (Game of Thrones) = Constant vigilance; hard times ahead.</p>
<hr class="my-3 border-black">
<h3>🍿 2. Film Terminology Every Fan Must Know</h3>
<p>• <b>"Cliffhanger"</b> = An exciting, tense ending that leaves you waiting for the next episode.</p>
<p>• <b>"Spoiler"</b> = Revealing the plot ending to someone who hasn''t watched it yet.</p>
<p>• <b>"Binge-watch"</b> = Watching an entire season in one single weekend!</p>'
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      lesson_title = EXCLUDED.lesson_title,
      lesson_content = EXCLUDED.lesson_content;
  `);

  // Delete existing exercises for 7 & 8 to avoid duplicates on re-run
  await pool.query('DELETE FROM exercises WHERE theme_id IN (7, 8)');

  const newExercises = [
    // Theme 7 (Everyday English - 20 questions)
    { t: 7, type: 'multiple_choice', q: 'In a London coffee shop, how do you politely order an espresso?', opts: ['Give me an espresso now', 'Could I have an espresso, please?', 'I demand espresso', 'Espresso to me'], a: 'Could I have an espresso, please?', c: ['could i have', 'can i get'] },
    { t: 7, type: 'fill_blank', q: 'Casual greeting: "What\'s ________?" (meaning: what is happening / how are you)', opts: [], a: 'up', c: ['upp'] },
    { t: 7, type: 'true_false', q: 'In English, saying "Tell me about it!" can mean "I totally agree with you because I know that feeling".', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
    { t: 7, type: 'multiple_choice', q: 'When someone says "HIT ME UP tonight", what do they want you to do?', opts: ['Punch them in the face', 'Text or call them later', 'Pay their restaurant bill', 'Wake them up early'], a: 'Text or call them later', c: ['call them', 'text them'] },
    { t: 7, type: 'fill_blank', q: 'Complete friendly goodbye: "Catch you ________!"', opts: [], a: 'later', c: ['layter', 'soon'] },
    { t: 7, type: 'multiple_choice', q: 'At a cafe, "For here or to go?" means:', opts: ['Cash or credit card?', 'Drink inside the cafe or take it outside?', 'Hot or cold?', 'Small or large?'], a: 'Drink inside the cafe or take it outside?', c: ['inside or takeaway'] },
    { t: 7, type: 'fill_blank', q: 'Polite answer when offered tea: "Yes, ________." (please or thanks)', opts: [], a: 'please', c: ['pleaze'] },
    { t: 7, type: 'true_false', q: 'In the UK, talking about the weather is the most common way to start small talk with a stranger.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
    { t: 7, type: 'multiple_choice', q: 'If someone asks "How have you been?", a natural reply is:', opts: ['Yes I have', 'Pretty good, thanks! How about you?', 'I am at the station', 'I like books'], a: 'Pretty good, thanks! How about you?', c: ['pretty good'] },
    { t: 7, type: 'fill_blank', q: 'Informal slang for "relax / calm down": "Take a _______ pill!"', opts: [], a: 'chill', c: ['chil'] },
    { t: 7, type: 'multiple_choice', q: 'When you want to interrupt someone politely in an office:', opts: ['Hey listen to me', 'Excuse me, do you have a quick minute?', 'Stop talking now', 'Hear this'], a: 'Excuse me, do you have a quick minute?', c: ['excuse me'] },
    { t: 7, type: 'fill_blank', q: 'To decline an offer politely: "No, thank _______."', opts: [], a: 'you', c: ['u'] },
    { t: 7, type: 'true_false', q: '"It\'s on me" means you will pay for everyone\'s drinks or food.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
    { t: 7, type: 'multiple_choice', q: 'What does "FINGERS CROSSED" mean when someone says it to you?', opts: ['Wishing you good luck and hoping for the best', 'I am lying to you', 'I have cold hands', 'I am angry'], a: 'Wishing you good luck and hoping for the best', c: ['good luck', 'hoping for best'] },
    { t: 7, type: 'fill_blank', q: 'Casual way to say "I don\'t know": "Beats _______!" (meaning: no idea)', opts: [], a: 'me', c: ['mee'] },
    { t: 7, type: 'multiple_choice', q: 'When a friend tells a funny joke and you want to say "You are hilarious!":', opts: ['You kill me!', 'You break me!', 'You eat me!', 'You sleep me!'], a: 'You kill me!', c: ['you kill me'] },
    { t: 7, type: 'fill_blank', q: 'Complete: "Take care and keep in ________!" (meaning: stay connected)', opts: [], a: 'touch', c: ['tuch'] },
    { t: 7, type: 'true_false', q: 'Saying "I\'m down" to an invitation means you are feeling depressed and can\'t come.', opts: ['True', 'False'], a: 'False', c: ['f', 'no'] },
    { t: 7, type: 'multiple_choice', q: 'In slang, if you ask "Are you down for pizza tonight?", what does "down" mean?', opts: ['Sad', 'Interested / Up for it / Ready to join', 'Allergic', 'Cooking'], a: 'Interested / Up for it / Ready to join', c: ['interested', 'ready'] },
    { t: 7, type: 'fill_blank', q: 'Slang for hanging out and doing nothing: "We are just _______ing at home."', opts: [], a: 'chill', c: ['chillin', 'chilling'] },

    // Theme 8 (Cinema, Netflix & Pop Culture - 20 questions)
    { t: 8, type: 'multiple_choice', q: 'Complete Walter White\'s iconic line in Breaking Bad: "I am the one who ________!"', opts: ['knocks', 'cooks', 'fights', 'runs'], a: 'knocks', c: ['knocks'] },
    { t: 8, type: 'fill_blank', q: 'Peaky Blinders catchphrase: "By order of the Peaky ________!"', opts: [], a: 'Blinders', c: ['blinder'] },
    { t: 8, type: 'true_false', q: 'In Game of Thrones, the motto of House Lannister is "A Lannister always pays his debts".', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
    { t: 8, type: 'multiple_choice', q: 'What does "BINGE-WATCH" mean in streaming culture?', opts: ['Watching with subtitles', 'Watching many episodes of a show back-to-back', 'Cancelling your subscription', 'Watching on a small screen'], a: 'Watching many episodes of a show back-to-back', c: ['watching many episodes'] },
    { t: 8, type: 'fill_blank', q: 'Complete Star Wars line: "May the ________ be with you!"', opts: [], a: 'Force', c: ['force'] },
    { t: 8, type: 'multiple_choice', q: 'In Marvel\'s Avengers, what does Captain America say to gather the team?', opts: ['Avengers, run!', 'Avengers, assemble!', 'Avengers, attack!', 'Avengers, unite!'], a: 'Avengers, assemble!', c: ['assemble'] },
    { t: 8, type: 'fill_blank', q: 'Terminator famous line: "Hasta la vista, ________!"', opts: [], a: 'baby', c: ['babi'] },
    { t: 8, type: 'true_false', q: 'A "spoiler" is an exciting surprise gift included inside movie tickets.', opts: ['True', 'False'], a: 'False', c: ['f', 'no'] },
    { t: 8, type: 'multiple_choice', q: 'In The Dark Knight, Harvey Dent says: "You either die a hero, or you live long enough to see yourself become the ________."', opts: ['villain', 'joker', 'king', 'batman'], a: 'villain', c: ['villain'] },
    { t: 8, type: 'fill_blank', q: 'The Lord of the Rings: Gollum calls the Ring: "My ________!"', opts: [], a: 'precious', c: ['presious'] },
    { t: 8, type: 'multiple_choice', q: 'What does a "CLIFFHANGER" refer to in TV series?', opts: ['A scene shot on a mountain', 'A suspenseful, unresolved ending at the end of an episode', 'A bad actor', 'A cancelled season'], a: 'A suspenseful, unresolved ending at the end of an episode', c: ['suspenseful ending'] },
    { t: 8, type: 'fill_blank', q: 'Complete Forrest Gump: "Life is like a box of ________."', opts: [], a: 'chocolates', c: ['chocolate'] },
    { t: 8, type: 'true_false', q: 'In Stranger Things, the mysterious parallel dark dimension is called "The Upside Down".', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
    { t: 8, type: 'multiple_choice', q: 'In Titanic, what does Jack yell on the bow of the ship?', opts: ['I am the king of the world!', 'Look at the ocean!', 'I am sailing fast!', 'Where is Rose?'], a: 'I am the king of the world!', c: ['king of the world'] },
    { t: 8, type: 'fill_blank', q: 'Complete Scarface line: "Say hello to my little ________!"', opts: [], a: 'friend', c: ['frend'] },
    { t: 8, type: 'multiple_choice', q: 'In Gladiator, what does Maximus shout to the crowd in the arena?', opts: ['Are you not entertained?', 'Do you want more blood?', 'Who is next?', 'Bow to Caesar!'], a: 'Are you not entertained?', c: ['are you not entertained'] },
    { t: 8, type: 'fill_blank', q: 'In Fight Club: "The first rule of Fight Club is: you do not ________ about Fight Club."', opts: [], a: 'talk', c: ['speek'] },
    { t: 8, type: 'true_false', q: 'The line "I have a bad feeling about this" appears in every Star Wars movie.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
    { t: 8, type: 'multiple_choice', q: 'In The Matrix, Neo chooses between two pills:', opts: ['Yellow and Green', 'Red and Blue', 'Black and White', 'Gold and Silver'], a: 'Red and Blue', c: ['red and blue'] },
    { t: 8, type: 'fill_blank', q: 'Complete James Bond intro: "The name is Bond... ________ Bond."', opts: [], a: 'James', c: ['jams'] }
  ];

  for (const ex of newExercises) {
    await pool.query(
      `INSERT INTO exercises (theme_id, question_type, question_text, options_json, correct_answer, close_answers_json)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6::jsonb)`,
      [ex.t, ex.type, ex.q, JSON.stringify(ex.opts), ex.a, JSON.stringify(ex.c)]
    );
  }

  const finalThemes = await pool.query('SELECT COUNT(*)::int as c FROM themes');
  const finalEx = await pool.query('SELECT COUNT(*)::int as c FROM exercises');
  console.log(`✅ SUCCESS: ${finalThemes.rows[0].c} Themes and ${finalEx.rows[0].c} Questions in PostgreSQL!`);
  process.exit(0);
}

addThemes().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
