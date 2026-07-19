import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from pypdf import PdfReader
import io

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")


def parse_resume_text(resume_text: str) -> dict:
    """Takes raw resume text and returns structured JSON."""
    prompt = f"""
You are a resume parser. Extract structured information from the resume text below.
Return ONLY valid JSON, no markdown, no explanation, matching exactly this shape:

{{
  "full_name": "string",
  "education": [{{"degree": "string", "college": "string", "year": "string"}}],
  "experience": [{{"role": "string", "company": "string", "duration": "string"}}],
  "skills": ["string"],
  "projects": [{{"name": "string", "description": "string"}}]
}}

Resume text:
{resume_text}
"""
    response = model.generate_content(prompt)
    raw_text = response.text.strip()

    # Clean up if Gemini wraps it in markdown code fences
    if raw_text.startswith("```"):
        raw_text = raw_text.strip("`")
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]

    return json.loads(raw_text)


def generate_portfolio_from_prompt(prompt_text: str) -> dict:
    """Takes a free-text prompt and returns structured portfolio sections."""
    prompt = f"""
You are a portfolio content generator for a student career platform.
Based on the description below, generate portfolio content.
Return ONLY valid JSON, no markdown, no explanation, matching exactly this shape:

{{
  "about": {{"bio": "string, 2-3 sentences, professional tone"}},
  "skills": ["string"],
  "projects": [{{"name": "string", "description": "string"}}],
  "experience": [{{"role": "string", "company": "string", "duration": "string"}}]
}}

If information isn't mentioned, use an empty array or reasonable placeholder.

Student description:
{prompt_text}
"""
    response = model.generate_content(prompt)
    raw_text = response.text.strip()

    if raw_text.startswith("```"):
        raw_text = raw_text.strip("`")
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]

    return json.loads(raw_text)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract raw text from an uploaded PDF file's bytes."""
    reader = PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text