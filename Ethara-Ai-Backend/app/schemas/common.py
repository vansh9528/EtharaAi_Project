from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel


class MessageResponse(BaseModel):
    message: str


class UserSummary(BaseModel):
    id: str
    username: str
    full_name: str
    role: str

    class Config:
        from_attributes = True


class ProjectSummary(BaseModel):
    id: str
    name: str
    status: str

    class Config:
        from_attributes = True


class TaskSummary(BaseModel):
    id: str
    title: str
    status: str
    priority: str
    due_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    total_projects: int
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    overdue_tasks: int
    projects_by_status: Dict[str, int]
    tasks_by_status: Dict[str, int]
    recent_projects: List[ProjectSummary]
    recent_tasks: List[TaskSummary]
