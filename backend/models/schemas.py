from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: EmailStr

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class GoalCreate(BaseModel):
    user_id: int
    title: str
    target_amount: float
    current_savings: float = 0.0
    monthly_contribution: float
    duration_months: int
    category: str = "General"

    @field_validator("target_amount", "monthly_contribution")
    @classmethod
    def must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Must be a positive value")
        return round(v, 2)

    @field_validator("duration_months")
    @classmethod
    def valid_duration(cls, v):
        if v < 1 or v > 360:
            raise ValueError("Duration must be between 1 and 360 months")
        return v

    @field_validator("current_savings")
    @classmethod
    def non_negative(cls, v):
        if v < 0:
            raise ValueError("Current savings cannot be negative")
        return round(v, 2)


class GoalUpdate(BaseModel):
    current_savings: Optional[float] = None
    monthly_contribution: Optional[float] = None
    title: Optional[str] = None


class GoalOut(BaseModel):
    id: int
    user_id: int
    title: str
    target_amount: float
    current_savings: float
    monthly_contribution: float
    duration_months: int
    category: str
    ai_tip: Optional[str]
    created_at: datetime
    updated_at: datetime
    progress_percent: float = 0.0

    class Config:
        from_attributes = True


class TopUserGoal(BaseModel):
    user_id: int
    user_name: str
    goal_title: str
    target_amount: float
    current_savings: float
    progress_percent: float
    months_remaining: int
