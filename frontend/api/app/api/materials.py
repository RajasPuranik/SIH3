from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/api/materials", tags=["materials"])

def load_materials() -> List[Dict[str, Any]]:
    # Mock data
    return [
        {"id": "ldpe", "name": "LDPE", "biodegradable": False, "category": "Plastic", "barrier_level": "Low", "cost": 10},
        {"id": "pla", "name": "PLA", "biodegradable": True, "category": "Bioplastic", "barrier_level": "Medium", "cost": 25},
        {"id": "glass", "name": "Glass", "biodegradable": False, "category": "Glass", "barrier_level": "High", "cost": 50},
    ]

@router.get("", response_model=List[Dict[str, Any]])
def list_materials(
    biodegradable: Optional[bool] = None,
    category: Optional[str] = None,
    barrier_level: Optional[str] = None,
    max_cost: Optional[float] = None
):
    data = load_materials()
    result = []
    for m in data:
        if biodegradable is not None and m["biodegradable"] != biodegradable:
            continue
        if category is not None and m["category"].lower() != category.lower():
            continue
        if barrier_level is not None and m["barrier_level"].lower() != barrier_level.lower():
            continue
        if max_cost is not None and m["cost"] > max_cost:
            continue
        result.append(m)
    return result

@router.get("/compare", response_model=List[Dict[str, Any]])
def compare_materials(ids: str = Query(..., description="Comma separated material IDs")):
    id_list = [i.strip() for i in ids.split(",") if i.strip()]
    if len(id_list) > 3:
        raise HTTPException(status_code=400, detail="Cannot compare more than 3 materials")
    
    data = load_materials()
    result = []
    for i in id_list:
        mat = next((m for m in data if m["id"] == i), None)
        if mat:
            result.append(mat)
        else:
            raise HTTPException(status_code=404, detail=f"Material {i} not found")
    return result

@router.get("/{id}", response_model=Dict[str, Any])
def get_material(id: str):
    data = load_materials()
    for m in data:
        if m["id"] == id:
            return m
    raise HTTPException(status_code=404, detail="Material not found")
