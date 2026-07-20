from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth
from utils import log_activity, create_notification

router = APIRouter(prefix="/auth", tags=["Authentication"])

# --- Register Student ---
@router.post("/register/student")
def register_student(data: schemas.StudentRegister, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    student_role = db.query(models.Role).filter(models.Role.role_name == "student").first()

    new_user = models.User(
        email=data.email,
        password_hash=auth.hash_password(data.password),
        role_id=student_role.id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_student = models.Student(
        user_id=new_user.id,
        full_name=data.full_name,
        university=data.university,
        degree=data.degree,
        year_of_study=data.year_of_study,
        phone=data.phone
    )
    db.add(new_student)
    db.commit()
    log_activity(db, new_user.id, "Student registered")

    return {"message": "Student registered successfully"}


# --- Register Organization ---
@router.post("/register/organization")
def register_organization(data: schemas.OrganizationRegister, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    org_role = db.query(models.Role).filter(models.Role.role_name == "organization").first()

    new_user = models.User(
        email=data.email,
        password_hash=auth.hash_password(data.password),
        role_id=org_role.id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_org = models.Organization(
        user_id=new_user.id,
        org_name=data.org_name,
        org_type=data.org_type,
        contact_email=data.contact_email
    )
    db.add(new_org)
    db.commit()

    log_activity(db, new_user.id, "Organization registered")

    return {"message": "Organization registered successfully. Awaiting Super Admin approval."}


# --- Login (for all roles) ---
# --- Login (for all roles) ---
@router.post("/login", response_model=schemas.TokenResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not auth.verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been deactivated")

    token = auth.create_access_token({"sub": str(user.id), "role": user.role.role_name})
    refresh_token = auth.create_refresh_token({"sub": str(user.id), "role": user.role.role_name})
    log_activity(db, user.id, "User logged in")

    return {"access_token": token, "refresh_token": refresh_token, "role": user.role.role_name}
@router.get("/me")
def get_my_profile(current_user: models.User = Depends(auth.get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.role_name
    }

@router.get("/admin/pending-organizations")
def get_pending_organizations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["super_admin"]))
):
    pending_orgs = db.query(models.Organization).filter(
        models.Organization.status == "pending"
    ).all()
    return [
        {
            "id": org.id,
            "org_name": org.org_name,
            "contact_email": org.contact_email,
            "status": org.status
        }
        for org in pending_orgs
    ]


@router.put("/admin/approve-organization/{org_id}")
def approve_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["super_admin"]))
):
    org = db.query(models.Organization).filter(models.Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    org.status = "approved"
    org.approved_by = current_user.id
    db.commit()

    log_activity(db, current_user.id, "Approved organization", {"organization_id": org.id, "org_name": org.org_name})
    create_notification(db, org.user_id, f"Your organization '{org.org_name}' has been approved!")

    return {"message": f"Organization '{org.org_name}' approved successfully"}

@router.post("/refresh")
def refresh_access_token(payload: dict, db: Session = Depends(get_db)):
    refresh_token = payload.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token required")

    decoded = auth.decode_access_token(refresh_token)
    if not decoded or decoded.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user_id = decoded.get("sub")
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or deactivated")

    new_access_token = auth.create_access_token({"sub": str(user.id), "role": user.role.role_name})
    return {"access_token": new_access_token, "role": user.role.role_name}