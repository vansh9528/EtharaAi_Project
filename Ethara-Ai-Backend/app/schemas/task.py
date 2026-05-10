from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.schemas.common import ProjectSummary, UserSummary


class TaskBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=120)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: str = Field(default="todo", pattern="^(todo|in_progress|done)$")
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")
    due_date: Optional[datetime] = None
    project_id: str
    assigned_to_id: Optional[str] = None

    @field_validator("due_date")
    @classmethod
    def validate_due_date(cls, value: Optional[datetime]) -> Optional[datetime]:
        if value and value.year < 2000:
            raise ValueError("Due date must be a valid future-oriented date")
        return value


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=120)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: Optional[str] = Field(default=None, pattern="^(todo|in_progress|done)$")
    priority: Optional[str] = Field(default=None, pattern="^(low|medium|high)$")
    due_date: Optional[datetime] = None
    project_id: Optional[str] = None
    assigned_to_id: Optional[str] = None


class TaskStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(todo|in_progress|done)$")


class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    status: str
    priority: str
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    project: ProjectSummary
    assignee: Optional[UserSummary]
    creator: UserSummary

    model_config = {"from_attributes": True}
