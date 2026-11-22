-- ====================================================================
-- BAAMBOOZLE ENGLISH LEARNING GAME - POSTGRESQL SCHEMA & SEED DATA
-- Massive Pack: Grammar Lessons + Tenses + Cats & Dogs + Streamers (140 Questions!)
-- ====================================================================

DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS themes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Table: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    total_score INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: themes (With full grammar lesson content & CEFR level)
CREATE TABLE themes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    color_theme VARCHAR(50) DEFAULT 'amber',
    icon VARCHAR(50) DEFAULT 'fa-brain',
    lesson_title VARCHAR(150),
    lesson_content TEXT,
    level VARCHAR(10) DEFAULT 'A1'
);

-- 3. Table: exercises
CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    theme_id INT REFERENCES themes(id) ON DELETE CASCADE,
    question_type VARCHAR(30) NOT NULL,          -- 'multiple_choice', 'fill_blank', 'true_false'
    question_text TEXT NOT NULL,
    options_json JSONB DEFAULT '[]'::jsonb,
    correct_answer TEXT NOT NULL,
    close_answers_json JSONB DEFAULT '[]'::jsonb
);

-- 4. Table: scores
CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    theme_id INT REFERENCES themes(id) ON DELETE CASCADE,
    score INT NOT NULL DEFAULT 0,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- THEMES & LESSONS (6 Comprehensive Lessons)
-- ====================================================================
INSERT INTO themes (id, title, description, color_theme, icon, lesson_title, lesson_content) VALUES
(1, 'English Tenses Mastery (Present, Past, Future & Perfect)', 
 'Master the core timeline of English: Present Simple vs Continuous, Past Simple vs Present Perfect, and Future forms.', 
 'amber', 'fa-clock',
 'Lesson 1: The Ultimate English Tenses Blueprint',
 '<h3>⏳ 1. Present Simple vs Present Continuous</h3>
<p>• <b>Present Simple</b> (Routine, permanent facts): <i>"I drink coffee every morning."</i> / <i>"The sun rises in the east."</i> (Key words: always, usually, every day).</p>
<p>• <b>Present Continuous</b> (Action happening right now): <b>Subject + AM/IS/ARE + Verb-ING</b>. <i>"I am studying English right now."</i></p>
<hr class="my-3 border-black">
<h3>🕰️ 2. Past Simple vs Present Perfect</h3>
<p>• <b>Past Simple</b> (Finished action at a specific known time in the past): <i>"I visited London in 2021."</i> / <i>"Yesterday, she bought a car."</i></p>
<p>• <b>Present Perfect</b> (Experience, past action with a result in the present, unfinished time): <b>Subject + HAVE/HAS + Past Participle</b>. <i>"I have lived here for 5 years."</i> / <i>"Have you ever seen a ghost?"</i></p>
<p><b>⚠️ "FOR" vs "SINCE":</b> Use <b>FOR</b> with a duration (for 2 hours, for 10 years). Use <b>SINCE</b> with a starting point (since 2015, since Monday).</p>
<hr class="my-3 border-black">
<h3>🚀 3. Future: Will vs Going To</h3>
<p>• <b>Will + Verb:</b> Instant decisions, promises, predictions without proof. <i>"I will help you!"</i></p>
<p>• <b>Be Going To + Verb:</b> Pre-planned intentions, predictions with visible evidence. <i>"Look at those black clouds! It is going to rain."</i></p>'),

(2, 'Essential Grammar, Modals & Conditionals', 
 'Conquer Conditionals (If clauses), Modal verbs (Must, Should, Could) and common structural traps.', 
 'emerald', 'fa-book-bookmark',
 'Lesson 2: Conditionals & Modal Verbs Made Simple',
 '<h3>🔮 The 3 Main Conditionals</h3>
<p>• <b>Zero Conditional</b> (General truths/scientific laws): <b>If + Present, Present</b>. <i>"If you heat ice, it melts."</i></p>
<p>• <b>First Conditional</b> (Real future possibility): <b>If + Present, WILL + Verb</b>. <i>"If you study, you will pass the exam."</i></p>
<p>• <b>Second Conditional</b> (Imaginary / hypothetical situations in present): <b>If + Past Simple, WOULD + Verb</b>. <i>"If I won a million dollars, I would travel the world."</i> Note: Always use <i>"If I were you"</i>!</p>
<p>• <b>Third Conditional</b> (Past regret, impossible to change): <b>If + Past Perfect (had done), WOULD HAVE + Participle</b>. <i>"If I had trained harder, I would have won."</i></p>
<hr class="my-3 border-black">
<h3>🛡️ Modal Verbs Quick Cheat-Sheet</h3>
<p>• <b>MUST</b> = Strong personal obligation or logical certainty (<i>"You must wear a seatbelt."</i> / <i>"He must be rich."</i>).</p>
<p>• <b>HAVE TO</b> = External rule or law (<i>"I have to renew my passport."</i>).</p>
<p>• <b>SHOULD</b> = Friendly advice or recommendation (<i>"You should drink more water."</i>).</p>
<p>• <b>COULD / MIGHT</b> = Possibility (<i>"It might rain later."</i>).</p>'),

(3, 'Irregular Verbs Bootcamp', 
 'Never confuse drank vs drunk or wrote vs written again! Master the top 30 irregular verbs in action.', 
 'indigo', 'fa-bolt',
 'Lesson 3: Irregular Verbs Cheat-Sheet',
 '<h3>⚡ The 3 Pillars: Base Form, Past Simple (V2), Past Participle (V3)</h3>
<table class="w-full text-xs font-mono border-2 border-black mt-2 mb-3 bg-white">
<tr class="bg-yellow-300 border-b border-black text-left"><th class="p-1">Infinitive</th><th class="p-1">Past Simple (V2)</th><th class="p-1">Past Participle (V3)</th></tr>
<tr><td class="p-1">Go</td><td class="p-1">Went</td><td class="p-1">Gone</td></tr>
<tr><td class="p-1">Eat</td><td class="p-1">Ate</td><td class="p-1">Eaten</td></tr>
<tr><td class="p-1">Drive</td><td class="p-1">Drove</td><td class="p-1">Driven</td></tr>
<tr><td class="p-1">Write</td><td class="p-1">Wrote</td><td class="p-1">Written</td></tr>
<tr><td class="p-1">Break</td><td class="p-1">Broke</td><td class="p-1">Broken</td></tr>
<tr><td class="p-1">Drink</td><td class="p-1">Drank</td><td class="p-1">Drunk</td></tr>
<tr><td class="p-1">Speak</td><td class="p-1">Spoke</td><td class="p-1">Spoken</td></tr>
<tr><td class="p-1">Fly</td><td class="p-1">Flew</td><td class="p-1">Flown</td></tr>
<tr><td class="p-1">Swim</td><td class="p-1">Swam</td><td class="p-1">Swum</td></tr>
<tr><td class="p-1">Begin</td><td class="p-1">Began</td><td class="p-1">Begun</td></tr>
</table>
<p><b>🧠 Golden Rule:</b> Use V2 for simple past (<i>"I drank coffee yesterday"</i>). Use V3 with Have/Has/Had (<i>"I have drunk two cups already"</i>).</p>'),

(4, 'Cats & Dogs: Animal Idioms & Slang', 
 'Learn the most famous English idioms inspired by cats, dogs, and pets with hilarious memes!', 
 'rose', 'fa-dog',
 'Lesson 4: Animal Idioms with Cats & Dogs',
 '<h3>🐱 Cat Idioms</h3>
<p>• <b>"Raining cats and dogs"</b> = Raining heavily outside.</p>
<p>• <b>"Let the cat out of the bag"</b> = Accidentally reveal a secret.</p>
<p>• <b>"Cat got your tongue?"</b> = Why are you suddenly silent / speechless?</p>
<p>• <b>"Curiosity killed the cat"</b> = Being too nosy can cause trouble.</p>
<p>• <b>"Copycat"</b> = Someone who copies others without originality.</p>
<hr class="my-3 border-black">
<h3>🐶 Dog Idioms</h3>
<p>• <b>"Barking up the wrong tree"</b> = Looking in the wrong place or accusing the wrong person.</p>
<p>• <b>"Top dog"</b> = The leader, boss, or dominant person in a group.</p>
<p>• <b>"Dog-eat-dog world"</b> = A fiercely competitive and ruthless environment.</p>
<p>• <b>"Every dog has its day"</b> = Everyone will experience success or good luck at least once.</p>
<p>• <b>"Underdog"</b> = The person expected to lose who surprises everyone.</p>'),

(5, 'Internet Slang & Gen-Z Talk (Sabiri & Jamal Alpha Edition)', 
 'Learn the viral talk: Rizz, No Cap, GOAT, Cook, Sus, Bet, and stream memes!', 
 'purple', 'fa-fire',
 'Lesson 5: Gen-Z & Streamer Slang Dictionary',
 '<h3>🔥 The Modern Streamer & Gen-Z Vocabulary</h3>
<p>• <b>Rizz</b> = Charisma and charm, especially when flirting or winning people over.</p>
<p>• <b>No Cap</b> = "For real / I am telling the 100% truth" (Cap = lie).</p>
<p>• <b>Let him cook</b> = Let him do his thing, show his skill or finish his speech!</p>
<p>• <b>GOAT</b> = Greatest Of All Time (like Messi or Cristiano).</p>
<p>• <b>Sus</b> = Suspicious, shady, or weird (originating from Among Us).</p>
<p>• <b>Bet</b> = "Yes! Deal! Absolutely!"</p>
<p>• <b>Mid</b> = Mediocre, uninspiring, average.</p>
<p>• <b>Ghosted</b> = Suddenly cutting all communication with someone.</p>'),

(6, 'Tricky Idioms & False Friends (Faux-Amis)', 
 'Avoid embarrassing translation traps: don''t translate word-for-word from French!', 
 'cyan', 'fa-ghost',
 'Lesson 6: False Friends Traps to Avoid',
 '<h3>⚠️ The Most Dangerous False Friends</h3>
<p>• <b>Actually</b> = "In reality / En fait" (NOT "actuellement", which is <i>currently / nowadays</i>).</p>
<p>• <b>Sensible</b> = "Reasonable / Sage / Sensé" (NOT "sensible", which is <i>sensitive</i>).</p>
<p>• <b>Eventually</b> = "In the end / Finalement" (NOT "éventuellement", which is <i>possibly / perhaps</i>).</p>
<p>• <b>Library</b> = "Bibliothèque" (A bookstore to buy books is a <i>bookshop</i>).</p>
<p>• <b>Deception</b> = "Tromperie / Trahison" (Disappointment is <i>déception</i>).</p>');

SELECT setval('themes_id_seq', (SELECT MAX(id) FROM themes));

-- INSERT EXERCISES (140 QUESTIONS)
INSERT INTO exercises (theme_id, question_type, question_text, options_json, correct_answer, close_answers_json) VALUES
(1, 'multiple_choice', 'Which sentence is in the Present Continuous tense?', '["She works every day","She is working right now","She worked yesterday","She has worked all day"]'::jsonb, 'She is working right now', '["is working"]'::jsonb),
(1, 'fill_blank', 'Complete with Present Perfect: "I have _______ in this city for 3 years." (live)', '[]'::jsonb, 'lived', '["live","livd"]'::jsonb),
(1, 'true_false', 'In the sentence "Yesterday, I have seen a movie", the grammar is correct.', '["True","False"]'::jsonb, 'False', '["f","no","faux"]'::jsonb),
(1, 'multiple_choice', 'Choose the correct form: "Look at those dark clouds! It _______ rain soon!"', '["is going to","will","is raining","was"]'::jsonb, 'is going to', '["going to"]'::jsonb),
(1, 'fill_blank', 'Choose for or since: "She has been learning English _______ 2020."', '[]'::jsonb, 'since', '["sinse"]'::jsonb),
(1, 'multiple_choice', 'What is the correct negative form of "He likes pizza" in Present Simple?', '["He don''t like pizza","He doesn''t like pizza","He doesn''t likes pizza","He not like pizza"]'::jsonb, 'He doesn''t like pizza', '["doesnt like"]'::jsonb),
(1, 'fill_blank', 'Choose for or since: "We have waited for you _______ two hours!"', '[]'::jsonb, 'for', '["four"]'::jsonb),
(1, 'true_false', 'Verbs like "know", "love", and "understand" (stative verbs) are rarely used in the -ING continuous form.', '["True","False"]'::jsonb, 'True', '["t","yes","vrai"]'::jsonb),
(1, 'multiple_choice', 'Which tense is used for permanent facts, like "Water boils at 100 degrees"?', '["Present Continuous","Present Simple","Past Simple","Present Perfect"]'::jsonb, 'Present Simple', '["simple present"]'::jsonb),
(1, 'fill_blank', 'Complete: "By this time next year, I _______ graduate from university." (will or did)', '[]'::jsonb, 'will', '["shall"]'::jsonb),
(1, 'multiple_choice', 'Choose the correct past continuous form: "While I was sleeping, the phone _______."', '["rang","was ringing","has rung","rings"]'::jsonb, 'rang', '["rang"]'::jsonb),
(1, 'fill_blank', 'Complete with past simple: "Last night, we _______ delicious tacos." (eat)', '[]'::jsonb, 'ate', '["eated","eat"]'::jsonb),
(1, 'true_false', 'The sentence "I am living in Morocco for 10 years" is the standard way to express an ongoing duration in English.', '["True","False"]'::jsonb, 'False', '["f","no"]'::jsonb),
(1, 'multiple_choice', 'Choose: "Have you _______ been to New York?"', '["ever","never","already","yet"]'::jsonb, 'ever', '["ever"]'::jsonb),
(1, 'fill_blank', 'Negative question: "I haven''t finished my homework _______."', '[]'::jsonb, 'yet', '["stil"]'::jsonb),
(1, 'multiple_choice', '"She was watching TV when the lights went out." What tense is "was watching"?', '["Past Simple","Past Continuous","Past Perfect","Present Continuous"]'::jsonb, 'Past Continuous', '["past progressive"]'::jsonb),
(1, 'fill_blank', 'Complete: "Water _______ at zero degrees Celsius." (freeze)', '[]'::jsonb, 'freezes', '["freeze"]'::jsonb),
(1, 'true_false', '"Will" is typically used for spontaneous, on-the-spot decisions made at the moment of speaking.', '["True","False"]'::jsonb, 'True', '["t","yes"]'::jsonb),
(1, 'multiple_choice', 'Choose the correct form: "I _______ to the gym three times a week."', '["go","am going","have gone","goes"]'::jsonb, 'go', '["go"]'::jsonb),
(1, 'fill_blank', 'Complete with past simple: "He _______ his keys yesterday." (lose)', '[]'::jsonb, 'lost', '["loosed"]'::jsonb),
(1, 'multiple_choice', 'Which sentence describes an action in progress right now?', '["I listen to music","I am listening to music","I listened to music","I have listened to music"]'::jsonb, 'I am listening to music', '["am listening"]'::jsonb),
(1, 'fill_blank', 'Complete: "She _______ already left the office." (has or have)', '[]'::jsonb, 'has', '["haz"]'::jsonb),
(1, 'true_false', 'The past tense of "read" is written the same way ("read") but pronounced like the color "red".', '["True","False"]'::jsonb, 'True', '["t","yes"]'::jsonb),
(1, 'multiple_choice', '"I had never seen such a beautiful sunset before that day." What tense is "had seen"?', '["Past Simple","Past Continuous","Past Perfect","Present Perfect"]'::jsonb, 'Past Perfect', '["past perfect"]'::jsonb),
(1, 'fill_blank', 'Fill in the blank: "Look! The baby is _______ to walk!" (try)', '[]'::jsonb, 'trying', '["tryin"]'::jsonb),
(2, 'multiple_choice', 'Second conditional: "If I _______ rich, I would buy an island."', '["was","were","am","will be"]'::jsonb, 'were', '["was","were"]'::jsonb),
(2, 'fill_blank', 'Complete: "If it rains tomorrow, we _______ stay at home." (will or would)', '[]'::jsonb, 'will', '["wil"]'::jsonb),
(2, 'true_false', '"Unless" means the same thing as "if not".', '["True","False"]'::jsonb, 'True', '["t","yes"]'::jsonb),
(2, 'multiple_choice', 'Choose the modal for polite advice: "You look tired, you _______ go to sleep."', '["must","should","can","may"]'::jsonb, 'should', '["should"]'::jsonb),
(2, 'fill_blank', 'Complete the idiom: "If I were in your _______, I would accept the job."', '[]'::jsonb, 'shoes', '["place","position"]'::jsonb),
(2, 'multiple_choice', 'Which modal expresses 100% logical certainty: "The lights are on, he _______ be home."', '["might","could","must","should"]'::jsonb, 'must', '["must"]'::jsonb),
(2, 'fill_blank', 'Negative obligation: "You _______ not smoke in this hospital!" (must or can)', '[]'::jsonb, 'must', '["musnt"]'::jsonb),
(2, 'true_false', 'In the third conditional, we talk about past situations that we can still change.', '["True","False"]'::jsonb, 'False', '["f","no"]'::jsonb),
(2, 'multiple_choice', 'Complete: "If she had studied harder, she _______ passed the test."', '["would have","will have","would","had"]'::jsonb, 'would have', '["would have"]'::jsonb),
(2, 'fill_blank', 'Passive voice: "The Harry Potter books were _______ by J.K. Rowling." (write)', '[]'::jsonb, 'written', '["writen"]'::jsonb),
(2, 'multiple_choice', 'Choose the correct question tag: "You are French, _______?"', '["aren''t you","are you","isn''t it","don''t you"]'::jsonb, 'aren''t you', '["arent you"]'::jsonb),
(2, 'fill_blank', 'Complete with modal: "Excuse me, _______ you please pass the salt?" (could or must)', '[]'::jsonb, 'could', '["can","would"]'::jsonb),
(2, 'true_false', '"I must to go" is grammatically correct in English.', '["True","False"]'::jsonb, 'False', '["f","no"]'::jsonb),
(2, 'multiple_choice', 'Choose the right comparative: "This puzzle is _______ than the first one."', '["more easy","easier","easyer","most easy"]'::jsonb, 'easier', '["easier"]'::jsonb),
(2, 'fill_blank', 'Superlative: "He is the _______ student in the entire class." (good)', '[]'::jsonb, 'best', '["the best"]'::jsonb),
(2, 'multiple_choice', 'Which sentence is in the passive voice?', '["The chef cooked the meal","The meal was cooked by the chef","The chef is cooking now","The chef will cook"]'::jsonb, 'The meal was cooked by the chef', '["meal was cooked"]'::jsonb),
(2, 'fill_blank', 'Complete conditional: "If you touch fire, you _______ burned." (get or got)', '[]'::jsonb, 'get', '["get"]'::jsonb),
(2, 'true_false', 'After modal verbs (can, could, should, must), the main verb is always in the bare infinitive (without "to").', '["True","False"]'::jsonb, 'True', '["t","yes"]'::jsonb),
(2, 'multiple_choice', 'Choose: "You _______ have a ticket to enter the cinema; it is mandatory."', '["have to","might","could","may"]'::jsonb, 'have to', '["have to","must"]'::jsonb),
(2, 'fill_blank', 'Complete: "Neither Sarah _______ John came to the party." (nor or or)', '[]'::jsonb, 'nor', '["nor"]'::jsonb),
(2, 'multiple_choice', 'Zero conditional: "If water reaches 100 degrees, it _______."', '["boils","boiled","will boil","would boil"]'::jsonb, 'boils', '["boils"]'::jsonb),
(2, 'fill_blank', 'Modal of deduction: "It _______ rain later, so take an umbrella just in case." (might or must)', '[]'::jsonb, 'might', '["may","could"]'::jsonb),
(2, 'true_false', '"Although" and "Even though" are used to express contrast.', '["True","False"]'::jsonb, 'True', '["t","yes"]'::jsonb),
(2, 'multiple_choice', 'Which word connects reasons: "He stayed home _______ he was sick."', '["because","although","despite","unless"]'::jsonb, 'because', '["because"]'::jsonb),
(2, 'fill_blank', 'Question tag: "She can swim, _______ she?"', '[]'::jsonb, 'can''t', '["cant"]'::jsonb),
(3, 'multiple_choice', 'What is the past simple of the verb "TO BREAK"?', '["Breaked","Broke","Broken","Broked"]'::jsonb, 'Broke', '["broke"]'::jsonb),
(3, 'fill_blank', 'Fill in Past Participle: "She has _______ all her money." (spend)', '[]'::jsonb, 'spent', '["spended"]'::jsonb),
(3, 'true_false', 'The three forms of the verb "PUT" are "put", "put", and "put".', '["True","False"]'::jsonb, 'True', '["t","yes"]'::jsonb),
(3, 'multiple_choice', 'What is the past participle of the verb "TO FLY"?', '["Flew","Flown","Flyed","Flowed"]'::jsonb, 'Flown', '["flown"]'::jsonb),
(3, 'fill_blank', 'Past simple: "Last week, she _______ a letter to her grandmother." (write)', '[]'::jsonb, 'wrote', '["writed"]'::jsonb),
(3, 'multiple_choice', 'What is the past simple of the verb "TO CATCH"?', '["Catched","Caught","Cought","Cotched"]'::jsonb, 'Caught', '["caught"]'::jsonb),
(3, 'fill_blank', 'Past participle: "He has _______ across the river twice." (swim)', '[]'::jsonb, 'swum', '["swam"]'::jsonb),
(3, 'true_false', 'The past simple of "teach" is "teached".', '["True","False"]'::jsonb, 'False', '["f","no"]'::jsonb),
(3, 'multiple_choice', 'What is the past simple of "TO DRIVE"?', '["Drived","Drove","Driven","Droven"]'::jsonb, 'Drove', '["drove"]'::jsonb),
(3, 'fill_blank', 'Past participle: "Have you _______ my keys anywhere?" (see)', '[]'::jsonb, 'seen', '["saw"]'::jsonb),
(3, 'multiple_choice', 'Past simple of "TO CHOOSE":', '["Choosed","Chose","Chosen","Chase"]'::jsonb, 'Chose', '["chose"]'::jsonb),
(3, 'fill_blank', 'Past simple: "The birds _______ south for the winter." (fly)', '[]'::jsonb, 'flew', '["flyed"]'::jsonb),
(3, 'true_false', 'The past participle of "begin" is "begun".', '["True","False"]'::jsonb, 'True', '["t","yes"]'::jsonb),
(3, 'multiple_choice', 'Past simple of "TO BUY":', '["Buyed","Bought","Brought","Boted"]'::jsonb, 'Bought', '["bought"]'::jsonb),
(3, 'fill_blank', 'Past simple: "He _______ down on the sofa and fell asleep." (sit)', '[]'::jsonb, 'sat', '["sitted"]'::jsonb),
(3, 'multiple_choice', 'Past participle of "TO SPEAK":', '["Spoke","Spoken","Speaked","Spoked"]'::jsonb, 'Spoken', '["spoken"]'::jsonb),
(3, 'fill_blank', 'Past simple: "She _______ the bell three times." (ring)', '[]'::jsonb, 'rang', '["rung"]'::jsonb),
(3, 'true_false', 'The past simple of "cut" is "cutted".', '["True","False"]'::jsonb, 'False', '["f","no"]'::jsonb),
(3, 'multiple_choice', 'Past simple of "TO WEAR":', '["Weared","Wore","Worn","Ware"]'::jsonb, 'Wore', '["wore"]'::jsonb),
(3, 'fill_blank', 'Past participle: "I have _______ that car for five years." (drive)', '[]'::jsonb, 'driven', '["drived"]'::jsonb),
(3, 'multiple_choice', 'Past simple of "TO RUN":', '["Runned","Ran","Ron","Running"]'::jsonb, 'Ran', '["ran"]'::jsonb),
(3, 'fill_blank', 'Past participle: "The glass was _______ by the cat." (break)', '[]'::jsonb, 'broken', '["broked"]'::jsonb),
(3, 'true_false', 'The past tense of "bring" is "brought".', '["True","False"]'::jsonb, 'True', '["t","yes"]'::jsonb),
(3, 'multiple_choice', 'Past participle of "TO GIVE":', '["Gave","Given","Gived","Gaven"]'::jsonb, 'Given', '["given"]'::jsonb),
(3, 'fill_blank', 'Past simple: "We _______ the championship yesterday!" (win)', '[]'::jsonb, 'won', '["winned"]'::jsonb),
(4, 'multiple_choice', 'Complete the idiom: "It is raining _______ and dogs outside!"', '["birds","cats","frogs","horses"]'::jsonb, 'cats', '["cat","cats"]'::jsonb),
(4, 'fill_blank', 'To accidentally reveal a secret: "Let the cat out of the _______."', '[]'::jsonb, 'bag', '["box","sack"]'::jsonb),
(4, 'true_false', 'The phrase "barking up the wrong tree" means looking for answers in the completely wrong direction.', '["True","False"]'::jsonb, 'True', '["t","yes"]'::jsonb),
(4, 'multiple_choice', 'When someone suddenly becomes shy or speechless, people say:', '["Dog took your shoes?","Cat got your tongue?","Fish stole your voice?","Bird ate your words?"]'::jsonb, 'Cat got your tongue?', '["cat got your tongue"]'::jsonb),
(4, 'fill_blank', 'A fiercely competitive environment: "It is a dog-_______-dog world out there!"', '[]'::jsonb, 'eat', '["ate"]'::jsonb),
(4, 'multiple_choice', 'What does "TOP DOG" mean in an organization or team?', '["The tallest person","The leader or most powerful person","The funniest member","The pet of the company"]'::jsonb, 'The leader or most powerful person', '["leader","boss"]'::jsonb),
(4, 'fill_blank', 'Complete: "Curiosity killed the _______."', '[]'::jsonb, 'cat', '["katt"]'::jsonb),
(4, 'true_false', 'A "copycat" is a machine used in offices to print documents.', '["True","False"]'::jsonb, 'False', '["f","no"]'::jsonb),
(4, 'multiple_choice', '"Every dog has its _______" means everyone will have good luck or success at some point.', '["bone","day","bark","walk"]'::jsonb, 'day', '["day"]'::jsonb),
(4, 'fill_blank', 'The person in a contest who is expected to lose is called the "under_______".', '[]'::jsonb, 'dog', '["dogg"]'::jsonb),
(4, 'multiple_choice', 'When two people fight constantly, they are fighting like:', '["Cat and dog","Mouse and cheese","Lion and tiger","Dog and wolf"]'::jsonb, 'Cat and dog', '["cat and dog"]'::jsonb),
(4, 'fill_blank', 'A short nap during the afternoon is often called a "_______ nap".', '[]'::jsonb, 'cat', '["kat"]'::jsonb),
(4, 'true_false', '"You can''t teach an old dog new tricks" means it is difficult to change people''s deeply set habits.', '["True","False"]'::jsonb, 'True', '["t","yes"]'::jsonb),
(4, 'multiple_choice', 'If someone is in the "DOGHOUSE", what does it mean?', '["They bought a dog","Someone is very angry at them for doing something wrong","They are living outside","They won a prize"]'::jsonb, 'Someone is very angry at them for doing something wrong', '["in trouble"]'::jsonb),
(4, 'fill_blank', 'Complete: "Let sleeping dogs _______." (meaning: don''t restart an old argument)', '[]'::jsonb, 'lie', '["sleep"]'::jsonb),
(4, 'multiple_choice', '"Look what the cat dragged in!" is said when someone arrives looking:', '["Super stylish","Messy, disheveled, or unexpectedly","Very rich","Angry"]'::jsonb, 'Messy, disheveled, or unexpectedly', '["unexpectedly","messy"]'::jsonb),
(4, 'fill_blank', 'To play a game of pursuit where one tries to catch the other: "a game of cat and _______."', '[]'::jsonb, 'mouse', '["mouze"]'::jsonb),
(4, 'true_false', 'In English folklore, cats are said to have 9 lives.', '["True","False"]'::jsonb, 'True', '["t","yes"]'::jsonb),
(4, 'multiple_choice', 'What does "DOG TIRED" mean?', '["Tired of having a dog","Extremely exhausted","Waking up early","Feeling sick"]'::jsonb, 'Extremely exhausted', '["exhausted","very tired"]'::jsonb),
(4, 'fill_blank', 'Complete: "His bark is worse than his _______." (meaning: he sounds aggressive but isn''t dangerous)', '[]'::jsonb, 'bite', '["bytt"]'::jsonb),
(4, 'multiple_choice', 'A "CATCALL" in street slang refers to:', '["Calling a stray kitten","An unwanted whistle or shout at someone in public","A telephone ringtone","A pet store advertisement"]'::jsonb, 'An unwanted whistle or shout at someone in public', '["whistle"]'::jsonb),
(4, 'fill_blank', 'The hot, sultry, inactive days of mid-summer are called "the _______ days of summer".', '[]'::jsonb, 'dog', '["dogg"]'::jsonb),
(4, 'true_false', 'To "put the cat among the pigeons" means to do something that causes huge trouble and panic.', '["True","False"]'::jsonb, 'True', '["t","yes"]'::jsonb),
(4, 'multiple_choice', 'When a situation is an utter chaotic disaster, it is called a:', '["Dog''s dinner","Cat''s lunch","Puppy party","Kitty kitchen"]'::jsonb, 'Dog''s dinner', '["dogs dinner"]'::jsonb),
(4, 'fill_blank', 'To move quietly and stealthily like a feline: to walk with "cat-like _______".', '[]'::jsonb, 'tread', '["steps","feet"]'::jsonb),
(5, 'multiple_choice', 'What does "NO CAP" mean?', '["No hat allowed","For real / 100% truth","I have no money","Not interested"]'::jsonb, 'For real / 100% truth', '["for real","telling the truth"]'::jsonb),
(5, 'fill_blank', 'Complete: "He has so much natural charm with girls, he has infinite _______."', '[]'::jsonb, 'rizz', '["riz","rizzz"]'::jsonb),
(5, 'true_false', 'Sending just "K" in modern texting sounds enthusiastic and cheerful.', '["True","False"]'::jsonb, 'False', '["f","no"]'::jsonb),
(5, 'multiple_choice', '"Let him cook!" means:', '["Make dinner","Give him space to show his skill","Turn on the oven","He burned the food"]'::jsonb, 'Give him space to show his skill', '["let him do his thing"]'::jsonb),
(5, 'fill_blank', 'What does GOAT stand for? "Greatest Of All _______."', '[]'::jsonb, 'Time', '["times"]'::jsonb),
(5, 'multiple_choice', 'If someone calls a movie "MID", what do they think of it?', '["Masterpiece","Average / Mediocre","Horrible","Too long"]'::jsonb, 'Average / Mediocre', '["average","mediocre"]'::jsonb),
(5, 'fill_blank', 'When an imposter acts suspicious, they are being "_______".', '[]'::jsonb, 'sus', '["suss"]'::jsonb),
(5, 'true_false', 'In slang, "BET" can mean "Yes / Deal / Absolutely".', '["True","False"]'::jsonb, 'True', '["t","yes"]'::jsonb),
(5, 'multiple_choice', 'What does "SPILL THE TEA" mean?', '["Clean up tea","Share the juicy gossip","Order a hot drink","Calm down"]'::jsonb, 'Share the juicy gossip', '["share gossip"]'::jsonb),
(5, 'fill_blank', 'When someone suddenly stops replying to all messages, they _______ you.', '[]'::jsonb, 'ghosted', '["ghost"]'::jsonb),
(5, 'multiple_choice', 'What is a "GIGACHAD" in internet culture?', '["A terrible gamer","The ultimate confident, cool and respectful male","A boring person","A chat bot"]'::jsonb, 'The ultimate confident, cool and respectful male', '["chad"]'::jsonb),
(5, 'fill_blank', 'When you take a victory or succeed, people say: "Big _______!" (W or L)', '[]'::jsonb, 'W', '["win","dub"]'::jsonb),
(5, 'true_false', 'To "flex" in modern slang means to show off your wealth, style, or skills.', '["True","False"]'::jsonb, 'True', '["t","yes"]'::jsonb),
(5, 'multiple_choice', 'What does "CRINGE" mean?', '["Extremely funny","Embarrassing / Awkward to watch","Exciting","Delicious"]'::jsonb, 'Embarrassing / Awkward to watch', '["embarrassing"]'::jsonb),
(5, 'fill_blank', 'When someone changes their appearance and becomes way more attractive: a "_______ up".', '[]'::jsonb, 'glow', '["glo"]'::jsonb),
(5, 'multiple_choice', 'If someone is doing way too much for their crush with no self-respect, they are a:', '["King","Simp","Chef","Captain"]'::jsonb, 'Simp', '["simp"]'::jsonb),
(5, 'fill_blank', 'Opposite of a Win in gaming/life: taking an _______. (W or L)', '[]'::jsonb, 'L', '["loss"]'::jsonb),
(5, 'true_false', '"Sheesh" is used to express admiration, surprise, or hype.', '["True","False"]'::jsonb, 'True', '["t","yes"]'::jsonb),
(5, 'multiple_choice', '"Living rent-free in your head" means:', '["Staying in an apartment for free","You can''t stop obsessively thinking about something","Forgetting everything","Having no thoughts"]'::jsonb, 'You can''t stop obsessively thinking about something', '["thinking obsessively"]'::jsonb),
(5, 'fill_blank', 'A powerful, game-changing move or play is called a "_______ IQ play".', '[]'::jsonb, '200', '["big","300"]'::jsonb),
(6, 'multiple_choice', '"Break a leg!" means:', '["Fall down","Good luck!","Hurry up","Sit down"]'::jsonb, 'Good luck!', '["good luck"]'::jsonb),
(6, 'fill_blank', 'Complete false friend: "I thought he was French, but _______ he is Canadian!" (meaning: in reality)', '[]'::jsonb, 'actually', '["in reality"]'::jsonb),
(6, 'true_false', 'In English, "sensible" means emotionally sensitive.', '["True","False"]'::jsonb, 'False', '["f","no"]'::jsonb),
(6, 'multiple_choice', '"A piece of cake" describes:', '["A sweet dessert","Something very easy","A big problem","A reward"]'::jsonb, 'Something very easy', '["very easy"]'::jsonb),
(6, 'fill_blank', 'Facing a tough reality with courage is to "bite the _______".', '[]'::jsonb, 'bullet', '["bulet"]'::jsonb),
(6, 'multiple_choice', 'When you get "COLD FEET" before an event:', '["You are freezing","You suddenly get nervous and hesitate","You dance well","Your shoes are wet"]'::jsonb, 'You suddenly get nervous and hesitate', '["nervous"]'::jsonb),
(6, 'fill_blank', 'Complete: "Once in a _______ moon."', '[]'::jsonb, 'blue', '["bloo"]'::jsonb),
(6, 'true_false', 'The English word "eventually" means "perhaps / possibly".', '["True","False"]'::jsonb, 'False', '["f","no"]'::jsonb),
(6, 'multiple_choice', 'To accidentally reveal a secret: you "spilled the _______".', '["milk","beans","tea","soup"]'::jsonb, 'beans', '["beans","tea"]'::jsonb),
(6, 'fill_blank', 'False friend: In English, a "library" is a place to borrow books, but to BUY books you go to a _______.', '[]'::jsonb, 'bookshop', '["bookstore"]'::jsonb),
(6, 'multiple_choice', '"Cost an arm and a leg" means:', '["Injuring yourself","Extremely expensive","Cheap discount","Easy to buy"]'::jsonb, 'Extremely expensive', '["expensive"]'::jsonb),
(6, 'fill_blank', 'To judge someone without knowing them: "Don''t judge a book by its _______."', '[]'::jsonb, 'cover', '["title"]'::jsonb),
(6, 'true_false', '"To attend a meeting" means to wait for the meeting to start.', '["True","False"]'::jsonb, 'False', '["f","no"]'::jsonb),
(6, 'multiple_choice', 'What does "Under the weather" mean?', '["Standing in the rain","Feeling slightly sick or unwell","Enjoying the sunshine","Traveling by plane"]'::jsonb, 'Feeling slightly sick or unwell', '["sick","unwell"]'::jsonb),
(6, 'fill_blank', 'Complete: "Hit the nail on the _______." (meaning: exactly right)', '[]'::jsonb, 'head', '["hed"]'::jsonb),
(6, 'multiple_choice', '"Burn the midnight oil" means:', '["Setting fire to oil","Working or studying late into the night","Wasting energy","Cooking dinner"]'::jsonb, 'Working or studying late into the night', '["working late"]'::jsonb),
(6, 'fill_blank', 'Complete: "Better _______ than never."', '[]'::jsonb, 'late', '["layte"]'::jsonb),
(6, 'true_false', 'In English, "deception" means being disappointed by someone.', '["True","False"]'::jsonb, 'False', '["f","no"]'::jsonb),
(6, 'multiple_choice', '"See eye to eye" with someone means:', '["Having a stare contest","Agreeing with them","Fighting with them","Wearing glasses"]'::jsonb, 'Agreeing with them', '["agreeing"]'::jsonb),
(6, 'fill_blank', 'To give up: to "throw in the _______."', '[]'::jsonb, 'towel', '["sponge"]'::jsonb);

-- DEMO USERS
INSERT INTO users (username, email, password_hash, total_score) VALUES
('MemeMaster', 'player@baamboozle.test', '$2a$10$wT8K.4rT4i7/d9YJb6Kz1eO8aL.qP/Mh4X2gO.5P0zZqU3F0KxNre', 2500),
('QuizWizard', 'wizard@baamboozle.test', '$2a$10$wT8K.4rT4i7/d9YJb6Kz1eO8aL.qP/Mh4X2gO.5P0zZqU3F0KxNre', 1800);

-- DEMO SCORES
INSERT INTO scores (user_id, theme_id, score) VALUES
(1, 1, 2000),
(1, 4, 1800),
(2, 3, 1500);
