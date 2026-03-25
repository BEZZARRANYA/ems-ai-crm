# EMS AI CRM

An AI-powered Event Management System (EMS) that streamlines event operations, contract handling, and client management — enhanced with intelligent contract analysis using local AI models.

This project combines modern frontend design with a robust backend and real-world business logic to simulate a production-ready CRM system for event-based businesses.

---

##  Overview

EMS AI CRM is built to solve a real problem: managing events, contracts, and clients efficiently while reducing risk through automated contract analysis.

Instead of manually reviewing contracts, this system extracts text and uses AI to generate:
- Clear summaries
- Key obligations
- Risk flags
- Actionable recommendations

This makes it especially useful for:
- Event agencies
- Artist managers
- Venue organizers
- Freelancers handling contracts

---

##  Core Features

###  Event Management
- Create, update, and delete events
- Track event lifecycle:
  - Active
  - Completed
  - On-Hold
- Assign clients to events
- Manage artists per event (stored locally per event)
- Visual progress tracking

---

###  Contract Intelligence (AI-Powered)
- Upload contracts (PDF, DOCX)
- Automatic text extraction from files
- AI analysis using local LLM (Ollama)

#### Output includes:
-  Summary of the contract
-  Key clauses and responsibilities
-  Risk detection (e.g. cancellation penalties)
-  Smart recommendations

---

###  Client Management
- Centralized client database
- Link clients to events and contracts
- Display client context directly in event cards

---

###  Invoice & Payment Tracking
- Manage financial states:
  - Pending
  - Paid
  - Overdue
- Designed to integrate with event lifecycle

---

##  AI Integration

This project integrates **local AI (Ollama)** instead of external APIs, meaning:
- No external API cost
- Full control over data
- Faster local processing

The backend:
1. Extracts contract text
2. Sends it to the AI model
3. Parses structured insights
4. Returns JSON to frontend

---

##  Tech Stack

### Frontend
- React (Vite)
- TypeScript
- Tailwind CSS
- shadcn/ui (modern UI components)
- Lucide Icons

### Backend
- Flask (Python)
- SQLAlchemy ORM
- SQLite database

### AI Layer
- Ollama (local LLM inference)

---

##  System Architecture

Frontend (React)
↓
Flask API (REST)
↓
SQLite Database
↓
AI Layer (Ollama)

---

##  Project Structure

ems-project/
│
├── app/ # Frontend (React + Vite)
│ ├── components/
│ ├── pages/
│ └── ui/
│
├── backend/ # Flask backend
│ ├── app.py # Main API
│ ├── models.py # Database models
│ ├── config.py
│ ├── uploads/ # Stored contracts
│ └── requirements.txt
│
└── .gitignore

---

## ⚙️ Installation & Setup

### 1. Clone repository

```bash
git clone https://github.com/BEZZARRANYA/ems-ai-crm.git
cd ems-ai-crm
2. Backend Setup
cd backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
python app.py

Backend runs on:

http://127.0.0.1:5001

