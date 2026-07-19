import re
import random
import string

def generate_slug(text: str) -> str:
    base = re.sub(r'[^a-zA-Z0-9]+', '-', text.lower()).strip('-')
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=5))
    return f"{base}-{random_suffix}"

import qrcode
import os

def generate_qr_code(verification_id: str, output_dir: str = "generated_qrcodes") -> str:
    os.makedirs(output_dir, exist_ok=True)
    verify_url = f"http://127.0.0.1:8000/verify/{verification_id}"
    
    img = qrcode.make(verify_url)
    file_path = os.path.join(output_dir, f"{verification_id}.png")
    img.save(file_path)
    
    return file_path

from sqlalchemy.orm import Session

def log_activity(db: Session, user_id: int, action: str, extra_data: dict = None):
    import models
    log = models.ActivityLog(user_id=user_id, action=action, extra_data=extra_data)
    db.add(log)
    db.commit()


def create_notification(db: Session, user_id: int, message: str):
    import models
    notif = models.Notification(user_id=user_id, message=message)
    db.add(notif)
    db.commit()