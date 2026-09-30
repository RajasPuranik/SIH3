from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class BarrierRequirements(BaseModel):
    otr_max: Optional[float] = None
    wvtr_max: Optional[float] = None
    breathable: bool = False
    required_features: List[str] = []

class MAPComposition(BaseModel):
    o2_pct: float
    co2_pct: float
    n2_pct: float

class RiskFlag(BaseModel):
    risk_type: str
    severity: str
    description: str

class ExpertRuleEngine:
    """Expert rule engine to determine packaging material requirements based on food characteristics."""

    def determine_barrier_requirements(self, commodity_data: dict, storage_conditions: dict) -> BarrierRequirements:
        """Determines required OTR and WVTR ranges."""
        reqs = BarrierRequirements(required_features=[])
        
        moisture = commodity_data.get("moisture_pct", 0)
        fat = commodity_data.get("oil_fat_pct", 0)
        is_produce = commodity_data.get("is_produce", False)
        aw = commodity_data.get("water_activity", 0.0)
        
        if is_produce:
            reqs.breathable = True
            reqs.wvtr_max = 50.0 if moisture < 90 else 150.0
            if "anti_fog" in commodity_data.get("special_requirements", []):
                reqs.required_features.append("anti_fog")
            return reqs

        # Oxygen barrier logic
        if fat > 20:
            reqs.otr_max = 5.0
        elif fat > 10:
            reqs.otr_max = 20.0
        elif commodity_data.get("primary_spoilage") == "oxidation":
            reqs.otr_max = 10.0
        else:
            reqs.otr_max = 1000.0

        # Moisture barrier logic
        if aw < 0.6: # Dry, hygroscopic
            reqs.wvtr_max = 2.0
        elif moisture > 60: # High moisture
            reqs.wvtr_max = 10.0
        else:
            reqs.wvtr_max = 25.0

        if "light_sensitive" in commodity_data.get("special_requirements", []):
            reqs.required_features.append("opaque")

        return reqs

    def determine_map_composition(self, commodity_data: dict) -> MAPComposition:
        """Determines Optimal Modified Atmosphere Composition."""
        if not commodity_data.get("is_produce") and "map_beneficial" in commodity_data.get("special_requirements", []):
            cat = commodity_data.get("category")
            if cat == "meat":
                return MAPComposition(o2_pct=0.0, co2_pct=30.0, n2_pct=70.0)
            elif cat == "bakery":
                return MAPComposition(o2_pct=0.0, co2_pct=50.0, n2_pct=50.0)
            elif cat == "snack":
                return MAPComposition(o2_pct=0.0, co2_pct=0.0, n2_pct=100.0)
                
        if commodity_data.get("is_produce"):
            resp = commodity_data.get("respiration_rate", "low")
            if resp in ["high", "very_high"]:
                return MAPComposition(o2_pct=5.0, co2_pct=10.0, n2_pct=85.0)
            else:
                return MAPComposition(o2_pct=3.0, co2_pct=5.0, n2_pct=92.0)
                
        return MAPComposition(o2_pct=21.0, co2_pct=0.04, n2_pct=78.96)

    def flag_risks(self, commodity_data: dict, storage_conditions: dict) -> List[RiskFlag]:
        """Flags specific risks like condensation or temperature abuse."""
        flags = []
        temp = storage_conditions.get("temperature", 25.0)
        rh = storage_conditions.get("rh", 60.0)
        
        if rh > 85.0 and temp < 10.0:
            flags.append(RiskFlag(risk_type="Condensation", severity="High", description="High RH and cold storage may lead to in-pack condensation."))
            
        rec_temp = commodity_data.get("recommended_storage_temp", {})
        if rec_temp and temp > rec_temp.get("max", 25) + 5:
            flags.append(RiskFlag(risk_type="Temperature Abuse", severity="Critical", description="Storage temp significantly higher than recommended, accelerating spoilage."))
            
        if commodity_data.get("ph", 7.0) > 4.5 and commodity_data.get("water_activity", 0) > 0.85:
            flags.append(RiskFlag(risk_type="Microbial", severity="High", description="High pH and water activity support pathogen growth."))
            
        return flags

    def get_barrier_class(self, requirements: BarrierRequirements) -> str:
        """Classifies requirements into a barrier class."""
        if requirements.breathable:
            return "breathable"
        if requirements.otr_max and requirements.otr_max < 2.0:
            return "ultra_high"
        if (requirements.otr_max and requirements.otr_max < 20.0) or (requirements.wvtr_max and requirements.wvtr_max < 2.0):
            return "high"
        if (requirements.otr_max and requirements.otr_max < 100.0) or (requirements.wvtr_max and requirements.wvtr_max < 15.0):
            return "medium"
        return "low"
