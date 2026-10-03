"""
Official 56-Class Indian Sign Language (ISL) Vocabulary Specification
Exclusively covers:
1. ALPHABET (26 classes): A - Z
2. NUMBERS (10 classes): 0 - 9
3. BASIC ISL SIGNS (20 classes): HELLO, THANK_YOU, PLEASE, SORRY, YES, NO, HELP, STOP, WAIT, I, YOU, WHAT, WHERE, GO, COME, EAT, DRINK, SLEEP, HOME, SCHOOL
Total: 56 Classes
"""

ISL_CATEGORIES = [
    "Alphabet",
    "Numbers",
    "Basic ISL Signs"
]

ISL_56_VOCABULARY = [
    # ================= 1. ALPHABET (26 Classes) =================
    *[{
        "id": f"alpha_{chr(c).lower()}",
        "class_name": chr(c),
        "label": chr(c),
        "category": "Alphabet",
        "category_id": "alphabet",
        "emoji": "🔤",
        "actionSummary": f"Official ISL fingerspelling for letter {chr(c)}",
        "description": f"Standard Indian Sign Language fingerspelling formation for letter {chr(c)}."
    } for c in range(ord('A'), ord('Z') + 1)],

    # ================= 2. NUMBERS (10 Classes: 0 - 9) =================
    *[{
        "id": f"num_{n}",
        "class_name": str(n),
        "label": str(n),
        "category": "Numbers",
        "category_id": "numbers",
        "emoji": "🔢",
        "actionSummary": f"ISL numerical sign for {n}",
        "description": f"Standard Indian Sign Language counting handshape for number {n}."
    } for n in range(10)],

    # ================= 3. BASIC ISL SIGNS (20 Classes) =================
    {
        "id": "basic_hello",
        "class_name": "HELLO",
        "label": "HELLO",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "👋",
        "actionSummary": "Open palm salute outward from forehead/temple",
        "description": "Standard Indian Sign Language greeting."
    },
    {
        "id": "basic_thank_you",
        "class_name": "THANK_YOU",
        "label": "THANK_YOU",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "🙏",
        "actionSummary": "Fingertips from chin move forward and down toward person",
        "description": "Standard Indian Sign Language sign for Thank You."
    },
    {
        "id": "basic_please",
        "class_name": "PLEASE",
        "label": "PLEASE",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "🤲",
        "actionSummary": "Open flat palm circular rub over chest",
        "description": "Standard Indian Sign Language polite request gesture."
    },
    {
        "id": "basic_sorry",
        "class_name": "SORRY",
        "label": "SORRY",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "🙇",
        "actionSummary": "Closed fist circular rub over center of chest",
        "description": "Standard Indian Sign Language apology gesture."
    },
    {
        "id": "basic_yes",
        "class_name": "YES",
        "label": "YES",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "👍",
        "actionSummary": "Closed fist nodding up and down like a head",
        "description": "Standard Indian Sign Language affirmation gesture."
    },
    {
        "id": "basic_no",
        "class_name": "NO",
        "label": "NO",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "👎",
        "actionSummary": "Index and middle fingers tap against thumb like snapping beak",
        "description": "Standard Indian Sign Language negation gesture."
    },
    {
        "id": "basic_help",
        "class_name": "HELP",
        "label": "HELP",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "🆘",
        "actionSummary": "Thumbs up fist on flat base palm lifted upward",
        "description": "Standard Indian Sign Language assistance sign."
    },
    {
        "id": "basic_stop",
        "class_name": "STOP",
        "label": "STOP",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "🛑",
        "actionSummary": "Dominant vertical open palm chops onto flat base palm",
        "description": "Standard Indian Sign Language stop gesture."
    },
    {
        "id": "basic_wait",
        "class_name": "WAIT",
        "label": "WAIT",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "⏳",
        "actionSummary": "Palms upward with fingers wiggling gently in pause",
        "description": "Standard Indian Sign Language wait gesture."
    },
    {
        "id": "basic_i",
        "class_name": "I",
        "label": "I",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "👉",
        "actionSummary": "Index finger pointing directly to self / chest",
        "description": "Standard Indian Sign Language first-person pronoun."
    },
    {
        "id": "basic_you",
        "class_name": "YOU",
        "label": "YOU",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "👉",
        "actionSummary": "Index finger pointing directly outward to conversation partner",
        "description": "Standard Indian Sign Language second-person pronoun."
    },
    {
        "id": "basic_what",
        "class_name": "WHAT",
        "label": "WHAT",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "❓",
        "actionSummary": "Both open hands palms up shaking side to side",
        "description": "Standard Indian Sign Language inquiry sign."
    },
    {
        "id": "basic_where",
        "class_name": "WHERE",
        "label": "WHERE",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "📍",
        "actionSummary": "Index finger extended upright, waving side to side",
        "description": "Standard Indian Sign Language location inquiry sign."
    },
    {
        "id": "basic_go",
        "class_name": "GO",
        "label": "GO",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "➡️",
        "actionSummary": "Index fingers point forward and flick away in an arc",
        "description": "Standard Indian Sign Language directional motion sign."
    },
    {
        "id": "basic_come",
        "class_name": "COME",
        "label": "COME",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "⬅️",
        "actionSummary": "Index fingers point outward and curl inward toward body",
        "description": "Standard Indian Sign Language arrival motion sign."
    },
    {
        "id": "basic_eat",
        "class_name": "EAT",
        "label": "EAT",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "🍽️",
        "actionSummary": "Bunched fingertips brought to mouth repeatedly",
        "description": "Standard Indian Sign Language eating sign."
    },
    {
        "id": "basic_drink",
        "class_name": "DRINK",
        "label": "DRINK",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "🥤",
        "actionSummary": "C-hand tipped toward mouth like holding a cup",
        "description": "Standard Indian Sign Language drinking sign."
    },
    {
        "id": "basic_sleep",
        "class_name": "SLEEP",
        "label": "SLEEP",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "😴",
        "actionSummary": "Both palms together under tilted cheek",
        "description": "Standard Indian Sign Language resting/sleep sign."
    },
    {
        "id": "basic_home",
        "class_name": "HOME",
        "label": "HOME",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "🏡",
        "actionSummary": "Bunched fingertips touch mouth then cheek, or roof apex",
        "description": "Standard Indian Sign Language home sign."
    },
    {
        "id": "basic_school",
        "class_name": "SCHOOL",
        "label": "SCHOOL",
        "category": "Basic ISL Signs",
        "category_id": "basic",
        "emoji": "🏫",
        "actionSummary": "Horizontal flat open palms clap together twice",
        "description": "Standard Indian Sign Language school sign."
    }
]

# Quick lookup map
VOCABULARY_56_MAP = {s["class_name"]: s for s in ISL_56_VOCABULARY}

# Aliases used by database.py
ISL_ALL_SIGNS = list(ISL_56_VOCABULARY)

PRACTICE_SCENARIOS = [
    {"id": "p1", "title": "Going to School", "target_signs": ["I", "GO", "SCHOOL"], "english": "I am going to school.", "difficulty": "easy"},
    {"id": "p2", "title": "Need Help", "target_signs": ["I", "NEED", "HELP"], "english": "I need help.", "difficulty": "easy"},
    {"id": "p3", "title": "Where is Hospital", "target_signs": ["WHERE", "HOSPITAL"], "english": "Where is the hospital?", "difficulty": "easy"},
    {"id": "p4", "title": "I am Hungry", "target_signs": ["I", "HUNGRY"], "english": "I am hungry.", "difficulty": "easy"},
    {"id": "p5", "title": "College Tomorrow", "target_signs": ["I", "GO", "COLLEGE", "TOMORROW"], "english": "I will go to college tomorrow.", "difficulty": "medium"},
]

