"""
PackLabs — Recommendation API Routes

All recommendation endpoints: /recommend, /what-if, /shelf-life,
/report/{id}, /report/{id}/pdf, /history, /batch
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import Optional, List
import uuid
import json
import io
import csv
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_optional_user, get_current_user
from app.models.user import User
from app.models.analysis import Analysis
from app.schemas.recommend import (
    RecommendInput, RecommendResult, MaterialRecommendation,
    ShelfLifePrediction, RiskFlag, RespirationData,
    FeatureContribution,
)
from app.engine.recommender import PackagingRecommender
from app.engine.rules import ExpertRuleEngine
from app.engine.scoring import MaterialScorer
from app.engine.shelf_life import ShelfLifePredictor
from app.engine.respiration import RespirationModel
from pathlib import Path
import math

router = APIRouter(prefix="/api", tags=["recommend"])

# Global recommender instance (initialized in main.py startup)
_recommender: Optional[PackagingRecommender] = None

def get_recommender() -> PackagingRecommender:
    global _recommender
    if _recommender is None:
        seed_dir = str(Path(__file__).resolve().parent.parent / "seed")
        _recommender = PackagingRecommender(seed_dir)
    return _recommender


def build_result(input_data: RecommendInput) -> RecommendResult:
    """Run the full recommendation pipeline and build the response."""
    rec = get_recommender()

    # Build commodity data dict from input (merge with seed if available)
    commodity = rec.commodities.get(input_data.commodity_id, {})
    commodity_data = {
        "id": input_data.commodity_id,
        "name": input_data.commodity_name or commodity.get("name", input_data.commodity_id),
        "category": input_data.category,
        "moisture_pct": input_data.moisture_pct,
        "oil_fat_pct": input_data.oil_fat_pct,
        "ph": input_data.ph,
        "respiration_rate": input_data.respiration_rate,
        "respiration_rate_ml": input_data.respiration_rate_ml or 0,
        "water_activity": commodity.get("water_activity", 0.9 if input_data.moisture_pct > 60 else 0.5),
        "is_produce": commodity.get("is_produce", input_data.category in ("fruit", "vegetable")),
        "is_perishable": commodity.get("is_perishable", True),
        "primary_spoilage": commodity.get("primary_spoilage", "microbial"),
        "typical_shelf_life_days": commodity.get("typical_shelf_life_days", 7),
        "special_requirements": commodity.get("special_requirements", []),
        "recommended_storage_temp": commodity.get("recommended_storage_temp", {"min": 2, "max": 25}),
    }

    storage_conditions = {
        "temperature": input_data.storage_temp_c,
        "rh": input_data.relative_humidity_pct,
        "transit": input_data.transit_condition,
        "storage_type": input_data.storage_type,
    }

    priorities = {
        "priority_protection": input_data.priority_protection,
        "priority_cost": input_data.priority_cost,
        "priority_sustainability": input_data.priority_sustainability,
    }

    # Run engine
    rules = rec.rules
    scorer = rec.scorer
    sl_predictor = rec.shelf_life
    resp_model = rec.respiration

    # 1. Barrier requirements
    reqs = rules.determine_barrier_requirements(commodity_data, storage_conditions)
    map_comp = rules.determine_map_composition(commodity_data)
    risk_flags_raw = rules.flag_risks(commodity_data, storage_conditions)
    barrier_class = rules.get_barrier_class(reqs)

    # 2. Filter and score materials
    all_materials = rec.materials
    filtered = scorer.filter_materials(all_materials, reqs)

    # If eco_only, keep only biodegradable/compostable
    if input_data.eco_only:
        filtered = [m for m in filtered if m.get("biodegradable") or m.get("compostable")]

    scored = scorer.score_materials(filtered, reqs, priorities)
    green_alt_scored = scorer.find_green_alternative(scored)

    # Track rejected materials
    filtered_ids = {m["id"] for m in filtered}
    rejected_materials = []
    for mat in all_materials:
        if mat["id"] not in filtered_ids:
            reason = ""
            if reqs.otr_max and mat.get("otr", 999999) > reqs.otr_max:
                reason = f"OTR {mat.get('otr')} exceeds required max {reqs.otr_max}"
            elif reqs.wvtr_max and mat.get("wvtr", 999999) > reqs.wvtr_max:
                reason = f"WVTR {mat.get('wvtr')} exceeds required max {reqs.wvtr_max}"
            elif reqs.breathable and mat.get("otr", 0) < 5000:
                reason = "Not breathable enough for fresh produce"
            else:
                reason = "Does not meet barrier requirements"
            rejected_materials.append({
                "material_id": mat["id"],
                "name": mat["name"],
                "reason": reason,
            })

    # 3. Build recommendation details for top 3
    recommendations = []
    pack_area = input_data.pack_area_m2 or 0.06  # ~24x25cm default

    for rank, sm in enumerate(scored[:3], 1):
        mat = sm.material

        # Shelf life prediction
        sl = sl_predictor.predict(
            commodity_data, mat,
            input_data.storage_temp_c, input_data.relative_humidity_pct,
            500, pack_area
        )

        cost_per_1000 = scorer.estimate_cost_per_1000(mat, pack_area)

        # Recommended thickness (midpoint of range)
        t_range = mat.get("thickness_range", {"min": 25, "max": 50})
        rec_thickness = (t_range["min"] + t_range["max"]) / 2.0

        # Confidence based on how well the material exceeds requirements
        conf = 0.7
        if reqs.otr_max and mat.get("otr", 999) < reqs.otr_max * 0.5:
            conf += 0.1
        if reqs.wvtr_max and mat.get("wvtr", 999) < reqs.wvtr_max * 0.5:
            conf += 0.1
        conf = min(0.98, conf + (sm.score * 0.1))

        # Plain-language reasoning
        reasoning = _build_reasoning(commodity_data, mat, barrier_class, sl, map_comp)

        recommendations.append(MaterialRecommendation(
            rank=rank,
            material_id=mat["id"],
            material_name=mat["name"],
            material_category=mat.get("category", "unknown"),
            confidence=round(conf, 2),
            protection_score=round(sm.protection_score, 3),
            cost_score=round(sm.cost_score, 3),
            sustainability_score=round(sm.sustainability_score, 3),
            overall_score=round(sm.score, 3),
            required_otr=reqs.otr_max or 99999,
            provided_otr=mat.get("otr", 0),
            required_wvtr=reqs.wvtr_max or 99999,
            provided_wvtr=mat.get("wvtr", 0),
            recommended_thickness_um=rec_thickness,
            thickness_range=t_range,
            heat_seal_temp=mat.get("heat_seal_temp", {"min": 0, "max": 0}),
            sealability=mat.get("sealability", "fair"),
            mechanical_strength=mat.get("mechanical_strength", "medium"),
            map_composition=map_comp.model_dump() if map_comp else None,
            cost_per_1000_packs=round(cost_per_1000, 2),
            recyclability_pct=mat.get("recyclability_pct", 0),
            biodegradable=mat.get("biodegradable", False),
            carbon_footprint=mat.get("carbon_footprint", 0),
            reasoning=reasoning,
            notes=mat.get("notes", ""),
            is_green_alternative=False,
        ))

    # Green alternative
    green_alt = None
    if green_alt_scored:
        gmat = green_alt_scored.material
        gsl = sl_predictor.predict(commodity_data, gmat, input_data.storage_temp_c, input_data.relative_humidity_pct, 500, pack_area)
        g_t_range = gmat.get("thickness_range", {"min": 25, "max": 50})
        green_alt = MaterialRecommendation(
            rank=0,
            material_id=gmat["id"],
            material_name=gmat["name"],
            material_category=gmat.get("category", "unknown"),
            confidence=round(0.65 + green_alt_scored.score * 0.1, 2),
            protection_score=round(green_alt_scored.protection_score, 3),
            cost_score=round(green_alt_scored.cost_score, 3),
            sustainability_score=round(green_alt_scored.sustainability_score, 3),
            overall_score=round(green_alt_scored.score, 3),
            required_otr=reqs.otr_max or 99999,
            provided_otr=gmat.get("otr", 0),
            required_wvtr=reqs.wvtr_max or 99999,
            provided_wvtr=gmat.get("wvtr", 0),
            recommended_thickness_um=(g_t_range["min"] + g_t_range["max"]) / 2.0,
            thickness_range=g_t_range,
            heat_seal_temp=gmat.get("heat_seal_temp", {"min": 0, "max": 0}),
            sealability=gmat.get("sealability", "fair"),
            mechanical_strength=gmat.get("mechanical_strength", "medium"),
            map_composition=map_comp.model_dump() if map_comp else None,
            cost_per_1000_packs=round(scorer.estimate_cost_per_1000(gmat, pack_area), 2),
            recyclability_pct=gmat.get("recyclability_pct", 0),
            biodegradable=gmat.get("biodegradable", False),
            carbon_footprint=gmat.get("carbon_footprint", 0),
            reasoning=f"Eco-friendly alternative: {gmat['name']} is {'biodegradable' if gmat.get('biodegradable') else 'compostable'} while still meeting the barrier requirements.",
            notes=gmat.get("notes", ""),
            is_green_alternative=True,
        )

    # Shelf life for top recommendation
    top_mat = scored[0].material if scored else all_materials[0]
    main_sl = sl_predictor.predict(commodity_data, top_mat, input_data.storage_temp_c, input_data.relative_humidity_pct, 500, pack_area)

    shelf_life_result = ShelfLifePrediction(
        predicted_days=round(main_sl.get("predicted_days", input_data.target_shelf_life_days), 1),
        confidence_interval={
            "lower": round(main_sl.get("predicted_days", 0) * 0.8, 1),
            "upper": round(main_sl.get("predicted_days", 0) * 1.2, 1),
        },
        limiting_factor=main_sl.get("limiting_factor", "moisture_gain"),
        unpackaged_baseline_days=commodity_data.get("typical_shelf_life_days", 3),
        q10_value=main_sl.get("q10", 2.0),
        temperature_sensitivity="High" if commodity_data.get("is_perishable") else "Medium",
    )

    # Respiration data (produce only)
    respiration_data = None
    if commodity_data.get("is_produce"):
        rr = commodity_data.get("respiration_rate_ml", 0)
        if rr > 0 and scored:
            top_m = scored[0].material
            ss = resp_model.steady_state_composition(
                rr, rr * 0.9, 0.5, pack_area,
                top_m.get("otr", 1000), top_m.get("wvtr", 100)
            )
            timeline = resp_model.gas_timeline(
                rr, rr * 0.9, 0.5, pack_area,
                top_m.get("otr", 1000), days=14
            )
            cond_risk = resp_model.assess_condensation(
                input_data.relative_humidity_pct,
                input_data.storage_temp_c, 3.0
            )
            respiration_data = RespirationData(
                is_produce=True,
                respiration_rate_at_storage=round(rr, 2),
                steady_state_o2=round(ss.get("o2_pct", 21), 2),
                steady_state_co2=round(ss.get("co2_pct", 0), 2),
                perforation_count=ss.get("perforations_needed"),
                condensation_risk=cond_risk,
                gas_timeline=timeline,
            )

    # Feature contributions
    feature_contributions = _build_feature_contributions(commodity_data, input_data, barrier_class)

    # Eco score
    eco_score = _calc_eco_score(recommendations[0] if recommendations else None)

    # Risk flags
    risk_flags = [
        RiskFlag(
            type=rf.risk_type,
            severity=rf.severity,
            message=rf.description,
            suggestion=_suggest_for_risk(rf.risk_type),
        )
        for rf in risk_flags_raw
    ]

    # Add transit-specific warnings
    warnings = []
    if input_data.transit_condition in ("export_sea", "export_air"):
        warnings.append("Export packaging may require additional regulatory compliance checks.")
    if input_data.storage_temp_c > 35:
        warnings.append("High storage temperatures will significantly reduce shelf life.")
    if input_data.relative_humidity_pct > 85:
        warnings.append("Very high humidity increases risk of condensation and microbial growth.")

    # Plain summary
    top_name = recommendations[0].material_name if recommendations else "Unknown"
    plain_summary = (
        f"For {commodity_data['name']}, we recommend {top_name} packaging. "
        f"This material provides a {barrier_class} barrier level, "
        f"with a predicted shelf life of {shelf_life_result.predicted_days:.0f} days "
        f"at {input_data.storage_temp_c}°C. "
        f"The main spoilage risk is {commodity_data.get('primary_spoilage', 'degradation')}."
    )

    what_to_do_next = [
        f"Confirm material availability: {top_name}",
        f"Validate with lab testing at target conditions ({input_data.storage_temp_c}°C, {input_data.relative_humidity_pct}% RH)",
        "Check local food contact regulations for your market",
        "Request samples from material suppliers for trial runs",
        "Consider the green alternative for sustainability goals" if green_alt else "Explore cost optimization options",
    ]

    result_id = str(uuid.uuid4())

    return RecommendResult(
        id=result_id,
        timestamp=datetime.utcnow().isoformat(),
        input_summary={
            "commodity_id": input_data.commodity_id,
            "commodity_name": commodity_data["name"],
            "category": input_data.category,
            "moisture_pct": input_data.moisture_pct,
            "oil_fat_pct": input_data.oil_fat_pct,
            "ph": input_data.ph,
            "target_shelf_life_days": input_data.target_shelf_life_days,
            "storage_temp_c": input_data.storage_temp_c,
            "relative_humidity_pct": input_data.relative_humidity_pct,
            "transit_condition": input_data.transit_condition,
            "storage_type": input_data.storage_type,
        },
        recommendations=recommendations,
        green_alternative=green_alt,
        shelf_life=shelf_life_result,
        respiration=respiration_data,
        risk_flags=risk_flags,
        feature_contributions=feature_contributions,
        barrier_class=barrier_class,
        eco_score=eco_score,
        rejected_materials=rejected_materials[:10],  # Top 10
        plain_summary=plain_summary,
        what_to_do_next=what_to_do_next,
        warnings=warnings,
    )


def _build_reasoning(commodity: dict, material: dict, barrier_class: str,
                     sl: dict, map_comp) -> str:
    """Build plain-language reasoning for a recommendation."""
    name = commodity.get("name", "this product")
    mat_name = material.get("name", "this material")
    spoilage = commodity.get("primary_spoilage", "degradation")

    parts = [f"{mat_name} is recommended for {name} because:"]

    if spoilage in ("oxidation", "rancidity"):
        parts.append(f"• It provides excellent oxygen barrier (OTR: {material.get('otr', 'N/A')} cc/m²·day) to prevent {spoilage}.")
    if spoilage in ("moisture_gain", "moisture_loss"):
        parts.append(f"• Its moisture barrier (WVTR: {material.get('wvtr', 'N/A')} g/m²·day) protects against {spoilage}.")
    if commodity.get("is_produce"):
        parts.append(f"• It allows controlled gas exchange for respiring produce.")

    parts.append(f"• Barrier class: {barrier_class}.")

    if material.get("biodegradable") or material.get("compostable"):
        parts.append(f"• Environmentally friendly: {'biodegradable' if material.get('biodegradable') else 'compostable'}.")

    return " ".join(parts)


def _build_feature_contributions(commodity: dict, input_data: RecommendInput,
                                  barrier_class: str) -> List[FeatureContribution]:
    """Build feature importance explanations."""
    contribs = []

    # Moisture
    moisture_imp = min(1.0, input_data.moisture_pct / 100)
    contribs.append(FeatureContribution(
        feature="Moisture Content",
        importance=round(moisture_imp * 0.8, 3),
        direction="positive" if input_data.moisture_pct > 30 else "negative",
        description=f"Moisture at {input_data.moisture_pct}% {'increases' if input_data.moisture_pct > 30 else 'decreases'} the need for moisture barrier.",
    ))

    # Fat content
    fat_imp = min(1.0, input_data.oil_fat_pct / 50)
    contribs.append(FeatureContribution(
        feature="Fat/Oil Content",
        importance=round(fat_imp * 0.9, 3),
        direction="positive" if input_data.oil_fat_pct > 5 else "negative",
        description=f"Fat content at {input_data.oil_fat_pct}% {'drives high oxygen barrier need' if input_data.oil_fat_pct > 10 else 'has moderate impact on barrier selection'}.",
    ))

    # Temperature
    temp_imp = abs(input_data.storage_temp_c - 25) / 40
    contribs.append(FeatureContribution(
        feature="Storage Temperature",
        importance=round(temp_imp * 0.7, 3),
        direction="positive" if input_data.storage_temp_c > 25 else "negative",
        description=f"Storage at {input_data.storage_temp_c}°C {'accelerates spoilage, requiring stronger barrier' if input_data.storage_temp_c > 25 else 'extends shelf life through cold chain'}.",
    ))

    # Shelf life target
    sl_imp = min(1.0, input_data.target_shelf_life_days / 180)
    contribs.append(FeatureContribution(
        feature="Target Shelf Life",
        importance=round(sl_imp * 0.85, 3),
        direction="positive",
        description=f"Target of {input_data.target_shelf_life_days} days {'requires high-performance barrier materials' if input_data.target_shelf_life_days > 60 else 'is achievable with standard materials'}.",
    ))

    # pH
    ph_risk = abs(input_data.ph - 4.5) / 5
    contribs.append(FeatureContribution(
        feature="pH Level",
        importance=round(ph_risk * 0.5, 3),
        direction="positive" if input_data.ph > 4.5 else "negative",
        description=f"pH {input_data.ph} {'supports microbial growth — packaging must compensate' if input_data.ph > 4.5 else 'is naturally acidic, inhibiting pathogen growth'}.",
    ))

    contribs.sort(key=lambda x: x.importance, reverse=True)
    return contribs


def _calc_eco_score(rec: Optional[MaterialRecommendation]) -> float:
    """Calculate eco score 0-100."""
    if not rec:
        return 50.0

    score = 0.0
    score += rec.recyclability_pct * 0.4  # Max 40
    if rec.biodegradable:
        score += 30
    score += max(0, (5.0 - rec.carbon_footprint) / 5.0) * 30  # Max 30

    return round(min(100, max(0, score)), 1)


def _suggest_for_risk(risk_type: str) -> str:
    """Return suggestion for a given risk type."""
    suggestions = {
        "Condensation": "Consider anti-fog films or desiccant sachets. Ensure cold chain continuity.",
        "Temperature Abuse": "Use cold chain monitoring. Consider time-temperature indicators (TTI) on packs.",
        "Microbial": "Ensure packaging provides an effective microbial barrier. Consider MAP packaging.",
        "Oxidation": "Use high-barrier or vacuum packaging. Consider oxygen absorbers.",
        "Physical": "Use rigid or semi-rigid packaging. Add cushioning for transit.",
    }
    return suggestions.get(risk_type, "Review storage conditions and adjust packaging accordingly.")


# ── API Routes ──────────────────────────────────────────────────────────────

@router.post("/recommend", response_model=RecommendResult)
def recommend(
    data: RecommendInput,
    db: Session = Depends(get_db),
    user: User = Depends(get_optional_user),
):
    """Generate a full packaging recommendation."""
    result = build_result(data)

    # Save to database if user is authenticated
    if user:
        analysis = Analysis(
            id=result.id,
            user_id=user.id,
            commodity_id=data.commodity_id,
            title=f"Analysis: {data.commodity_name or data.commodity_id}",
            input_json=data.model_dump_json(),
            result_json=result.model_dump_json(),
        )
        db.add(analysis)
        db.commit()

    return result


@router.post("/what-if", response_model=RecommendResult)
def what_if(data: RecommendInput):
    """Run a what-if analysis without saving to history."""
    return build_result(data)


@router.post("/shelf-life", response_model=ShelfLifePrediction)
def shelf_life_endpoint(data: RecommendInput):
    """Standalone shelf-life prediction."""
    result = build_result(data)
    return result.shelf_life


@router.get("/report/{id}", response_model=RecommendResult)
def get_report(id: str, db: Session = Depends(get_db)):
    """Retrieve a saved analysis report."""
    analysis = db.query(Analysis).filter(Analysis.id == id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Report not found")
    return RecommendResult.model_validate_json(analysis.result_json)


@router.get("/report/{id}/pdf")
def get_report_pdf(id: str, db: Session = Depends(get_db)):
    """Generate and download a PDF report."""
    analysis = db.query(Analysis).filter(Analysis.id == id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Report not found")

    result = RecommendResult.model_validate_json(analysis.result_json)

    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import mm
        from reportlab.lib import colors

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # Title
        p.setFont("Helvetica-Bold", 20)
        p.setFillColor(colors.HexColor("#0F5132"))
        p.drawString(30, height - 40, "PackLabs — Recommendation Report")

        # Subtitle
        p.setFont("Helvetica", 12)
        p.setFillColor(colors.HexColor("#44403C"))
        p.drawString(30, height - 60, f"Generated: {result.timestamp}")

        # Summary
        y = height - 100
        p.setFont("Helvetica-Bold", 14)
        p.setFillColor(colors.HexColor("#1C1917"))
        p.drawString(30, y, "Summary")
        y -= 20
        p.setFont("Helvetica", 10)

        # Wrap long text
        summary = result.plain_summary
        words = summary.split()
        line = ""
        for word in words:
            if p.stringWidth(line + " " + word, "Helvetica", 10) < width - 60:
                line += " " + word if line else word
            else:
                p.drawString(30, y, line)
                y -= 14
                line = word
        if line:
            p.drawString(30, y, line)
            y -= 14

        # Recommendations
        y -= 20
        p.setFont("Helvetica-Bold", 14)
        p.drawString(30, y, "Top Recommendations")
        y -= 20

        for rec in result.recommendations:
            p.setFont("Helvetica-Bold", 11)
            p.setFillColor(colors.HexColor("#0F5132"))
            p.drawString(30, y, f"#{rec.rank}: {rec.material_name}")
            y -= 16

            p.setFont("Helvetica", 9)
            p.setFillColor(colors.HexColor("#44403C"))
            details = [
                f"Overall Score: {rec.overall_score:.1%}  |  Confidence: {rec.confidence:.1%}",
                f"OTR: {rec.provided_otr} cc/m²·day (req: ≤{rec.required_otr})  |  WVTR: {rec.provided_wvtr} g/m²·day (req: ≤{rec.required_wvtr})",
                f"Thickness: {rec.recommended_thickness_um:.0f} µm  |  Cost/1000: ₹{rec.cost_per_1000_packs:.2f}" if rec.cost_per_1000_packs else f"Thickness: {rec.recommended_thickness_um:.0f} µm",
                f"Recyclable: {rec.recyclability_pct}%  |  Biodegradable: {'Yes' if rec.biodegradable else 'No'}  |  CO₂: {rec.carbon_footprint} kg/kg",
            ]
            for detail in details:
                p.drawString(40, y, detail)
                y -= 12
            y -= 8

            if y < 100:
                p.showPage()
                y = height - 40

        # Shelf life
        y -= 10
        p.setFont("Helvetica-Bold", 14)
        p.setFillColor(colors.HexColor("#1C1917"))
        p.drawString(30, y, "Shelf Life Prediction")
        y -= 18
        p.setFont("Helvetica", 10)
        p.setFillColor(colors.HexColor("#44403C"))
        p.drawString(30, y, f"Predicted: {result.shelf_life.predicted_days:.0f} days  (Unpackaged: {result.shelf_life.unpackaged_baseline_days:.0f} days)")
        y -= 14
        p.drawString(30, y, f"Limiting factor: {result.shelf_life.limiting_factor}")
        y -= 14
        p.drawString(30, y, f"Confidence interval: {result.shelf_life.confidence_interval.get('lower', 0):.0f} – {result.shelf_life.confidence_interval.get('upper', 0):.0f} days")

        # Disclaimer
        y -= 40
        p.setFont("Helvetica-Oblique", 8)
        p.setFillColor(colors.HexColor("#78716C"))
        p.drawString(30, y, "Disclaimer: These recommendations are for decision support only. Validate with lab testing and local regulations before commercial use.")

        p.showPage()
        p.save()
        buffer.seek(0)

        return Response(
            content=buffer.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="packlabs_report_{id[:8]}.pdf"'},
        )

    except ImportError:
        raise HTTPException(status_code=500, detail="PDF generation requires reportlab. Install with: pip install reportlab")


@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get user's analysis history."""
    analyses = (
        db.query(Analysis)
        .filter(Analysis.user_id == user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )
    return [
        {
            "id": a.id,
            "commodity_id": a.commodity_id,
            "title": a.title,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in analyses
    ]


@router.post("/batch")
async def process_batch(file: UploadFile = File(...)):
    """Process batch CSV upload for bulk recommendations."""
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file")

    content = await file.read()
    text = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))

    results = []
    errors = []

    for idx, row in enumerate(reader, 1):
        try:
            input_data = RecommendInput(
                commodity_id=row.get("commodity_id", "unknown"),
                commodity_name=row.get("commodity_name"),
                category=row.get("category", "grain"),
                moisture_pct=float(row.get("moisture_pct", 10)),
                oil_fat_pct=float(row.get("oil_fat_pct", 0)),
                ph=float(row.get("ph", 7.0)),
                respiration_rate=row.get("respiration_rate", "none"),
                target_shelf_life_days=int(row.get("target_shelf_life_days", 30)),
                storage_temp_c=float(row.get("storage_temp_c", 25)),
                relative_humidity_pct=float(row.get("relative_humidity_pct", 60)),
                transit_condition=row.get("transit_condition", "local"),
                storage_type=row.get("storage_type", "ambient"),
            )
            result = build_result(input_data)
            results.append({
                "row": idx,
                "commodity": input_data.commodity_id,
                "top_material": result.recommendations[0].material_name if result.recommendations else "None",
                "shelf_life_days": result.shelf_life.predicted_days,
                "barrier_class": result.barrier_class,
                "eco_score": result.eco_score,
            })
        except Exception as e:
            errors.append({"row": idx, "error": str(e)})

    return {
        "status": "completed",
        "total_rows": len(results) + len(errors),
        "successful": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors,
    }
