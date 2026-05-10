from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_roles
from app.db.session import get_db
from app.models import User
from app.schemas import UserResponse, UserRoleUpdate

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
async def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    del current_user
    users = db.query(User).order_by(User.created_at.asc()).all()
    return [UserResponse.model_validate(user) for user in users]


@router.patch("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    role_data: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if current_user.id == user.id and role_data.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin cannot remove their own admin role",
        )

    user.role = role_data.role
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


@router.get("/assignable", response_model=list[UserResponse])
async def list_assignable_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    query = db.query(User).order_by(User.full_name.asc())

    if current_user.role == "manager":
        query = query.filter(User.role == "employee")

    users = query.all()
    return [UserResponse.model_validate(user) for user in users]
