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

@router.get("/admin/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["super_admin"]))
):
    total_students = db.query(models.Student).count()
    total_organizations = db.query(models.Organization).count()
    approved_organizations = db.query(models.Organization).filter(models.Organization.status == "approved").count()
    pending_organizations = db.query(models.Organization).filter(models.Organization.status == "pending").count()
    total_resumes = db.query(models.Resume).count()
    total_portfolios = db.query(models.Portfolio).count()
    published_portfolios = db.query(models.Portfolio).filter(models.Portfolio.is_published == True).count()
    total_certificates = db.query(models.Certificate).count()
    total_offer_letters = db.query(models.OfferLetter).count()

    return {
        "total_students": total_students,
        "total_organizations": total_organizations,
        "approved_organizations": approved_organizations,
        "pending_organizations": pending_organizations,
        "total_resumes": total_resumes,
        "total_portfolios": total_portfolios,
        "published_portfolios": published_portfolios,
        "total_certificates": total_certificates,
        "total_offer_letters": total_offer_letters,
    }

@router.get("/admin/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["super_admin"]))
):
    users = db.query(models.User).all()
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "email": u.email,
            "role": u.role.role_name,
            "is_active": u.is_active,
            "created_at": u.created_at,
        })
    return result


@router.put("/admin/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["super_admin"]))
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    db.commit()
    log_activity(db, current_user.id, f"{'Activated' if user.is_active else 'Deactivated'} user", {"user_id": user.id})

    return {"message": f"User {'activated' if user.is_active else 'deactivated'} successfully"}

@router.get("/admin/templates")
def get_all_templates(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["super_admin"]))
):
    cert_templates = db.query(models.CertificateTemplate).all()
    offer_templates = db.query(models.OfferLetterTemplate).all()

    result = []
    for t in cert_templates:
        org = db.query(models.Organization).filter(models.Organization.id == t.organization_id).first()
        result.append({
            "id": t.id,
            "type": "certificate",
            "name": t.name,
            "organization_name": org.org_name if org else "Unknown",
        })
    for t in offer_templates:
        org = db.query(models.Organization).filter(models.Organization.id == t.organization_id).first()
        result.append({
            "id": t.id,
            "type": "offer_letter",
            "name": t.name,
            "organization_name": org.org_name if org else "Unknown",
        })

    return result