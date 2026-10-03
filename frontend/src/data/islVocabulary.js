/**
 * ISL (Indian Sign Language) Vocabulary Database
 * 
 * Categories: Pronouns, Questions, Actions, Places, People, Objects, Feelings, Responses
 * Levels: 1 (Alphabet), 2 (Numbers), 3 (Basic ~100), 4 (Daily ~500), 5 (Continuous Sentences)
 */

export const ISL_SIGNS = [
  // ─── PRONOUNS ───
  { id: 'isl_i', label: 'I', category: 'Pronouns', level: 3, meaning: 'Self / Me', emoji: '👤', gesture: 'Point index finger at own chest', speech: 'I' },
  { id: 'isl_you', label: 'YOU', category: 'Pronouns', level: 3, meaning: 'Second person', emoji: '👉', gesture: 'Point index finger outward toward the other person', speech: 'you' },
  { id: 'isl_he', label: 'HE', category: 'Pronouns', level: 3, meaning: 'Male third person', emoji: '👨', gesture: 'Point index finger to the side (male context)', speech: 'he' },
  { id: 'isl_she', label: 'SHE', category: 'Pronouns', level: 3, meaning: 'Female third person', emoji: '👩', gesture: 'Point index finger to the side (female context)', speech: 'she' },
  { id: 'isl_we', label: 'WE', category: 'Pronouns', level: 3, meaning: 'First person plural', emoji: '👥', gesture: 'Circular pointing motion between self and others', speech: 'we' },
  { id: 'isl_they', label: 'THEY', category: 'Pronouns', level: 3, meaning: 'Third person plural', emoji: '👥', gesture: 'Sweep point outward across multiple people', speech: 'they' },
  { id: 'isl_my', label: 'MY', category: 'Pronouns', level: 3, meaning: 'Possessive first person', emoji: '🤚', gesture: 'Flat palm placed on chest', speech: 'my' },
  { id: 'isl_your', label: 'YOUR', category: 'Pronouns', level: 3, meaning: 'Possessive second person', emoji: '🖐️', gesture: 'Flat palm facing and pushing toward the other person', speech: 'your' },

  // ─── QUESTION WORDS ───
  { id: 'isl_name', label: 'NAME', category: 'Questions', level: 3, meaning: 'Name / identity', emoji: '📛', gesture: 'H-hand (index+middle extended) tap on other H-hand', speech: 'name' },
  { id: 'isl_what', label: 'WHAT', category: 'Questions', level: 3, meaning: 'What inquiry', emoji: '❓', gesture: 'Open palms up, shake side to side with questioning expression', speech: 'what' },
  { id: 'isl_who', label: 'WHO', category: 'Questions', level: 3, meaning: 'Person inquiry', emoji: '🔍', gesture: 'Index finger circles near lips', speech: 'who' },
  { id: 'isl_where', label: 'WHERE', category: 'Questions', level: 3, meaning: 'Location inquiry', emoji: '📍', gesture: 'Index finger extended, wag side to side', speech: 'where' },
  { id: 'isl_when', label: 'WHEN', category: 'Questions', level: 3, meaning: 'Time inquiry', emoji: '⏰', gesture: 'Circle index finger then point outward', speech: 'when' },
  { id: 'isl_why', label: 'WHY', category: 'Questions', level: 3, meaning: 'Reason inquiry', emoji: '🤔', gesture: 'Touch forehead with middle finger then pull away', speech: 'why' },
  { id: 'isl_how', label: 'HOW', category: 'Questions', level: 3, meaning: 'Method inquiry', emoji: '💡', gesture: 'Fists together, roll open to palms up', speech: 'how' },

  // ─── ACTION VERBS ───
  { id: 'isl_go', label: 'GO', category: 'Actions', level: 3, meaning: 'Move / depart', emoji: '➡️', gesture: 'Both index fingers point forward and arc away', speech: 'go' },
  { id: 'isl_come', label: 'COME', category: 'Actions', level: 3, meaning: 'Approach', emoji: '⬅️', gesture: 'Index fingers point outward then curl back inward', speech: 'come' },
  { id: 'isl_eat', label: 'EAT', category: 'Actions', level: 3, meaning: 'Consume food', emoji: '🍽️', gesture: 'Bunched fingertips tap toward mouth repeatedly', speech: 'eat' },
  { id: 'isl_drink', label: 'DRINK', category: 'Actions', level: 3, meaning: 'Consume liquid', emoji: '🥤', gesture: 'C-hand tilted toward mouth like a cup', speech: 'drink' },
  { id: 'isl_sleep', label: 'SLEEP', category: 'Actions', level: 3, meaning: 'Rest / sleep', emoji: '😴', gesture: 'Both flat palms together under tilted head', speech: 'sleep' },
  { id: 'isl_study', label: 'STUDY', category: 'Actions', level: 3, meaning: 'Study / learn', emoji: '📖', gesture: 'Open flat hand (book) with other hand wiggling fingers above', speech: 'study' },
  { id: 'isl_work', label: 'WORK', category: 'Actions', level: 3, meaning: 'Work / labor', emoji: '💼', gesture: 'Fist taps on other fist repeatedly', speech: 'work' },
  { id: 'isl_read', label: 'READ', category: 'Actions', level: 3, meaning: 'Read text', emoji: '📚', gesture: 'V-hand moves across open palm like reading lines', speech: 'read' },
  { id: 'isl_write', label: 'WRITE', category: 'Actions', level: 3, meaning: 'Write', emoji: '✍️', gesture: 'Pinched hand mimes writing on flat open palm', speech: 'write' },
  { id: 'isl_speak', label: 'SPEAK', category: 'Actions', level: 3, meaning: 'Talk / speak', emoji: '🗣️', gesture: 'Four fingers tap thumb repeatedly near mouth', speech: 'speak' },
  { id: 'isl_help', label: 'HELP', category: 'Actions', level: 3, meaning: 'Assist', emoji: '🆘', gesture: 'Fist (thumbs up) placed on flat open base palm, lift upward', speech: 'help' },
  { id: 'isl_wait', label: 'WAIT', category: 'Actions', level: 3, meaning: 'Pause / wait', emoji: '⏳', gesture: 'Both open palms facing up, fingers wiggle gently', speech: 'wait' },
  { id: 'isl_want', label: 'WANT', category: 'Actions', level: 3, meaning: 'Desire', emoji: '🙏', gesture: 'Open palms facing up, pull toward chest while closing', speech: 'want' },
  { id: 'isl_need', label: 'NEED', category: 'Actions', level: 3, meaning: 'Require', emoji: '⚡', gesture: 'X-hand nods downward emphatically', speech: 'need' },
  { id: 'isl_like', label: 'LIKE', category: 'Actions', level: 3, meaning: 'Enjoy / prefer', emoji: '❤️', gesture: 'Open hand on chest, pull away closing into pinch', speech: 'like' },
  { id: 'isl_know', label: 'KNOW', category: 'Actions', level: 3, meaning: 'Knowledge', emoji: '🧠', gesture: 'Flat fingertips tap side of forehead', speech: 'know' },
  { id: 'isl_understand', label: 'UNDERSTAND', category: 'Actions', level: 3, meaning: 'Comprehend', emoji: '💡', gesture: 'Fist at forehead flicks open (index pops up)', speech: 'understand' },

  // ─── PLACES ───
  { id: 'isl_home', label: 'HOME', category: 'Places', level: 3, meaning: 'House / residence', emoji: '🏠', gesture: 'Bunched fingertips touch mouth then cheek', speech: 'home' },
  { id: 'isl_college', label: 'COLLEGE', category: 'Places', level: 4, meaning: 'College / university', emoji: '🎓', gesture: 'C-hand circles upward above flat palm', speech: 'college' },
  { id: 'isl_school', label: 'SCHOOL', category: 'Places', level: 3, meaning: 'School', emoji: '🏫', gesture: 'Flat open palms clap together twice', speech: 'school' },
  { id: 'isl_hospital', label: 'HOSPITAL', category: 'Places', level: 3, meaning: 'Hospital / clinic', emoji: '🏥', gesture: 'H-hand draws cross on upper arm', speech: 'hospital' },
  { id: 'isl_shop', label: 'SHOP', category: 'Places', level: 4, meaning: 'Store / market', emoji: '🛒', gesture: 'Both flat hands swipe outward from center', speech: 'shop' },
  { id: 'isl_office', label: 'OFFICE', category: 'Places', level: 4, meaning: 'Workplace', emoji: '🏢', gesture: 'O-hands build box shape in front', speech: 'office' },
  { id: 'isl_bus', label: 'BUS', category: 'Places', level: 4, meaning: 'Bus / transport', emoji: '🚌', gesture: 'Both fists mime holding and turning steering wheel', speech: 'bus' },

  // ─── PEOPLE ───
  { id: 'isl_friend', label: 'FRIEND', category: 'People', level: 3, meaning: 'Friend / companion', emoji: '🤝', gesture: 'Interlocked index fingers rotate', speech: 'friend' },
  { id: 'isl_teacher', label: 'TEACHER', category: 'People', level: 3, meaning: 'Instructor', emoji: '👩‍🏫', gesture: 'Both flat hands at temples push forward twice', speech: 'teacher' },
  { id: 'isl_mother', label: 'MOTHER', category: 'People', level: 3, meaning: 'Mom', emoji: '👩', gesture: 'Open 5-hand thumb taps chin', speech: 'mother' },
  { id: 'isl_father', label: 'FATHER', category: 'People', level: 3, meaning: 'Dad', emoji: '👨', gesture: 'Open 5-hand thumb taps forehead', speech: 'father' },

  // ─── OBJECTS / NOUNS ───
  { id: 'isl_food', label: 'FOOD', category: 'Objects', level: 3, meaning: 'Food / meal', emoji: '🍕', gesture: 'Bunched fingertips tap lips', speech: 'food' },
  { id: 'isl_water', label: 'WATER', category: 'Objects', level: 3, meaning: 'Water', emoji: '💧', gesture: 'W-hand taps chin/lips twice', speech: 'water' },
  { id: 'isl_money', label: 'MONEY', category: 'Objects', level: 4, meaning: 'Currency', emoji: '💰', gesture: 'Flat hand taps into other cupped palm', speech: 'money' },
  { id: 'isl_phone', label: 'PHONE', category: 'Objects', level: 4, meaning: 'Mobile phone', emoji: '📱', gesture: 'Y-hand (thumb+pinky) held at ear', speech: 'phone' },
  { id: 'isl_book', label: 'BOOK', category: 'Objects', level: 3, meaning: 'Book / text', emoji: '📕', gesture: 'Flat palms together, open like a book', speech: 'book' },
  { id: 'isl_medicine', label: 'MEDICINE', category: 'Objects', level: 4, meaning: 'Medicine / drugs', emoji: '💊', gesture: 'Middle finger circles on flat open palm', speech: 'medicine' },
  { id: 'isl_toilet', label: 'TOILET', category: 'Objects', level: 4, meaning: 'Restroom', emoji: '🚻', gesture: 'T-hand shakes side to side', speech: 'toilet' },
  { id: 'isl_emergency', label: 'EMERGENCY', category: 'Objects', level: 4, meaning: 'Urgent situation', emoji: '🚨', gesture: 'E-hand alternates on top of other fist (flashing)', speech: 'emergency' },
  { id: 'isl_pain', label: 'PAIN', category: 'Objects', level: 4, meaning: 'Physical pain', emoji: '🤕', gesture: 'Both index fingers point at each other, twist near affected area', speech: 'pain' },

  // ─── FEELINGS / STATES ───
  { id: 'isl_hungry', label: 'HUNGRY', category: 'Feelings', level: 3, meaning: 'Hunger', emoji: '😋', gesture: 'C-hand slides down from throat to stomach', speech: 'hungry' },
  { id: 'isl_thirsty', label: 'THIRSTY', category: 'Feelings', level: 3, meaning: 'Thirst', emoji: '🥵', gesture: 'Index finger traces down throat', speech: 'thirsty' },
  { id: 'isl_happy', label: 'HAPPY', category: 'Feelings', level: 3, meaning: 'Joy', emoji: '😊', gesture: 'Flat hand brushes up on chest repeatedly', speech: 'happy' },
  { id: 'isl_sad', label: 'SAD', category: 'Feelings', level: 3, meaning: 'Sorrow', emoji: '😢', gesture: 'Both open hands pull down over face', speech: 'sad' },
  { id: 'isl_tired', label: 'TIRED', category: 'Feelings', level: 3, meaning: 'Fatigue', emoji: '😫', gesture: 'Both bent hands at chest, fingertips touch then drop/rotate down', speech: 'tired' },
  { id: 'isl_sick', label: 'SICK', category: 'Feelings', level: 3, meaning: 'Illness', emoji: '🤒', gesture: 'Middle finger touches forehead + stomach with grimace', speech: 'sick' },

  // ─── RESPONSES ───
  { id: 'isl_yes', label: 'YES', category: 'Responses', level: 3, meaning: 'Affirmation', emoji: '👍', gesture: 'Closed fist nods up and down (like nodding head)', speech: 'yes' },
  { id: 'isl_no', label: 'NO', category: 'Responses', level: 3, meaning: 'Negation', emoji: '👎', gesture: 'Index + middle fingers snap against thumb (beak closing)', speech: 'no' },
  { id: 'isl_please', label: 'PLEASE', category: 'Responses', level: 3, meaning: 'Polite request', emoji: '🤲', gesture: 'Open flat palm circles on chest', speech: 'please' },
  { id: 'isl_thank_you', label: 'THANK_YOU', category: 'Responses', level: 3, meaning: 'Gratitude', emoji: '🙏', gesture: 'Flat hand from chin moves forward and down', speech: 'thank you' },
  { id: 'isl_stop', label: 'STOP', category: 'Responses', level: 3, meaning: 'Halt / cease', emoji: '🛑', gesture: 'Vertical open palm chops down onto horizontal flat palm', speech: 'stop' },
  { id: 'isl_blank', label: 'BLANK', category: 'System', level: 0, meaning: 'No sign / resting', emoji: '⬜', gesture: 'Neutral resting position', speech: '' },
];

export const ISL_CATEGORIES = [
  ...new Set(ISL_SIGNS.filter(s => s.category !== 'System').map(s => s.category))
];

export const ISL_LEVELS = [
  { level: 1, name: 'Alphabet', description: 'A–Z fingerspelling', count: 26 },
  { level: 2, name: 'Numbers', description: '0–100+', count: 10 },
  { level: 3, name: 'Basic Vocabulary', description: '~100 essential signs', count: ISL_SIGNS.filter(s => s.level === 3).length },
  { level: 4, name: 'Daily Vocabulary', description: '~500 common signs', count: ISL_SIGNS.filter(s => s.level === 4).length },
  { level: 5, name: 'Continuous Sentences', description: 'Full sentence translation', count: '∞' },
];

// Practice sentence sets
export const PRACTICE_SENTENCES = [
  { id: 'p1', english: 'I am going to school.', signs: ['I', 'GO', 'SCHOOL'], difficulty: 'easy' },
  { id: 'p2', english: 'Where is the hospital?', signs: ['WHERE', 'HOSPITAL'], difficulty: 'easy' },
  { id: 'p3', english: 'I need help.', signs: ['I', 'NEED', 'HELP'], difficulty: 'easy' },
  { id: 'p4', english: 'I am hungry.', signs: ['I', 'HUNGRY'], difficulty: 'easy' },
  { id: 'p5', english: 'I will go to college tomorrow.', signs: ['I', 'GO', 'COLLEGE'], difficulty: 'medium' },
  { id: 'p6', english: 'What is your name?', signs: ['YOUR', 'NAME', 'WHAT'], difficulty: 'medium' },
  { id: 'p7', english: 'I am thirsty, I want water.', signs: ['I', 'THIRSTY', 'WANT', 'WATER'], difficulty: 'medium' },
  { id: 'p8', english: 'Mother is cooking food.', signs: ['MOTHER', 'FOOD'], difficulty: 'medium' },
  { id: 'p9', english: 'I like to study.', signs: ['I', 'LIKE', 'STUDY'], difficulty: 'medium' },
  { id: 'p10', english: 'Please help me, I am sick.', signs: ['PLEASE', 'HELP', 'I', 'SICK'], difficulty: 'hard' },
  { id: 'p11', english: 'My friend is going home.', signs: ['MY', 'FRIEND', 'GO', 'HOME'], difficulty: 'hard' },
  { id: 'p12', english: 'The teacher is at school.', signs: ['TEACHER', 'SCHOOL'], difficulty: 'medium' },
];

export function getSignByLabel(label) {
  return ISL_SIGNS.find(s => s.label === label);
}

export function getSignsByCategory(category) {
  return ISL_SIGNS.filter(s => s.category === category);
}
