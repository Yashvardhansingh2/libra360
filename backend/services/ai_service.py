import os
import httpx
import asyncio
import logging

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.0-flash:generateContent"
)

FALLBACK_TIPS = [
    "Automate your savings by setting up a recurring transfer on payday — you won't miss what you never see.",
    "Track every expense for 30 days. Awareness alone typically cuts discretionary spending by 15–20%.",
    "Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Adjust to meet your goal faster.",
    "Round up every purchase to the nearest hundred and transfer the difference to savings weekly.",
    "Review subscriptions quarterly — the average person wastes ₹2,000–₹5,000/month on unused services.",
]


async def generate_financial_tip(
    goal_title: str,
    target_amount: float,
    monthly_contribution: float,
    duration_months: int,
    category: str,
    current_savings: float = 0.0,
) -> str:
    """Call Google Gemini API to get a personalized financial tip."""
    prompt = (
        f"You are a certified financial advisor specializing in personal savings. "
        f"A user has set the following financial goal:\n"
        f"- Goal: {goal_title}\n"
        f"- Category: {category}\n"
        f"- Target Amount: ₹{target_amount:,.2f}\n"
        f"- Current Savings: ₹{current_savings:,.2f}\n"
        f"- Monthly Contribution: ₹{monthly_contribution:,.2f}\n"
        f"- Timeline: {duration_months} months\n\n"
        f"Provide ONE concise, actionable, and personalized financial tip (2–3 sentences max) "
        f"that will help this user reach their goal faster or manage risk better. "
        f"Be specific to their numbers. Do not use generic platitudes."
    )

    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not set — returning fallback tip.")
        import random
        return random.choice(FALLBACK_TIPS)

    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    params = {"key": GEMINI_API_KEY}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(GEMINI_URL, json=payload, params=params)
            response.raise_for_status()
            data = response.json()
            tip = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            return tip
    except Exception as exc:
        logger.error(f"Gemini API error: {exc}")
        import random
        return random.choice(FALLBACK_TIPS)
