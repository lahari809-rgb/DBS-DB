import re
from typing import List, Dict, Any, Tuple

class ISLTranslationEngine:
    """
    Stage 2: Continuous ISL to Natural English Grammar Translation Engine.
    Converts continuous sequences of ISL signs into grammatically fluent, natural English sentences.
    
    Supports 65+ ISL vocabulary signs covering:
    - Pronouns: I, YOU, HE, SHE, WE, THEY, MY, YOUR
    - Questions: NAME, WHAT, WHO, WHERE, WHEN, WHY, HOW
    - Actions: GO, COME, EAT, DRINK, SLEEP, STUDY, WORK, READ, WRITE, SPEAK, HELP, WAIT, WANT, NEED, LIKE, KNOW, UNDERSTAND
    - Places: HOME, COLLEGE, SCHOOL, HOSPITAL, SHOP, OFFICE, BUS
    - People: FRIEND, TEACHER, MOTHER, FATHER
    - Objects: FOOD, WATER, MONEY, PHONE, BOOK, MEDICINE, TOILET, EMERGENCY, PAIN
    - Feelings: HUNGRY, THIRSTY, HAPPY, SAD, TIRED, SICK
    - Responses: YES, NO, PLEASE, THANK_YOU, STOP
    """

    def __init__(self):
        self.exact_sequences: Dict[Tuple[str, ...], str] = {
            # Subject + GO + Place
            ("I", "GO", "SCHOOL"): "I am going to school.",
            ("I", "GO", "SCHOOL", "TOMORROW"): "I will go to school tomorrow.",
            ("I", "GO", "COLLEGE"): "I am going to college.",
            ("I", "GO", "COLLEGE", "TOMORROW"): "I will go to college tomorrow.",
            ("I", "GO", "HOME"): "I am going home.",
            ("I", "GO", "HOSPITAL"): "I need to go to the hospital.",
            ("I", "GO", "OFFICE"): "I am going to the office.",
            ("I", "GO", "SHOP"): "I am going to the shop.",
            ("HE", "GO", "SCHOOL"): "He is going to school.",
            ("SHE", "GO", "SCHOOL"): "She is going to school.",
            ("WE", "GO", "SCHOOL"): "We are going to school.",
            ("THEY", "GO", "HOME"): "They are going home.",
            ("MY", "FRIEND", "GO", "HOME"): "My friend is going home.",
            ("FRIEND", "GO", "HOME"): "My friend is going home.",

            # Need/Want patterns
            ("I", "NEED", "HELP"): "I need help.",
            ("YOU", "NEED", "HELP"): "Do you need help?",
            ("I", "WANT", "HELP"): "I want help.",
            ("I", "WANT", "FOOD"): "I want food.",
            ("I", "WANT", "WATER"): "I want water.",
            ("I", "WANT", "SLEEP"): "I want to sleep.",
            ("I", "WANT", "GO", "HOME"): "I want to go home.",
            ("I", "NEED", "MONEY"): "I need money.",
            ("I", "NEED", "MEDICINE"): "I need medicine.",
            ("I", "NEED", "TOILET"): "I need the restroom.",
            ("PLEASE", "HELP"): "Please help me.",
            ("PLEASE", "HELP", "I"): "Please help me.",
            ("PLEASE", "WAIT"): "Please wait.",

            # Questions
            ("WHERE", "HOSPITAL"): "Where is the hospital?",
            ("WHERE", "SCHOOL"): "Where is the school?",
            ("WHERE", "HOME"): "Where is the house?",
            ("WHERE", "TOILET"): "Where is the restroom?",
            ("WHERE", "BUS"): "Where is the bus stop?",
            ("WHERE", "OFFICE"): "Where is the office?",
            ("WHERE", "SHOP"): "Where is the shop?",
            ("YOUR", "NAME", "WHAT"): "What is your name?",
            ("NAME", "WHAT"): "What is your name?",
            ("WHAT", "NAME"): "What is your name?",
            ("WHO", "TEACHER"): "Who is the teacher?",
            ("WHEN", "GO"): "When are you going?",
            ("WHY", "SAD"): "Why are you sad?",
            ("HOW", "HELP"): "How can I help?",
            ("YOU", "UNDERSTAND"): "Do you understand?",
            ("YOU", "KNOW"): "Do you know?",

            # Feeling states
            ("I", "HUNGRY"): "I am hungry.",
            ("I", "HUNGRY", "WANT", "FOOD"): "I am hungry and I want food.",
            ("I", "HUNGRY", "NEED", "FOOD"): "I am hungry and I need food.",
            ("I", "THIRSTY"): "I am thirsty.",
            ("I", "THIRSTY", "WANT", "WATER"): "I am thirsty and I want water.",
            ("I", "THIRSTY", "NEED", "WATER"): "I am thirsty and I need water.",
            ("I", "TIRED"): "I am feeling tired.",
            ("I", "TIRED", "WANT", "SLEEP"): "I am tired and want to sleep.",
            ("I", "SICK"): "I am sick.",
            ("I", "SICK", "NEED", "HELP"): "I am sick and need help.",
            ("I", "SICK", "NEED", "MEDICINE"): "I am sick and need medicine.",
            ("I", "HAPPY"): "I am happy.",
            ("I", "SAD"): "I am sad.",
            ("I", "PAIN"): "I am in pain.",
            ("I", "EMERGENCY"): "I have an emergency.",

            # Actions
            ("I", "EAT", "FOOD"): "I am eating food.",
            ("I", "DRINK", "WATER"): "I am drinking water.",
            ("I", "STUDY"): "I am studying.",
            ("I", "STUDY", "BOOK"): "I am studying a book.",
            ("I", "WORK"): "I am working.",
            ("I", "WORK", "OFFICE"): "I am working at the office.",
            ("I", "READ", "BOOK"): "I am reading a book.",
            ("I", "WRITE"): "I am writing.",
            ("I", "SPEAK"): "I am speaking.",
            ("I", "UNDERSTAND"): "I understand.",
            ("I", "KNOW"): "I know.",
            ("I", "LIKE", "STUDY"): "I like to study.",
            ("I", "LIKE", "FOOD"): "I like food.",
            ("I", "COME", "HOME"): "I am coming home.",
            ("COME", "HOME"): "Come home.",

            # People
            ("MOTHER", "FOOD"): "Mother is preparing food.",
            ("FATHER", "WORK"): "Father is working.",
            ("FATHER", "WORK", "OFFICE"): "Father is working in the office.",
            ("TEACHER", "SCHOOL"): "The teacher is at school.",
            ("THANK_YOU", "HELP"): "Thank you for helping.",
            ("THANK_YOU", "FRIEND"): "Thank you, friend.",
            ("MY", "NAME"): "My name is...",
            ("STOP", "WAIT"): "Stop and wait.",
            ("YES", "I", "GO"): "Yes, I will go.",
            ("NO", "I", "STOP"): "No, I will stop.",
        }

        self.FEELINGS = {"HAPPY", "SAD", "TIRED", "SICK", "HUNGRY", "THIRSTY", "PAIN"}
        self.QUESTIONS = {"WHAT", "WHERE", "WHEN", "WHY", "HOW", "WHO"}
        self.PLACES = {"HOME", "SCHOOL", "COLLEGE", "HOSPITAL", "SHOP", "OFFICE", "BUS", "TOILET"}
        self.SUBJECTS = {
            "I": ("am", "was"), "YOU": ("are", "were"), "HE": ("is", "was"),
            "SHE": ("is", "was"), "WE": ("are", "were"), "THEY": ("are", "were"),
        }
        self.VERBS = {
            "GO": ("going", "go", "to"), "COME": ("coming", "come", ""),
            "EAT": ("eating", "eat", ""), "DRINK": ("drinking", "drink", ""),
            "SLEEP": ("sleeping", "sleep", ""), "STUDY": ("studying", "study", ""),
            "WORK": ("working", "work", "at"), "READ": ("reading", "read", ""),
            "WRITE": ("writing", "write", ""), "SPEAK": ("speaking", "speak", ""),
            "HELP": ("helping", "help", ""), "WAIT": ("waiting", "wait", ""),
            "WANT": ("wanting", "want", ""), "NEED": ("needing", "need", ""),
            "LIKE": ("liking", "like", ""), "KNOW": ("knowing", "know", ""),
            "UNDERSTAND": ("understanding", "understand", ""), "STOP": ("stopping", "stop", ""),
        }

    def clean_tokens(self, tokens: List[str]) -> List[str]:
        cleaned = []
        last = None
        for t in tokens:
            t_upper = str(t).strip().upper().replace(" ", "_")
            if not t_upper or t_upper in ["BLANK", "UNKNOWN", "GESTURE_DETECTED", "ANALYZING..."]:
                continue
            if t_upper != last:
                cleaned.append(t_upper)
                last = t_upper
        return cleaned

    def translate_sequence(self, sign_tokens: List[str]) -> Dict[str, Any]:
        clean_signs = self.clean_tokens(sign_tokens)
        if not clean_signs:
            return {
                "rawSigns": sign_tokens, "cleanSigns": [], "englishTranslation": "",
                "isSentenceComplete": False, "confidenceScore": 0.0
            }

        seq_tuple = tuple(clean_signs)

        # 1. Exact match
        if seq_tuple in self.exact_sequences:
            return {
                "rawSigns": sign_tokens, "cleanSigns": clean_signs,
                "englishTranslation": self.exact_sequences[seq_tuple],
                "isSentenceComplete": True, "confidenceScore": 0.97
            }

        # 2. Longest sub-sequence match
        for length in range(len(clean_signs), 1, -1):
            sub = tuple(clean_signs[:length])
            if sub in self.exact_sequences:
                rem = clean_signs[length:]
                if not rem:
                    return {
                        "rawSigns": sign_tokens, "cleanSigns": clean_signs,
                        "englishTranslation": self.exact_sequences[sub],
                        "isSentenceComplete": True, "confidenceScore": 0.96
                    }
                rem_text = " ".join([s.replace("_", " ").lower() for s in rem])
                base = self.exact_sequences[sub].rstrip(".")
                return {
                    "rawSigns": sign_tokens, "cleanSigns": clean_signs,
                    "englishTranslation": f"{base} {rem_text}.",
                    "isSentenceComplete": True, "confidenceScore": 0.93
                }

        # 3. Grammar synthesis
        trans = self._synthesize(clean_signs)
        return {
            "rawSigns": sign_tokens, "cleanSigns": clean_signs,
            "englishTranslation": trans,
            "isSentenceComplete": len(clean_signs) >= 2,
            "confidenceScore": 0.90
        }

    def _synthesize(self, signs: List[str]) -> str:
        if not signs:
            return ""

        # Question patterns
        if signs[0] in self.QUESTIONS:
            rest = signs[1:]
            q = signs[0]
            if q == "WHERE":
                place = " ".join(s.replace("_", " ").lower() for s in rest) if rest else "it"
                return f"Where is the {place}?"
            if q == "WHAT":
                if "NAME" in rest and "YOUR" in rest:
                    return "What is your name?"
                if "NAME" in rest:
                    return "What is your name?"
                obj = " ".join(s.replace("_", " ").lower() for s in rest) if rest else "it"
                return f"What is {obj}?"
            if q == "WHO":
                obj = " ".join(s.replace("_", " ").lower() for s in rest) if rest else "that person"
                return f"Who is the {obj}?"
            if q == "WHEN":
                obj = " ".join(s.replace("_", " ").lower() for s in rest) if rest else "it"
                return f"When is {obj}?"
            if q == "WHY":
                obj = " ".join(s.replace("_", " ").lower() for s in rest) if rest else "that"
                return f"Why {obj}?"
            if q == "HOW":
                obj = " ".join(s.replace("_", " ").lower() for s in rest) if rest else "it"
                return f"How can I {obj}?"

        # Question at end
        if signs[-1] in self.QUESTIONS:
            q = signs[-1]
            rest = signs[:-1]
            if q == "WHAT":
                obj = " ".join(s.replace("_", " ").lower() for s in rest)
                return f"What is {obj}?"

        # Subject + feeling
        if signs[0] in self.SUBJECTS and len(signs) >= 2 and signs[1] in self.FEELINGS:
            subj = signs[0] if signs[0] == "I" else signs[0].capitalize()
            be = self.SUBJECTS[signs[0]][0]
            feeling = signs[1].lower()
            rest = signs[2:]
            sentence = f"{subj} {be} {feeling}"
            if rest:
                rest_text = " ".join(s.replace("_", " ").lower() for s in rest)
                sentence += f" and {rest_text}"
            return sentence + "."

        # Subject + verb + object
        if signs[0] in self.SUBJECTS and len(signs) >= 2 and signs[1] in self.VERBS:
            subj = signs[0] if signs[0] == "I" else signs[0].capitalize()
            be = self.SUBJECTS[signs[0]][0]
            gerund, base, prep = self.VERBS[signs[1]]
            objects = signs[2:]

            has_tomorrow = "TOMORROW" in objects
            filtered = [o for o in objects if o != "TOMORROW"]

            obj_parts = []
            for o in filtered:
                if o in self.PLACES:
                    obj_parts.append(f"{prep + ' ' if prep else 'to '}{o.lower()}")
                else:
                    obj_parts.append(o.replace("_", " ").lower())
            obj_str = " ".join(obj_parts)

            if has_tomorrow:
                return f"{subj} will {base} {obj_str} tomorrow.".strip() + ("." if not obj_str.endswith(".") else "")

            if signs[0] == "YOU":
                return f"Are you {gerund} {obj_str}?".strip()

            return f"{subj} {be} {gerund} {obj_str}.".strip()

        # Subject + want/need + object/verb
        if signs[0] in self.SUBJECTS and len(signs) >= 3 and signs[1] in ("WANT", "NEED"):
            subj = signs[0] if signs[0] == "I" else signs[0].capitalize()
            modal = signs[1].lower()
            rest = signs[2:]
            if rest and rest[0] in self.VERBS:
                _, base, _ = self.VERBS[rest[0]]
                objs = " ".join(o.replace("_", " ").lower() for o in rest[1:])
                return f"{subj} {modal} to {base} {objs}.".strip()
            objs = " ".join(o.replace("_", " ").lower() for o in rest)
            return f"{subj} {modal} {objs}."

        # Single sign
        if len(signs) == 1:
            s = signs[0]
            singles = {"YES": "Yes.", "NO": "No.", "PLEASE": "Please.", "THANK_YOU": "Thank you.",
                       "STOP": "Stop.", "HELP": "Help!", "EMERGENCY": "Emergency!"}
            if s in singles:
                return singles[s]
            if s in self.FEELINGS:
                return f"I am {s.lower()}."
            return s.replace("_", " ").capitalize() + "."

        # Fallback
        words = []
        for i, s in enumerate(signs):
            if s == "I":
                words.append("I")
            elif i == 0:
                words.append(s.capitalize().replace("_", " "))
            else:
                words.append(s.lower().replace("_", " "))
        text = " ".join(words)
        is_question = any(s in self.QUESTIONS for s in signs)
        if not text.endswith((".", "?", "!")):
            text += "?" if is_question else "."
        return text

translation_engine = ISLTranslationEngine()
