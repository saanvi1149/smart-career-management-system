from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/portfolio", tags=["Public Portfolio"])


@router.get("/{slug}")
def get_public_portfolio(slug: str, db: Session = Depends(get_db)):
    portfolio = db.query(models.Portfolio).filter(
        models.Portfolio.slug == slug,
        models.Portfolio.is_published == True
    ).first()

    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found or not published")

    student = db.query(models.Student).filter(models.Student.id == portfolio.student_id).first()

    sections = db.query(models.PortfolioSection).filter(
        models.PortfolioSection.portfolio_id == portfolio.id
    ).order_by(models.PortfolioSection.display_order).all()

    return {
        "title": portfolio.title,
        "student_name": student.full_name,
        "university": student.university,
        "degree": student.degree,
        "sections": [
            {"section_type": s.section_type, "content": s.content}
            for s in sections
        ]
    }