from datetime import timedelta
from app.time_utils import get_ist_now

now_ist = get_ist_now()

DEFAULT_USERS = [
    {
        "_id": "650c82f91a2b3c4d5e6f7081",
        "name": "Ravi Kumar",
        "email": "ravi.kumar@example.com",
        "role": "user",
        "createdAt": (now_ist - timedelta(days=12)).isoformat()
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7080",
        "name": "Admin System",
        "email": "admin@signlang.ai",
        "role": "admin",
        "createdAt": (now_ist - timedelta(days=30)).isoformat()
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7089",
        "name": "Dr. Sarah Chen",
        "email": "sarah.chen@accessibility.org",
        "role": "admin",
        "createdAt": (now_ist - timedelta(days=20)).isoformat()
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7090",
        "name": "Alex Rivera",
        "email": "alex.rivera@asl-edu.org",
        "role": "user",
        "createdAt": (now_ist - timedelta(days=5)).isoformat()
    }
]

# Standard reference gesture feature templates matching ISL Reference Chart
DEFAULT_SIGNS = [
    # 1. Greetings & Politeness
    {
        "_id": "650c82f91a2b3c4d5e6f7101",
        "label": "Namaste / Hello",
        "description": "Press both your palms together firmly in front of your chest (the traditional Indian greeting) and give a polite nod with a smile.",
        "category": "1. Greetings & Politeness",
        "meaning": "Traditional Greeting & Respect",
        "createdAt": (now_ist - timedelta(days=25)).isoformat()
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7102",
        "label": "Thank You",
        "description": "Touch the fingertips of your flat dominant hand to your lips, then move your hand downward and forward toward the person you are speaking to.",
        "category": "1. Greetings & Politeness",
        "meaning": "Expression of Gratitude",
        "createdAt": (now_ist - timedelta(days=24)).isoformat()
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7103",
        "label": "Please",
        "description": "Place your flat dominant hand on the center of your chest and move it in a gentle, circular motion.",
        "category": "1. Greetings & Politeness",
        "meaning": "Polite Request",
        "createdAt": (now_ist - timedelta(days=17)).isoformat()
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7104",
        "label": "Sorry",
        "description": "Make a fist with your dominant hand, place it over your chest, and rub it in a circular motion while making a regretful or apologetic facial expression.",
        "category": "1. Greetings & Politeness",
        "meaning": "Apology & Regret",
        "createdAt": (now_ist - timedelta(days=15)).isoformat()
    },

    # 2. Basic Responses
    {
        "_id": "650c82f91a2b3c4d5e6f7105",
        "label": "Yes",
        "description": "Make a loose fist with your dominant hand and tilt it forward and back from the wrist (mimicking a nodding head).",
        "category": "2. Basic Responses",
        "meaning": "Affirmation & Agreement",
        "createdAt": (now_ist - timedelta(days=23)).isoformat()
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7106",
        "label": "No",
        "description": "Extend your index and middle finger horizontally, then snap them down sharply against your thumb.",
        "category": "2. Basic Responses",
        "meaning": "Disagreement & Negation",
        "createdAt": (now_ist - timedelta(days=22)).isoformat()
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7107",
        "label": "Okay / Fine",
        "description": "Bring your thumb and index finger together to form a circle (the 'OK' sign) and move it forward slightly with other fingers open.",
        "category": "2. Basic Responses",
        "meaning": "Confirmation & Agreement",
        "createdAt": (now_ist - timedelta(days=14)).isoformat()
    },

    # 3. Everyday Needs & Actions
    {
        "_id": "650c82f91a2b3c4d5e6f7108",
        "label": "Eat / Food",
        "description": "Bring your dominant hand to your mouth with your fingers bundled together (tips touching), mimicking the motion of putting a bite of food into your mouth.",
        "category": "3. Everyday Needs & Actions",
        "meaning": "Meal & Nourishment",
        "createdAt": (now_ist - timedelta(days=13)).isoformat()
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7109",
        "label": "Drink / Water",
        "description": "Form a 'C' shape with your dominant hand (or tuck your fingers and extend your thumb), bring it to your lips, and tilt it upward like drinking from a glass.",
        "category": "3. Everyday Needs & Actions",
        "meaning": "Thirst & Beverage",
        "createdAt": (now_ist - timedelta(days=12)).isoformat()
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7110",
        "label": "Sleep",
        "description": "Place both palms flat together, rest your cheek sideways against the back of your hands, and tilt your head slightly to the side while closing your eyes.",
        "category": "3. Everyday Needs & Actions",
        "meaning": "Rest & Sleep",
        "createdAt": (now_ist - timedelta(days=11)).isoformat()
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7111",
        "label": "Come",
        "description": "Hold your hand out with your palm facing up, and sweep your fingers inward toward your body.",
        "category": "3. Everyday Needs & Actions",
        "meaning": "Beckoning / Approach",
        "createdAt": (now_ist - timedelta(days=10)).isoformat()
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7112",
        "label": "Go",
        "description": "Point your index finger outward away from your body, or sweep an open palm outward in the direction you are pointing.",
        "category": "3. Everyday Needs & Actions",
        "meaning": "Depart & Proceed",
        "createdAt": (now_ist - timedelta(days=9)).isoformat()
    },

    # 4. Simple Social Phrases
    {
        "_id": "650c82f91a2b3c4d5e6f7113",
        "label": "Palms Up / What?",
        "description": "Hold both hands out in front of you with palms facing up, turning outward slightly in an open questioning gesture.",
        "category": "4. Simple Social Phrases",
        "meaning": "Questioning & Asking What",
        "createdAt": (now_ist - timedelta(days=8)).isoformat()
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7114",
        "label": "How are you?",
        "description": "Hold your hand out with palms facing downward then give a thumbs-up gesture with your dominant hand while looking questioning.",
        "category": "4. Simple Social Phrases",
        "meaning": "Inquiring Well-being",
        "createdAt": (now_ist - timedelta(days=8)).isoformat()
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7115",
        "label": "I don't know / I don't understand",
        "description": "Place the fingertips of your flat hand against your forehead, then sweep the hand outward away from your head while shaking your head 'no'.",
        "category": "4. Simple Social Phrases",
        "meaning": "Uncertainty & Not Understanding",
        "createdAt": (now_ist - timedelta(days=7)).isoformat()
    }
]

DEFAULT_TRANSLATIONS = [
    {
        "_id": "650c82f91a2b3c4d5e6f7201",
        "userId": "650c82f91a2b3c4d5e6f7081",
        "signLabel": "hello",
        "text": "HELLO",
        "confidence": 0.96,
        "createdAt": (now_ist - timedelta(minutes=45)).isoformat()
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7202",
        "userId": "650c82f91a2b3c4d5e6f7081",
        "signLabel": "thank you",
        "text": "THANK YOU",
        "confidence": 0.98,
        "createdAt": (now_ist - timedelta(minutes=42)).isoformat()
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7203",
        "userId": "650c82f91a2b3c4d5e6f7090",
        "signLabel": "i love you",
        "text": "I LOVE YOU",
        "confidence": 0.99,
        "createdAt": (now_ist - timedelta(hours=2)).isoformat()
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7204",
        "userId": "650c82f91a2b3c4d5e6f7081",
        "signLabel": "yes",
        "text": "YES",
        "confidence": 0.94,
        "createdAt": (now_ist - timedelta(hours=4)).isoformat()
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7205",
        "userId": "650c82f91a2b3c4d5e6f7089",
        "signLabel": "please",
        "text": "PLEASE",
        "confidence": 0.93,
        "createdAt": (now_ist - timedelta(hours=6)).isoformat()
    }
]

DEFAULT_HISTORY = [
    {
        "_id": "650c82f91a2b3c4d5e6f7301",
        "userId": "650c82f91a2b3c4d5e6f7081",
        "signLabel": "hello",
        "text": "HELLO",
        "confidence": 0.96,
        "timestamp": (now_ist - timedelta(minutes=45)).isoformat(),
        "method": "live"
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7302",
        "userId": "650c82f91a2b3c4d5e6f7081",
        "signLabel": "thank you",
        "text": "THANK YOU",
        "confidence": 0.98,
        "timestamp": (now_ist - timedelta(minutes=42)).isoformat(),
        "method": "live"
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7303",
        "userId": "650c82f91a2b3c4d5e6f7090",
        "signLabel": "i love you",
        "text": "I LOVE YOU",
        "confidence": 0.99,
        "timestamp": (now_ist - timedelta(hours=2)).isoformat(),
        "method": "live"
    },
    {
        "_id": "650c82f91a2b3c4d5e6f7304",
        "userId": "650c82f91a2b3c4d5e6f7081",
        "signLabel": "yes",
        "text": "YES",
        "confidence": 0.94,
        "timestamp": (now_ist - timedelta(hours=4)).isoformat(),
        "method": "upload"
    }
]
