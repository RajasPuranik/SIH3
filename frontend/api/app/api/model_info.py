"""
PackLabs — Model Information Route

Exposes ML model metadata: accuracy, F1, R², feature importances, training date.
"""

from fastapi import APIRouter
from pathlib import Path
import json

router = APIRouter(prefix="/api", tags=["model"])

MODEL_DIR = Path(__file__).resolve().parent.parent.parent / "ml" / "models"


@router.get("/model/info")
def get_model_info():
    """Return model metadata, metrics, and feature importances."""
    metadata_path = MODEL_DIR / "metadata.json"

    if metadata_path.exists():
        with open(metadata_path, "r") as f:
            metadata = json.load(f)

        return {
            "status": "trained",
            "dataset_size": metadata.get("dataset_size", 0),
            "training_date": metadata.get("training_date", "unknown"),
            "feature_names": metadata.get("feature_names", []),
            "barrier_classes": metadata.get("barrier_classes", []),
            "material_families": metadata.get("material_families", []),
            "metrics": metadata.get("metrics", {}),
            "feature_importances": metadata.get("feature_importances", {}),
            "models": [
                {
                    "name": "Barrier Class Classifier",
                    "type": "RandomForestClassifier",
                    "description": "Predicts the required barrier class based on food properties and storage conditions",
                    "accuracy": metadata.get("metrics", {}).get("barrier_classifier", {}).get("accuracy", 0),
                    "f1_weighted": metadata.get("metrics", {}).get("barrier_classifier", {}).get("f1_weighted", 0),
                },
                {
                    "name": "Material Family Classifier",
                    "type": "RandomForestClassifier",
                    "description": "Predicts the best material family based on barrier requirements and user priorities",
                    "accuracy": metadata.get("metrics", {}).get("family_classifier", {}).get("accuracy", 0),
                    "f1_weighted": metadata.get("metrics", {}).get("family_classifier", {}).get("f1_weighted", 0),
                },
                {
                    "name": "Shelf Life Regressor",
                    "type": "GradientBoostingRegressor",
                    "description": "Predicts shelf life in days based on food, packaging, and storage parameters",
                    "r2": metadata.get("metrics", {}).get("shelf_life_regressor", {}).get("r2", 0),
                    "mae_days": metadata.get("metrics", {}).get("shelf_life_regressor", {}).get("mae_days", 0),
                },
            ],
            "methodology": {
                "data_source": "Synthetic dataset generated from expert food packaging rules with realistic noise",
                "approach": "Three-layer system: Expert rules → ML prediction → Scoring & ranking",
                "transparency": "All models use interpretable algorithms with feature importance exposed",
                "limitations": [
                    "Trained on synthetic data; real-world validation recommended",
                    "Material properties are typical values; actual values vary by manufacturer",
                    "Shelf life predictions are estimates; lab testing required for commercial use",
                ],
            },
        }
    else:
        return {
            "status": "not_trained",
            "message": "ML models have not been trained yet. Using rule-engine only mode.",
            "methodology": {
                "data_source": "Expert rules only (no ML models loaded)",
                "approach": "Rule-based barrier classification and scoring",
                "transparency": "All decisions based on documented food packaging science rules",
            },
            "how_to_train": "Run: python -m ml.train from the backend directory",
        }
