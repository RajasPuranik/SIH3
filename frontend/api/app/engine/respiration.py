import math
from typing import Dict, List

class RespirationModel:
    """Fresh produce respiration and gas exchange model."""
    
    def __init__(self):
        self.R = 8.314
        
    def arrhenius_rate(self, base_rate: float, e_a: float, t_ref: float, t_actual: float) -> float:
        """Adjusts respiration rate based on temperature."""
        t_ref_k = t_ref + 273.15
        t_actual_k = t_actual + 273.15
        return base_rate * math.exp((-e_a / self.R) * (1/t_actual_k - 1/t_ref_k))
        
    def steady_state_composition(self, rr_o2: float, rr_co2: float, weight_kg: float, area_m2: float, perm_o2: float, perm_co2: float) -> Dict[str, float]:
        """Estimates steady-state O2 and CO2 in package."""
        if perm_o2 <= 0 or perm_co2 <= 0:
            return {"o2_pct": 0.0, "co2_pct": 100.0}
            
        # rr is mL/kg*h. perm is cc/m2*day. 
        # Convert rr to cc/day
        consumption_o2_day = rr_o2 * weight_kg * 24
        production_co2_day = rr_co2 * weight_kg * 24
        
        # dO2 = consumption / (perm * area)
        delta_o2 = (consumption_o2_day / (perm_o2 * area_m2)) * 100
        delta_co2 = (production_co2_day / (perm_co2 * area_m2)) * 100
        
        ss_o2 = max(0.0, 21.0 - delta_o2)
        ss_co2 = min(100.0, 0.03 + delta_co2)
        
        return {"o2_pct": round(ss_o2, 2), "co2_pct": round(ss_co2, 2)}
        
    def suggest_perforations(self, target_o2: float, current_ss_o2: float, area_m2: float) -> int:
        """Suggests micro-perforation count to reach target O2."""
        if current_ss_o2 >= target_o2:
            return 0
        diff = target_o2 - current_ss_o2
        # Rough heuristic: 1 micro-perforation (50µm) adds ~0.1% O2 per day per m2
        return int(max(1, (diff * area_m2) * 50))
        
    def assess_condensation(self, rh_storage: float, temp_storage: float, temp_fluctuation: float) -> bool:
        """Assesses risk of condensation."""
        return rh_storage > 85.0 and temp_fluctuation > 2.0
        
    def simulate_gas_exchange(self, days: int, rr: float, perm: float) -> List[Dict[str, float]]:
        """Provides time-series of gas composition."""
        series = []
        o2 = 21.0
        co2 = 0.03
        for day in range(days + 1):
            series.append({"day": day, "o2": round(o2, 1), "co2": round(co2, 1)})
            # Exponential approach to steady state
            decay_rate = rr / (perm + rr) if (perm + rr) > 0 else 0.01
            o2 = max(2.0, o2 - (21.0 - 2.0) * decay_rate * (1 - day / (days + 1)))
            co2 = min(15.0, co2 + 15.0 * decay_rate * (1 - day / (days + 1)))
        return series

    def gas_timeline(self, rr_o2: float, rr_co2: float, weight_kg: float,
                     area_m2: float, perm_o2: float, days: int = 14) -> List[Dict[str, float]]:
        """Generate a gas timeline for charting in the frontend."""
        ss = self.steady_state_composition(rr_o2, rr_co2, weight_kg, area_m2, perm_o2, perm_o2 * 1.5)
        target_o2 = ss["o2_pct"]
        target_co2 = ss["co2_pct"]

        timeline = []
        o2 = 21.0
        co2 = 0.03
        # Time constant (days to reach ~63% of steady state)
        tau = max(0.5, 2.0 * area_m2 / (weight_kg + 0.01))

        for day in range(days + 1):
            fraction = 1.0 - math.exp(-day / tau) if tau > 0 else 1.0
            o2 = 21.0 - (21.0 - target_o2) * fraction
            co2 = 0.03 + (target_co2 - 0.03) * fraction
            timeline.append({
                "day": day,
                "o2_pct": round(max(0, o2), 2),
                "co2_pct": round(max(0, co2), 2),
            })
        return timeline
