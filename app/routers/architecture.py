from fastapi import APIRouter

router = APIRouter(prefix="/architecture", tags=["System Architecture & Documentation"])

@router.get("")
async def get_architecture_details():
    return {
        "title": "SIGN LANGUAGE TRANSLATOR - SYSTEM ARCHITECTURE",
        "description": "Enterprise end-to-end full-stack sign language translation system featuring real-time MediaPipe 21-hand landmark detection, OpenCV preprocessing pipeline, machine learning feature classifier, FastAPI backend, MongoDB document storage, Web Speech TTS, and rich admin telemetry.",
        "components": {
            "input": {
                "name": "Webcam Video Input",
                "role": "Real-time 60 FPS video stream capture from user's camera",
                "specs": "1280x720 RGB @ 30-60 FPS"
            },
            "pipeline": [
                {
                    "step": 1,
                    "title": "Frame Capture",
                    "tech": "HTML5 Video / OpenCV VideoCapture",
                    "description": "Continuous real-time video buffer sampling"
                },
                {
                    "step": 2,
                    "title": "Preprocessing (OpenCV)",
                    "tech": "OpenCV (cv2)",
                    "description": "Resize, color conversion (BGR to RGB), normalization, Gaussian noise reduction, brightness normalization"
                },
                {
                    "step": 3,
                    "title": "Hand Detection & Landmarks (MediaPipe)",
                    "tech": "MediaPipe Hands",
                    "description": "Detects palm bounding box and extracts 21 3D hand coordinates (x, y, z) with sub-pixel precision"
                },
                {
                    "step": 4,
                    "title": "Feature Extraction",
                    "tech": "NumPy / Custom Geometric Vector Engine",
                    "description": "Wrist-relative translation normalization, hand-scale invariance, 3D Euclidean inter-joint distances, joint flexion angles, finger curl states"
                },
                {
                    "step": 5,
                    "title": "Sign Recognition (TensorFlow / Keras)",
                    "tech": "ML / DL Classifier (Neural Network & Geometric Heuristics)",
                    "description": "Multi-class gesture classification with softmax confidence distribution"
                }
            ],
            "backend": {
                "framework": "FastAPI",
                "pattern": "Layered Architecture (Routers, Services, Repositories, Pydantic Schemas)",
                "protocols": ["REST (HTTP/2)", "WebSockets for low-latency streaming"],
                "features": ["Asynchronous I/O", "OpenAPI / Swagger documentation", "Pydantic V2 validation"]
            },
            "database": {
                "engine": "MongoDB",
                "collections": [
                    {
                        "name": "USERS",
                        "schema": {"_id": "ObjectId", "name": "String", "email": "String", "role": "String", "createdAt": "ISODate"}
                    },
                    {
                        "name": "SIGNS",
                        "schema": {"_id": "ObjectId", "label": "String", "videoUrl": "String", "features": "Array[Float]", "createdAt": "ISODate"}
                    },
                    {
                        "name": "TRANSLATIONS",
                        "schema": {"_id": "ObjectId", "userId": "ObjectId", "signLabel": "String", "text": "String", "confidence": "Float", "createdAt": "ISODate"}
                    },
                    {
                        "name": "TRANSLATION_HISTORY",
                        "schema": {"_id": "ObjectId", "userId": "ObjectId", "signLabel": "String", "text": "String", "timestamp": "ISODate", "method": "String"}
                    }
                ]
            },
            "output": {
                "visual": "Sign Badge & Real-time Text Sentence Transcription",
                "audio": "Web Speech API / TTS Synthesis Engine with pitch & rate controls"
            },
            "admin": {
                "modules": ["Manage Users", "Manage Signs", "View Translations", "View History", "System Analytics"]
            }
        },
        "learningOutcomes": {
            "CO1": "Relational & Document Database Engineering: Schema models, normalization vs embedding, BSON document modeling.",
            "CO2": "Database Engineering: SQL vs NoSQL comparative study, MongoDB aggregation pipelines, polyglot persistence.",
            "CO3": "Backend API Engineering: FastAPI RESTful design, Pydantic data contracts, dependency injection, async pipelines.",
            "CO4": "Multi-Framework & Real-Time Engineering: Real-time WebSockets, microsecond feature extraction.",
            "CO5": "Microservices Engineering: Service boundaries (AI Vision service, Ingestion, Database persistence, Admin Telemetry).",
            "CO6": "Deployment & Observability: Docker containerization, health probes, latency benchmarking, and C4 architecture documentation."
        }
    }
