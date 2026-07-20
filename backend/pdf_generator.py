from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import os


def wrap_text(text, font_name, font_size, max_width, canvas_obj):
    """Break text into lines that fit within max_width."""
    words = text.split()
    lines = []
    current_line = ""

    for word in words:
        test_line = f"{current_line} {word}".strip()
        if canvas_obj.stringWidth(test_line, font_name, font_size) <= max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
            current_line = word

    if current_line:
        lines.append(current_line)

    return lines


def generate_resume_pdf(resume_data: dict, student_name: str, output_path: str):
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    y = height - 1 * inch
    max_text_width = width - 2.2 * inch  # usable width, leaving margins

    def check_page_break(current_y, needed_space=0.3 * inch):
        if current_y < 1 * inch:
            c.showPage()
            return height - 1 * inch
        return current_y

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
            for wrapped_line in wrap_text(line, "Helvetica", 10, max_text_width, c):
                y = check_page_break(y)
                c.drawString(1.1 * inch, y, wrapped_line)
                y -= 0.22 * inch
        y -= 0.15 * inch

    # --- Skills ---
    skills = resume_data.get("skills", [])
    if skills:
        c.setFont("Helvetica-Bold", 13)
        y = check_page_break(y)
        c.drawString(1 * inch, y, "SKILLS")
        y -= 0.25 * inch
        c.setFont("Helvetica", 10)
        skills_line = ", ".join(skills)
        for wrapped_line in wrap_text(skills_line, "Helvetica", 10, max_text_width, c):
            y = check_page_break(y)
            c.drawString(1.1 * inch, y, wrapped_line)
            y -= 0.22 * inch
        y -= 0.15 * inch

    # --- Experience ---
    experience = resume_data.get("experience", [])
    if experience:
        c.setFont("Helvetica-Bold", 13)
        y = check_page_break(y)
        c.drawString(1 * inch, y, "EXPERIENCE")
        y -= 0.25 * inch
        c.setFont("Helvetica", 10)
        for exp in experience:
            line = f"{exp.get('role', '')} - {exp.get('company', '')} ({exp.get('duration', '')})"
            for wrapped_line in wrap_text(line, "Helvetica", 10, max_text_width, c):
                y = check_page_break(y)
                c.drawString(1.1 * inch, y, wrapped_line)
                y -= 0.22 * inch
        y -= 0.15 * inch

    # --- Projects ---
    projects = resume_data.get("projects", [])
    if projects:
        c.setFont("Helvetica-Bold", 13)
        y = check_page_break(y)
        c.drawString(1 * inch, y, "PROJECTS")
        y -= 0.25 * inch
        for proj in projects:
            c.setFont("Helvetica-Bold", 10)
            y = check_page_break(y)
            c.drawString(1.1 * inch, y, proj.get("name", ""))
            y -= 0.2 * inch

            c.setFont("Helvetica-Oblique", 9)
            desc = proj.get("description", "")
            for wrapped_line in wrap_text(desc, "Helvetica-Oblique", 9, max_text_width - 0.2 * inch, c):
                y = check_page_break(y)
                c.drawString(1.2 * inch, y, wrapped_line)
                y -= 0.2 * inch
            y -= 0.15 * inch

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


def generate_certificate_pdf(design_html: str, data: dict, output_path: str, signature_path: str = None) -> str:
    filled_html = fill_template(design_html, data)

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

    # Stamp signature onto the PDF if provided
    if signature_path and os.path.exists(signature_path):
        stamp_signature(output_path, signature_path)

    return output_path


def stamp_signature(pdf_path: str, signature_path: str):
    """Overlay a signature image onto the bottom of the first page of an existing PDF."""
    from reportlab.pdfgen import canvas as sig_canvas
    from PyPDF2 import PdfReader, PdfWriter
    import io

    # Create an overlay PDF with just the signature image
    packet = io.BytesIO()
    c = sig_canvas.Canvas(packet, pagesize=A4)
    width, height = A4
    c.drawImage(signature_path, width - 3 * inch, 1 * inch, width=1.5 * inch, height=0.7 * inch, mask='auto')
    c.setFont("Helvetica", 8)
    c.drawString(width - 3 * inch, 0.85 * inch, "Authorized Signature")
    c.save()
    packet.seek(0)

    overlay_reader = PdfReader(packet)
    base_reader = PdfReader(pdf_path)
    writer = PdfWriter()

    base_page = base_reader.pages[0]
    base_page.merge_page(overlay_reader.pages[0])
    writer.add_page(base_page)

    for i in range(1, len(base_reader.pages)):
        writer.add_page(base_reader.pages[i])

    with open(pdf_path, "wb") as f:
        writer.write(f)