 -EMS AI CRM:
AI-Powered Event & Contract Management Platform
EMS AI CRM is a full-stack application designed to streamline event management, client tracking, contract handling, and invoicing — enhanced with local AI-powered contract analysis.
Built with a modern tech stack and clean architecture, this project demonstrates real-world system design, UI/UX thinking, and AI integration.

 -Overview:
Managing events involves multiple moving parts — clients, contracts, timelines, and finances. EMS AI CRM centralizes all of these into one intuitive platform while introducing AI-assisted contract insights.
This system is designed to be:
 Scalable
 User-friendly
 Developer-friendly
 AI-augmented

 -Key Features:
 .Event Management:
 Create, edit, and track events
 Status system: active, completed, on-hold
 Progress tracking UI
 Event–client relationship
   .Client Management:
 Store and manage client information
 Link clients to events and contracts
 Search and filter clients
   .Contract Management_
 Upload contract documents
 Store and manage files locally
 Prepare contracts for AI analysis
   .AI Contract Analysis:
 Powered by Ollama (local LLM)
 Extract insights from contracts
 Analyze content without cloud dependency
 Privacy-friendly AI processing
   .Invoice Management:
 Track invoices per event/client
 Payment status support:
     pending
     paid
     overdue
 Financial visibility per event
   -Authentication System;
 Sign up / Sign in pages
 Session-based access
 Secure user flow
   -Dashboard:
 Overview of:
     Total events
     Active events
     Completed events
 Clean analytics UI

 -UI / UX Highlights:
 Modern dark theme
 Glassmorphism-inspired design
 Built with React + Tailwind + shadcn/ui
 Responsive layout
 Clean and minimal interactions

 -System Architecture:

Frontend (React + Vite)
        ↓
API Layer (Flask REST API)
        ↓
Backend Services
   ├── SQLite Database
   ├── File Upload System
   └── Ollama (Local AI)


 - Screenshots:

.Home Page
![Home](./screenshots/home.png)

.Sign In
![Sign In](./screenshots/signin.png)

.Sign Up
![Sign Up](./screenshots/signup.png)

.Dashboard
![Dashboard](./screenshots/dashboard.png)

.Clients
![Clients](./screenshots/clients.png)

.Events
![Events](./screenshots/events.png)

.Contracts
![Contracts](./screenshots/contracts.png)

.AI Analysis
![Analysis](./screenshots/analysis.png)

.Invoices
![Invoices](./screenshots/invoices.png)

 -Tech Stack:
Frontend
 React (Vite)
 TypeScript
 Tailwind CSS
 shadcn/ui
 Lucide Icons
Backend
 Python (Flask)
 Flask-SQLAlchemy
 Flask-CORS
Database
 SQLite
AI Integration
 Ollama (Local LLM)
Tools
 Git & GitHub
 GitHub Desktop
 VS Code

 -Installation:

 1. Clone Repository
```bash
git clone https://github.com/BEZZARRANYA/ems-ai-crm.git
cd ems-ai-crm
2. Backend Setup
cd backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
pip install python-docx

python app.py

Backend runs on:
http://127.0.0.1:5001

3. Frontend Setup
cd app

npm install
npm run dev

Frontend runs on:
http://localhost:5173

Make sure backend is running before starting the frontend.


 -Frontend ↔ Backend Connection:
The frontend communicates with the backend via REST APIs:

fetch("http://127.0.0.1:5001/api/events")

CORS is enabled in Flask:

from flask_cors import CORS
CORS(app)


 -Project Structure:

ems-ai-crm/
├── app/            # React frontend
├── backend/        # Flask backend
├── screenshots/    # README images
├── .gitignore
└── README.md


 -What This Project Demonstrates:
 Full-stack development (frontend + backend)
 REST API design
 Database modeling
 File handling
 AI integration (LLM)
 UI/UX design
 Real-world system architecture

 -Future Improvements:
 Role-based authentication
 Cloud deployment (AWS / Vercel / Railway)
 Advanced analytics dashboard
 Multi-user collaboration
 Payment gateway integration

 Author
Ranya Bezzar Computer Science Student & Developer
