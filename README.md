# Smart Career Management System (SCMS)

An AI-powered, full-stack platform for managing career documents — students build resumes and portfolios, organizations issue certificates and offer letters, and every document can be verified via QR code.

## Features

**Student:** Profile, manual resume builder, AI resume parsing (upload), AI portfolio generation (prompt-based), portfolio publishing, PDF downloads, notifications.

**Organization:** Profile management, certificate & offer letter templates, single + bulk document issuance, digital signature stamping, student records, PDF downloads.

**Super Admin:** Approve organizations, manage users, view all templates, platform analytics, audit/activity logs.

**Public (no login):** View published portfolios, verify certificates/offer letters via QR code or verification ID.

## Tech Stack

- **Backend:** FastAPI, MySQL, SQLAlchemy, JWT + Refresh Tokens, Google Gemini AI, ReportLab/xhtml2pdf, qrcode
- **Frontend:** React (Vite), React Router, Axios

## Project Structure
SCMS/
├── backend/ # FastAPI backend - models, routers, AI integration, PDF/QR generation
└── frontend/ # React frontend - student, organization, and admin dashboards, public pages
