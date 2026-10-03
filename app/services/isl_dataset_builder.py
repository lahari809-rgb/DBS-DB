import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

# Exact 8 categories & signs from the Indian Sign Language (ISL) Complete Sign Chart
ISL_CHART_CATEGORIES = {
    "alphabet": [
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
    ],
    "numbers": [
        "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
        "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
        "30", "40", "50", "60", "70", "80", "90", "100"
    ],
    "common_words": [
        "YES", "NO", "PLEASE", "THANK_YOU", "SORRY", "HELP", "WATER", "FOOD", "MONEY", "FRIEND",
        "FAMILY", "SCHOOL", "HOME", "WORK", "LOVE", "HAPPY", "SAD", "ANGRY", "PEACE", "STOP"
    ],
    "phrases": [
        "HELLO", "GOOD_MORNING", "GOOD_AFTERNOON", "GOOD_EVENING", "GOOD_NIGHT", "HOW_ARE_YOU",
        "I_AM_FINE", "WHAT_IS_YOUR_NAME", "MY_NAME_IS", "NICE_TO_MEET_YOU", "WHERE_IS", "WHEN",
        "WHY", "WHAT", "I_DONT_KNOW", "AGAIN", "PLEASE_WAIT", "THANK_YOU"
    ],
    "verbs": [
        "GO", "COME", "EAT", "DRINK", "SEE", "HEAR", "READ", "WRITE", "PLAY", "WORK",
        "SIT", "STAND", "SLEEP", "WALK", "RUN", "OPEN", "CLOSE", "GIVE", "TAKE", "PUT"
    ],
    "adjectives": [
        "BIG", "SMALL", "TALL", "SHORT", "GOOD", "BAD", "STRONG", "WEAK", "FAST", "SLOW",
        "HOT", "COLD", "NEW", "OLD", "CLEAN", "DIRTY", "BEAUTIFUL", "UGLY", "BRAVE", "SCARED"
    ],
    "people_and_relationships": [
        "MOTHER", "FATHER", "BROTHER", "SISTER", "GRANDMOTHER", "GRANDFATHER", "SON", "DAUGHTER", "HUSBAND", "WIFE",
        "TEACHER", "STUDENT", "DOCTOR", "POLICE", "FRIEND", "NEIGHBOR", "BOSS", "COLLEAGUE", "CUSTOMER", "CHILD"
    ],
    "miscellaneous_daily_life": [
        "TIME", "TODAY", "TOMORROW", "YESTERDAY", "MORNING", "AFTERNOON", "EVENING", "NIGHT", "WEEK", "MONTH", "YEAR",
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "DECEMBER"
    ]
}

def init_exact_chart_dataset():
    """Initializes the dataset folder hierarchy matching strictly the ISL Complete Sign Chart"""
    os.makedirs(DATASET_DIR, exist_ok=True)
    summary = {}
    
    for category, signs in ISL_CHART_CATEGORIES.items():
        cat_dir = os.path.join(DATASET_DIR, category)
        os.makedirs(cat_dir, exist_ok=True)
        
        manifest = {
            "category": category,
            "title": category.replace("_", " ").title(),
            "signCount": len(signs),
            "signs": []
        }
        
        for sign in signs:
            manifest["signs"].append({
                "label": sign,
                "gloss": sign.upper(),
                "videoSamples": [
                    f"dataset/{category}/{sign.lower()}_sample_01.mp4",
                    f"dataset/{category}/{sign.lower()}_sample_02.mp4"
                ],
                "landmarkFrames": 30,
                "modality": "Temporal 3D Landmarks (Hands + Pose)",
                "fps": 60
            })
            
        with open(os.path.join(cat_dir, "manifest.json"), "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)
            
        summary[category] = len(signs)
        
    master_meta = {
        "datasetName": "Indian Sign Language (ISL) Complete Sign Chart Dataset",
        "totalCategories": len(ISL_CHART_CATEGORIES),
        "totalSigns": sum(len(s) for s in ISL_CHART_CATEGORIES.values()),
        "categories": summary,
        "format": "Temporal Video & 3D Coordinates Sequence",
        "version": "4.0.0"
    }
    with open(os.path.join(DATASET_DIR, "dataset_summary.json"), "w", encoding="utf-8") as f:
        json.dump(master_meta, f, indent=2)
        
    print(f"[Dataset] Initialized exact chart categories with {master_meta['totalSigns']} signs.")

if __name__ == "__main__":
    init_exact_chart_dataset()
