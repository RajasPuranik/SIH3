"""
PackSmart AI — Synthetic Data Generator & ML Model Trainer

Generates a realistic synthetic training dataset from expert rules,
then trains:
  1. RandomForestClassifier for barrier class / material family prediction
  2. GradientBoostingRegressor for shelf-life prediction

Saved models are loaded by the backend at startup.
"""

import json
import os
import sys
import random
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime

from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, r2_score, mean_absolute_error
from sklearn.preprocessing import LabelEncoder
import joblib

# Resolve paths
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent if SCRIPT_DIR.name == "ml" else SCRIPT_DIR
SEED_DIR = BACKEND_DIR / "app" / "seed"
MODEL_DIR = SCRIPT_DIR / "models" if SCRIPT_DIR.name == "ml" else BACKEND_DIR / "ml" / "models"

# Respiration rate mapping
RESP_MAP = {"none": 0, "very_low": 2, "low": 8, "medium": 25, "high": 60, "very_high": 120}

# Barrier class mapping based on rules
BARRIER_CLASSES = ["breathable", "low", "medium", "high", "ultra_high"]

# Material families (simplified grouping)
MATERIAL_FAMILIES = [
    "polyolefin",       # LDPE, HDPE, PP
    "polyester",        # PET, BOPP
    "barrier_film",     # MetPET, MetBOPP, EVOH, PVDC
    "laminate",         # Al foil laminates, retort pouch
    "bioplastic",       # PLA, PHA, PBAT
    "paper_based",      # Paper/PE, wax paper, cellulose
    "specialty",        # Micro-perf, breathable PE, anti-fog
]


def load_seed_data():
    """Load commodity and material seed data."""
    with open(SEED_DIR / "commodities.json", "r", encoding="utf-8") as f:
        commodities = json.load(f)
    with open(SEED_DIR / "materials.json", "r", encoding="utf-8") as f:
        materials = json.load(f)
    return commodities, materials


def determine_barrier_class(moisture: float, fat: float, ph: float, resp_ml: float,
                            is_produce: bool, aw: float, primary_spoilage: str) -> str:
    """Mirror expert rules to assign barrier class."""
    if is_produce:
        return "breathable"
    if fat > 20 or (primary_spoilage == "oxidation" and fat > 5):
        if aw < 0.6:
            return "ultra_high"
        return "high"
    if fat > 10:
        return "high"
    if aw < 0.6:
        return "high"
    if moisture > 60:
        return "medium"
    if moisture < 15:
        if aw < 0.3:
            return "high"
        return "medium"
    return "low"


def assign_material_family(barrier_class: str, is_produce: bool, eco_pref: float) -> str:
    """Assign a material family based on barrier class and preferences."""
    if is_produce:
        if eco_pref > 0.7:
            return random.choice(["bioplastic", "paper_based"])
        return "specialty"

    if barrier_class == "ultra_high":
        if eco_pref > 0.8:
            return "bioplastic"
        return random.choice(["laminate", "barrier_film"])
    if barrier_class == "high":
        if eco_pref > 0.6:
            return random.choice(["bioplastic", "paper_based"])
        return random.choice(["barrier_film", "laminate", "polyester"])
    if barrier_class == "medium":
        if eco_pref > 0.5:
            return random.choice(["bioplastic", "paper_based"])
        return random.choice(["polyester", "polyolefin"])
    # low
    if eco_pref > 0.5:
        return random.choice(["bioplastic", "paper_based"])
    return "polyolefin"


def predict_shelf_life_synthetic(
    moisture: float, fat: float, ph: float, temp_c: float, rh: float,
    resp_ml: float, barrier_class: str, target_days: int, is_produce: bool
) -> float:
    """Generate a realistic shelf life prediction with noise."""
    # Base multiplier from barrier class
    barrier_mult = {
        "breathable": 2.0,
        "low": 2.5,
        "medium": 4.0,
        "high": 6.0,
        "ultra_high": 10.0,
    }
    base_mult = barrier_mult.get(barrier_class, 3.0)

    # Unpackaged baseline: very short for perishables, moderate for dry goods
    if is_produce:
        unpackaged = max(1, 3 + random.gauss(0, 1))
    elif moisture > 60:
        unpackaged = max(1, 5 + random.gauss(0, 2))
    elif moisture < 15:
        unpackaged = max(7, 60 + random.gauss(0, 15))
    else:
        unpackaged = max(3, 14 + random.gauss(0, 5))

    # Q10 temperature correction
    q10 = 2.5 if is_produce else 2.0
    ref_temp = 25.0
    temp_factor = q10 ** ((ref_temp - temp_c) / 10.0)

    # RH correction (high RH reduces life for dry goods)
    rh_factor = 1.0
    if moisture < 30 and rh > 70:
        rh_factor = 0.7

    predicted = unpackaged * base_mult * temp_factor * rh_factor
    # Add noise (±15%)
    predicted *= 1.0 + random.gauss(0, 0.15)
    predicted = max(1, predicted)

    return round(predicted, 1)


def generate_synthetic_dataset(commodities: list, n_samples: int = 3500) -> pd.DataFrame:
    """Generate n_samples synthetic training rows."""
    random.seed(42)
    np.random.seed(42)

    rows = []
    categories = [c["category"] for c in commodities]
    cat_set = list(set(categories))

    for i in range(n_samples):
        # Pick a random commodity as base
        base = random.choice(commodities)

        # Add noise to properties
        moisture = max(0, min(100, base["moisture_pct"] + random.gauss(0, base["moisture_pct"] * 0.1 + 1)))
        fat = max(0, min(100, base["oil_fat_pct"] + random.gauss(0, max(0.5, base["oil_fat_pct"] * 0.1))))
        ph = max(0, min(14, base["ph"] + random.gauss(0, 0.3)))
        aw = max(0, min(1.0, base["water_activity"] + random.gauss(0, 0.02)))
        resp_str = base.get("respiration_rate", "none")
        resp_ml = RESP_MAP.get(resp_str, 0) + random.gauss(0, max(1, RESP_MAP.get(resp_str, 0) * 0.15))
        resp_ml = max(0, resp_ml)
        is_produce = base.get("is_produce", False)
        is_perishable = base.get("is_perishable", False)
        primary_spoilage = base.get("primary_spoilage", "microbial")
        category = base["category"]

        # Randomize storage conditions
        if is_produce:
            temp_c = random.choice([2, 4, 8, 10, 15, 20, 25])
        elif category in ("meat", "fish", "dairy"):
            temp_c = random.choice([-18, -10, 0, 2, 4, 8])
        else:
            temp_c = random.choice([20, 25, 30, 35, 40])

        rh = random.choice([30, 40, 50, 60, 70, 80, 90]) + random.gauss(0, 3)
        rh = max(10, min(100, rh))

        target_days = random.choice([3, 5, 7, 14, 21, 30, 60, 90, 120, 180, 365])
        transit = random.choice(["local", "road", "long_haul", "export_sea", "export_air"])
        storage_type = random.choice(["ambient", "cold_chain", "controlled_atmosphere", "frozen"])

        # User priorities
        eco_pref = random.random()
        cost_pref = random.random()
        prot_pref = random.random()
        total = eco_pref + cost_pref + prot_pref
        eco_pref /= total
        cost_pref /= total
        prot_pref /= total

        # Labels from expert rules
        barrier_class = determine_barrier_class(moisture, fat, ph, resp_ml, is_produce, aw, primary_spoilage)
        material_family = assign_material_family(barrier_class, is_produce, eco_pref)
        shelf_life_pred = predict_shelf_life_synthetic(
            moisture, fat, ph, temp_c, rh, resp_ml, barrier_class, target_days, is_produce
        )

        # Category encoding
        cat_idx = cat_set.index(category) if category in cat_set else 0
        transit_map = {"local": 0, "road": 1, "long_haul": 2, "export_sea": 3, "export_air": 4}
        storage_map = {"ambient": 0, "cold_chain": 1, "controlled_atmosphere": 2, "frozen": 3}
        spoilage_map = {"oxidation": 0, "moisture_gain": 1, "moisture_loss": 2, "microbial": 3,
                        "respiration": 4, "staling": 5, "rancidity": 6}

        rows.append({
            "moisture_pct": round(moisture, 2),
            "oil_fat_pct": round(fat, 2),
            "ph": round(ph, 2),
            "water_activity": round(aw, 3),
            "respiration_rate_ml": round(resp_ml, 2),
            "is_produce": int(is_produce),
            "is_perishable": int(is_perishable),
            "category_idx": cat_idx,
            "storage_temp_c": round(temp_c, 1),
            "relative_humidity_pct": round(rh, 1),
            "target_shelf_life_days": target_days,
            "transit_idx": transit_map.get(transit, 0),
            "storage_type_idx": storage_map.get(storage_type, 0),
            "primary_spoilage_idx": spoilage_map.get(primary_spoilage, 3),
            "priority_protection": round(prot_pref, 3),
            "priority_cost": round(cost_pref, 3),
            "priority_sustainability": round(eco_pref, 3),
            # Labels
            "barrier_class": barrier_class,
            "material_family": material_family,
            "predicted_shelf_life_days": shelf_life_pred,
        })

    return pd.DataFrame(rows)


def train_models(df: pd.DataFrame):
    """Train and save ML models."""
    os.makedirs(MODEL_DIR, exist_ok=True)

    feature_cols = [
        "moisture_pct", "oil_fat_pct", "ph", "water_activity",
        "respiration_rate_ml", "is_produce", "is_perishable", "category_idx",
        "storage_temp_c", "relative_humidity_pct", "target_shelf_life_days",
        "transit_idx", "storage_type_idx", "primary_spoilage_idx",
        "priority_protection", "priority_cost", "priority_sustainability",
    ]

    X = df[feature_cols].values

    # === 1. Barrier Class Classifier ===
    le_barrier = LabelEncoder()
    y_barrier = le_barrier.fit_transform(df["barrier_class"])
    X_train, X_test, y_train, y_test = train_test_split(X, y_barrier, test_size=0.2, random_state=42)

    clf_barrier = RandomForestClassifier(
        n_estimators=200, max_depth=12, min_samples_leaf=5, random_state=42, n_jobs=-1
    )
    clf_barrier.fit(X_train, y_train)
    y_pred_barrier = clf_barrier.predict(X_test)
    barrier_acc = accuracy_score(y_test, y_pred_barrier)
    barrier_f1 = f1_score(y_test, y_pred_barrier, average="weighted")
    print(f"Barrier Classifier — Accuracy: {barrier_acc:.4f}, F1: {barrier_f1:.4f}")

    # === 2. Material Family Classifier ===
    le_family = LabelEncoder()
    y_family = le_family.fit_transform(df["material_family"])
    X_train_f, X_test_f, y_train_f, y_test_f = train_test_split(X, y_family, test_size=0.2, random_state=42)

    clf_family = RandomForestClassifier(
        n_estimators=200, max_depth=15, min_samples_leaf=3, random_state=42, n_jobs=-1
    )
    clf_family.fit(X_train_f, y_train_f)
    y_pred_family = clf_family.predict(X_test_f)
    family_acc = accuracy_score(y_test_f, y_pred_family)
    family_f1 = f1_score(y_test_f, y_pred_family, average="weighted")
    print(f"Material Family Classifier — Accuracy: {family_acc:.4f}, F1: {family_f1:.4f}")

    # === 3. Shelf Life Regressor ===
    y_shelf = df["predicted_shelf_life_days"].values
    X_train_s, X_test_s, y_train_s, y_test_s = train_test_split(X, y_shelf, test_size=0.2, random_state=42)

    reg_shelf = GradientBoostingRegressor(
        n_estimators=300, max_depth=6, learning_rate=0.1, min_samples_leaf=10, random_state=42
    )
    reg_shelf.fit(X_train_s, y_train_s)
    y_pred_shelf = reg_shelf.predict(X_test_s)
    shelf_r2 = r2_score(y_test_s, y_pred_shelf)
    shelf_mae = mean_absolute_error(y_test_s, y_pred_shelf)
    print(f"Shelf Life Regressor — R²: {shelf_r2:.4f}, MAE: {shelf_mae:.2f} days")

    # Save models
    joblib.dump(clf_barrier, MODEL_DIR / "barrier_classifier.joblib")
    joblib.dump(clf_family, MODEL_DIR / "family_classifier.joblib")
    joblib.dump(reg_shelf, MODEL_DIR / "shelf_life_regressor.joblib")
    joblib.dump(le_barrier, MODEL_DIR / "le_barrier.joblib")
    joblib.dump(le_family, MODEL_DIR / "le_family.joblib")

    # Save feature names and metadata
    metadata = {
        "feature_names": feature_cols,
        "barrier_classes": le_barrier.classes_.tolist(),
        "material_families": le_family.classes_.tolist(),
        "dataset_size": len(df),
        "training_date": datetime.utcnow().isoformat(),
        "metrics": {
            "barrier_classifier": {"accuracy": round(barrier_acc, 4), "f1_weighted": round(barrier_f1, 4)},
            "family_classifier": {"accuracy": round(family_acc, 4), "f1_weighted": round(family_f1, 4)},
            "shelf_life_regressor": {"r2": round(shelf_r2, 4), "mae_days": round(shelf_mae, 2)},
        },
        "feature_importances": {
            "barrier_classifier": dict(zip(feature_cols, clf_barrier.feature_importances_.round(4).tolist())),
            "family_classifier": dict(zip(feature_cols, clf_family.feature_importances_.round(4).tolist())),
            "shelf_life_regressor": dict(zip(feature_cols, reg_shelf.feature_importances_.round(4).tolist())),
        },
    }
    with open(MODEL_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    # Save synthetic dataset
    df.to_csv(MODEL_DIR / "synthetic_dataset.csv", index=False)
    print(f"\nModels and metadata saved to {MODEL_DIR}")
    print(f"Synthetic dataset: {len(df)} rows")

    return metadata


def main():
    print("=" * 60)
    print("  PackSmart AI — ML Model Training")
    print("=" * 60)
    print()

    print("Loading seed data...")
    commodities, materials = load_seed_data()
    print(f"  {len(commodities)} commodities, {len(materials)} materials")

    print("Generating synthetic dataset (3500 rows)...")
    df = generate_synthetic_dataset(commodities, n_samples=3500)
    print(f"  Generated {len(df)} rows")
    print(f"  Barrier class distribution:\n{df['barrier_class'].value_counts().to_string()}")
    print(f"  Material family distribution:\n{df['material_family'].value_counts().to_string()}")
    print()

    print("Training models...")
    metadata = train_models(df)
    print()
    print("Done! Models are ready for inference.")


if __name__ == "__main__":
    main()
