const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const exercises = [
  // ==========================================
  // THEME 1: TENSES MASTERY (25 Questions)
  // ==========================================
  { t: 1, type: 'multiple_choice', q: 'Which sentence is in the Present Continuous tense?', opts: ['She works every day', 'She is working right now', 'She worked yesterday', 'She has worked all day'], a: 'She is working right now', c: ['is working'] },
  { t: 1, type: 'fill_blank', q: 'Complete with Present Perfect: "I have _______ in this city for 3 years." (live)', opts: [], a: 'lived', c: ['live', 'livd'] },
  { t: 1, type: 'true_false', q: 'In the sentence "Yesterday, I have seen a movie", the grammar is correct.', opts: ['True', 'False'], a: 'False', c: ['f', 'no', 'faux'] },
  { t: 1, type: 'multiple_choice', q: 'Choose the correct form: "Look at those dark clouds! It _______ rain soon!"', opts: ['is going to', 'will', 'is raining', 'was'], a: 'is going to', c: ['going to'] },
  { t: 1, type: 'fill_blank', q: 'Choose for or since: "She has been learning English _______ 2020."', opts: [], a: 'since', c: ['sinse'] },
  { t: 1, type: 'multiple_choice', q: 'What is the correct negative form of "He likes pizza" in Present Simple?', opts: ["He don't like pizza", "He doesn't like pizza", "He doesn't likes pizza", "He not like pizza"], a: "He doesn't like pizza", c: ['doesnt like'] },
  { t: 1, type: 'fill_blank', q: 'Choose for or since: "We have waited for you _______ two hours!"', opts: [], a: 'for', c: ['four'] },
  { t: 1, type: 'true_false', q: 'Verbs like "know", "love", and "understand" (stative verbs) are rarely used in the -ING continuous form.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes', 'vrai'] },
  { t: 1, type: 'multiple_choice', q: 'Which tense is used for permanent facts, like "Water boils at 100 degrees"?', opts: ['Present Continuous', 'Present Simple', 'Past Simple', 'Present Perfect'], a: 'Present Simple', c: ['simple present'] },
  { t: 1, type: 'fill_blank', q: 'Complete: "By this time next year, I _______ graduate from university." (will or did)', opts: [], a: 'will', c: ['shall'] },
  { t: 1, type: 'multiple_choice', q: 'Choose the correct past continuous form: "While I was sleeping, the phone _______."', opts: ['rang', 'was ringing', 'has rung', 'rings'], a: 'rang', c: ['rang'] },
  { t: 1, type: 'fill_blank', q: 'Complete with past simple: "Last night, we _______ delicious tacos." (eat)', opts: [], a: 'ate', c: ['eated', 'eat'] },
  { t: 1, type: 'true_false', q: 'The sentence "I am living in Morocco for 10 years" is the standard way to express an ongoing duration in English.', opts: ['True', 'False'], a: 'False', c: ['f', 'no'] },
  { t: 1, type: 'multiple_choice', q: 'Choose: "Have you _______ been to New York?"', opts: ['ever', 'never', 'already', 'yet'], a: 'ever', c: ['ever'] },
  { t: 1, type: 'fill_blank', q: 'Negative question: "I haven\'t finished my homework _______."', opts: [], a: 'yet', c: ['stil'] },
  { t: 1, type: 'multiple_choice', q: '"She was watching TV when the lights went out." What tense is "was watching"?', opts: ['Past Simple', 'Past Continuous', 'Past Perfect', 'Present Continuous'], a: 'Past Continuous', c: ['past progressive'] },
  { t: 1, type: 'fill_blank', q: 'Complete: "Water _______ at zero degrees Celsius." (freeze)', opts: [], a: 'freezes', c: ['freeze'] },
  { t: 1, type: 'true_false', q: '"Will" is typically used for spontaneous, on-the-spot decisions made at the moment of speaking.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
  { t: 1, type: 'multiple_choice', q: 'Choose the correct form: "I _______ to the gym three times a week."', opts: ['go', 'am going', 'have gone', 'goes'], a: 'go', c: ['go'] },
  { t: 1, type: 'fill_blank', q: 'Complete with past simple: "He _______ his keys yesterday." (lose)', opts: [], a: 'lost', c: ['loosed'] },
  { t: 1, type: 'multiple_choice', q: 'Which sentence describes an action in progress right now?', opts: ['I listen to music', 'I am listening to music', 'I listened to music', 'I have listened to music'], a: 'I am listening to music', c: ['am listening'] },
  { t: 1, type: 'fill_blank', q: 'Complete: "She _______ already left the office." (has or have)', opts: [], a: 'has', c: ['haz'] },
  { t: 1, type: 'true_false', q: 'The past tense of "read" is written the same way ("read") but pronounced like the color "red".', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
  { t: 1, type: 'multiple_choice', q: '"I had never seen such a beautiful sunset before that day." What tense is "had seen"?', opts: ['Past Simple', 'Past Continuous', 'Past Perfect', 'Present Perfect'], a: 'Past Perfect', c: ['past perfect'] },
  { t: 1, type: 'fill_blank', q: 'Fill in the blank: "Look! The baby is _______ to walk!" (try)', opts: [], a: 'trying', c: ['tryin'] },

  // ==========================================
  // THEME 2: GRAMMAR, MODALS & CONDITIONALS (25 Questions)
  // ==========================================
  { t: 2, type: 'multiple_choice', q: 'Second conditional: "If I _______ rich, I would buy an island."', opts: ['was', 'were', 'am', 'will be'], a: 'were', c: ['was', 'were'] },
  { t: 2, type: 'fill_blank', q: 'Complete: "If it rains tomorrow, we _______ stay at home." (will or would)', opts: [], a: 'will', c: ['wil'] },
  { t: 2, type: 'true_false', q: '"Unless" means the same thing as "if not".', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
  { t: 2, type: 'multiple_choice', q: 'Choose the modal for polite advice: "You look tired, you _______ go to sleep."', opts: ['must', 'should', 'can', 'may'], a: 'should', c: ['should'] },
  { t: 2, type: 'fill_blank', q: 'Complete the idiom: "If I were in your _______, I would accept the job."', opts: [], a: 'shoes', c: ['place', 'position'] },
  { t: 2, type: 'multiple_choice', q: 'Which modal expresses 100% logical certainty: "The lights are on, he _______ be home."', opts: ['might', 'could', 'must', 'should'], a: 'must', c: ['must'] },
  { t: 2, type: 'fill_blank', q: 'Negative obligation: "You _______ not smoke in this hospital!" (must or can)', opts: [], a: 'must', c: ['musnt'] },
  { t: 2, type: 'true_false', q: 'In the third conditional, we talk about past situations that we can still change.', opts: ['True', 'False'], a: 'False', c: ['f', 'no'] },
  { t: 2, type: 'multiple_choice', q: 'Complete: "If she had studied harder, she _______ passed the test."', opts: ['would have', 'will have', 'would', 'had'], a: 'would have', c: ['would have'] },
  { t: 2, type: 'fill_blank', q: 'Passive voice: "The Harry Potter books were _______ by J.K. Rowling." (write)', opts: [], a: 'written', c: ['writen'] },
  { t: 2, type: 'multiple_choice', q: 'Choose the correct question tag: "You are French, _______?"', opts: ["aren't you", 'are you', "isn't it", "don't you"], a: "aren't you", c: ['arent you'] },
  { t: 2, type: 'fill_blank', q: 'Complete with modal: "Excuse me, _______ you please pass the salt?" (could or must)', opts: [], a: 'could', c: ['can', 'would'] },
  { t: 2, type: 'true_false', q: '"I must to go" is grammatically correct in English.', opts: ['True', 'False'], a: 'False', c: ['f', 'no'] },
  { t: 2, type: 'multiple_choice', q: 'Choose the right comparative: "This puzzle is _______ than the first one."', opts: ['more easy', 'easier', 'easyer', 'most easy'], a: 'easier', c: ['easier'] },
  { t: 2, type: 'fill_blank', q: 'Superlative: "He is the _______ student in the entire class." (good)', opts: [], a: 'best', c: ['the best'] },
  { t: 2, type: 'multiple_choice', q: 'Which sentence is in the passive voice?', opts: ['The chef cooked the meal', 'The meal was cooked by the chef', 'The chef is cooking now', 'The chef will cook'], a: 'The meal was cooked by the chef', c: ['meal was cooked'] },
  { t: 2, type: 'fill_blank', q: 'Complete conditional: "If you touch fire, you _______ burned." (get or got)', opts: [], a: 'get', c: ['get'] },
  { t: 2, type: 'true_false', q: 'After modal verbs (can, could, should, must), the main verb is always in the bare infinitive (without "to").', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
  { t: 2, type: 'multiple_choice', q: 'Choose: "You _______ have a ticket to enter the cinema; it is mandatory."', opts: ['have to', 'might', 'could', 'may'], a: 'have to', c: ['have to', 'must'] },
  { t: 2, type: 'fill_blank', q: 'Complete: "Neither Sarah _______ John came to the party." (nor or or)', opts: [], a: 'nor', c: ['nor'] },
  { t: 2, type: 'multiple_choice', q: 'Zero conditional: "If water reaches 100 degrees, it _______."', opts: ['boils', 'boiled', 'will boil', 'would boil'], a: 'boils', c: ['boils'] },
  { t: 2, type: 'fill_blank', q: 'Modal of deduction: "It _______ rain later, so take an umbrella just in case." (might or must)', opts: [], a: 'might', c: ['may', 'could'] },
  { t: 2, type: 'true_false', q: '"Although" and "Even though" are used to express contrast.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
  { t: 2, type: 'multiple_choice', q: 'Which word connects reasons: "He stayed home _______ he was sick."', opts: ['because', 'although', 'despite', 'unless'], a: 'because', c: ['because'] },
  { t: 2, type: 'fill_blank', q: 'Question tag: "She can swim, _______ she?"', opts: [], a: "can't", c: ['cant'] },

  // ==========================================
  // THEME 3: IRREGULAR VERBS BOOTCAMP (25 Questions)
  // ==========================================
  { t: 3, type: 'multiple_choice', q: 'What is the past simple of the verb "TO BREAK"?', opts: ['Breaked', 'Broke', 'Broken', 'Broked'], a: 'Broke', c: ['broke'] },
  { t: 3, type: 'fill_blank', q: 'Fill in Past Participle: "She has _______ all her money." (spend)', opts: [], a: 'spent', c: ['spended'] },
  { t: 3, type: 'true_false', q: 'The three forms of the verb "PUT" are "put", "put", and "put".', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
  { t: 3, type: 'multiple_choice', q: 'What is the past participle of the verb "TO FLY"?', opts: ['Flew', 'Flown', 'Flyed', 'Flowed'], a: 'Flown', c: ['flown'] },
  { t: 3, type: 'fill_blank', q: 'Past simple: "Last week, she _______ a letter to her grandmother." (write)', opts: [], a: 'wrote', c: ['writed'] },
  { t: 3, type: 'multiple_choice', q: 'What is the past simple of the verb "TO CATCH"?', opts: ['Catched', 'Caught', 'Cought', 'Cotched'], a: 'Caught', c: ['caught'] },
  { t: 3, type: 'fill_blank', q: 'Past participle: "He has _______ across the river twice." (swim)', opts: [], a: 'swum', c: ['swam'] },
  { t: 3, type: 'true_false', q: 'The past simple of "teach" is "teached".', opts: ['True', 'False'], a: 'False', c: ['f', 'no'] },
  { t: 3, type: 'multiple_choice', q: 'What is the past simple of "TO DRIVE"?', opts: ['Drived', 'Drove', 'Driven', 'Droven'], a: 'Drove', c: ['drove'] },
  { t: 3, type: 'fill_blank', q: 'Past participle: "Have you _______ my keys anywhere?" (see)', opts: [], a: 'seen', c: ['saw'] },
  { t: 3, type: 'multiple_choice', q: 'Past simple of "TO CHOOSE":', opts: ['Choosed', 'Chose', 'Chosen', 'Chase'], a: 'Chose', c: ['chose'] },
  { t: 3, type: 'fill_blank', q: 'Past simple: "The birds _______ south for the winter." (fly)', opts: [], a: 'flew', c: ['flyed'] },
  { t: 3, type: 'true_false', q: 'The past participle of "begin" is "begun".', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
  { t: 3, type: 'multiple_choice', q: 'Past simple of "TO BUY":', opts: ['Buyed', 'Bought', 'Brought', 'Boted'], a: 'Bought', c: ['bought'] },
  { t: 3, type: 'fill_blank', q: 'Past simple: "He _______ down on the sofa and fell asleep." (sit)', opts: [], a: 'sat', c: ['sitted'] },
  { t: 3, type: 'multiple_choice', q: 'Past participle of "TO SPEAK":', opts: ['Spoke', 'Spoken', 'Speaked', 'Spoked'], a: 'Spoken', c: ['spoken'] },
  { t: 3, type: 'fill_blank', q: 'Past simple: "She _______ the bell three times." (ring)', opts: [], a: 'rang', c: ['rung'] },
  { t: 3, type: 'true_false', q: 'The past simple of "cut" is "cutted".', opts: ['True', 'False'], a: 'False', c: ['f', 'no'] },
  { t: 3, type: 'multiple_choice', q: 'Past simple of "TO WEAR":', opts: ['Weared', 'Wore', 'Worn', 'Ware'], a: 'Wore', c: ['wore'] },
  { t: 3, type: 'fill_blank', q: 'Past participle: "I have _______ that car for five years." (drive)', opts: [], a: 'driven', c: ['drived'] },
  { t: 3, type: 'multiple_choice', q: 'Past simple of "TO RUN":', opts: ['Runned', 'Ran', 'Ron', 'Running'], a: 'Ran', c: ['ran'] },
  { t: 3, type: 'fill_blank', q: 'Past participle: "The glass was _______ by the cat." (break)', opts: [], a: 'broken', c: ['broked'] },
  { t: 3, type: 'true_false', q: 'The past tense of "bring" is "brought".', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
  { t: 3, type: 'multiple_choice', q: 'Past participle of "TO GIVE":', opts: ['Gave', 'Given', 'Gived', 'Gaven'], a: 'Given', c: ['given'] },
  { t: 3, type: 'fill_blank', q: 'Past simple: "We _______ the championship yesterday!" (win)', opts: [], a: 'won', c: ['winned'] },

  // ==========================================
  // THEME 4: CATS & DOGS ANIMAL IDIOMS (25 Questions)
  // ==========================================
  { t: 4, type: 'multiple_choice', q: 'Complete the idiom: "It is raining _______ and dogs outside!"', opts: ['birds', 'cats', 'frogs', 'horses'], a: 'cats', c: ['cat', 'cats'] },
  { t: 4, type: 'fill_blank', q: 'To accidentally reveal a secret: "Let the cat out of the _______."', opts: [], a: 'bag', c: ['box', 'sack'] },
  { t: 4, type: 'true_false', q: 'The phrase "barking up the wrong tree" means looking for answers in the completely wrong direction.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
  { t: 4, type: 'multiple_choice', q: 'When someone suddenly becomes shy or speechless, people say:', opts: ['Dog took your shoes?', 'Cat got your tongue?', 'Fish stole your voice?', 'Bird ate your words?'], a: 'Cat got your tongue?', c: ['cat got your tongue'] },
  { t: 4, type: 'fill_blank', q: 'A fiercely competitive environment: "It is a dog-_______-dog world out there!"', opts: [], a: 'eat', c: ['ate'] },
  { t: 4, type: 'multiple_choice', q: 'What does "TOP DOG" mean in an organization or team?', opts: ['The tallest person', 'The leader or most powerful person', 'The funniest member', 'The pet of the company'], a: 'The leader or most powerful person', c: ['leader', 'boss'] },
  { t: 4, type: 'fill_blank', q: 'Complete: "Curiosity killed the _______."', opts: [], a: 'cat', c: ['katt'] },
  { t: 4, type: 'true_false', q: 'A "copycat" is a machine used in offices to print documents.', opts: ['True', 'False'], a: 'False', c: ['f', 'no'] },
  { t: 4, type: 'multiple_choice', q: '"Every dog has its _______" means everyone will have good luck or success at some point.', opts: ['bone', 'day', 'bark', 'walk'], a: 'day', c: ['day'] },
  { t: 4, type: 'fill_blank', q: 'The person in a contest who is expected to lose is called the "under_______".', opts: [], a: 'dog', c: ['dogg'] },
  { t: 4, type: 'multiple_choice', q: 'When two people fight constantly, they are fighting like:', opts: ['Cat and dog', 'Mouse and cheese', 'Lion and tiger', 'Dog and wolf'], a: 'Cat and dog', c: ['cat and dog'] },
  { t: 4, type: 'fill_blank', q: 'A short nap during the afternoon is often called a "_______ nap".', opts: [], a: 'cat', c: ['kat'] },
  { t: 4, type: 'true_false', q: '"You can\'t teach an old dog new tricks" means it is difficult to change people\'s deeply set habits.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
  { t: 4, type: 'multiple_choice', q: 'If someone is in the "DOGHOUSE", what does it mean?', opts: ['They bought a dog', 'Someone is very angry at them for doing something wrong', 'They are living outside', 'They won a prize'], a: 'Someone is very angry at them for doing something wrong', c: ['in trouble'] },
  { t: 4, type: 'fill_blank', q: 'Complete: "Let sleeping dogs _______." (meaning: don\'t restart an old argument)', opts: [], a: 'lie', c: ['sleep'] },
  { t: 4, type: 'multiple_choice', q: '"Look what the cat dragged in!" is said when someone arrives looking:', opts: ['Super stylish', 'Messy, disheveled, or unexpectedly', 'Very rich', 'Angry'], a: 'Messy, disheveled, or unexpectedly', c: ['unexpectedly', 'messy'] },
  { t: 4, type: 'fill_blank', q: 'To play a game of pursuit where one tries to catch the other: "a game of cat and _______."', opts: [], a: 'mouse', c: ['mouze'] },
  { t: 4, type: 'true_false', q: 'In English folklore, cats are said to have 9 lives.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
  { t: 4, type: 'multiple_choice', q: 'What does "DOG TIRED" mean?', opts: ['Tired of having a dog', 'Extremely exhausted', 'Waking up early', 'Feeling sick'], a: 'Extremely exhausted', c: ['exhausted', 'very tired'] },
  { t: 4, type: 'fill_blank', q: 'Complete: "His bark is worse than his _______." (meaning: he sounds aggressive but isn\'t dangerous)', opts: [], a: 'bite', c: ['bytt'] },
  { t: 4, type: 'multiple_choice', q: 'A "CATCALL" in street slang refers to:', opts: ['Calling a stray kitten', 'An unwanted whistle or shout at someone in public', 'A telephone ringtone', 'A pet store advertisement'], a: 'An unwanted whistle or shout at someone in public', c: ['whistle'] },
  { t: 4, type: 'fill_blank', q: 'The hot, sultry, inactive days of mid-summer are called "the _______ days of summer".', opts: [], a: 'dog', c: ['dogg'] },
  { t: 4, type: 'true_false', q: 'To "put the cat among the pigeons" means to do something that causes huge trouble and panic.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
  { t: 4, type: 'multiple_choice', q: 'When a situation is an utter chaotic disaster, it is called a:', opts: ["Dog's dinner", "Cat's lunch", 'Puppy party', 'Kitty kitchen'], a: "Dog's dinner", c: ['dogs dinner'] },
  { t: 4, type: 'fill_blank', q: 'To move quietly and stealthily like a feline: to walk with "cat-like _______".', opts: [], a: 'tread', c: ['steps', 'feet'] },

  // ==========================================
  // THEME 5: SLANG & STREAMER TALK (20 Questions)
  // ==========================================
  { t: 5, type: 'multiple_choice', q: 'What does "NO CAP" mean?', opts: ['No hat allowed', 'For real / 100% truth', 'I have no money', 'Not interested'], a: 'For real / 100% truth', c: ['for real', 'telling the truth'] },
  { t: 5, type: 'fill_blank', q: 'Complete: "He has so much natural charm with girls, he has infinite _______."', opts: [], a: 'rizz', c: ['riz', 'rizzz'] },
  { t: 5, type: 'true_false', q: 'Sending just "K" in modern texting sounds enthusiastic and cheerful.', opts: ['True', 'False'], a: 'False', c: ['f', 'no'] },
  { t: 5, type: 'multiple_choice', q: '"Let him cook!" means:', opts: ['Make dinner', 'Give him space to show his skill', 'Turn on the oven', 'He burned the food'], a: 'Give him space to show his skill', c: ['let him do his thing'] },
  { t: 5, type: 'fill_blank', q: 'What does GOAT stand for? "Greatest Of All _______."', opts: [], a: 'Time', c: ['times'] },
  { t: 5, type: 'multiple_choice', q: 'If someone calls a movie "MID", what do they think of it?', opts: ['Masterpiece', 'Average / Mediocre', 'Horrible', 'Too long'], a: 'Average / Mediocre', c: ['average', 'mediocre'] },
  { t: 5, type: 'fill_blank', q: 'When an imposter acts suspicious, they are being "_______".', opts: [], a: 'sus', c: ['suss'] },
  { t: 5, type: 'true_false', q: 'In slang, "BET" can mean "Yes / Deal / Absolutely".', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
  { t: 5, type: 'multiple_choice', q: 'What does "SPILL THE TEA" mean?', opts: ['Clean up tea', 'Share the juicy gossip', 'Order a hot drink', 'Calm down'], a: 'Share the juicy gossip', c: ['share gossip'] },
  { t: 5, type: 'fill_blank', q: 'When someone suddenly stops replying to all messages, they _______ you.', opts: [], a: 'ghosted', c: ['ghost'] },
  { t: 5, type: 'multiple_choice', q: 'What is a "GIGACHAD" in internet culture?', opts: ['A terrible gamer', 'The ultimate confident, cool and respectful male', 'A boring person', 'A chat bot'], a: 'The ultimate confident, cool and respectful male', c: ['chad'] },
  { t: 5, type: 'fill_blank', q: 'When you take a victory or succeed, people say: "Big _______!" (W or L)', opts: [], a: 'W', c: ['win', 'dub'] },
  { t: 5, type: 'true_false', q: 'To "flex" in modern slang means to show off your wealth, style, or skills.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
  { t: 5, type: 'multiple_choice', q: 'What does "CRINGE" mean?', opts: ['Extremely funny', 'Embarrassing / Awkward to watch', 'Exciting', 'Delicious'], a: 'Embarrassing / Awkward to watch', c: ['embarrassing'] },
  { t: 5, type: 'fill_blank', q: 'When someone changes their appearance and becomes way more attractive: a "_______ up".', opts: [], a: 'glow', c: ['glo'] },
  { t: 5, type: 'multiple_choice', q: 'If someone is doing way too much for their crush with no self-respect, they are a:', opts: ['King', 'Simp', 'Chef', 'Captain'], a: 'Simp', c: ['simp'] },
  { t: 5, type: 'fill_blank', q: 'Opposite of a Win in gaming/life: taking an _______. (W or L)', opts: [], a: 'L', c: ['loss'] },
  { t: 5, type: 'true_false', q: '"Sheesh" is used to express admiration, surprise, or hype.', opts: ['True', 'False'], a: 'True', c: ['t', 'yes'] },
  { t: 5, type: 'multiple_choice', q: '"Living rent-free in your head" means:', opts: ['Staying in an apartment for free', "You can't stop obsessively thinking about something", 'Forgetting everything', 'Having no thoughts'], a: "You can't stop obsessively thinking about something", c: ['thinking obsessively'] },
  { t: 5, type: 'fill_blank', q: 'A powerful, game-changing move or play is called a "_______ IQ play".', opts: [], a: '200', c: ['big', '300'] },

  // ==========================================
  // THEME 6: TRICKY IDIOMS & FALSE FRIENDS (20 Questions)
  // ==========================================
  { t: 6, type: 'multiple_choice', q: '"Break a leg!" means:', opts: ['Fall down', 'Good luck!', 'Hurry up', 'Sit down'], a: 'Good luck!', c: ['good luck'] },
  { t: 6, type: 'fill_blank', q: 'Complete false friend: "I thought he was French, but _______ he is Canadian!" (meaning: in reality)', opts: [], a: 'actually', c: ['in reality'] },
  { t: 6, type: 'true_false', q: 'In English, "sensible" means emotionally sensitive.', opts: ['True', 'False'], a: 'False', c: ['f', 'no'] },
  { t: 6, type: 'multiple_choice', q: '"A piece of cake" describes:', opts: ['A sweet dessert', 'Something very easy', 'A big problem', 'A reward'], a: 'Something very easy', c: ['very easy'] },
  { t: 6, type: 'fill_blank', q: 'Facing a tough reality with courage is to "bite the _______".', opts: [], a: 'bullet', c: ['bulet'] },
  { t: 6, type: 'multiple_choice', q: 'When you get "COLD FEET" before an event:', opts: ['You are freezing', 'You suddenly get nervous and hesitate', 'You dance well', 'Your shoes are wet'], a: 'You suddenly get nervous and hesitate', c: ['nervous'] },
  { t: 6, type: 'fill_blank', q: 'Complete: "Once in a _______ moon."', opts: [], a: 'blue', c: ['bloo'] },
  { t: 6, type: 'true_false', q: 'The English word "eventually" means "perhaps / possibly".', opts: ['True', 'False'], a: 'False', c: ['f', 'no'] },
  { t: 6, type: 'multiple_choice', q: 'To accidentally reveal a secret: you "spilled the _______".', opts: ['milk', 'beans', 'tea', 'soup'], a: 'beans', c: ['beans', 'tea'] },
  { t: 6, type: 'fill_blank', q: 'False friend: In English, a "library" is a place to borrow books, but to BUY books you go to a _______.', opts: [], a: 'bookshop', c: ['bookstore'] },
  { t: 6, type: 'multiple_choice', q: '"Cost an arm and a leg" means:', opts: ['Injuring yourself', 'Extremely expensive', 'Cheap discount', 'Easy to buy'], a: 'Extremely expensive', c: ['expensive'] },
  { t: 6, type: 'fill_blank', q: 'To judge someone without knowing them: "Don\'t judge a book by its _______."', opts: [], a: 'cover', c: ['title'] },
  { t: 6, type: 'true_false', q: '"To attend a meeting" means to wait for the meeting to start.', opts: ['True', 'False'], a: 'False', c: ['f', 'no'] },
  { t: 6, type: 'multiple_choice', q: 'What does "Under the weather" mean?', opts: ['Standing in the rain', 'Feeling slightly sick or unwell', 'Enjoying the sunshine', 'Traveling by plane'], a: 'Feeling slightly sick or unwell', c: ['sick', 'unwell'] },
  { t: 6, type: 'fill_blank', q: 'Complete: "Hit the nail on the _______." (meaning: exactly right)', opts: [], a: 'head', c: ['hed'] },
  { t: 6, type: 'multiple_choice', q: '"Burn the midnight oil" means:', opts: ['Setting fire to oil', 'Working or studying late into the night', 'Wasting energy', 'Cooking dinner'], a: 'Working or studying late into the night', c: ['working late'] },
  { t: 6, type: 'fill_blank', q: 'Complete: "Better _______ than never."', opts: [], a: 'late', c: ['layte'] },
  { t: 6, type: 'true_false', q: 'In English, "deception" means being disappointed by someone.', opts: ['True', 'False'], a: 'False', c: ['f', 'no'] },
  { t: 6, type: 'multiple_choice', q: '"See eye to eye" with someone means:', opts: ['Having a stare contest', 'Agreeing with them', 'Fighting with them', 'Wearing glasses'], a: 'Agreeing with them', c: ['agreeing'] },
  { t: 6, type: 'fill_blank', q: 'To give up: to "throw in the _______."', opts: [], a: 'towel', c: ['sponge'] }
];

console.log('Total questions to insert:', exercises.length);

let sql = '\n-- INSERT EXERCISES (140 QUESTIONS)\nINSERT INTO exercises (theme_id, question_type, question_text, options_json, correct_answer, close_answers_json) VALUES\n';

sql += exercises.map(e => {
  const qClean = e.q.replace(/'/g, "''");
  const aClean = e.a.replace(/'/g, "''");
  const optsJson = JSON.stringify(e.opts).replace(/'/g, "''");
  const closeJson = JSON.stringify(e.c).replace(/'/g, "''");
  return `(${e.t}, '${e.type}', '${qClean}', '${optsJson}'::jsonb, '${aClean}', '${closeJson}'::jsonb)`;
}).join(',\n') + ';\n';

sql += `
-- DEMO USERS
INSERT INTO users (username, email, password_hash, total_score) VALUES
('MemeMaster', 'player@baamboozle.test', '$2a$10$wT8K.4rT4i7/d9YJb6Kz1eO8aL.qP/Mh4X2gO.5P0zZqU3F0KxNre', 2500),
('QuizWizard', 'wizard@baamboozle.test', '$2a$10$wT8K.4rT4i7/d9YJb6Kz1eO8aL.qP/Mh4X2gO.5P0zZqU3F0KxNre', 1800);

-- DEMO SCORES
INSERT INTO scores (user_id, theme_id, score) VALUES
(1, 1, 2000),
(1, 4, 1800),
(2, 3, 1500);
`;

fs.appendFileSync('schema.sql', sql);
console.log('Appended 140 questions successfully to schema.sql!');

// Now run the full schema.sql in PostgreSQL
const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

async function runPg() {
  const fullSql = fs.readFileSync('schema.sql', 'utf8');
  await pool.query(fullSql);
  const themesCount = await pool.query('SELECT COUNT(*)::int as c FROM themes');
  const exCount = await pool.query('SELECT COUNT(*)::int as c FROM exercises');
  console.log(`✅ POSTGRESQL UPDATED! ${themesCount.rows[0].c} Themes and ${exCount.rows[0].c} Questions loaded!`);
  process.exit(0);
}
runPg();
