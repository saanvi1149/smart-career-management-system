from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth
from pdf_generator import generate_resume_pdf
from fastapi.responses import FileResponse
import os
from utils import generate_slug
from ai_service import generate_portfolio_from_prompt, parse_resume_text
from fastapi import UploadFile, File
from ai_service import extract_text_from_pdf, parse_resume_text

router = APIRouter(prefix="/students", tags=["Student"])


@router.get("/profile", response_model=schemas.ProfileResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["student"]))
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")

    profile = db.query(models.Profile).filter(models.Profile.student_id == student.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not created yet")

    return profile


@router.put("/profile", response_model=schemas.ProfileResponse)
def update_my_profile(
    data: schemas.ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["student"]))
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")

    profile = db.query(models.Profile).filter(models.Profile.student_id == student.id).first()

    if not profile:
        # Create new profile if it doesn't exist
        profile = models.Profile(student_id=student.id)
        db.add(profile)

    # Update only the fields that were sent
    if data.bio_text is not None:
        profile.bio_text = data.bio_text
    if data.skills is not None:
        profile.skills = data.skills
    if data.links is not None:
        profile.links = data.links
    if data.profile_photo_url is not None:
        profile.profile_photo_url = data.profile_photo_url

    db.commit()
    db.refresh(profile)

    return profile

# --- Resume Endpoints ---

@router.post("/resumes", response_model=schemas.ResumeResponse)
def create_resume(
    data: schemas.ResumeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["student"]))
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")

    new_resume = models.Resume(
        student_id=student.id,
        title=data.title,
        template_id=data.template_id,
        content=data.content
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    return new_resume


@router.get("/resumes", response_model=list[schemas.ResumeResponse])
def get_my_resumes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["student"]))
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")

    resumes = db.query(models.Resume).filter(models.Resume.student_id == student.id).all()
    return resumes


@router.get("/resumes/{resume_id}", response_model=schemas.ResumeResponse)
def get_resume_by_id(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["student"]))
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id,
        models.Resume.student_id == student.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    return resume


@router.put("/resumes/{resume_id}", response_model=schemas.ResumeResponse)
def update_resume(
    resume_id: int,
    data: schemas.ResumeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["student"]))
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id,
        models.Resume.student_id == student.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume.title = data.title
    resume.template_id = data.template_id
    resume.content = data.content
    db.commit()
    db.refresh(resume)

    return resume


@router.delete("/resumes/{resume_id}")
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["student"]))
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id,
        models.Resume.student_id == student.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    db.delete(resume)
    db.commit()

    return {"message": "Resume deleted successfully"}

@router.get("/resumes/{resume_id}/download")
def download_resume_pdf(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["student"]))
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id,
        models.Resume.student_id == student.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    output_path = f"generated_pdfs/resume_{resume.id}.pdf"
    generate_resume_pdf(resume.content, student.full_name, output_path)

    resume.pdf_url = output_path
    db.commit()

    return FileResponse(output_path, media_type="application/pdf", filename=f"{resume.title}.pdf")

# --- Portfolio Endpoints ---

@router.post("/portfolios", response_model=schemas.PortfolioResponse)
def create_portfolio(
    data: schemas.PortfolioCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["student"]))
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")

    slug = generate_slug(data.title)

    new_portfolio = models.Portfolio(
        student_id=student.id,
        title=data.title,
        slug=slug,
        source=data.source
    )
    db.add(new_portfolio)
    db.commit()
    db.refresh(new_portfolio)

    return new_portfolio


@router.get("/portfolios", response_model=list[schemas.PortfolioResponse])
def get_my_portfolios(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["student"]))
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    portfolios = db.query(models.Portfolio).filter(models.Portfolio.student_id == student.id).all()
    return portfolios


@router.post("/portfolios/{portfolio_id}/sections", response_model=schemas.PortfolioSectionResponse)
def add_portfolio_section(
    portfolio_id: int,
    data: schemas.PortfolioSectionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["student"]))
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    portfolio = db.query(models.Portfolio).filter(
        models.Portfolio.id == portfolio_id,
        models.Portfolio.student_id == student.id
    ).first()

    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    new_section = models.PortfolioSection(
        portfolio_id=portfolio.id,
        section_type=data.section_type,
        content=data.content,
        display_order=data.display_order
    )
    db.add(new_section)
    db.commit()
    db.refresh(new_section)

    return new_section


@router.get("/portfolios/{portfolio_id}/sections", response_model=list[schemas.PortfolioSectionResponse])
def get_portfolio_sections(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["student"]))
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    portfolio = db.query(models.Portfolio).filter(
        models.Portfolio.id == portfolio_id,
        models.Portfolio.student_id == student.id
    ).first()

    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    sections = db.query(models.PortfolioSection).filter(
        models.PortfolioSection.portfolio_id == portfolio.id
    ).order_by(models.PortfolioSection.display_order).all()

    return sections


@router.put("/portfolios/{portfolio_id}/publish")
def publish_portfolio(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["student"]))
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    portfolio = db.query(models.Portfolio).filter(
        models.Portfolio.id == portfolio_id,
        models.Portfolio.student_id == student.id
    ).first()

    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    portfolio.is_published = True
    db.commit()

    return {"message": "Portfolio published successfully", "public_url": f"/portfolio/{portfolio.slug}"}

@router.post("/portfolios/{portfolio_id}/generate-from-prompt")
def generate_portfolio_sections_from_prompt(
    portfolio_id: int,
    data: schemas.PromptRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["student"]))
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    portfolio = db.query(models.Portfolio).filter(
        models.Portfolio.id == portfolio_id,
        models.Portfolio.student_id == student.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    # Log the AI prompt
    ai_log = models.AIPrompt(
        student_id=student.id,
        prompt_text=data.prompt_text,
        purpose="portfolio_generation"
    )

    # Call Gemini
    generated = generate_portfolio_from_prompt(data.prompt_text)
    ai_log.generated_output = generated
    db.add(ai_log)
    db.commit()

    # Create portfolio sections from the generated content
    created_sections = []
    order = 1
    for section_type, content in generated.items():
        section = models.PortfolioSection(
            portfolio_id=portfolio.id,
            section_type=section_type,
            content=content if isinstance(content, dict) else {"items": content},
            display_order=order
        )
        db.add(section)
        created_sections.append(section)
        order += 1

    db.commit()

    return {"message": "Portfolio sections generated successfully", "sections_created": len(created_sections)}

@router.post("/resumes/upload-and-parse")
async def upload_and_parse_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["student"]))
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()
    resume_text = extract_text_from_pdf(file_bytes)

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from this PDF")

    parsed_data = parse_resume_text(resume_text)

    # Log the AI parsing action
    ai_log = models.AIPrompt(
        student_id=student.id,
        prompt_text=f"Resume upload parse: {file.filename}",
        generated_output=parsed_data,
        purpose="resume_parse"
    )
    db.add(ai_log)

    # Save this as a new resume
    new_resume = models.Resume(
        student_id=student.id,
        title=f"Parsed Resume - {file.filename}",
        template_id="modern",
        content=parsed_data
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    return {
        "message": "Resume parsed and saved successfully",
        "resume_id": new_resume.id,
        "parsed_data": parsed_data
    }