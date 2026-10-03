import os
import json
import uuid
from typing import List, Dict, Any, Optional
from pymongo import MongoClient
from app.config import settings
from app.time_utils import get_ist_iso, get_ist_now
from app.db.seed_data import DEFAULT_USERS, DEFAULT_SIGNS, DEFAULT_TRANSLATIONS, DEFAULT_HISTORY
from app.services.isl_vocabulary_data import ISL_ALL_SIGNS, PRACTICE_SCENARIOS

class DatabaseManager:
    """
    MongoDB Dual-Layer Document Persistence Engine with IST Compliance.
    Collections:
      - users: { _id, name, email, role, createdAt (IST) }
      - vocabulary: { _id, sign_id, label, category, level, meaning, description, speech_text }
      - sign_sequences: { _id, sequence_id, signs, translation, confidence, createdAt (IST) }
      - translation_sessions: { _id, userId, detectedSigns, englishTranslation, confidence, timestamp }
      - translation_history: { _id, userId, signLabel, text, confidence, timestamp, method }
      - practice_results: { _id, userId, scenarioId, targetSigns, detectedSigns, overallMatch, passed, timestamp }
      - model_metadata: { _id, modelName, framework, inputShape, accuracy, lastUpdated }
    """

    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db = None
        self.is_mongo_connected = False
        self.storage_dir = settings.DATA_STORAGE_DIR
        os.makedirs(self.storage_dir, exist_ok=True)
        self.storage_file = os.path.join(self.storage_dir, "db_store.json")
        self.in_memory_data: Dict[str, List[Dict[str, Any]]] = {
            "users": [],
            "vocabulary": [],
            "signs": [],
            "sign_sequences": [],
            "translation_sessions": [],
            "translation_history": [],
            "translations": [],
            "history": [],
            "practice_results": [],
            "model_metadata": []
        }
        self.connect()

    def connect(self):
        try:
            client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=1500)
            client.admin.command('ping')
            self.client = client
            self.db = self.client[settings.DATABASE_NAME]
            self.is_mongo_connected = True
            print(f"[Database] Successfully connected to MongoDB at {settings.MONGO_URI}")
            self._init_mongo_data()
        except Exception as e:
            self.is_mongo_connected = False
            print(f"[Database] MongoDB not reachable ({e}). Using persistent JSON Document Storage engine.")
            self._load_local_data()

    def _init_mongo_data(self):
        """Seed initial collections in MongoDB if empty"""
        if not self.is_mongo_connected or self.db is None:
            return
        try:
            if self.db.users.count_documents({}) == 0:
                self.db.users.insert_many(DEFAULT_USERS)
            if self.db.vocabulary.count_documents({}) == 0:
                self.db.vocabulary.insert_many(ISL_ALL_SIGNS)
            if self.db.signs.count_documents({}) == 0:
                self.db.signs.insert_many(DEFAULT_SIGNS)
            if self.db.translations.count_documents({}) == 0:
                self.db.translations.insert_many(DEFAULT_TRANSLATIONS)
            if self.db.translation_history.count_documents({}) == 0:
                self.db.translation_history.insert_many(DEFAULT_HISTORY)
            if self.db.history.count_documents({}) == 0:
                self.db.history.insert_many(DEFAULT_HISTORY)
        except Exception as ex:
            print(f"[Database] Error checking/seeding MongoDB: {ex}")

    def _load_local_data(self):
        """Load data from JSON file or initialize with seed data"""
        if os.path.exists(self.storage_file):
            try:
                with open(self.storage_file, "r", encoding="utf-8") as f:
                    self.in_memory_data = json.load(f)
                    # Ensure vocabulary is loaded
                    if not self.in_memory_data.get("vocabulary"):
                        self.in_memory_data["vocabulary"] = list(ISL_ALL_SIGNS)
                        self._save_local_data()
                    print(f"[Database] Loaded existing document collections from {self.storage_file}")
                    return
            except Exception as e:
                print(f"[Database] Could not read local file: {e}")
        
        # Initialize default seed collections
        self.in_memory_data = {
            "users": list(DEFAULT_USERS),
            "vocabulary": list(ISL_ALL_SIGNS),
            "signs": list(DEFAULT_SIGNS),
            "sign_sequences": [],
            "translation_sessions": [],
            "translation_history": list(DEFAULT_HISTORY),
            "translations": list(DEFAULT_TRANSLATIONS),
            "history": list(DEFAULT_HISTORY),
            "practice_results": [],
            "model_metadata": [
                {
                    "modelName": "MediaPipe Holistic + Temporal GRU/Transformer",
                    "version": "2.4.0",
                    "accuracy": "97.4%",
                    "fps": "60 FPS",
                    "status": "Active Inference"
                }
            ]
        }
        self._save_local_data()

    def _save_local_data(self):
        try:
            with open(self.storage_file, "w", encoding="utf-8") as f:
                json.dump(self.in_memory_data, f, indent=2, default=str)
        except Exception as e:
            print(f"[Database] Error writing to local file: {e}")

    # ================= CRUD: USERS =================
    async def get_users(self, role: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        if self.is_mongo_connected and self.db is not None:
            query = {}
            if role:
                query["role"] = role
            if search:
                query["$or"] = [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"email": {"$regex": search, "$options": "i"}}
                ]
            cursor = self.db.users.find(query)
            return list(cursor)
        
        items = self.in_memory_data.get("users", [])
        if role:
            items = [u for u in items if u.get("role") == role]
        if search:
            s = search.lower()
            items = [u for u in items if s in u.get("name", "").lower() or s in u.get("email", "").lower()]
        return items

    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        if "_id" not in user_data:
            user_data["_id"] = f"usr_{uuid.uuid4().hex[:12]}"
        if "createdAt" not in user_data:
            user_data["createdAt"] = get_ist_iso()
            
        if self.is_mongo_connected and self.db is not None:
            self.db.users.insert_one(user_data)
            return user_data
            
        self.in_memory_data.setdefault("users", []).append(user_data)
        self._save_local_data()
        return user_data

    # ================= CRUD: VOCABULARY =================
    async def get_vocabulary_signs(
        self,
        category: Optional[str] = None,
        level: Optional[int] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        if self.is_mongo_connected and self.db is not None:
            query = {}
            if category:
                query["category"] = category
            if level:
                query["level"] = level
            if search:
                query["$or"] = [
                    {"label": {"$regex": search, "$options": "i"}},
                    {"meaning": {"$regex": search, "$options": "i"}},
                    {"description": {"$regex": search, "$options": "i"}}
                ]
            return list(self.db.vocabulary.find(query))

        items = self.in_memory_data.get("vocabulary", list(ISL_ALL_SIGNS))
        if category:
            items = [s for s in items if s.get("category") == category]
        if level:
            items = [s for s in items if s.get("level") == level]
        if search:
            s = search.lower()
            items = [s_item for s_item in items if s in s_item.get("label", "").lower() or s in s_item.get("meaning", "").lower()]
        return items

    # ================= CRUD: SIGNS & TRANSLATIONS =================
    async def get_signs(self, category: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        return await self.get_vocabulary_signs(category=category, search=search)

    async def create_translation(self, trans_data: Dict[str, Any]) -> Dict[str, Any]:
        if "_id" not in trans_data:
            trans_data["_id"] = f"trn_{uuid.uuid4().hex[:12]}"
        if "createdAt" not in trans_data:
            trans_data["createdAt"] = get_ist_iso()
            
        if self.is_mongo_connected and self.db is not None:
            self.db.translations.insert_one(trans_data)
            return trans_data
            
        self.in_memory_data.setdefault("translations", []).append(trans_data)
        self._save_local_data()
        return trans_data

    # ================= CRUD: HISTORY =================
    async def get_history(self, user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        if self.is_mongo_connected and self.db is not None:
            query = {"userId": user_id} if user_id else {}
            cursor = self.db.translation_history.find(query).sort("timestamp", -1).limit(limit)
            return list(cursor)
            
        items = self.in_memory_data.get("translation_history", self.in_memory_data.get("history", []))
        if user_id:
            items = [h for h in items if h.get("userId") == user_id]
        sorted_items = sorted(items, key=lambda x: str(x.get("timestamp", "")), reverse=True)
        return sorted_items[:limit]

    async def add_history(self, hist_data: Dict[str, Any]) -> Dict[str, Any]:
        if "_id" not in hist_data:
            hist_data["_id"] = f"hist_{uuid.uuid4().hex[:12]}"
        if "timestamp" not in hist_data:
            hist_data["timestamp"] = get_ist_iso()
            
        if self.is_mongo_connected and self.db is not None:
            self.db.translation_history.insert_one(hist_data)
            self.db.history.insert_one(hist_data)
            return hist_data
            
        self.in_memory_data.setdefault("translation_history", []).append(hist_data)
        self.in_memory_data.setdefault("history", []).append(hist_data)
        self._save_local_data()
        return hist_data

    async def clear_history(self, user_id: Optional[str] = None) -> int:
        if self.is_mongo_connected and self.db is not None:
            query = {"userId": user_id} if user_id else {}
            res = self.db.translation_history.delete_many(query)
            self.db.history.delete_many(query)
            return res.deleted_count
            
        if user_id:
            orig = len(self.in_memory_data.get("translation_history", []))
            self.in_memory_data["translation_history"] = [h for h in self.in_memory_data.get("translation_history", []) if h.get("userId") != user_id]
            self.in_memory_data["history"] = [h for h in self.in_memory_data.get("history", []) if h.get("userId") != user_id]
            self._save_local_data()
            return orig - len(self.in_memory_data["translation_history"])
        else:
            c = len(self.in_memory_data.get("translation_history", []))
            self.in_memory_data["translation_history"] = []
            self.in_memory_data["history"] = []
            self._save_local_data()
            return c

    # ================= CRUD: PRACTICE RESULTS =================
    async def save_practice_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        if "_id" not in result:
            result["_id"] = f"prac_{uuid.uuid4().hex[:12]}"
        if "timestamp" not in result:
            result["timestamp"] = get_ist_iso()

        if self.is_mongo_connected and self.db is not None:
            self.db.practice_results.insert_one(result)
            return result

        self.in_memory_data.setdefault("practice_results", []).append(result)
        self._save_local_data()
        return result

db_manager = DatabaseManager()
