from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models import Project, Task, User
from app.schemas import DashboardSummary, ProjectSummary, TaskSummary

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task_query = db.query(Task)
    project_query = db.query(Project)

    if current_user.role == "employee":
        task_query = task_query.filter(Task.assigned_to_id == current_user.id)

    tasks = task_query.order_by(Task.updated_at.desc()).all()
    projects = project_query.order_by(Project.updated_at.desc()).all()

    task_status_counts = {}
    for task in tasks:
        task_status_counts[task.status] = task_status_counts.get(task.status, 0) + 1

    project_status_counts = {}
    for project in projects:
        project_status_counts[project.status] = project_status_counts.get(project.status, 0) + 1

    overdue_tasks = sum(
        1 for task in tasks if task.due_date and task.due_date < datetime.utcnow() and task.status != "done"
    )

    return DashboardSummary(
        total_projects=len(projects),
        total_tasks=len(tasks),
        completed_tasks=sum(1 for task in tasks if task.status == "done"),
        pending_tasks=sum(1 for task in tasks if task.status != "done"),
        overdue_tasks=overdue_tasks,
        projects_by_status=project_status_counts,
        tasks_by_status=task_status_counts,
        recent_projects=[ProjectSummary.model_validate(project) for project in projects[:5]],
        recent_tasks=[TaskSummary.model_validate(task) for task in tasks[:5]],
    )
