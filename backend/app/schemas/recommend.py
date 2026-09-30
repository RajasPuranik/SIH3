from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class RecommendInput(BaseModel):
    commodity_id: str
    commodity_name: Optional[str] = None
    category: str
    moisture_pct: float = Field(ge=0, le=100)
    oil_fat_pct: float = Field(ge=0, le=100)
    ph: float = Field(ge=0, le=14)
    respiration_rate: str  # none, very_low, low, medium, high, very_high
    respiration_rate_ml: Optional[float] = None  # mL CO2/kg·h
    target_shelf_life_days: int = Field(ge=1, le=730)
    storage_temp_c: float = Field(ge=-40, le=60)
    relative_humidity_pct: float = Field(ge=0, le=100)
    transit_condition: str  # local, road, long_haul, export_sea, export_air
    storage_type: str  # ambient, cold_chain, controlled_atmosphere, frozen
    priority_protection: float = Field(ge=0, le=1, default=0.4)
    priority_cost: float = Field(ge=0, le=1, default=0.3)
    priority_sustainability: float = Field(ge=0, le=1, default=0.3)
    eco_only: bool = False
    pack_area_m2: Optional[float] = None

class MaterialRecommendation(BaseModel):
    rank: int
    material_id: str
    material_name: str
    material_category: str
    confidence: float
    protection_score: float
    cost_score: float
    sustainability_score: float
    overall_score: float
    required_otr: float
    provided_otr: float
    required_wvtr: float
    provided_wvtr: float
    recommended_thickness_um: float
    thickness_range: Dict[str, Any]
    heat_seal_temp: Dict[str, Any]
    sealability: str
    mechanical_strength: str
    map_composition: Optional[Dict[str, Any]] = None  # {o2, co2, n2}
    cost_per_1000_packs: Optional[float] = None
    recyclability_pct: float
    biodegradable: bool
    carbon_footprint: float
    reasoning: str  # plain language
    notes: str
    is_green_alternative: bool = False

class ShelfLifePrediction(BaseModel):
    predicted_days: float
    confidence_interval: Dict[str, float]  # {lower, upper}
    limiting_factor: str
    unpackaged_baseline_days: float
    q10_value: float
    temperature_sensitivity: str

class RiskFlag(BaseModel):
    type: str  # condensation, temperature_abuse, oxidation, microbial, physical
    severity: str  # low, medium, high
    message: str
    suggestion: str

class RespirationData(BaseModel):
    is_produce: bool = False
    respiration_rate_at_storage: Optional[float] = None
    steady_state_o2: Optional[float] = None
    steady_state_co2: Optional[float] = None
    perforation_count: Optional[int] = None
    condensation_risk: Optional[bool] = None
    gas_timeline: Optional[List[Dict[str, Any]]] = None  # [{day, o2_pct, co2_pct}]

class FeatureContribution(BaseModel):
    feature: str
    importance: float
    direction: str  # positive, negative
    description: str

class RecommendResult(BaseModel):
    id: str  # UUID
    timestamp: str
    input_summary: Dict[str, Any]
    recommendations: List[MaterialRecommendation]
    green_alternative: Optional[MaterialRecommendation] = None
    shelf_life: ShelfLifePrediction
    respiration: Optional[RespirationData] = None
    risk_flags: List[RiskFlag]
    feature_contributions: List[FeatureContribution]
    barrier_class: str
    eco_score: float  # 0-100
    rejected_materials: List[Dict[str, Any]]  # [{material_id, name, reason}]
    plain_summary: str
    what_to_do_next: List[str]
    warnings: List[str]
