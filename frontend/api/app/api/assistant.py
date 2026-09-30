"""
PackLabs — AI Assistant Routes

Rules-based assistant that answers follow-up questions about packaging
recommendations. Optionally hooks into an LLM API if configured.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import re

from app.core.config import settings

router = APIRouter(prefix="/api", tags=["assistant"])


class AssistantRequest(BaseModel):
    question: str
    context: Optional[Dict[str, Any]] = None  # The current recommendation result


class AssistantResponse(BaseModel):
    answer: str
    source: str  # "rules" or "llm"
    related_materials: List[str] = []
    suggestions: List[str] = []


# Knowledge base for common questions
KNOWLEDGE_BASE = {
    "otr": {
        "answer": "OTR (Oxygen Transmission Rate) measures how much oxygen passes through a packaging material, expressed in cc/m²·day. Lower OTR means better oxygen barrier. High-fat foods need very low OTR (< 10) to prevent oxidation and rancidity.",
        "keywords": ["otr", "oxygen transmission", "oxygen barrier", "o2 barrier"],
    },
    "wvtr": {
        "answer": "WVTR (Water Vapor Transmission Rate) measures moisture passing through packaging, in g/m²·day. Dry foods like chips and spices need low WVTR (< 2) to stay crispy. Fresh produce needs moderate WVTR to prevent wilting but allow some gas exchange.",
        "keywords": ["wvtr", "water vapor", "moisture barrier", "moisture transmission"],
    },
    "map": {
        "answer": "MAP (Modified Atmosphere Packaging) replaces air inside a package with a specific gas mix. For example, meat uses low O₂ and high CO₂ to inhibit bacteria. Fresh produce needs some O₂ for respiration. Snacks use pure N₂ to prevent oxidation.",
        "keywords": ["map", "modified atmosphere", "gas mix", "nitrogen flush"],
    },
    "shelf_life": {
        "answer": "Shelf life is how long a food stays safe and acceptable. It depends on the food's properties (moisture, fat, pH), packaging barrier, storage temperature, and humidity. The Q10 model predicts that for every 10°C increase, shelf life roughly halves.",
        "keywords": ["shelf life", "expiry", "how long", "last"],
    },
    "sustainability": {
        "answer": "Our eco-score considers recyclability, biodegradability, compostability, and carbon footprint. PLA and PHA are bio-based alternatives. Paper/PE laminates offer partial recyclability. The green alternative always shows the most eco-friendly option meeting your barrier needs.",
        "keywords": ["sustainable", "eco", "green", "biodegradable", "compostable", "environment", "recycle"],
    },
    "cost": {
        "answer": "Cost index is relative to LDPE (1.0x). Barrier films like EVOH and metallized PET cost 3–6x more. Bio-plastics are 2–4x LDPE. For cost optimization, we find the cheapest material that still meets all barrier requirements.",
        "keywords": ["cost", "price", "cheap", "expensive", "budget", "affordable"],
    },
    "condensation": {
        "answer": "Condensation occurs when warm moist air meets cold packaging surfaces. Risk increases with high humidity (>85%) and temperature fluctuations (>2°C). Anti-fog films prevent droplet formation. Proper cold chain management is the best prevention.",
        "keywords": ["condensation", "fog", "droplet", "anti-fog", "moisture inside"],
    },
    "aluminum": {
        "answer": "Aluminum foil provides the highest barrier (practically zero OTR and WVTR). It's used in laminates for long shelf life products. However, it's not transparent, heavier, and less recyclable in laminate form. Consider metallized PET as a lighter alternative with 95%+ barrier.",
        "keywords": ["aluminum", "aluminium", "foil", "al foil", "metal"],
    },
    "sea_export": {
        "answer": "Sea freight takes 2-6 weeks with temperature fluctuations of 5-15°C. Containers can reach 45-55°C in tropical routes. Use high-barrier materials with good mechanical strength. Consider time-temperature indicators and desiccants. Cold chain containers (reefer) are essential for perishables.",
        "keywords": ["sea", "ship", "export", "container", "freight", "ocean"],
    },
    "cold_chain": {
        "answer": "Cold chain packaging must handle temperature differentials without condensation. Use anti-fog films for produce. Ensure seal integrity at cold temperatures. LDPE and PP maintain flexibility at 0-4°C. For frozen (-18°C), use PA/PE or EVOH laminates that won't crack.",
        "keywords": ["cold chain", "refrigerated", "chilled", "frozen", "cold storage"],
    },
}


def find_best_answer(question: str, context: Optional[Dict[str, Any]]) -> AssistantResponse:
    """Rules-based question answering using the knowledge base and recommendation context."""
    q_lower = question.lower().strip()
    suggestions = []

    # Check knowledge base
    best_match = None
    best_score = 0
    for topic, info in KNOWLEDGE_BASE.items():
        score = sum(1 for kw in info["keywords"] if kw in q_lower)
        if score > best_score:
            best_score = score
            best_match = topic

    if best_match and best_score > 0:
        return AssistantResponse(
            answer=KNOWLEDGE_BASE[best_match]["answer"],
            source="rules",
            suggestions=[
                "What other materials could work?",
                "How can I reduce costs?",
                "What about sustainability options?",
            ],
        )

    # Context-aware answers
    if context:
        recs = context.get("recommendations", [])
        barrier_class = context.get("barrier_class", "unknown")
        input_summary = context.get("input_summary", {})

        # "Why not [material]?" questions
        why_not_match = re.search(r"why not (\w+)", q_lower)
        if why_not_match:
            mat_name = why_not_match.group(1)
            rejected = context.get("rejected_materials", [])
            for rej in rejected:
                if mat_name.lower() in rej.get("name", "").lower():
                    return AssistantResponse(
                        answer=f"{rej['name']} was not recommended because: {rej['reason']}. The current barrier class requirement is '{barrier_class}', and {rej['name']} doesn't meet those specifications.",
                        source="rules",
                        related_materials=[rej["material_id"]],
                        suggestions=["What if I change my requirements?", "Show me the green alternative"],
                    )
            return AssistantResponse(
                answer=f"I couldn't find '{mat_name}' in the rejected materials list. It may not be in our database, or it might actually be a viable option. Try checking the material catalog.",
                source="rules",
                suggestions=["Show me the material catalog", "What materials are available?"],
            )

        # "What if" questions
        if "what if" in q_lower or "what about" in q_lower:
            return AssistantResponse(
                answer=f"You can use the 'What-If Simulator' on the results page to change any parameter and see updated recommendations instantly. Try adjusting temperature, humidity, or shelf life target to see how the recommendation changes.",
                source="rules",
                suggestions=["How does temperature affect shelf life?", "What happens with sea export?"],
            )

        # Questions about the current recommendation
        if recs and ("why" in q_lower or "explain" in q_lower or "reason" in q_lower):
            top = recs[0] if recs else {}
            return AssistantResponse(
                answer=f"The top recommendation ({top.get('material_name', 'N/A')}) was chosen because it scores highest across your priorities: Protection ({top.get('protection_score', 0):.0%}), Cost ({top.get('cost_score', 0):.0%}), Sustainability ({top.get('sustainability_score', 0):.0%}). The overall score is {top.get('overall_score', 0):.0%} with {top.get('confidence', 0):.0%} confidence. {top.get('reasoning', '')}",
                source="rules",
                suggestions=["How can I improve sustainability?", "What's the cheapest option?"],
            )

    # Default response
    return AssistantResponse(
        answer="I'm not sure about that specific question. Here's what I can help with: OTR/WVTR explained, shelf life factors, MAP packaging, sustainability options, cost optimization, material comparisons, and export packaging advice. Try asking about one of these topics!",
        source="rules",
        suggestions=[
            "What is OTR and why does it matter?",
            "How can I extend shelf life?",
            "What are the most sustainable options?",
            "Why was this material recommended?",
        ],
    )


@router.post("/assistant", response_model=AssistantResponse)
def ask_assistant(request: AssistantRequest):
    """Ask the PackLabs assistant a question about packaging."""
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Please provide a question")

    # If LLM API key is configured, could use it here
    if settings.LLM_API_KEY:
        # Future: call LLM API with context
        # For now, fall back to rules
        pass

    return find_best_answer(request.question, request.context)
