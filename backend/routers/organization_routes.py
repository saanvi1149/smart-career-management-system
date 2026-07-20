from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth
from utils import generate_qr_code
from pdf_generator import generate_certificate_pdf
from fastapi.responses import FileResponse
import os
from utils import log_activity, create_notification
from fastapi import UploadFile, File

router = APIRouter(prefix="/organizations", tags=["Organization"])


def get_current_org(current_user: models.User = Depends(auth.require_role(["organization"])), db: Session = Depends(get_db)):
    org = db.query(models.Organization).filter(models.Organization.user_id == current_user.id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization record not found")
    if org.status != "approved":
        raise HTTPException(status_code=403, detail="Organization not yet approved by Super Admin")
    return org


# --- Certificate Templates ---

@router.post("/templates", response_model=schemas.CertificateTemplateResponse)
def create_template(
    data: schemas.CertificateTemplateCreate,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org)
):
    new_template = models.CertificateTemplate(
        organization_id=org.id,
        name=data.name,
        design_html=data.design_html
    )
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    return new_template


@router.get("/templates", response_model=list[schemas.CertificateTemplateResponse])
def get_my_templates(
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org)
):
    templates = db.query(models.CertificateTemplate).filter(
        models.CertificateTemplate.organization_id == org.id
    ).all()
    return templates


# --- Certificates ---

@router.post("/certificates", response_model=schemas.CertificateResponse)
def issue_certificate(
    data: schemas.CertificateCreate,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org)
):
    # Find the student by email
    student_user = db.query(models.User).filter(models.User.email == data.student_email).first()
    if not student_user:
        raise HTTPException(status_code=404, detail="Student with this email not found")

    student = db.query(models.Student).filter(models.Student.user_id == student_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")

    # Confirm template belongs to this org
    template = db.query(models.CertificateTemplate).filter(
        models.CertificateTemplate.id == data.template_id,
        models.CertificateTemplate.organization_id == org.id
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    new_cert = models.Certificate(
        template_id=template.id,
        student_id=student.id,
        issued_by=org.id,
        certificate_data=data.certificate_data
    )
    db.add(new_cert)
    db.commit()
    db.refresh(new_cert)

    # Generate QR code and verification record
    qr_path = generate_qr_code(new_cert.verification_id)
    verification = models.DocumentVerification(
        document_type="certificate",
        document_id=new_cert.id,
        verification_id=new_cert.verification_id,
        qr_code_url=qr_path
    )
    db.add(verification)
    db.commit()
    log_activity(db, org.user_id, "Issued certificate", {"certificate_id": new_cert.id, "student_id": student.id})
    create_notification(db, student_user.id, f"You received a new certificate from {org.org_name}!")

    return new_cert

@router.get("/certificates", response_model=list[schemas.CertificateResponse])
def get_issued_certificates(
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org)
):
    certs = db.query(models.Certificate).filter(models.Certificate.issued_by == org.id).all()
    return certs

# --- Offer Letter Templates ---

@router.post("/offer-templates", response_model=schemas.OfferLetterTemplateResponse)
def create_offer_template(
    data: schemas.OfferLetterTemplateCreate,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org)
):
    new_template = models.OfferLetterTemplate(
        organization_id=org.id,
        name=data.name,
        design_html=data.design_html
    )
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    return new_template


@router.get("/offer-templates", response_model=list[schemas.OfferLetterTemplateResponse])
def get_my_offer_templates(
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org)
):
    templates = db.query(models.OfferLetterTemplate).filter(
        models.OfferLetterTemplate.organization_id == org.id
    ).all()
    return templates


# --- Offer Letters ---

@router.post("/offer-letters", response_model=schemas.OfferLetterResponse)
def issue_offer_letter(
    data: schemas.OfferLetterCreate,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org)
):
    student_user = db.query(models.User).filter(models.User.email == data.student_email).first()
    if not student_user:
        raise HTTPException(status_code=404, detail="Student with this email not found")

    student = db.query(models.Student).filter(models.Student.user_id == student_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")

    template = db.query(models.OfferLetterTemplate).filter(
        models.OfferLetterTemplate.id == data.template_id,
        models.OfferLetterTemplate.organization_id == org.id
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    new_offer = models.OfferLetter(
        template_id=template.id,
        student_id=student.id,
        issued_by=org.id,
        offer_data=data.offer_data
    )
    db.add(new_offer)
    db.commit()
    db.refresh(new_offer)

    # Generate QR code and verification record
    qr_path = generate_qr_code(new_offer.verification_id)
    verification = models.DocumentVerification(
        document_type="offer_letter",
        document_id=new_offer.id,
        verification_id=new_offer.verification_id,
        qr_code_url=qr_path
    )
    db.add(verification)
    db.commit()
    log_activity(db, org.user_id, "Issued offer letter", {"offer_id": new_offer.id, "student_id": student.id})
    create_notification(db, student_user.id, f"You received a new offer letter from {org.org_name}!")

    return new_offer


@router.get("/offer-letters", response_model=list[schemas.OfferLetterResponse])
def get_issued_offer_letters(
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org)
):
    offers = db.query(models.OfferLetter).filter(models.OfferLetter.issued_by == org.id).all()
    return offers

@router.get("/certificates/{certificate_id}/download")
def download_certificate_pdf(
    certificate_id: int,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org)
):
    cert = db.query(models.Certificate).filter(
        models.Certificate.id == certificate_id,
        models.Certificate.issued_by == org.id
    ).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    student = db.query(models.Student).filter(models.Student.id == cert.student_id).first()
    template = db.query(models.CertificateTemplate).filter(models.CertificateTemplate.id == cert.template_id).first()
    verification = db.query(models.DocumentVerification).filter(
        models.DocumentVerification.verification_id == cert.verification_id
    ).first()

    fill_data = {**cert.certificate_data, "student_name": student.full_name}

    os.makedirs("generated_pdfs", exist_ok=True)
    output_path = f"generated_pdfs/certificate_{cert.id}.pdf"
    generate_certificate_pdf(
        template.design_html,
        fill_data,
        output_path,
        org.signature_url,
        verification.qr_code_url if verification else None,
        cert.verification_id
    )

    cert.pdf_url = output_path
    db.commit()

    return FileResponse(output_path, media_type="application/pdf", filename=f"certificate_{cert.id}.pdf")

@router.get("/offer-letters/{offer_id}/download")
def download_offer_letter_pdf(
    offer_id: int,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org)
):
    offer = db.query(models.OfferLetter).filter(
        models.OfferLetter.id == offer_id,
        models.OfferLetter.issued_by == org.id
    ).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer letter not found")

    student = db.query(models.Student).filter(models.Student.id == offer.student_id).first()
    template = db.query(models.OfferLetterTemplate).filter(models.OfferLetterTemplate.id == offer.template_id).first()
    verification = db.query(models.DocumentVerification).filter(
        models.DocumentVerification.verification_id == offer.verification_id
    ).first()

    fill_data = {**offer.offer_data, "student_name": student.full_name}

    os.makedirs("generated_pdfs", exist_ok=True)
    output_path = f"generated_pdfs/offer_{offer.id}.pdf"
    generate_certificate_pdf(
        template.design_html,
        fill_data,
        output_path,
        org.signature_url,
        verification.qr_code_url if verification else None,
        offer.verification_id
    )

    offer.pdf_url = output_path
    db.commit()

    return FileResponse(output_path, media_type="application/pdf", filename=f"offer_letter_{offer.id}.pdf")
@router.get("/profile")
def get_org_profile(org: models.Organization = Depends(get_current_org)):
    return {
        "id": org.id,
        "org_name": org.org_name,
        "org_type": org.org_type,
        "contact_email": org.contact_email,
        "status": org.status,
    }


@router.put("/profile")
def update_org_profile(
    data: schemas.OrgProfileUpdate,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org)
):
    org.org_name = data.org_name
    org.org_type = data.org_type
    org.contact_email = data.contact_email
    db.commit()
    return {"message": "Organization profile updated successfully"}

@router.get("/student-records")
def get_student_records(
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org)
):
    cert_student_ids = db.query(models.Certificate.student_id).filter(
        models.Certificate.issued_by == org.id
    ).distinct()
    offer_student_ids = db.query(models.OfferLetter.student_id).filter(
        models.OfferLetter.issued_by == org.id
    ).distinct()

    student_ids = set([r[0] for r in cert_student_ids] + [r[0] for r in offer_student_ids])

    records = []
    for sid in student_ids:
        student = db.query(models.Student).filter(models.Student.id == sid).first()
        if not student:
            continue
        cert_count = db.query(models.Certificate).filter(
            models.Certificate.student_id == sid,
            models.Certificate.issued_by == org.id
        ).count()
        offer_count = db.query(models.OfferLetter).filter(
            models.OfferLetter.student_id == sid,
            models.OfferLetter.issued_by == org.id
        ).count()
        records.append({
            "student_id": student.id,
            "full_name": student.full_name,
            "university": student.university,
            "certificates_issued": cert_count,
            "offer_letters_issued": offer_count,
        })

    return records

@router.post("/certificates/bulk")
def issue_bulk_certificates(
    data: schemas.BulkCertificateCreate,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org)
):
    template = db.query(models.CertificateTemplate).filter(
        models.CertificateTemplate.id == data.template_id,
        models.CertificateTemplate.organization_id == org.id
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    issued = []
    failed = []

    for email in data.student_emails:
        student_user = db.query(models.User).filter(models.User.email == email).first()
        if not student_user:
            failed.append({"email": email, "reason": "User not found"})
            continue

        student = db.query(models.Student).filter(models.Student.user_id == student_user.id).first()
        if not student:
            failed.append({"email": email, "reason": "Student record not found"})
            continue

        new_cert = models.Certificate(
            template_id=template.id,
            student_id=student.id,
            issued_by=org.id,
            certificate_data=data.certificate_data
        )
        db.add(new_cert)
        db.commit()
        db.refresh(new_cert)

        qr_path = generate_qr_code(new_cert.verification_id)
        verification = models.DocumentVerification(
            document_type="certificate",
            document_id=new_cert.id,
            verification_id=new_cert.verification_id,
            qr_code_url=qr_path
        )
        db.add(verification)
        db.commit()

        create_notification(db, student_user.id, f"You received a new certificate from {org.org_name}!")
        issued.append({"email": email, "certificate_id": new_cert.id})

    log_activity(db, org.user_id, "Bulk issued certificates", {"count": len(issued), "template_id": template.id})

    return {"issued": issued, "failed": failed}

@router.post("/signature")
async def upload_signature(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org)
):
    os.makedirs("signatures", exist_ok=True)
    file_path = f"signatures/org_{org.id}_signature.png"

    with open(file_path, "wb") as f:
        f.write(await file.read())

    org.signature_url = file_path
    db.commit()

    return {"message": "Signature uploaded successfully", "signature_url": file_path}