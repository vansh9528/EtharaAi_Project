import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.core.security import get_current_user, require_roles
from app.db.session import get_db
from app.models import Project, Task, User
from app.schemas import MessageResponse, TaskCreate, TaskResponse, TaskStatusUpdate, TaskUpdate

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def validate_task_relationships(db: Session, project_id: str, assigned_to_id: Optional[str] = None):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    assignee = None
    if assigned_to_id:
        assignee = db.query(User).filter(User.id == assigned_to_id).first()
        if not assignee:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assigned user not found")

    return project, assignee


def validate_assignment_permissions(current_user: User, assignee: Optional[User]) -> None:
    if current_user.role == "employee":
        if assignee is None or assignee.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employees can only create tasks for themselves",
            )
        return

    if not assignee:
        return

    if current_user.role == "manager" and assignee.role != "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Managers can only assign tasks to employees",
        )


def validate_employee_project_access(db: Session, current_user: User, project_id: str) -> None:
    if current_user.role not in {"employee", "manager"}:
        return

    existing_assignment = (
        db.query(Task)
        .filter(Task.project_id == project_id, Task.assigned_to_id == current_user.id)
        .first()
    )
    if not existing_assignment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create tasks for projects already assigned to you",
        )


@router.get("", response_model=list[TaskResponse])
async def list_tasks(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    project_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Task).options(
        joinedload(Task.project),
        joinedload(Task.assignee),
        joinedload(Task.creator),
    )

    if current_user.role == "employee":
        query = query.filter(Task.assigned_to_id == current_user.id)

    if status_filter:
        query = query.filter(Task.status == status_filter)
    if project_id:
        query = query.filter(Task.project_id == project_id)

    tasks = query.order_by(Task.updated_at.desc()).all()
    return [TaskResponse.model_validate(task) for task in tasks]


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager", "employee")),
):
    assigned_to_id = task_data.assigned_to_id or (current_user.id if current_user.role == "employee" else None)
    project, assignee = validate_task_relationships(db, task_data.project_id, assigned_to_id)
    validate_assignment_permissions(current_user, assignee)
    validate_employee_project_access(db, current_user, project.id)
    if task_data.due_date and task_data.due_date < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Due date cannot be in the past")

    task = Task(
        id=str(uuid.uuid4()),
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        priority=task_data.priority,
        due_date=task_data.due_date,
        project_id=project.id,
        assigned_to_id=assignee.id if assignee else None,
        created_by_id=current_user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    task = (
        db.query(Task)
        .options(joinedload(Task.project), joinedload(Task.assignee), joinedload(Task.creator))
        .filter(Task.id == task.id)
        .first()
    )
    return TaskResponse.model_validate(task)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if current_user.role == "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employees can only update task status through the status endpoint",
        )

    if current_user.role == "manager" and task.created_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Managers can only update tasks they created",
        )

    update_data = task_data.model_dump(exclude_unset=True)

    next_project_id = update_data.get("project_id", task.project_id)
    next_assigned_to_id = update_data.get("assigned_to_id", task.assigned_to_id)
    _, next_assignee = validate_task_relationships(db, next_project_id, next_assigned_to_id)
    validate_assignment_permissions(current_user, next_assignee)

    if "due_date" in update_data and update_data["due_date"] and update_data["due_date"] < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Due date cannot be in the past")

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    task = (
        db.query(Task)
        .options(joinedload(Task.project), joinedload(Task.assignee), joinedload(Task.creator))
        .filter(Task.id == task.id)
        .first()
    )
    return TaskResponse.model_validate(task)


@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: str,
    status_data: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if current_user.role == "employee" and task.assigned_to_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employees can only update tasks assigned to them",
        )

    task.status = status_data.status
    db.commit()
    db.refresh(task)
    task = (
        db.query(Task)
        .options(joinedload(Task.project), joinedload(Task.assignee), joinedload(Task.creator))
        .filter(Task.id == task.id)
        .first()
    )
    return TaskResponse.model_validate(task)


@router.delete("/{task_id}", response_model=MessageResponse)
async def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if current_user.role == "manager" and task.created_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Managers can only delete tasks they created",
        )

    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}
