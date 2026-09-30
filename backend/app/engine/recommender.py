import json
import os
from pathlib import Path
from typing import Dict, Any

from .rules import ExpertRuleEngine
from .scoring import MaterialScorer
from .shelf_life import ShelfLifePredictor
from .respiration import RespirationModel

class PackagingRecommender:
    """Main orchestrator for packaging recommendations."""
    
    def __init__(self, seed_dir: str):
        self.seed_dir = Path(seed_dir)
        self.materials = self._load_json("materials.json")
        self.commodities = {c["id"]: c for c in self._load_json("commodities.json")}
        
        self.rules = ExpertRuleEngine()
        self.scorer = MaterialScorer()
        self.shelf_life = ShelfLifePredictor()
        self.respiration = RespirationModel()

    def _load_json(self, filename: str):
        with open(self.seed_dir / filename, 'r', encoding='utf-8') as f:
            return json.load(f)

    def recommend(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate packaging recommendations."""
        commodity_id = input_data.get("commodity_id")
        storage = input_data.get("storage_conditions", {"temperature": 25, "rh": 60})
        priorities = input_data.get("priorities", {"priority_cost": 0.33, "priority_sustainability": 0.33, "priority_protection": 0.34})
        weight_g = input_data.get("weight_g", 500.0)
        area_m2 = input_data.get("area_m2", 0.1)

        commodity = self.commodities.get(commodity_id)
        if not commodity:
            raise ValueError(f"Commodity {commodity_id} not found.")

        # 1. Rule Engine
        reqs = self.rules.determine_barrier_requirements(commodity, storage)
        map_comp = self.rules.determine_map_composition(commodity)
        risks = self.rules.flag_risks(commodity, storage)
        b_class = self.rules.get_barrier_class(reqs)

        # 2. Scoring & Filtering
        filtered = self.scorer.filter_materials(self.materials, reqs)
        scored = self.scorer.score_materials(filtered, reqs, priorities)
        
        if not scored:
            return {"error": "No materials found meeting the requirements."}

        top_materials = scored[:3]
        green_alt = self.scorer.find_green_alternative(scored)

        # 3. Shelf Life & Enhancements
        results = []
        for sm in top_materials:
            sl_pred = self.shelf_life.predict(commodity, sm.material, storage.get("temperature", 25), storage.get("rh", 60), weight_g, area_m2)
            cost = self.scorer.estimate_cost_per_1000(sm.material, area_m2)
            
            resp_data = None
            if commodity.get("is_produce"):
                rr = commodity.get("respiration_rate_ml", 0)
                ss = self.respiration.steady_state_composition(rr, rr*0.9, weight_g/1000, area_m2, sm.material.get("otr", 1000), sm.material.get("wvtr", 100))
                resp_data = {
                    "steady_state": ss,
                    "condensation_risk": self.respiration.assess_condensation(storage.get("rh", 60), storage.get("temperature", 25), 3.0)
                }
                
            results.append({
                "material": sm.material,
                "score_details": {
                    "total": sm.score,
                    "cost": sm.cost_score,
                    "sustainability": sm.sustainability_score,
                    "protection": sm.protection_score
                },
                "shelf_life": sl_pred,
                "estimated_cost_per_1000": round(cost, 2),
                "respiration_data": resp_data
            })

        return {
            "commodity": commodity,
            "barrier_requirements": reqs.model_dump(),
            "barrier_class": b_class,
            "recommended_map": map_comp.model_dump(),
            "risk_flags": [r.model_dump() for r in risks],
            "top_recommendations": results,
            "green_alternative": green_alt.model_dump() if green_alt else None,
            "reasoning": f"Based on the {commodity['name']}'s characteristics, we selected {b_class} barrier materials to mitigate {commodity.get('primary_spoilage', 'spoilage')}."
        }
