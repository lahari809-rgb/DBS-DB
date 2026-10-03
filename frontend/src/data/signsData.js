/**
 * INDIAN SIGN LANGUAGE (ISL) – 56 CLASSES SPECIFICATION
 * 1. ALPHABET (26): A - Z
 * 2. NUMBERS (10): 0 - 9
 * 3. BASIC ISL SIGNS (20): HELLO, THANK_YOU, PLEASE, SORRY, YES, NO, HELP, STOP, WAIT, I, YOU, WHAT, WHERE, GO, COME, EAT, DRINK, SLEEP, HOME, SCHOOL
 * TOTAL: 56 Classes
 */

export const ISL_VOCABULARY_CATEGORIES = [
  "Alphabet",
  "Numbers",
  "Basic ISL Signs"
];

const generateAlphabetSigns = () => {
  const list = [];
  for (let i = 65; i <= 90; i++) {
    const char = String.fromCharCode(i);
    list.push({
      id: `alpha_${char.toLowerCase()}`,
      label: char,
      shortName: `${char}`,
      category: "Alphabet",
      level: 1,
      meaning: `Letter ${char} - ISL Fingerspelling`,
      actionSummary: `Official ISL fingerspelling for letter ${char}`,
      emoji: '🔤',
      description: `Official Indian Sign Language fingerspelling formation for letter ${char}.`
    });
  }
  return list;
};

const generateNumberSigns = () => {
  const numbersData = [
    { num: "0", text: "Zero" },
    { num: "1", text: "One" },
    { num: "2", text: "Two" },
    { num: "3", text: "Three" },
    { num: "4", text: "Four" },
    { num: "5", text: "Five" },
    { num: "6", text: "Six" },
    { num: "7", text: "Seven" },
    { num: "8", text: "Eight" },
    { num: "9", text: "Nine" }
  ];
  return numbersData.map(item => ({
    id: `num_${item.num}`,
    label: item.num,
    shortName: `${item.num}`,
    category: "Numbers",
    level: 2,
    meaning: `Number ${item.text}`,
    actionSummary: `ISL numerical sign for ${item.text}`,
    emoji: '🔢',
    description: `Standard Indian Sign Language counting handshape for number ${item.num}.`
  }));
};

const basicSignsData = [
  { id: "basic_hello", label: "HELLO", shortName: "HELLO", meaning: "Greeting", emoji: "👋", actionSummary: "Open palm salute outward from forehead/temple" },
  { id: "basic_thank_you", label: "THANK_YOU", shortName: "THANK_YOU", meaning: "Gratitude", emoji: "🙏", actionSummary: "Fingertips from chin move forward and down" },
  { id: "basic_please", label: "PLEASE", shortName: "PLEASE", meaning: "Polite request", emoji: "🤲", actionSummary: "Open flat palm circular rub over chest" },
  { id: "basic_sorry", label: "SORRY", shortName: "SORRY", meaning: "Apology", emoji: "🙇", actionSummary: "Closed fist circular rub over center of chest" },
  { id: "basic_yes", label: "YES", shortName: "YES", meaning: "Affirmation", emoji: "👍", actionSummary: "Closed fist nodding up and down like a head" },
  { id: "basic_no", label: "NO", shortName: "NO", meaning: "Negation", emoji: "👎", actionSummary: "Index and middle tap thumb like snapping beak" },
  { id: "basic_help", label: "HELP", shortName: "HELP", meaning: "Assistance", emoji: "🆘", actionSummary: "Thumbs up fist on flat base palm lifted upward" },
  { id: "basic_stop", label: "STOP", shortName: "STOP", meaning: "Cease action", emoji: "🛑", actionSummary: "Dominant vertical open palm chops onto flat base palm" },
  { id: "basic_wait", label: "WAIT", shortName: "WAIT", meaning: "Pause", emoji: "⏳", actionSummary: "Palms upward with fingers wiggling gently" },
  { id: "basic_i", label: "I", shortName: "I", meaning: "Self / Me", emoji: "👉", actionSummary: "Index finger pointing directly to self / chest" },
  { id: "basic_you", label: "YOU", shortName: "YOU", meaning: "Partner / You", emoji: "👉", actionSummary: "Index finger pointing directly outward" },
  { id: "basic_what", label: "WHAT", shortName: "WHAT", meaning: "Inquiry", emoji: "❓", actionSummary: "Both open hands palms up shaking side to side" },
  { id: "basic_where", label: "WHERE", shortName: "WHERE", meaning: "Location inquiry", emoji: "📍", actionSummary: "Index finger extended upright, waving side to side" },
  { id: "basic_go", label: "GO", shortName: "GO", meaning: "Depart", emoji: "➡️", actionSummary: "Index fingers point forward and flick away in an arc" },
  { id: "basic_come", label: "COME", shortName: "COME", meaning: "Approach", emoji: "⬅️", actionSummary: "Index fingers point outward and curl inward" },
  { id: "basic_eat", label: "EAT", shortName: "EAT", meaning: "Consume food", emoji: "🍽️", actionSummary: "Bunched fingertips brought to mouth repeatedly" },
  { id: "basic_drink", label: "DRINK", shortName: "DRINK", meaning: "Consume beverage", emoji: "🥤", actionSummary: "C-hand tipped toward mouth like a cup" },
  { id: "basic_sleep", label: "SLEEP", shortName: "SLEEP", meaning: "Rest", emoji: "😴", actionSummary: "Both palms together under tilted cheek" },
  { id: "basic_home", label: "HOME", shortName: "HOME", meaning: "Residence", emoji: "🏡", actionSummary: "Bunched fingertips touch mouth then cheek" },
  { id: "basic_school", label: "SCHOOL", shortName: "SCHOOL", meaning: "School", emoji: "🏫", actionSummary: "Horizontal flat open palms clap together twice" }
].map(s => ({ ...s, category: "Basic ISL Signs", level: 3, description: `Official Indian Sign Language sign for ${s.label}.` }));

export const COMPREHENSIVE_SIGNS = [
  ...generateAlphabetSigns(),
  ...generateNumberSigns(),
  ...basicSignsData
];

export const CONTINUOUS_SEQUENCE_PRESETS = [
  { id: "seq_1", title: "Greeting", category: "Basic", sequence: ["HELLO"], english: "Hello" },
  { id: "seq_2", title: "Gratitude", category: "Basic", sequence: ["THANK_YOU"], english: "Thank you" },
  { id: "seq_3", title: "School Location", category: "Basic", sequence: ["SCHOOL"], english: "School" }
];
