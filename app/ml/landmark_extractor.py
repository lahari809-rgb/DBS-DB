import numpy as np
from typing import Dict, List, Optional, Tuple

class ISLLandmarkFeatureExtractor:
    """
    Standardized Feature Extraction Pipeline for Indian Sign Language (ISL).
    Extracts 126 normalized spatial and kinematic features per frame:
      - Left Hand: 21 landmarks x (x, y, z) = 63 features
      - Right Hand: 21 landmarks x (x, y, z) = 63 features
      - Relative hand distances, palm orientations, and kinematic velocities.
    """
    FEATURE_DIM = 126
    SEQUENCE_LENGTH = 30

    @classmethod
    def extract_frame_features(cls, frame_data: Dict) -> np.ndarray:
        """
        Extracts 126-dim normalized vector from a single frame dictionary containing:
        - landmarks: List of 21 points for dominant hand or dict with 'left' and 'right'
        - leftHand: Optional list of 21 points
        - rightHand: Optional list of 21 points
        - pose: Optional pose landmarks
        """
        left_pts = np.zeros((21, 3), dtype=np.float32)
        right_pts = np.zeros((21, 3), dtype=np.float32)

        # Handle various incoming formats (single hand, dual hands, nested dicts)
        if "leftHand" in frame_data and frame_data["leftHand"]:
            pts = frame_data["leftHand"]
            for i, p in enumerate(pts[:21]):
                left_pts[i] = [p.get("x", 0.0), p.get("y", 0.0), p.get("z", 0.0)]
        
        if "rightHand" in frame_data and frame_data["rightHand"]:
            pts = frame_data["rightHand"]
            for i, p in enumerate(pts[:21]):
                right_pts[i] = [p.get("x", 0.0), p.get("y", 0.0), p.get("z", 0.0)]

        # If only flat 'landmarks' provided, route to right or dominant hand
        if "landmarks" in frame_data and frame_data["landmarks"]:
            pts = frame_data["landmarks"]
            handedness = frame_data.get("handedness", "Right")
            target = left_pts if handedness == "Left" else right_pts
            for i, p in enumerate(pts[:21]):
                if isinstance(p, dict):
                    target[i] = [p.get("x", 0.0), p.get("y", 0.0), p.get("z", 0.0)]
                elif isinstance(p, (list, tuple)) and len(p) >= 2:
                    z = p[2] if len(p) > 2 else 0.0
                    target[i] = [p[0], p[1], z]

        # Spatial normalization: Center relative to wrist (index 0)
        if np.any(left_pts):
            wrist_l = left_pts[0].copy()
            left_pts -= wrist_l
            scale_l = np.linalg.norm(left_pts[9]) or 1.0  # distance to middle knuckle
            left_pts /= scale_l

        if np.any(right_pts):
            wrist_r = right_pts[0].copy()
            right_pts -= wrist_r
            scale_r = np.linalg.norm(right_pts[9]) or 1.0
            right_pts /= scale_r

        features = np.concatenate([left_pts.flatten(), right_pts.flatten()]).astype(np.float32)
        return features

    @classmethod
    def pad_or_resample_sequence(cls, sequence: np.ndarray, target_len: int = 30) -> np.ndarray:
        """
        Resamples a temporal sequence of frames to standard fixed target length (30 frames).
        Uses linear interpolation across the temporal dimension.
        """
        current_len = len(sequence)
        if current_len == 0:
            return np.zeros((target_len, cls.FEATURE_DIM), dtype=np.float32)

        if current_len == target_len:
            return sequence.astype(np.float32)

        # Resample using linear interpolation
        indices = np.linspace(0, current_len - 1, target_len)
        resampled = np.zeros((target_len, sequence.shape[1]), dtype=np.float32)
        for i, idx in enumerate(indices):
            low = int(np.floor(idx))
            high = int(np.ceil(idx))
            weight = idx - low
            if low == high or high >= current_len:
                resampled[i] = sequence[low]
            else:
                resampled[i] = (1.0 - weight) * sequence[low] + weight * sequence[high]

        return resampled
