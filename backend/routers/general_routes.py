from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth

router = APIRouter(tags=["Notifications & Activity"])


@router.get("/notifications", response_model=list[schemas.NotificationResponse])
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).all()
    return notifications


@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}


@router.get("/admin/activity-logs", response_model=list[schemas.ActivityLogResponse])
def get_all_activity_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["super_admin"]))
):
    logs = db.query(models.ActivityLog).order_by(models.ActivityLog.created_at.desc()).limit(100).all()
    result = []
    for log in logs:
        result.append({
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "metadata": log.extra_data,
            "created_at": log.created_at
        })
    return result