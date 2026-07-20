import enum

from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, String, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

try:
    from .database import Base
except ImportError:
    from database import Base


class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(50), unique=True, nullable=False)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    role = relationship("Role")


class StatusEnum(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    university = Column(String(150))
    degree = Column(String(150))
    year_of_study = Column(Integer)
    phone = Column(String(20))

    user = relationship("User")


class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    org_name = Column(String(150), nullable=False)
    org_type = Column(String(50))
    contact_email = Column(String(150))
    status = Column(Enum(StatusEnum), default=StatusEnum.pending)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    signature_url = Column(String(255), nullable=True)

    user = relationship("User", foreign_keys=[user_id])

from sqlalchemy import JSON

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), unique=True, nullable=False)
    bio_text = Column(String(2000))
    skills = Column(JSON)
    links = Column(JSON)
    profile_photo_url = Column(String(255))

    student = relationship("Student")

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    title = Column(String(150), nullable=False)
    template_id = Column(String(50))
    content = Column(JSON)
    pdf_url = Column(String(255))
    created_at = Column(TIMESTAMP, server_default=func.now())

    student = relationship("Student")

class Portfolio(Base):
    __tablename__ = "portfolios"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    title = Column(String(150), nullable=False)
    slug = Column(String(150), unique=True, nullable=False)
    is_published = Column(Boolean, default=False)
    source = Column(String(50), default="manual")
    created_at = Column(TIMESTAMP, server_default=func.now())

    student = relationship("Student")
    sections = relationship("PortfolioSection", back_populates="portfolio", cascade="all, delete-orphan")


class PortfolioSection(Base):
    __tablename__ = "portfolio_sections"
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    section_type = Column(String(50), nullable=False)
    content = Column(JSON)
    display_order = Column(Integer, default=0)

    portfolio = relationship("Portfolio", back_populates="sections")

import uuid

class CertificateTemplate(Base):
    __tablename__ = "certificate_templates"
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    name = Column(String(150), nullable=False)
    design_html = Column(String(5000))
    created_at = Column(TIMESTAMP, server_default=func.now())

    organization = relationship("Organization")


class Certificate(Base):
    __tablename__ = "certificates"
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("certificate_templates.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    issued_by = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    certificate_data = Column(JSON)
    pdf_url = Column(String(255))
    verification_id = Column(String(100), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    issued_at = Column(TIMESTAMP, server_default=func.now())

    template = relationship("CertificateTemplate")
    student = relationship("Student")
    organization = relationship("Organization")

class OfferLetterTemplate(Base):
    __tablename__ = "offer_letter_templates"
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    name = Column(String(150), nullable=False)
    design_html = Column(String(5000))
    created_at = Column(TIMESTAMP, server_default=func.now())

    organization = relationship("Organization")


class OfferLetter(Base):
    __tablename__ = "offer_letters"
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("offer_letter_templates.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    issued_by = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    offer_data = Column(JSON)
    pdf_url = Column(String(255))
    verification_id = Column(String(100), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    issued_at = Column(TIMESTAMP, server_default=func.now())

    template = relationship("OfferLetterTemplate")
    student = relationship("Student")
    organization = relationship("Organization")

class DocumentVerification(Base):
    __tablename__ = "document_verification"
    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(String(50), nullable=False)  # certificate / offer_letter
    document_id = Column(Integer, nullable=False)
    verification_id = Column(String(100), unique=True, nullable=False)
    qr_code_url = Column(String(255))
    is_valid = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

class AIPrompt(Base):
    __tablename__ = "ai_prompts"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    prompt_text = Column(String(3000))
    generated_output = Column(JSON)
    purpose = Column(String(50), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    student = relationship("Student")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(String(255), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User")


class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(255), nullable=False)
    extra_data = Column("metadata", JSON)
    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User")