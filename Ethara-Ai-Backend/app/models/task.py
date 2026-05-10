from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class Task(Base):
    """Task database model."""

    __tablename__ = "tasks"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String, default="todo", nullable=False, index=True)
    priority = Column(String, default="medium", nullable=False)
    due_date = Column(DateTime, nullable=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    assigned_to_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    created_by_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="assigned_tasks", foreign_keys=[assigned_to_id])
    creator = relationship("User", back_populates="created_tasks", foreign_keys=[created_by_id])

    def __repr__(self) -> str:
        return f"<Task {self.title}>"
