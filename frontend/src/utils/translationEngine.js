/**
 * ISL → English Translation Engine (Client-side)
 * Converts ISL sign sequences into natural English sentences.
 * Uses pattern matching, template synthesis, and grammar rules.
 */

// ── EXACT SEQUENCES ──
const EXACT_TRANSLATIONS = {
  'I|GO|SCHOOL': 'I am going to school.',
  'I|GO|SCHOOL|TOMORROW': 'I will go to school tomorrow.',
  'I|GO|COLLEGE': 'I am going to college.',
  'I|GO|COLLEGE|TOMORROW': 'I will go to college tomorrow.',
  'I|GO|HOME': 'I am going home.',
  'I|GO|HOSPITAL': 'I need to go to the hospital.',
  'I|GO|OFFICE': 'I am going to the office.',
  'I|GO|SHOP': 'I am going to the shop.',
  'I|NEED|HELP': 'I need help.',
  'YOU|NEED|HELP': 'Do you need help?',
  'PLEASE|HELP': 'Please help me.',
  'PLEASE|HELP|I': 'Please help me.',
  'WHERE|HOSPITAL': 'Where is the hospital?',
  'WHERE|SCHOOL': 'Where is the school?',
  'WHERE|HOME': 'Where is the house?',
  'WHERE|TOILET': 'Where is the restroom?',
  'WHERE|BUS': 'Where is the bus stop?',
  'WHERE|OFFICE': 'Where is the office?',
  'WHERE|SHOP': 'Where is the shop?',
  'YOUR|NAME|WHAT': 'What is your name?',
  'NAME|WHAT': 'What is your name?',
  'WHAT|NAME': 'What is your name?',
  'I|HUNGRY': 'I am hungry.',
  'I|HUNGRY|WANT|FOOD': 'I am hungry and I want food.',
  'I|HUNGRY|NEED|FOOD': 'I am hungry and I need food.',
  'I|THIRSTY': 'I am thirsty.',
  'I|THIRSTY|WANT|WATER': 'I am thirsty and I want water.',
  'I|THIRSTY|NEED|WATER': 'I am thirsty and I need water.',
  'I|TIRED': 'I am feeling tired.',
  'I|TIRED|WANT|SLEEP': 'I am tired and want to sleep.',
  'I|SICK': 'I am sick.',
  'I|SICK|NEED|HELP': 'I am sick and need help.',
  'I|SICK|NEED|MEDICINE': 'I am sick and need medicine.',
  'I|HAPPY': 'I am happy.',
  'I|SAD': 'I am sad.',
  'I|EAT|FOOD': 'I am eating food.',
  'I|DRINK|WATER': 'I am drinking water.',
  'I|STUDY': 'I am studying.',
  'I|STUDY|BOOK': 'I am studying a book.',
  'I|WORK': 'I am working.',
  'I|WORK|OFFICE': 'I am working at the office.',
  'I|READ|BOOK': 'I am reading a book.',
  'I|WRITE': 'I am writing.',
  'I|UNDERSTAND': 'I understand.',
  'I|KNOW': 'I know.',
  'I|LIKE|STUDY': 'I like to study.',
  'I|LIKE|FOOD': 'I like food.',
  'I|WANT|HELP': 'I want help.',
  'I|WANT|FOOD': 'I want food.',
  'I|WANT|WATER': 'I want water.',
  'I|WANT|SLEEP': 'I want to sleep.',
  'I|WANT|GO|HOME': 'I want to go home.',
  'I|PAIN': 'I am in pain.',
  'I|EMERGENCY': 'I have an emergency.',
  'MOTHER|FOOD': 'Mother is preparing food.',
  'FATHER|WORK|OFFICE': 'Father is working in the office.',
  'FATHER|WORK': 'Father is working.',
  'TEACHER|SCHOOL': 'The teacher is at school.',
  'FRIEND|GO|HOME': 'My friend is going home.',
  'MY|FRIEND|GO|HOME': 'My friend is going home.',
  'MY|NAME': 'My name is...',
  'THANK_YOU|HELP': 'Thank you for helping.',
  'THANK_YOU|FRIEND': 'Thank you, friend.',
  'YES|I|GO': 'Yes, I will go.',
  'NO|I|STOP': 'No, I will stop.',
  'HE|GO|SCHOOL': 'He is going to school.',
  'SHE|GO|SCHOOL': 'She is going to school.',
  'WE|GO|SCHOOL': 'We are going to school.',
  'THEY|GO|HOME': 'They are going home.',
  'I|SPEAK': 'I am speaking.',
  'YOU|UNDERSTAND': 'Do you understand?',
  'YOU|KNOW': 'Do you know?',
  'STOP|WAIT': 'Stop and wait.',
  'COME|HOME': 'Come home.',
  'I|COME|HOME': 'I am coming home.',
  'PLEASE|WAIT': 'Please wait.',
  'I|PHONE': 'I have a phone.',
  'I|NEED|MONEY': 'I need money.',
  'I|NEED|MEDICINE': 'I need medicine.',
  'I|NEED|TOILET': 'I need the restroom.',
  'WHERE|MONEY': 'Where is the money?',
  'WHEN|GO': 'When are you going?',
  'WHY|SAD': 'Why are you sad?',
  'HOW|HELP': 'How can I help?',
  'WHO|TEACHER': 'Who is the teacher?',
};

// ── FEELING WORDS ──
const FEELINGS = new Set([
  'HAPPY', 'SAD', 'TIRED', 'SICK', 'HUNGRY', 'THIRSTY',
  'PAIN', 'ANGRY', 'AFRAID', 'EXCITED', 'CONFUSED', 'WORRIED'
]);

// ── QUESTION WORDS ──
const QUESTION_WORDS = new Set(['WHAT', 'WHERE', 'WHEN', 'WHY', 'HOW', 'WHO']);

// ── PLACE WORDS ──
const PLACES = new Set(['HOME', 'SCHOOL', 'COLLEGE', 'HOSPITAL', 'SHOP', 'OFFICE', 'BUS', 'TOILET']);

// ── PRONOUNS THAT START SENTENCES ──
const SUBJECT_MAP = {
  'I': { present: 'am', past: 'was', verb_suffix: '' },
  'YOU': { present: 'are', past: 'were', verb_suffix: '' },
  'HE': { present: 'is', past: 'was', verb_suffix: 's' },
  'SHE': { present: 'is', past: 'was', verb_suffix: 's' },
  'WE': { present: 'are', past: 'were', verb_suffix: '' },
  'THEY': { present: 'are', past: 'were', verb_suffix: '' },
};

// ── ACTION VERBS ──
const VERB_MAP = {
  'GO': { gerund: 'going', base: 'go', past: 'went', preposition: 'to' },
  'COME': { gerund: 'coming', base: 'come', past: 'came', preposition: '' },
  'EAT': { gerund: 'eating', base: 'eat', past: 'ate', preposition: '' },
  'DRINK': { gerund: 'drinking', base: 'drink', past: 'drank', preposition: '' },
  'SLEEP': { gerund: 'sleeping', base: 'sleep', past: 'slept', preposition: '' },
  'STUDY': { gerund: 'studying', base: 'study', past: 'studied', preposition: '' },
  'WORK': { gerund: 'working', base: 'work', past: 'worked', preposition: 'at' },
  'READ': { gerund: 'reading', base: 'read', past: 'read', preposition: '' },
  'WRITE': { gerund: 'writing', base: 'write', past: 'wrote', preposition: '' },
  'SPEAK': { gerund: 'speaking', base: 'speak', past: 'spoke', preposition: '' },
  'HELP': { gerund: 'helping', base: 'help', past: 'helped', preposition: '' },
  'WAIT': { gerund: 'waiting', base: 'wait', past: 'waited', preposition: '' },
  'WANT': { gerund: 'wanting', base: 'want', past: 'wanted', preposition: '' },
  'NEED': { gerund: 'needing', base: 'need', past: 'needed', preposition: '' },
  'LIKE': { gerund: 'liking', base: 'like', past: 'liked', preposition: '' },
  'KNOW': { gerund: 'knowing', base: 'know', past: 'knew', preposition: '' },
  'UNDERSTAND': { gerund: 'understanding', base: 'understand', past: 'understood', preposition: '' },
  'STOP': { gerund: 'stopping', base: 'stop', past: 'stopped', preposition: '' },
};

/**
 * Clean raw sign tokens — remove duplicates, blanks, system tokens
 */
function cleanTokens(tokens) {
  const cleaned = [];
  let last = null;
  for (const t of tokens) {
    const upper = String(t).trim().toUpperCase().replace(/\s+/g, '_');
    if (!upper || upper === 'BLANK' || upper === 'UNKNOWN' || upper === 'GESTURE_DETECTED' || upper === 'ANALYZING...') continue;
    if (upper !== last) {
      cleaned.push(upper);
      last = upper;
    }
  }
  return cleaned;
}

/**
 * Main translation function
 */
export function translateSignSequence(signTokens) {
  const signs = cleanTokens(signTokens);

  if (signs.length === 0) {
    return {
      signs: [],
      translation: '',
      confidence: 0,
      isComplete: false,
    };
  }

  // 1) Exact match
  const key = signs.join('|');
  if (EXACT_TRANSLATIONS[key]) {
    return {
      signs,
      translation: EXACT_TRANSLATIONS[key],
      confidence: 0.97,
      isComplete: true,
    };
  }

  // 2) Try longest sub-sequence match
  for (let len = signs.length; len >= 2; len--) {
    const subKey = signs.slice(0, len).join('|');
    if (EXACT_TRANSLATIONS[subKey]) {
      const remainder = signs.slice(len);
      if (remainder.length === 0) {
        return { signs, translation: EXACT_TRANSLATIONS[subKey], confidence: 0.96, isComplete: true };
      }
      const remText = remainder.map(s => s.replace('_', ' ').toLowerCase()).join(' ');
      const base = EXACT_TRANSLATIONS[subKey].replace(/\.$/, '');
      return {
        signs,
        translation: `${base} ${remText}.`,
        confidence: 0.93,
        isComplete: true,
      };
    }
  }

  // 3) Grammar-based synthesis
  const translation = synthesize(signs);
  return {
    signs,
    translation,
    confidence: signs.length >= 2 ? 0.90 : 0.85,
    isComplete: signs.length >= 2,
  };
}

function synthesize(signs) {
  const words = [];
  let isQuestion = signs.some(s => QUESTION_WORDS.has(s));

  // Question patterns
  if (QUESTION_WORDS.has(signs[0])) {
    const qWord = signs[0].toLowerCase();
    const rest = signs.slice(1);

    if (signs[0] === 'WHERE') {
      const place = rest.map(s => s.replace('_', ' ').toLowerCase()).join(' ');
      return `Where is the ${place || 'place'}?`;
    }
    if (signs[0] === 'WHAT') {
      if (rest.includes('NAME') && rest.includes('YOUR')) return 'What is your name?';
      if (rest.includes('NAME')) return 'What is your name?';
      const obj = rest.map(s => s.replace('_', ' ').toLowerCase()).join(' ');
      return `What is ${obj || 'it'}?`;
    }
    if (signs[0] === 'WHO') {
      const obj = rest.map(s => s.replace('_', ' ').toLowerCase()).join(' ');
      return `Who is the ${obj || 'person'}?`;
    }
    if (signs[0] === 'WHEN') {
      const obj = rest.map(s => s.replace('_', ' ').toLowerCase()).join(' ');
      return `When ${obj ? 'is ' + obj : 'is it'}?`;
    }
    if (signs[0] === 'WHY') {
      const obj = rest.map(s => s.replace('_', ' ').toLowerCase()).join(' ');
      return `Why ${obj ? 'are you ' + obj : 'is that'}?`;
    }
    if (signs[0] === 'HOW') {
      const obj = rest.map(s => s.replace('_', ' ').toLowerCase()).join(' ');
      return `How ${obj ? 'can I ' + obj : 'is it'}?`;
    }
  }

  // Question at end (e.g., YOUR NAME WHAT)
  if (QUESTION_WORDS.has(signs[signs.length - 1])) {
    const qWord = signs[signs.length - 1];
    const rest = signs.slice(0, -1);
    if (qWord === 'WHAT') {
      const obj = rest.map(s => s.replace('_', ' ').toLowerCase()).join(' ');
      return `What is ${obj}?`;
    }
  }

  // Subject + Feeling pattern
  const subjectInfo = SUBJECT_MAP[signs[0]];
  if (subjectInfo && signs.length >= 2 && FEELINGS.has(signs[1])) {
    const feeling = signs[1].replace('_', ' ').toLowerCase();
    const rest = signs.slice(2);
    let sentence = `${signs[0] === 'I' ? 'I' : signs[0].charAt(0) + signs[0].slice(1).toLowerCase()} ${subjectInfo.present} ${feeling}`;
    if (rest.length > 0) {
      const restWords = rest.map(s => s.replace('_', ' ').toLowerCase());
      sentence += ` and ${restWords.join(' ')}`;
    }
    return sentence + '.';
  }

  // Subject + Verb + Object pattern
  if (subjectInfo && signs.length >= 2 && VERB_MAP[signs[1]]) {
    const subject = signs[0] === 'I' ? 'I' : signs[0].charAt(0) + signs[0].slice(1).toLowerCase();
    const verb = VERB_MAP[signs[1]];
    const objects = signs.slice(2);

    // Check for TOMORROW → future tense
    const hasTomorrow = objects.includes('TOMORROW');
    const filteredObjs = objects.filter(o => o !== 'TOMORROW');

    let objStr = filteredObjs.map(o => {
      if (PLACES.has(o)) return (verb.preposition ? verb.preposition + ' ' : 'to ') + o.replace('_', ' ').toLowerCase();
      return o.replace('_', ' ').toLowerCase();
    }).join(' ');

    if (hasTomorrow) {
      return `${subject} will ${verb.base} ${objStr} tomorrow.`.replace(/\s+/g, ' ').trim();
    }

    // Present continuous for YOU → question form
    if (signs[0] === 'YOU') {
      return `Are you ${verb.gerund} ${objStr}?`.replace(/\s+/g, ' ').trim();
    }

    return `${subject} ${subjectInfo.present} ${verb.gerund} ${objStr}.`.replace(/\s+/g, ' ').trim();
  }

  // Subject + WANT/NEED + verb/object
  if (subjectInfo && signs.length >= 3 && (signs[1] === 'WANT' || signs[1] === 'NEED')) {
    const subject = signs[0] === 'I' ? 'I' : signs[0].charAt(0) + signs[0].slice(1).toLowerCase();
    const modal = signs[1].toLowerCase();
    const rest = signs.slice(2);

    if (rest.length > 0 && VERB_MAP[rest[0]]) {
      const verb = VERB_MAP[rest[0]];
      const objs = rest.slice(1).map(o => o.replace('_', ' ').toLowerCase()).join(' ');
      return `${subject} ${modal} to ${verb.base} ${objs}.`.replace(/\s+/g, ' ').trim();
    }

    const objs = rest.map(o => o.replace('_', ' ').toLowerCase()).join(' ');
    return `${subject} ${modal}${signs[1] === 'NEED' ? 's' : ''} ${objs}.`.replace(/\s+/g, ' ').trim();
  }

  // Single sign
  if (signs.length === 1) {
    const s = signs[0];
    if (s === 'YES') return 'Yes.';
    if (s === 'NO') return 'No.';
    if (s === 'PLEASE') return 'Please.';
    if (s === 'THANK_YOU') return 'Thank you.';
    if (s === 'STOP') return 'Stop.';
    if (s === 'HELP') return 'Help!';
    if (s === 'EMERGENCY') return 'Emergency!';
    if (FEELINGS.has(s)) return `I am ${s.toLowerCase()}.`;
    return s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1).toLowerCase() + '.';
  }

  // Fallback: concatenate with basic grammar
  const fallbackWords = signs.map((s, i) => {
    if (s === 'I') return 'I';
    if (i === 0) return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase().replace('_', ' ');
    return s.toLowerCase().replace('_', ' ');
  });
  let text = fallbackWords.join(' ');
  if (!text.endsWith('.') && !text.endsWith('?') && !text.endsWith('!')) {
    text += isQuestion ? '?' : '.';
  }
  return text;
}

/**
 * Detect if a sentence boundary has occurred (pause-based)
 */
export function detectSentenceBoundary(lastSignTime, currentTime, minPauseMs = 2500) {
  return (currentTime - lastSignTime) > minPauseMs;
}
