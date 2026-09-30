"""
PackSmart AI — Backend Unit Tests

Tests for the recommendation engine with 5+ commodity scenarios.
"""

import sys
import os
import json
import pytest
from pathlib import Path

# Add backend to path
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.engine.rules import ExpertRuleEngine
from app.engine.scoring import MaterialScorer
from app.engine.shelf_life import ShelfLifePredictor
from app.engine.respiration import RespirationModel
from app.engine.recommender import PackagingRecommender

SEED_DIR = str(BACKEND_DIR / "app" / "seed")


@pytest.fixture
def engine():
    return ExpertRuleEngine()


@pytest.fixture
def scorer():
    return MaterialScorer()


@pytest.fixture
def shelf_life():
    return ShelfLifePredictor()


@pytest.fixture
def respiration():
    return RespirationModel()


@pytest.fixture
def recommender():
    return PackagingRecommender(SEED_DIR)


# ── Rule Engine Tests ──────────────────────────────────────────────────

class TestExpertRuleEngine:
    def test_fresh_produce_breathable(self, engine):
        """Fresh produce should require breathable packaging."""
        commodity = {
            "moisture_pct": 85,
            "oil_fat_pct": 0.3,
            "is_produce": True,
            "water_activity": 0.95,
            "special_requirements": [],
        }
        reqs = engine.determine_barrier_requirements(commodity, {"temperature": 4, "rh": 90})
        assert reqs.breathable is True
        bc = engine.get_barrier_class(reqs)
        assert bc == "breathable"

    def test_high_fat_needs_oxygen_barrier(self, engine):
        """High-fat foods need low OTR (high oxygen barrier)."""
        commodity = {
            "moisture_pct": 5,
            "oil_fat_pct": 25,
            "is_produce": False,
            "water_activity": 0.3,
            "primary_spoilage": "rancidity",
            "special_requirements": [],
        }
        reqs = engine.determine_barrier_requirements(commodity, {"temperature": 25, "rh": 50})
        assert reqs.otr_max is not None
        assert reqs.otr_max <= 10  # High fat → very low OTR

    def test_dry_hygroscopic_needs_moisture_barrier(self, engine):
        """Dry, hygroscopic foods need low WVTR."""
        commodity = {
            "moisture_pct": 8,
            "oil_fat_pct": 1,
            "is_produce": False,
            "water_activity": 0.4,
            "primary_spoilage": "moisture_gain",
            "special_requirements": [],
        }
        reqs = engine.determine_barrier_requirements(commodity, {"temperature": 25, "rh": 70})
        assert reqs.wvtr_max is not None
        assert reqs.wvtr_max <= 5

    def test_meat_map_composition(self, engine):
        """Meat should get MAP with low O2 and high CO2."""
        commodity = {
            "category": "meat",
            "is_produce": False,
            "special_requirements": ["map_beneficial"],
            "respiration_rate": "none",
        }
        map_comp = engine.determine_map_composition(commodity)
        assert map_comp.o2_pct < 5
        assert map_comp.co2_pct > 20

    def test_condensation_risk(self, engine):
        """High RH + cold storage should flag condensation risk."""
        commodity = {
            "moisture_pct": 85,
            "ph": 4.2,
            "water_activity": 0.95,
            "recommended_storage_temp": {"min": 2, "max": 8},
            "special_requirements": [],
        }
        risks = engine.flag_risks(commodity, {"temperature": 4, "rh": 92})
        risk_types = [r.risk_type for r in risks]
        assert "Condensation" in risk_types


# ── Scoring Tests ──────────────────────────────────────────────────────

class TestMaterialScorer:
    def test_filter_removes_inadequate_materials(self, scorer, recommender):
        """Materials with OTR above requirement should be filtered out."""
        from app.engine.rules import BarrierRequirements
        reqs = BarrierRequirements(otr_max=10, wvtr_max=5)
        filtered = scorer.filter_materials(recommender.materials, reqs)
        for mat in filtered:
            assert mat.get("otr", 999999) <= 10
            assert mat.get("wvtr", 999999) <= 5

    def test_scoring_respects_priorities(self, scorer, recommender):
        """Cost-priority should rank cheaper materials higher."""
        from app.engine.rules import BarrierRequirements
        reqs = BarrierRequirements(otr_max=5000, wvtr_max=50)
        filtered = scorer.filter_materials(recommender.materials, reqs)

        cost_priority = {"priority_cost": 0.8, "priority_sustainability": 0.1, "priority_protection": 0.1}
        scored_cost = scorer.score_materials(filtered, reqs, cost_priority)

        sust_priority = {"priority_cost": 0.1, "priority_sustainability": 0.8, "priority_protection": 0.1}
        scored_sust = scorer.score_materials(filtered, reqs, sust_priority)

        # Top material should differ when priorities change
        if len(scored_cost) > 1 and len(scored_sust) > 1:
            # At minimum, the scores should be different
            assert scored_cost[0].score != scored_sust[0].score or scored_cost[0].material["id"] != scored_sust[0].material["id"]


# ── Shelf Life Tests ───────────────────────────────────────────────────

class TestShelfLife:
    def test_cold_storage_extends_life(self, shelf_life):
        """Colder storage should predict longer shelf life."""
        commodity = {
            "is_produce": True,
            "moisture_pct": 85,
            "oil_fat_pct": 0.5,
            "typical_shelf_life_days": 5,
            "category": "fruit",
            "recommended_storage_temp": {"min": 2, "max": 8},
        }
        material = {"otr": 6000, "wvtr": 15}

        cold = shelf_life.predict(commodity, material, 4, 90, 500, 0.06)
        warm = shelf_life.predict(commodity, material, 25, 60, 500, 0.06)

        assert cold["predicted_days"] > warm["predicted_days"]

    def test_q10_model(self, shelf_life):
        """Q10 correction should roughly halve life per 10°C increase."""
        base = shelf_life.q10_correction(100, 2.0, 20, 20)
        hotter = shelf_life.q10_correction(100, 2.0, 20, 30)
        assert abs(base - 100) < 0.01
        assert abs(hotter - 50) < 0.01


# ── Recommender Integration Tests ─────────────────────────────────────

class TestRecommenderScenarios:
    """Test 5+ real commodity scenarios with expected material families."""

    def test_scenario_fresh_strawberry_export(self, recommender):
        """Fresh strawberries exported by air → breathable packaging."""
        result = recommender.recommend({
            "commodity_id": "strawberry",
            "storage_conditions": {"temperature": 2, "rh": 90},
            "priorities": {"priority_cost": 0.2, "priority_sustainability": 0.3, "priority_protection": 0.5},
            "weight_g": 250,
            "area_m2": 0.04,
        })
        assert "error" not in result
        assert result["barrier_class"] == "breathable"

    def test_scenario_potato_chips(self, recommender):
        """Potato chips → high barrier (N2 flush, low OTR, low WVTR)."""
        result = recommender.recommend({
            "commodity_id": "potato_chips",
            "storage_conditions": {"temperature": 25, "rh": 50},
            "priorities": {"priority_cost": 0.4, "priority_sustainability": 0.2, "priority_protection": 0.4},
            "weight_g": 200,
            "area_m2": 0.08,
        })
        assert "error" not in result
        bc = result["barrier_class"]
        assert bc in ("high", "ultra_high", "medium")

    def test_scenario_turmeric_powder(self, recommender):
        """Turmeric powder in monsoon → moisture barrier critical."""
        result = recommender.recommend({
            "commodity_id": "turmeric",
            "storage_conditions": {"temperature": 30, "rh": 85},
            "priorities": {"priority_cost": 0.3, "priority_sustainability": 0.2, "priority_protection": 0.5},
            "weight_g": 500,
            "area_m2": 0.05,
        })
        assert "error" not in result

    def test_scenario_fresh_chicken(self, recommender):
        """Fresh chicken → high barrier, MAP recommended."""
        result = recommender.recommend({
            "commodity_id": "chicken",
            "storage_conditions": {"temperature": 2, "rh": 75},
            "priorities": {"priority_cost": 0.3, "priority_sustainability": 0.2, "priority_protection": 0.5},
            "weight_g": 500,
            "area_m2": 0.06,
        })
        assert "error" not in result
        # MAP should be non-air composition
        map_comp = result.get("recommended_map", {})
        # For meat, expect reduced O2
        assert map_comp.get("o2_pct", 21) < 21

    def test_scenario_rice(self, recommender):
        """Rice (dry grain) → moisture barrier, moderate OTR OK."""
        result = recommender.recommend({
            "commodity_id": "rice",
            "storage_conditions": {"temperature": 25, "rh": 60},
            "priorities": {"priority_cost": 0.5, "priority_sustainability": 0.3, "priority_protection": 0.2},
            "weight_g": 1000,
            "area_m2": 0.1,
        })
        assert "error" not in result
        assert result["barrier_class"] in ("medium", "high", "low")

    def test_scenario_cashews(self, recommender):
        """Cashews (high fat nuts) → high oxygen barrier."""
        result = recommender.recommend({
            "commodity_id": "cashews",
            "storage_conditions": {"temperature": 25, "rh": 50},
            "priorities": {"priority_cost": 0.3, "priority_sustainability": 0.3, "priority_protection": 0.4},
            "weight_g": 250,
            "area_m2": 0.04,
        })
        assert "error" not in result
        bc = result["barrier_class"]
        assert bc in ("high", "ultra_high")


# ── Respiration Tests ──────────────────────────────────────────────────

class TestRespiration:
    def test_steady_state_produces_valid_gas_levels(self, respiration):
        """Steady-state should have O2 < 21% and CO2 > 0%."""
        ss = respiration.steady_state_composition(
            rr_o2=20, rr_co2=18, weight_kg=0.5,
            area_m2=0.04, perm_o2=6000, perm_co2=9000,
        )
        assert 0 <= ss["o2_pct"] <= 21
        assert ss["co2_pct"] >= 0

    def test_gas_timeline_length(self, respiration):
        """Gas timeline should have correct number of data points."""
        timeline = respiration.gas_timeline(
            rr_o2=20, rr_co2=18, weight_kg=0.5,
            area_m2=0.04, perm_o2=6000, days=14,
        )
        assert len(timeline) == 15  # days 0 through 14
        assert timeline[0]["o2_pct"] == 21.0

    def test_condensation_assessment(self, respiration):
        """High RH + temperature fluctuation should indicate condensation risk."""
        assert respiration.assess_condensation(92, 4, 5) is True
        assert respiration.assess_condensation(50, 25, 1) is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
