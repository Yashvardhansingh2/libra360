from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from models.database import get_db, SavingsGoal, User
from models.schemas import GoalCreate, GoalOut, GoalUpdate
from services.ai_service import generate_financial_tip
from typing import List
import asyncio

router = APIRouter()


def _progress(goal: SavingsGoal) -> float:
    if goal.target_amount <= 0:
        return 0.0
    return round(min((goal.current_savings / goal.target_amount) * 100, 100), 2)


def _enrich(goal: SavingsGoal) -> GoalOut:
    out = GoalOut.model_validate(goal)
    out.progress_percent = _progress(goal)
    return out


@router.post("/", response_model=GoalOut, status_code=status.HTTP_201_CREATED)
async def create_goal(goal_in: GoalCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == goal_in.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate AI tip concurrently
    ai_tip = await generate_financial_tip(
        goal_title=goal_in.title,
        target_amount=goal_in.target_amount,
        monthly_contribution=goal_in.monthly_contribution,
        duration_months=goal_in.duration_months,
        category=goal_in.category,
        current_savings=goal_in.current_savings,
    )

    goal = SavingsGoal(
        user_id=goal_in.user_id,
        title=goal_in.title,
        target_amount=goal_in.target_amount,
        current_savings=goal_in.current_savings,
        monthly_contribution=goal_in.monthly_contribution,
        duration_months=goal_in.duration_months,
        category=goal_in.category,
        ai_tip=ai_tip,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return _enrich(goal)


@router.get("/", response_model=List[GoalOut])
def list_goals(user_id: int = None, db: Session = Depends(get_db)):
    q = db.query(SavingsGoal)
    if user_id:
        q = q.filter(SavingsGoal.user_id == user_id)
    return [_enrich(g) for g in q.all()]


@router.get("/{goal_id}", response_model=GoalOut)
def get_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return _enrich(goal)


@router.patch("/{goal_id}", response_model=GoalOut)
def update_goal(goal_id: int, update: GoalUpdate, db: Session = Depends(get_db)):
    goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if update.current_savings is not None:
        if update.current_savings < 0:
            raise HTTPException(status_code=400, detail="Savings can't be negative")
        goal.current_savings = round(update.current_savings, 2)
    if update.monthly_contribution is not None:
        if update.monthly_contribution <= 0:
            raise HTTPException(status_code=400, detail="monthly_contribution must be positive.")
        goal.monthly_contribution = round(update.monthly_contribution, 2)
    if update.title is not None:
        goal.title = update.title
    db.commit()
    db.refresh(goal)
    return _enrich(goal)


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")
    db.delete(goal)
    db.commit()
