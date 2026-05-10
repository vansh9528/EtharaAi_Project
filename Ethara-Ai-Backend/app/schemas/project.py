from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import TaskSummary, UserSummary


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    status: str = Field(default="planning", pattern="^(planning|active|completed|on_hold)$")


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    status: Optional[str] = Field(default=None, pattern="^(planning|active|completed|on_hold)$")


class ProjectResponse(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime
    owner: UserSummary
    tasks: list[TaskSummary] = []

    model_config = {"from_attributes": True}
