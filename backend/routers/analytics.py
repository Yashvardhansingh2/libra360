from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from models.database import get_db
from models.schemas import TopUserGoal
from typing import List

router = APIRouter()

# SQL query for top 3 users by goal progress
TOP_USERS_SQL = text("""
    SELECT
        u.id            AS user_id,
        u.name          AS user_name,
        sg.title        AS goal_title,
        sg.target_amount,
        sg.current_savings,
        ROUND(
            CAST(
                LEAST(sg.current_savings / NULLIF(sg.target_amount, 0) * 100, 100)
            AS NUMERIC), 2
        )               AS progress_percent,
        GREATEST(
            CEIL(
                (sg.target_amount - sg.current_savings)
                / NULLIF(sg.monthly_contribution, 0)
            ), 0
        )::INTEGER       AS months_remaining
    FROM savings_goals sg
    JOIN users u ON u.id = sg.user_id
    WHERE sg.current_savings < sg.target_amount
    ORDER BY progress_percent DESC
    LIMIT 3;
""")


@router.get("/top-users", response_model=List[TopUserGoal])
def top_users_closest_to_goal(db: Session = Depends(get_db)):
    """Get the top 3 users closest to their goal targets."""
    rows = db.execute(TOP_USERS_SQL).mappings().all()
    return [TopUserGoal(**dict(row)) for row in rows]


@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    """Return aggregate stats for the dashboard."""
    result = db.execute(text("""
        SELECT
            COUNT(DISTINCT u.id)                              AS total_users,
            COUNT(sg.id)                                      AS total_goals,
            COALESCE(SUM(sg.current_savings), 0)              AS total_saved,
            COALESCE(SUM(sg.target_amount), 0)                AS total_targets,
            COALESCE(AVG(
                sg.current_savings / NULLIF(sg.target_amount,0) * 100
            ), 0)                                             AS avg_progress
        FROM users u
        LEFT JOIN savings_goals sg ON sg.user_id = u.id
    """)).mappings().first()
    return dict(result)
