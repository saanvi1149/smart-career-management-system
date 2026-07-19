from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/verify", tags=["Document Verification"])


@router.get("/{verification_id}")
def verify_document(verification_id: str, db: Session = Depends(get_db)):
    record = db.query(models.DocumentVerification).filter(
        models.DocumentVerification.verification_id == verification_id
    ).first()

    if not record or not record.is_valid:
        raise HTTPException(status_code=404, detail="Document not found or invalid")

    if record.document_type == "certificate":
        doc = db.query(models.Certificate).filter(models.Certificate.id == record.document_id).first()
        student = db.query(models.Student).filter(models.Student.id == doc.student_id).first()
        org = db.query(models.Organization).filter(models.Organization.id == doc.issued_by).first()
        return {
            "document_type": "certificate",
            "student_name": student.full_name,
            "issued_by": org.org_name,
            "certificate_data": doc.certificate_data,
            "issued_at": doc.issued_at,
            "is_valid": record.is_valid
        }

    elif record.document_type == "offer_letter":
        doc = db.query(models.OfferLetter).filter(models.OfferLetter.id == record.document_id).first()
        student = db.query(models.Student).filter(models.Student.id == doc.student_id).first()
        org = db.query(models.Organization).filter(models.Organization.id == doc.issued_by).first()
        return {
            "document_type": "offer_letter",
            "student_name": student.full_name,
            "issued_by": org.org_name,
            "offer_data": doc.offer_data,
            "issued_at": doc.issued_at,
            "is_valid": record.is_valid
        }

    raise HTTPException(status_code=400, detail="Unknown document type")


@router.get("/{verification_id}/qr")
def get_qr_code(verification_id: str, db: Session = Depends(get_db)):
    record = db.query(models.DocumentVerification).filter(
        models.DocumentVerification.verification_id == verification_id
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Verification record not found")

    return FileResponse(record.qr_code_url, media_type="image/png")