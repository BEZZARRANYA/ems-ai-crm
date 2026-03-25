from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from models import db, Client, Event, Invoice, Contract, User, Lead
from werkzeug.security import generate_password_hash, check_password_hash
from docx import Document

import os
import json
import uuid
import requests
from flask import send_file

from datetime import datetime
from werkzeug.utils import secure_filename  

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db.init_app(app)

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
OLLAMA_MODEL = "llama3.2"

def serialize_invoice(invoice):
    return {
        "id": invoice.id,
        "invoice_code": invoice.invoice_code,
        "client": invoice.client.name if invoice.client else "Unknown",
        "event": invoice.event_name,
        "amount": invoice.amount,
        "status": invoice.status,
        "date": invoice.issue_date,
        "dueDate": invoice.due_date,
        "email": invoice.client.contact_email if invoice.client and invoice.client.contact_email else ""
    }

def generate_invoice_code(invoice_id):
    year = datetime.now().year
    return f"INV-{year}-{invoice_id:03d}"

def build_dashboard_context(clients, events, contracts):
    total_clients = len(clients)
    total_events = len(events)
    active_events = len([e for e in events if (e.status or "active") == "active"])
    venues = [c.name for c in clients if (c.type or "").lower() == "venue"]
    artists = [c.name for c in clients if (c.type or "").lower() == "artist"]
    pending_contracts = len([c for c in contracts if (c.get("status") or "").lower() == "pending"])

    recent_events = []
    for e in events[-5:]:
        recent_events.append({
            "title": e.title,
            "date": e.event_date,
            "status": e.status,
            "client_name": e.client.name if e.client else "Unknown"
        })

    return {
        "total_clients": total_clients,
        "total_events": total_events,
        "active_events": active_events,
        "venues": venues,
        "artists": artists,
        "pending_contracts": pending_contracts,
        "recent_events": recent_events
    }

def extract_text_from_docx(file_path):
    try:
        doc = Document(file_path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs)
    except Exception as e:
        print("DOCX EXTRACT ERROR:", str(e))
        return None

def extract_contract_text(file_path, filename):
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".docx":
        return extract_text_from_docx(file_path)

    return None


@app.route("/api/ai/ask", methods=["POST"])
def ask_ai():
    data = request.get_json() or {}
    query = (data.get("message") or "").strip().lower()

    if not query:
        return jsonify({"error": "message is required"}), 400

    clients = Client.query.all()
    events = Event.query.all()

    # 1. Show upcoming events
    if "upcoming events" in query or "show upcoming events" in query:
        upcoming = [e for e in events if e.event_date]
        upcoming = sorted(upcoming, key=lambda e: e.event_date)[:5]

        return jsonify({
            "type": "events_list",
            "answer": f"I found {len(upcoming)} upcoming events.",
            "items": [
                {
                    "id": e.id,
                    "title": e.title,
                    "event_date": e.event_date,
                    "client_name": e.client.name if e.client else "Unknown",
                    "status": e.status
                }
                for e in upcoming
            ]
        })

    # 2. How many active events
    if "active events" in query or "how many active events" in query:
        active_count = len([e for e in events if (e.status or "").lower() == "active"])

        return jsonify({
            "type": "stat",
            "answer": f"There are {active_count} active events.",
            "value": active_count,
            "label": "Active Events"
        })

    # 3. Which clients are inactive
    if "inactive clients" in query or "which clients are inactive" in query:
        inactive_clients = [c for c in clients if (c.status or "").lower() == "inactive"]

        return jsonify({
            "type": "clients_list",
            "answer": f"I found {len(inactive_clients)} inactive clients.",
            "items": [
                {
                    "id": c.id,
                    "name": c.name,
                    "type": c.type,
                    "status": c.status
                }
                for c in inactive_clients
            ]
        })

    # 4. Most active client
    if "most active client" in query:
        if not clients:
            return jsonify({
                "type": "insight",
                "answer": "No clients found."
            })

        most_active = max(clients, key=lambda c: len(c.events), default=None)

        if most_active and len(most_active.events) > 0:
            return jsonify({
                "type": "insight",
                "answer": f"The most active client is {most_active.name} with {len(most_active.events)} events.",
                "item": {
                    "id": most_active.id,
                    "name": most_active.name,
                    "events_count": len(most_active.events)
                }
            })
        else:
            return jsonify({
                "type": "insight",
                "answer": "No event activity found yet."
            })

    # 5. Peak event periods
    if "peak event" in query or "peak event periods" in query:
        dated_events = [e for e in events if e.event_date]

        if not dated_events:
            return jsonify({
                "type": "insight",
                "answer": "No dated events found."
            })

        month_counts = {}
        for e in dated_events:
            month = e.event_date[:7]  # YYYY-MM
            month_counts[month] = month_counts.get(month, 0) + 1

        peak_month = max(month_counts, key=month_counts.get)

        return jsonify({
            "type": "insight",
            "answer": f"The peak event period is {peak_month} with {month_counts[peak_month]} events.",
            "item": {
                "period": peak_month,
                "events_count": month_counts[peak_month]
            }
        })

    # 6. Suggest best venue
    if "best venue" in query or "suggest best venue" in query:
        venues = [c for c in clients if (c.type or "").lower() == "venue"]

        if not venues:
            return jsonify({
                "type": "recommendation",
                "answer": "No venues found to recommend."
            })

        best_venue = max(venues, key=lambda c: len(c.events), default=None)

        return jsonify({
            "type": "recommendation",
            "answer": f"Based on past activity, I recommend {best_venue.name}.",
            "item": {
                "id": best_venue.id,
                "name": best_venue.name,
                "events_count": len(best_venue.events)
            }
        })

    # 7. Recommend scheduling improvements
    if "scheduling improvement" in query or "recommend scheduling" in query:
        active_count = len([e for e in events if (e.status or "").lower() == "active"])

        if active_count >= 5:
            message = "You have many active events. I recommend spreading deadlines and confirming venue availability earlier."
        elif active_count >= 2:
            message = "Your schedule looks moderate. I recommend tracking event dates weekly to avoid overlaps."
        else:
            message = "Your schedule is light. This is a good time to plan upcoming bookings and client follow-ups."

        return jsonify({
            "type": "recommendation",
            "answer": message
        })

    # Fallback to Ollama
    try:
        response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={
                "model": "llama3.2",
                "prompt": f"""
You are an AI assistant inside an Event Management CRM.

Answer this dashboard question clearly and briefly:
{query}
""",
                "stream": False
            },
            timeout=60
        )
        response.raise_for_status()

        result = response.json()
        return jsonify({
            "type": "text",
            "answer": result.get("response", "No response from Ollama.")
        })

    except Exception as e:
        return jsonify({
            "type": "text",
            "answer": f"I could not process that request right now: {str(e)}"
        }), 500

@app.route("/api/health")
def health():
    return jsonify({"status": "Backend running"})

def format_file_size(size_bytes):
    mb = size_bytes / (1024 * 1024)
    return f"{mb:.2f} MB"

def generate_contract_code(contract_id):
    year = datetime.now().year
    return f"CTR-{year}-{contract_id:03d}"

def serialize_contract(contract):
    return {
        "id": contract.id,
        "contract_code": contract.contract_code,
        "name": contract.name,
        "client": contract.client.name if contract.client else "Unknown",
        "date": contract.uploaded_at,
        "status": contract.status,
        "size": contract.file_size,
        "type": contract.type,
        "analysis": json.loads(contract.analysis_json) if contract.analysis_json else None
    }

contracts = []
contract_counter = 1

@app.route("/api/contracts", methods=["GET"])
def get_contracts():
    contracts = Contract.query.order_by(Contract.id.desc()).all()
    return jsonify([serialize_contract(c) for c in contracts])


@app.route("/api/contracts/upload", methods=["POST"])
def upload_contract():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if not file or file.filename == "":
        return jsonify({"error": "Invalid file"}), 400

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    original_filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{original_filename}"
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)

    file.save(file_path)

    size_bytes = os.path.getsize(file_path)
    extracted_text = extract_contract_text(file_path, original_filename)

    contract = Contract(
      contract_code="TEMP",
      name=os.path.splitext(original_filename)[0],
      filename=original_filename,
      file_path=file_path,
      file_size=format_file_size(size_bytes),
      type="Artist",
      status="pending",
      uploaded_at=datetime.now().strftime("%Y-%m-%d"),
      client_id=None,
      extracted_text=extracted_text
    )

    db.session.add(contract)
    db.session.commit()

    contract.contract_code = generate_contract_code(contract.id)
    db.session.commit()

    return jsonify(serialize_contract(contract)), 201

@app.route("/api/contracts/<int:contract_id>/analyze", methods=["POST"])
def analyze_contract(contract_id):
    contract = Contract.query.get_or_404(contract_id)

    contract_text = (contract.extracted_text or "").strip()

    if not contract_text:
        return jsonify({
            "error": "No readable contract text found. Please upload a .docx file."
        }), 400

    prompt = f"""
You are an AI assistant for contract analysis.

Read the following contract text and analyze it carefully.

Contract text:
\"\"\"
{contract_text[:6000]}
\"\"\"

Return ONLY valid JSON in this exact shape:
{{
  "summary": "short summary of the contract",
  "keyPoints": ["point 1", "point 2"],
  "risks": [
    {{"level": "high", "description": "risk description"}},
    {{"level": "medium", "description": "risk description"}}
  ],
  "recommendations": ["recommendation 1", "recommendation 2"]
}}
"""

    try:
        response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={
                "model": "llama3.2",
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )

        print("OLLAMA STATUS:", response.status_code)
        print("OLLAMA TEXT:", response.text)

        response.raise_for_status()

        result = response.json()
        raw_text = (result.get("response") or "").strip()

        print("OLLAMA RAW RESPONSE:", raw_text)

        if raw_text.startswith("```"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        start = raw_text.find("{")
        end = raw_text.rfind("}")

        if start == -1 or end == -1:
            return jsonify({
                "error": f"Ollama did not return valid JSON. Raw response: {raw_text}"
            }), 500

        json_text = raw_text[start:end + 1]
        parsed = json.loads(json_text)

        contract.summary = parsed.get("summary")
        contract.analysis_json = json.dumps(parsed)

        if contract.status == "pending":
            contract.status = "active"

        db.session.commit()

        return jsonify(parsed)

    except requests.exceptions.ConnectionError as e:
        print("CONNECTION ERROR:", str(e))
        return jsonify({"error": "Cannot connect to Ollama. Make sure Ollama is running."}), 503

    except requests.exceptions.Timeout as e:
        print("TIMEOUT ERROR:", str(e))
        return jsonify({"error": "Ollama timed out."}), 504

    except json.JSONDecodeError as e:
        print("JSON DECODE ERROR:", str(e))
        return jsonify({"error": f"Invalid JSON from Ollama: {str(e)}"}), 500

    except Exception as e:
        print("ANALYZE ERROR:", repr(e))
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/contracts/<int:contract_id>", methods=["DELETE"])
def delete_contract(contract_id):
    contract = Contract.query.get(contract_id)

    if not contract:
        return jsonify({"error": "Contract not found"}), 404

    if contract.file_path and os.path.exists(contract.file_path):
        os.remove(contract.file_path)

    db.session.delete(contract)
    db.session.commit()

    return jsonify({"message": "Contract deleted"})    

@app.route("/api/contracts/<int:contract_id>/download", methods=["GET"])
def download_contract(contract_id):
    contract = Contract.query.get(contract_id)

    if not contract:
        return jsonify({"error": "Contract not found"}), 404

    if not contract.file_path or not os.path.exists(contract.file_path):
        return jsonify({"error": "File not found"}), 404

    return send_file(
        contract.file_path,
        as_attachment=True,
        download_name=contract.filename
    )


@app.route("/api/contracts/<int:contract_id>", methods=["PUT"])
def update_contract(contract_id):
    contract = Contract.query.get_or_404(contract_id)
    data = request.get_json() or {}

    contract.name = data.get("name", contract.name)
    contract.type = data.get("type", contract.type)
    contract.status = data.get("status", contract.status)

    if "client_id" in data:
        contract.client_id = data.get("client_id")

    db.session.commit()

    return jsonify(serialize_contract(contract))


@app.route("/api/clients", methods=["GET"])
def get_clients():
    clients = Client.query.all()

    return jsonify([
        {
            "id": c.id,
            "name": c.name,
            "contact_email": c.contact_email,
            "phone": c.phone,
            "type": c.type,
            "status": c.status,
            "events": [
                {
                    "id": e.id,
                    "title": e.title,
                    "event_date": e.event_date
                }
                for e in c.events
            ],
            "revenue": f"${sum(i.amount for i in c.invoices if (i.status or '').lower() == 'paid'):,.0f}"
        }
        for c in clients
    ])

@app.route("/api/clients/<int:client_id>", methods=["DELETE"])
def delete_client(client_id):
    client = Client.query.get(client_id)
    if not client:
        return {"error": "Client not found"}, 404

    # 1) delete all related events first
    Event.query.filter_by(client_id=client_id).delete()

    # 2) then delete the client
    db.session.delete(client)
    db.session.commit()

    return {"message": "Client deleted successfully"}, 200

# ✅ POST route
@app.route("/api/clients", methods=["POST"])
def add_client():
    data = request.get_json() or {}

    name = data.get("name")
    contact_email = data.get("contact_email")
    phone = data.get("phone")
    client_type = data.get("type", "Artist")
    status = data.get("status", "active")

    if not name:
        return jsonify({"error": "name is required"}), 400

    new_client = Client(
        name=name,
        contact_email=contact_email,
        phone=phone,
        type=client_type,
        status=status
    )
    db.session.add(new_client)
    db.session.commit()

    # return the same shape React expects
    return jsonify({
        "id": new_client.id,
        "name": new_client.name,
        "contact_email": new_client.contact_email,
        "phone": new_client.phone,
        "type": new_client.type,
        "status": new_client.status,
        "events": 0,
        "revenue": "$0"
    }), 201

@app.route("/api/clients/<int:client_id>", methods=["PUT"])
def update_client(client_id):
    client = Client.query.get_or_404(client_id)
    data = request.get_json() or {}

    client.name = data.get("name", client.name)
    client.contact_email = data.get("contact_email", client.contact_email)
    client.phone = data.get("phone", client.phone)
    client.type = data.get("type", client.type)
    client.status = data.get("status", client.status)

    db.session.commit()
    return jsonify({"message": "Client updated"})

@app.route("/api/events", methods=["GET"])
def get_events():
    events = Event.query.all()
    return jsonify([
        {
            "id": e.id,
            "title": e.title,
            "event_date": e.event_date,
            "client_id": e.client_id,
            "client_name": e.client.name if e.client else None, 
            "status": e.status         
        }
        for e in events
    ])

@app.route("/api/events/<int:event_id>", methods=["DELETE"])
def delete_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    db.session.delete(event)
    db.session.commit()
    return jsonify({"message": "Event deleted"}), 200

@app.route("/api/events", methods=["POST"])
def create_event():
    data = request.get_json() or {}

    title = data.get("title")
    event_date = data.get("event_date")
    client_id = data.get("client_id")

    if not title or not client_id:
        return jsonify({"error": "title and client_id required"}), 400

    new_event = Event(
        title=title,
        event_date=event_date,
        client_id=client_id,
        status="active"   # we will add this column next
    )

    db.session.add(new_event)
    db.session.commit()

    return jsonify({
        "id": new_event.id,
        "title": new_event.title,
        "event_date": new_event.event_date,
        "client_id": new_event.client_id,
        "status": new_event.status
    }), 201

@app.route("/api/events/<int:event_id>", methods=["PUT"])
def update_event(event_id):
    event = Event.query.get_or_404(event_id)
    data = request.get_json() or {}

    event.title = data.get("title", event.title)
    event.event_date = data.get("event_date", event.event_date)
    event.status = data.get("status", event.status)

    db.session.commit()

    return jsonify({
        "id": event.id,
        "title": event.title,
        "event_date": event.event_date,
        "status": event.status,
        "client_id": event.client_id,
        "client_name": event.client.name if event.client else None
    })

@app.route("/api/invoices", methods=["GET"])
def get_invoices():
    invoices = Invoice.query.order_by(Invoice.id.desc()).all()
    return jsonify([serialize_invoice(i) for i in invoices])

@app.route("/api/invoices", methods=["POST"])
def create_invoice():
    data = request.get_json() or {}

    client_id = data.get("client_id")
    event_name = data.get("event")
    amount = data.get("amount")
    status = (data.get("status", "pending") or "pending").lower()
    issue_date = data.get("date")
    due_date = data.get("dueDate")

    if not client_id or not event_name or amount is None:
        return jsonify({"error": "client_id, event, and amount are required"}), 400

    invoice = Invoice(
        invoice_code="TEMP",
        client_id=client_id,
        event_name=event_name,
        amount=float(amount),
        status=status,
        issue_date=issue_date,
        due_date=due_date
    )

    db.session.add(invoice)
    db.session.commit()

    invoice.invoice_code = generate_invoice_code(invoice.id)
    db.session.commit()

    return jsonify(serialize_invoice(invoice)), 201

@app.route("/api/invoices/<int:invoice_id>", methods=["DELETE"])
def delete_invoice(invoice_id):
    invoice = Invoice.query.get(invoice_id)

    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    db.session.delete(invoice)
    db.session.commit()

    return jsonify({"message": "Invoice deleted"})

@app.route("/api/invoices/<int:invoice_id>", methods=["PUT"])
def update_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    data = request.get_json() or {}

    invoice.event_name = data.get("event", invoice.event_name)
    invoice.amount = float(data.get("amount", invoice.amount))
    invoice.status = (data.get("status", invoice.status) or invoice.status).lower()
    invoice.issue_date = data.get("date", invoice.issue_date)
    invoice.due_date = data.get("dueDate", invoice.due_date)

    db.session.commit()
    return jsonify(serialize_invoice(invoice))

@app.route("/fix-status")
def fix_status():
    invoice = Invoice.query.get(1)  # 1 = your invoice ID
    invoice.status = "paid"
    db.session.commit()
    return "Updated to paid"

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 400

    new_user = User(
        email=email,
        password_hash=generate_password_hash(password, method="pbkdf2:sha256")
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "email": user.email
        }
    }), 200

@app.route("/create-test-user")
def create_test_user():
    email = "raniabezzar36@gmail.com"
    password = "12345678"

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return "Test user already exists"

    user = User(
        email=email,
        password_hash=generate_password_hash(password, method="pbkdf2:sha256")
    )

    db.session.add(user)
    db.session.commit()

    return "Test user created"


@app.route("/api/leads", methods=["GET"])
def get_leads():
    leads = Lead.query.order_by(Lead.id.desc()).all()

    return jsonify([
        {
            "id": lead.id,
            "name": lead.name,
            "email": lead.email,
            "phone": lead.phone,
            "company": lead.company,
            "source": lead.source,
            "stage": lead.stage,
            "created_at": lead.created_at.isoformat() if lead.created_at else None
        }
        for lead in leads
    ])

@app.route("/api/leads", methods=["POST"])
def create_lead():
    data = request.get_json() or {}

    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    company = data.get("company")
    source = data.get("source")
    stage = data.get("stage", "new")

    if not name:
        return jsonify({"error": "name is required"}), 400

    lead = Lead(
        name=name,
        email=email,
        phone=phone,
        company=company,
        source=source,
        stage=stage
    )

    db.session.add(lead)
    db.session.commit()

    return jsonify({
        "id": lead.id,
        "name": lead.name,
        "email": lead.email,
        "phone": lead.phone,
        "company": lead.company,
        "source": lead.source,
        "stage": lead.stage,
        "created_at": lead.created_at.isoformat() if lead.created_at else None
    }), 201


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    app.run(host="127.0.0.1", port=5001, debug=True)