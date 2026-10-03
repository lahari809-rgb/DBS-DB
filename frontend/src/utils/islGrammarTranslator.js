/**
 * Continuous ISL Gloss to Natural English Grammar Translation Engine
 * Translates rolling sequences into natural, grammatically fluent English sentences.
 */

const SEQUENCE_EXACT_RULES = {
  "I,GO,SCHOOL,TOMORROW": "I will go to school tomorrow.",
  "I,GO,COLLEGE,TOMORROW": "I will go to college tomorrow.",
  "I,GO,SCHOOL": "I am going to school.",
  "I,GO,COLLEGE": "I am going to college.",
  "I,GO,HOME": "I am going home.",
  "I,GO,HOSPITAL": "I need to go to the hospital.",
  "I,GO,OFFICE": "I am going to the office.",
  "I,GO,SHOP": "I am going to the shop.",
  "I,GO,MARKET": "I am going to the market.",
  "I,GO,BANK": "I am going to the bank.",
  "I,NEED,HELP": "I need help.",
  "YOU,NEED,HELP": "Do you need help?",
  "WHERE,HOSPITAL": "Where is the hospital?",
  "HOSPITAL,WHERE": "Where is the hospital?",
  "WHERE,BUS_STOP": "Where is the bus stop?",
  "BUS_STOP,WHERE": "Where is the bus stop?",
  "WHERE,RAILWAY_STATION": "Where is the railway station?",
  "WHERE,AIRPORT": "Where is the airport?",
  "WHERE,SCHOOL": "Where is the school?",
  "WHERE,TOILET": "Where is the restroom?",
  "WHERE,BANK": "Where is the bank?",
  "I,HUNGRY,NEED,FOOD": "I am hungry and I need food.",
  "I,HUNGRY": "I am hungry.",
  "I,THIRSTY,WANT,WATER": "I am thirsty and I want water.",
  "I,THIRSTY": "I am thirsty.",
  "I,TIRED,WANT,SLEEP": "I am tired and want to sleep.",
  "I,TIRED": "I am feeling tired.",
  "I,SICK,NEED,DOCTOR": "I am sick and need a doctor.",
  "I,SICK,NEED,MEDICINE": "I am sick and need medicine.",
  "MY,NAME,LAHARI,STUDENT": "Hello, my name is Lahari. I am a student.",
  "MY,NAME,RAVI": "My name is Ravi.",
  "YOUR,NAME,WHAT": "What is your name?",
  "NAME,WHAT": "What is your name?",
  "TIME,WHAT": "What is the time?",
  "WHAT,TIME": "What is the time?",
  "MOTHER,COOK,FOOD": "Mother is cooking food.",
  "FATHER,WORK,OFFICE": "Father is working in the office.",
  "TEACHER,TEACH,STUDENT": "The teacher is teaching the student.",
  "STUDENT,STUDY,BOOK": "The student is studying a book.",
  "I,DRINK,TEA": "I am drinking tea.",
  "I,DRINK,COFFEE": "I am drinking coffee.",
  "I,DRINK,WATER": "I am drinking water.",
  "I,EAT,FOOD": "I am eating food.",
  "I,EAT,RICE": "I am eating rice.",
  "I,EAT,FRUIT": "I am eating fruit.",
  "I,BUY,BOOK": "I am buying a book.",
  "I,LIKE,AI": "I like Artificial Intelligence.",
  "I,LIKE,COMPUTER": "I like computers.",
  "I,UNDERSTAND": "I understand.",
  "I,DONT_UNDERSTAND": "I do not understand.",
  "I,KNOW": "I know.",
  "I,DONT_KNOW": "I do not know.",
  "PLEASE,HELP": "Please help me.",
  "THANK_YOU,FRIEND": "Thank you, my friend."
};

/**
 * Translates an array of signs into natural English
 */
export function translateISLSequenceToEnglish(signs) {
  if (!signs || signs.length === 0) return '';

  const cleanSigns = signs
    .map(s => (typeof s === 'string' ? s : s.label || s.id || '').toUpperCase().trim().replace(/ /g, '_'))
    .filter(s => s && s !== 'BLANK' && s !== 'UNKNOWN' && s !== 'GESTURE_DETECTED');

  if (cleanSigns.length === 0) return '';

  const key = cleanSigns.join(',');

  // 1. Direct sequence match
  if (SEQUENCE_EXACT_RULES[key]) {
    return SEQUENCE_EXACT_RULES[key];
  }

  // 2. Sub-pattern lookup
  for (let len = cleanSigns.length - 1; len >= 2; len--) {
    const subKey = cleanSigns.slice(0, len).join(',');
    if (SEQUENCE_EXACT_RULES[subKey]) {
      const base = SEQUENCE_EXACT_RULES[subKey].replace(/\.$/, '');
      const tail = cleanSigns.slice(len).map(s => s.replace(/_/g, ' ').toLowerCase()).join(' ');
      return `${base} ${tail}.`;
    }
  }

  // 3. Questions
  if (cleanSigns.includes('WHERE')) {
    const targets = cleanSigns.filter(s => s !== 'WHERE').map(s => s.replace(/_/g, ' ').toLowerCase());
    if (targets.length > 0) {
      return `Where is the ${targets.join(' ')}?`;
    }
    return 'Where is it?';
  }

  if (cleanSigns.includes('WHAT')) {
    if (cleanSigns.includes('TIME')) {
      return 'What is the time?';
    }
    if (cleanSigns.includes('NAME') && cleanSigns.includes('YOUR')) {
      return 'What is your name?';
    }
    const targets = cleanSigns.filter(s => s !== 'WHAT').map(s => s.replace(/_/g, ' ').toLowerCase());
    return `What is ${targets.join(' ')}?`;
  }

  // 4. Future tense with TOMORROW
  if (cleanSigns.includes('TOMORROW')) {
    const filtered = cleanSigns.filter(s => s !== 'TOMORROW');
    const words = filtered.map(s => s.replace(/_/g, ' ').toLowerCase());
    if (words[0] === 'i' && words.includes('go')) {
      const idx = words.indexOf('go');
      const dest = words.slice(idx + 1).join(' ');
      return `I will go to ${dest || 'there'} tomorrow.`;
    }
  }

  // 5. Feelings
  const feelings = ["HAPPY", "SAD", "ANGRY", "AFRAID", "EXCITED", "TIRED", "BORED", "CONFUSED", "SURPRISED", "WORRIED", "SICK", "HEALTHY", "HUNGRY", "THIRSTY"];
  if (cleanSigns.length === 2 && cleanSigns[0] === 'I' && feelings.includes(cleanSigns[1])) {
    return `I am ${cleanSigns[1].toLowerCase()}.`;
  }

  // 6. Generic assembly with natural formatting
  const words = [];
  for (const s of cleanSigns) {
    if (s === 'I') words.push('I');
    else if (s === 'YOU') words.push('you');
    else if (s === 'GO') words.push(words.length > 0 && words[0] === 'I' ? 'am going to' : 'go to');
    else if (s === 'EAT') words.push(words.length > 0 && words[0] === 'I' ? 'am eating' : 'eat');
    else if (s === 'DRINK') words.push(words.length > 0 && words[0] === 'I' ? 'am drinking' : 'drink');
    else words.push(s.replace(/_/g, ' ').toLowerCase());
  }

  let text = words.join(' ');
  text = text.replace(/to to/g, 'to');
  text = text.trim();
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
    if (!['.', '?', '!'].includes(text.charAt(text.length - 1))) {
      text += '.';
    }
  }

  return text;
}
