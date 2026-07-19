from pydantic import BaseModel, EmailStr
from typing import Optional

# --- For registering a student ---
class StudentRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    university: Optional[str] = None
    degree: Optional[str] = None
    year_of_study: Optional[int] = None
    phone: Optional[str] = None

# --- For registering an organization ---
class OrganizationRegister(BaseModel):
    email: EmailStr
    password: str
    org_name: str
    org_type: Optional[str] = None
    contact_email: Optional[str] = None

# --- For login (both roles use this) ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# --- What we send back after successful login ---
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


from typing import List, Dict, Any

# --- Student Profile ---
class ProfileUpdate(BaseModel):
    bio_text: Optional[str] = None
    skills: Optional[List[str]] = None
    links: Optional[Dict[str, str]] = None
    profile_photo_url: Optional[str] = None

class ProfileResponse(BaseModel):
    id: int
    student_id: int
    bio_text: Optional[str] = None
    skills: Optional[List[str]] = None
    links: Optional[Dict[str, str]] = None
    profile_photo_url: Optional[str] = None

    class Config:
        from_attributes = True

# --- Resume ---
class ResumeCreate(BaseModel):
    title: str
    template_id: Optional[str] = "modern"
    content: Dict[str, Any]

class ResumeResponse(BaseModel):
    id: int
    student_id: int
    title: str
    template_id: Optional[str] = None
    content: Dict[str, Any]
    pdf_url: Optional[str] = None

    class Config:
        from_attributes = True

# --- Portfolio ---
class PortfolioCreate(BaseModel):
    title: str
    source: Optional[str] = "manual"  # manual / prompt / resume_upload

class PortfolioResponse(BaseModel):
    id: int
    student_id: int
    title: str
    slug: str
    is_published: bool
    source: str

    class Config:
        from_attributes = True

class PortfolioSectionCreate(BaseModel):
    section_type: str  # about / skills / projects / experience / education / certificates
    content: Dict[str, Any]
    display_order: Optional[int] = 0

class PortfolioSectionResponse(BaseModel):
    id: int
    portfolio_id: int
    section_type: str
    content: Dict[str, Any]
    display_order: int

    class Config:
        from_attributes = True

# --- Certificate Templates ---
class CertificateTemplateCreate(BaseModel):
    name: str
    design_html: str

class CertificateTemplateResponse(BaseModel):
    id: int
    organization_id: int
    name: str
    design_html: str

    class Config:
        from_attributes = True

# --- Certificates ---
class CertificateCreate(BaseModel):
    template_id: int
    student_email: str  # org looks up student by email
    certificate_data: Dict[str, Any]

class CertificateResponse(BaseModel):
    id: int
    template_id: int
    student_id: int
    issued_by: int
    certificate_data: Dict[str, Any]
    pdf_url: Optional[str] = None
    verification_id: str

    class Config:
        from_attributes = True

# --- Offer Letter Templates ---
class OfferLetterTemplateCreate(BaseModel):
    name: str
    design_html: str

class OfferLetterTemplateResponse(BaseModel):
    id: int
    organization_id: int
    name: str
    design_html: str

    class Config:
        from_attributes = True

# --- Offer Letters ---
class OfferLetterCreate(BaseModel):
    template_id: int
    student_email: str
    offer_data: Dict[str, Any]

class OfferLetterResponse(BaseModel):
    id: int
    template_id: int
    student_id: int
    issued_by: int
    offer_data: Dict[str, Any]
    pdf_url: Optional[str] = None
    verification_id: str

    class Config:
        from_attributes = True

# --- AI Portfolio Generation ---
class PromptRequest(BaseModel):
    prompt_text: str

# --- Notifications ---
class NotificationResponse(BaseModel):
    id: int
    message: str
    is_read: bool
    created_at: Any

    class Config:
        from_attributes = True

# --- Activity Logs ---
class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: Any

    class Config:
        from_attributes = True