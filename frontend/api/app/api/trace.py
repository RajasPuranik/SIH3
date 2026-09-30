"""
PackLabs — Traceability QR Code Routes

Create trace batches, generate QR codes, and serve public scan pages.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid
import hashlib
import json
import io

from app.core.database import get_db
from app.core.security import get_optional_user
from app.models.user import User
from app.models.analysis import Analysis, TraceBatch
from app.schemas.trace import TraceCreate, TraceResponse, TracePublic
from app.schemas.recommend import RecommendResult

router = APIRouter(prefix="/api", tags=["traceability"])


def generate_short_hash(analysis_id: str, batch_number: str) -> str:
    """Generate a short unique hash for the trace URL."""
    data = f"{analysis_id}:{batch_number}:{datetime.utcnow().isoformat()}"
    full_hash = hashlib.sha256(data.encode()).hexdigest()
    return full_hash[:12]


def generate_qr_svg(url: str) -> str:
    """Generate QR code as SVG string."""
    try:
        import qrcode
        import qrcode.image.svg

        factory = qrcode.image.svg.SvgPathImage
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=2,
        )
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(image_factory=factory)

        buffer = io.BytesIO()
        img.save(buffer)
        return buffer.getvalue().decode("utf-8")
    except ImportError:
        # Fallback: return a placeholder SVG
        return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
            <rect fill="white" width="200" height="200"/>
            <text x="100" y="100" text-anchor="middle" font-size="10" fill="#333">QR: {url[-12:]}</text>
        </svg>'''


def generate_qr_png(url: str) -> bytes:
    """Generate QR code as PNG bytes."""
    try:
        import qrcode
        from PIL import Image

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=2,
        )
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#0F5132", back_color="white")

        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        return buffer.getvalue()
    except ImportError:
        return b""


@router.post("/trace", response_model=TraceResponse)
def create_trace(
    data: TraceCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_optional_user),
):
    """Create a traceability batch with QR code."""
    # Verify the analysis exists
    analysis = db.query(Analysis).filter(Analysis.id == data.analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # Parse the result to get shelf life prediction
    result = RecommendResult.model_validate_json(analysis.result_json)

    # Generate hash and URLs
    short_hash = generate_short_hash(data.analysis_id, data.batch_number)
    trace_url = f"https://packlabs.ai/trace/{short_hash}"  # Production URL

    # Calculate expiry date
    packaging_date = data.packaging_date or datetime.utcnow()
    predicted_days = result.shelf_life.predicted_days
    expiry_date = packaging_date + timedelta(days=int(predicted_days))

    # Generate QR codes
    qr_svg = generate_qr_svg(trace_url)

    # Get product info for the trace
    input_summary = result.input_summary
    top_rec = result.recommendations[0] if result.recommendations else None

    product_info = {
        "commodity_name": input_summary.get("commodity_name", "Unknown"),
        "category": input_summary.get("category", "unknown"),
        "packaging_material": top_rec.material_name if top_rec else "Unknown",
        "barrier_class": result.barrier_class,
        "storage_temp_c": input_summary.get("storage_temp_c", 25),
        "shelf_life_days": predicted_days,
        "eco_score": result.eco_score,
    }

    # Save to database
    trace_batch = TraceBatch(
        id=str(uuid.uuid4()),
        hash=short_hash,
        analysis_id=data.analysis_id,
        producer_name=data.producer_name,
        batch_number=data.batch_number,
        packaging_date=packaging_date,
        expiry_date=expiry_date,
        qr_data=json.dumps({
            "svg": qr_svg,
            "url": trace_url,
            "product_info": product_info,
        }),
    )
    db.add(trace_batch)
    db.commit()
    db.refresh(trace_batch)

    return TraceResponse(
        id=trace_batch.id,
        hash=short_hash,
        analysis_id=data.analysis_id,
        producer_name=data.producer_name,
        batch_number=data.batch_number,
        packaging_date=packaging_date,
        expiry_date=expiry_date,
        qr_svg=qr_svg,
        created_at=trace_batch.created_at,
        product_info=product_info,
    )


@router.get("/trace/{hash}")
def get_trace(hash: str, db: Session = Depends(get_db)):
    """Public endpoint for scanning QR codes — returns trace information."""
    trace = db.query(TraceBatch).filter(TraceBatch.hash == hash).first()
    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")

    qr_data = json.loads(trace.qr_data) if trace.qr_data else {}
    product_info = qr_data.get("product_info", {})

    # Calculate freshness
    now = datetime.utcnow()
    packaging_date = trace.packaging_date
    expiry_date = trace.expiry_date

    if packaging_date and expiry_date:
        total_life = (expiry_date - packaging_date).days
        days_elapsed = (now - packaging_date).days
        days_remaining = max(0, (expiry_date - now).days)
        freshness_pct = max(0, min(100, (days_remaining / total_life * 100))) if total_life > 0 else 0
    else:
        days_elapsed = 0
        days_remaining = 0
        freshness_pct = 0
        total_life = 0

    # Determine freshness status
    if freshness_pct > 60:
        freshness_status = "fresh"
        freshness_color = "green"
    elif freshness_pct > 25:
        freshness_status = "good"
        freshness_color = "amber"
    elif freshness_pct > 0:
        freshness_status = "use_soon"
        freshness_color = "orange"
    else:
        freshness_status = "expired"
        freshness_color = "red"

    return TracePublic(
        hash=trace.hash,
        producer_name=trace.producer_name,
        batch_number=trace.batch_number,
        packaging_date=packaging_date,
        expiry_date=expiry_date,
        product_info=product_info,
        days_elapsed=days_elapsed,
        days_remaining=days_remaining,
        freshness_pct=round(freshness_pct, 1),
        freshness_status=freshness_status,
        freshness_color=freshness_color,
        total_shelf_life_days=total_life,
        timeline=[
            {"stage": "Production", "date": packaging_date.isoformat() if packaging_date else None, "status": "completed"},
            {"stage": "Packaged", "date": packaging_date.isoformat() if packaging_date else None, "status": "completed"},
            {"stage": "In Shelf Life", "date": now.isoformat(), "status": "active" if freshness_pct > 0 else "completed"},
            {"stage": "Expiry", "date": expiry_date.isoformat() if expiry_date else None, "status": "upcoming" if freshness_pct > 0 else "reached"},
        ],
    )


@router.get("/trace/{hash}/qr.png")
def get_trace_qr_png(hash: str, db: Session = Depends(get_db)):
    """Get QR code as PNG image."""
    trace = db.query(TraceBatch).filter(TraceBatch.hash == hash).first()
    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")

    qr_data = json.loads(trace.qr_data) if trace.qr_data else {}
    url = qr_data.get("url", f"https://packlabs.ai/trace/{hash}")

    png_bytes = generate_qr_png(url)
    if not png_bytes:
        raise HTTPException(status_code=500, detail="QR generation failed")

    return Response(content=png_bytes, media_type="image/png")
