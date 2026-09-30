from fastapi import APIRouter, HTTPException
from typing import Optional, List, Dict, Any
import json
import os

router = APIRouter(prefix="/api/commodities", tags=["commodities"])

def load_commodities() -> List[Dict[str, Any]]:
    # Mock data since seed file wasn't provided, replace with actual logic to load seed file
    return [
        {"id": "apple", "name": "Apple", "category": "Fruits"},
        {"id": "wheat", "name": "Wheat", "category": "Grains"},
    ]

@router.get("", response_model=List[Dict[str, Any]])
def list_commodities(category: Optional[str] = None):
    data = load_commodities()
    if category:
        return [c for c in data if c.get("category", "").lower() == category.lower()]
    return data

@router.get("/{id}", response_model=Dict[str, Any])
def get_commodity(id: str):
    data = load_commodities()
    for c in data:
        if c["id"] == id:
            return c
    raise HTTPException(status_code=404, detail="Commodity not found")
