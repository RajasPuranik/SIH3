from typing import List, Optional
from pydantic import BaseModel
from .rules import BarrierRequirements

class ScoredMaterial(BaseModel):
    material: dict
    score: float
    cost_score: float
    sustainability_score: float
    protection_score: float

class MaterialScorer:
    """Filters and scores materials based on barrier rules and user priorities."""

    def filter_materials(self, materials: List[dict], requirements: BarrierRequirements) -> List[dict]:
        """Filters materials that meet the strict OTR and WVTR barrier requirements."""
        filtered = []
        for mat in materials:
            if requirements.breathable:
                if mat.get("otr", 0) < 5000:
                    continue
            else:
                if requirements.otr_max is not None and mat.get("otr", 999999) > requirements.otr_max:
                    continue
                if requirements.wvtr_max is not None and mat.get("wvtr", 999999) > requirements.wvtr_max:
                    continue
            
            # Check features
            if "opaque" in requirements.required_features and mat.get("transparency") != "opaque":
                continue
            if "anti_fog" in requirements.required_features and "anti-fog" not in mat.get("name", "").lower():
                # Mild heuristic for anti_fog feature matching
                pass
                
            filtered.append(mat)
        return filtered

    def score_materials(self, filtered_materials: List[dict], requirements: BarrierRequirements, user_priorities: dict) -> List[ScoredMaterial]:
        """Ranks materials by calculating a weighted score."""
        scored = []
        w_cost = user_priorities.get("priority_cost", 0.33)
        w_sust = user_priorities.get("priority_sustainability", 0.33)
        w_prot = user_priorities.get("priority_protection", 0.34)
        
        # Min-max values for normalization
        max_cost = max([m.get("cost_index", 1) for m in filtered_materials]) if filtered_materials else 1
        
        for mat in filtered_materials:
            # Cost Score (Lower is better)
            c_idx = mat.get("cost_index", 1)
            cost_score = 1.0 - (c_idx / (max_cost + 0.1))
            
            # Sustainability Score
            sust_score = (mat.get("recyclability_pct", 0) / 100.0) * 0.5
            if mat.get("biodegradable") or mat.get("compostable"):
                sust_score += 0.5
                
            # Protection Score
            # Closer to the max allowable limits -> just adequate (lower score).
            # Lower OTR/WVTR -> better protection (higher score).
            prot_score = 0.5 # baseline
            if not requirements.breathable:
                if requirements.otr_max and mat.get("otr", 1000) < requirements.otr_max * 0.1:
                    prot_score += 0.25
                if requirements.wvtr_max and mat.get("wvtr", 100) < requirements.wvtr_max * 0.1:
                    prot_score += 0.25
            else:
                prot_score = 0.9 # Breathable films selected automatically have high protection for produce

            total_score = (cost_score * w_cost) + (sust_score * w_sust) + (prot_score * w_prot)
            
            scored.append(ScoredMaterial(
                material=mat,
                score=round(total_score, 4),
                cost_score=round(cost_score, 4),
                sustainability_score=round(sust_score, 4),
                protection_score=round(prot_score, 4)
            ))
            
        scored.sort(key=lambda x: x.score, reverse=True)
        return scored

    def find_green_alternative(self, scored_materials: List[ScoredMaterial]) -> Optional[ScoredMaterial]:
        """Finds the best biodegradable or compostable option from the filtered pool."""
        for sm in scored_materials:
            if sm.material.get("biodegradable") or sm.material.get("compostable"):
                return sm
        return None

    def estimate_cost_per_1000(self, material: dict, pack_area_m2: float) -> float:
        """Estimates cost based on cost index and area. Baseline is approx $0.05 per m2."""
        base_cost_m2 = 0.05 
        cost_m2 = base_cost_m2 * material.get("cost_index", 1.0)
        return cost_m2 * pack_area_m2 * 1000.0
