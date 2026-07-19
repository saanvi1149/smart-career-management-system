from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import os

def generate_resume_pdf(resume_data: dict, student_name: str, output_path: str):
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    y = height - 1 * inch

    # --- Header ---
    c.setFont("Helvetica-Bold", 20)
    c.drawString(1 * inch, y, student_name)
    y -= 0.4 * inch

    c.setFont("Helvetica", 10)
    contact = resume_data.get("contact", {})
    if contact:
        contact_line = " | ".join([f"{k}: {v}" for k, v in contact.items()])
        c.drawString(1 * inch, y, contact_line)
        y -= 0.3 * inch

    c.line(1 * inch, y, width - 1 * inch, y)
    y -= 0.3 * inch

    # --- Education ---
    education = resume_data.get("education", [])
    if education:
        c.setFont("Helvetica-Bold", 13)
        c.drawString(1 * inch, y, "EDUCATION")
        y -= 0.25 * inch
        c.setFont("Helvetica", 10)
        for edu in education:
            line = f"{edu.get('degree', '')} - {edu.get('college', '')} ({edu.get('year', '')})"
            c.drawString(1.1 * inch, y, line)
            y -= 0.25 * inch
        y -= 0.15 * inch

    # --- Skills ---
    skills = resume_data.get("skills", [])
    if skills:
        c.setFont("Helvetica-Bold", 13)
        c.drawString(1 * inch, y, "SKILLS")
        y -= 0.25 * inch
        c.setFont("Helvetica", 10)
        c.drawString(1.1 * inch, y, ", ".join(skills))
        y -= 0.35 * inch

    # --- Experience ---
    experience = resume_data.get("experience", [])
    if experience:
        c.setFont("Helvetica-Bold", 13)
        c.drawString(1 * inch, y, "EXPERIENCE")
        y -= 0.25 * inch
        c.setFont("Helvetica", 10)
        for exp in experience:
            line = f"{exp.get('role', '')} - {exp.get('company', '')} ({exp.get('duration', '')})"
            c.drawString(1.1 * inch, y, line)
            y -= 0.25 * inch
        y -= 0.15 * inch

    # --- Projects ---
    projects = resume_data.get("projects", [])
    if projects:
        c.setFont("Helvetica-Bold", 13)
        c.drawString(1 * inch, y, "PROJECTS")
        y -= 0.25 * inch
        c.setFont("Helvetica", 10)
        for proj in projects:
            c.drawString(1.1 * inch, y, proj.get("name", ""))
            y -= 0.2 * inch
            desc = proj.get("description", "")
            c.setFont("Helvetica-Oblique", 9)
            c.drawString(1.2 * inch, y, desc)
            c.setFont("Helvetica", 10)
            y -= 0.3 * inch

    c.save()
    return output_path

from xhtml2pdf import pisa
import os

def fill_template(design_html: str, data: dict) -> str:
    """Replace {{placeholder}} in design_html with actual values from data dict."""
    filled = design_html
    for key, value in data.items():
        filled = filled.replace(f"{{{{{key}}}}}", str(value))
    return filled


def generate_certificate_pdf(design_html: str, data: dict, output_path: str) -> str:
    filled_html = fill_template(design_html, data)

    # Wrap in basic HTML structure for consistent rendering
    full_html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Helvetica, Arial, sans-serif; text-align: center; padding: 60px; }}
            h1 {{ color: #2c3e50; }}
            p {{ font-size: 16px; color: #333; }}
        </style>
    </head>
    <body>{filled_html}</body>
    </html>
    """

    with open(output_path, "wb") as f:
        pisa.CreatePDF(full_html, dest=f)

    return output_path