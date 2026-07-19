from database import SessionLocal
import models
import auth

db = SessionLocal()

admin_role = db.query(models.Role).filter(models.Role.role_name == "super_admin").first()

if not admin_role:
    print("ERROR: 'super_admin' role not found in roles table.")
else:
    existing = db.query(models.User).filter(models.User.email == "admin@scms.com").first()
    if existing:
        existing.password_hash = auth.hash_password("Admin@123")
        existing.role_id = admin_role.id
        db.commit()
        print("Super Admin password reset successfully! Email: admin@scms.com | Password: Admin@123")
    else:
        admin_user = models.User(
            email="admin@scms.com",
            password_hash=auth.hash_password("Admin@123"),
            role_id=admin_role.id
        )
        db.add(admin_user)
        db.commit()
        print("Super Admin created successfully! Email: admin@scms.com | Password: Admin@123")

db.close()