import math
from typing import Tuple

class ShelfLifePredictor:
    """Predicts shelf life of packaged food using kinetics and barrier properties."""
    
    def __init__(self):
        self.gas_constant = 8.314 # J/(mol K)
    
    def q10_correction(self, base_shelf_life: float, q10: float, t_base: float, t_actual: float) -> float:
        """Applies Q10 temperature correction model."""
        delta_t = t_actual - t_base
        return base_shelf_life / (q10 ** (delta_t / 10.0))

    def moisture_driven_life(self, initial_moisture: float, critical_moisture: float, weight_g: float, area_m2: float, wvtr: float, delta_rh: float) -> float:
        """Calculates shelf life based on moisture gain/loss through packaging."""
        if wvtr <= 0 or area_m2 <= 0 or delta_rh <= 0:
            return 9999
        moisture_tolerance_g = abs(critical_moisture - initial_moisture) / 100.0 * weight_g
        # wvtr is g/m2/day. delta_rh is percentage difference (0-100)
        driving_force = delta_rh / 100.0 
        rate_g_per_day = wvtr * area_m2 * driving_force
        if rate_g_per_day <= 0:
            return 9999
        return moisture_tolerance_g / rate_g_per_day

    def oxidation_driven_life(self, fat_pct: float, weight_g: float, area_m2: float, otr: float) -> float:
        """Calculates shelf life based on oxygen ingress."""
        if otr <= 0 or area_m2 <= 0:
            return 9999
        fat_g = (fat_pct / 100.0) * weight_g
        # Assume critical O2 tolerance is 10cc per gram of fat.
        o2_tolerance_cc = fat_g * 10.0 
        rate_cc_per_day = otr * area_m2 * 0.21 # 21% atmospheric oxygen driving force
        if rate_cc_per_day <= 0:
            return 9999
        return o2_tolerance_cc / rate_cc_per_day

    def predict(self, commodity: dict, material: dict, storage_temp: float, storage_rh: float, weight_g: float, area_m2: float) -> dict:
        """Comprehensive shelf life prediction."""
        t_base = commodity.get("recommended_storage_temp", {}).get("min", 20.0)
        base_sl = commodity.get("typical_shelf_life_days", 5)
        
        # Temperature adjustment
        q10 = 2.5 if commodity.get("is_produce") else 2.0
        adjusted_base_sl = self.q10_correction(base_sl, q10, t_base, storage_temp)
        
        wvtr = material.get("wvtr", 1000)
        otr = material.get("otr", 10000)
        
        moisture_limit = 9999
        if commodity.get("category") in ["bakery", "snack", "grain", "spice"]:
            moisture_limit = self.moisture_driven_life(
                commodity.get("moisture_pct", 5), 
                commodity.get("moisture_pct", 5) + 3.0, # 3% tolerance
                weight_g, area_m2, wvtr, abs(storage_rh - 50.0)
            )
            
        oxidation_limit = 9999
        fat = commodity.get("oil_fat_pct", 0)
        if fat > 5:
            oxidation_limit = self.oxidation_driven_life(fat, weight_g, area_m2, otr)
            
        factors = {
            "temperature_base": adjusted_base_sl,
            "moisture": moisture_limit,
            "oxidation": oxidation_limit
        }
        
        limiting_factor = min(factors, key=factors.get)
        predicted_days = factors[limiting_factor]
        
        return {
            "predicted_days": round(predicted_days, 1),
            "confidence_interval": [round(predicted_days * 0.8, 1), round(predicted_days * 1.2, 1)],
            "limiting_factor": limiting_factor,
            "unpackaged_baseline": round(adjusted_base_sl, 1)
        }
