"""Pydantic schemas for traceability / QR code system."""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any, List


class TraceCreate(BaseModel):
    analysis_id: str
    producer_name: str
    batch_number: str
    packaging_date: Optional[datetime] = None


class TraceResponse(BaseModel):
    id: str
    hash: str
    analysis_id: str
    producer_name: str
    batch_number: str
    packaging_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    qr_svg: str
    created_at: Optional[datetime] = None
    product_info: Dict[str, Any] = {}


class TimelineStep(BaseModel):
    stage: str
    date: Optional[str] = None
    status: str  # completed, active, upcoming, reached


class TracePublic(BaseModel):
    hash: str
    producer_name: str
    batch_number: str
    packaging_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    product_info: Dict[str, Any] = {}
    days_elapsed: int = 0
    days_remaining: int = 0
    freshness_pct: float = 0
    freshness_status: str = "unknown"  # fresh, good, use_soon, expired
    freshness_color: str = "gray"      # green, amber, orange, red
    total_shelf_life_days: int = 0
    timeline: List[Dict[str, Any]] = []
