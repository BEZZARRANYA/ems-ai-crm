from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


db = SQLAlchemy()
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    

class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    contact_email = db.Column(db.String(120))
    phone = db.Column(db.String(50))
    type = db.Column(db.String(50), default="Artist")
    status = db.Column(db.String(50), default="active")

    events = db.relationship("Event", backref="client", lazy=True, cascade="all, delete-orphan")
    invoices = db.relationship("Invoice", backref="client", lazy=True, cascade="all, delete-orphan")
    contracts = db.relationship("Contract", backref="client", lazy=True, cascade="all, delete-orphan")
    


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    event_date = db.Column(db.String(50))
    status = db.Column(db.String(50), default="active")
    client_id = db.Column(db.Integer, db.ForeignKey("client.id"), nullable=False)
        

class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    invoice_code = db.Column(db.String(50), unique=True, nullable=False)
    event_name = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default="on-hold")
    issue_date = db.Column(db.String(50))
    due_date = db.Column(db.String(50))
    client_id = db.Column(db.Integer, db.ForeignKey("client.id"), nullable=False)
    
       
class Contract(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    contract_code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.String(50))
    type = db.Column(db.String(50), default="General")
    status = db.Column(db.String(50), default="on-hold")
    uploaded_at = db.Column(db.String(50))
    summary = db.Column(db.Text)
    analysis_json = db.Column(db.Text)
    extracted_text = db.Column(db.Text)
    client_id = db.Column(db.Integer, db.ForeignKey("client.id"), nullable=True)


class Lead(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(50))
    company = db.Column(db.String(120))
    source = db.Column(db.String(100))  # website, referral, instagram, etc.
    stage = db.Column(db.String(50), default="new")  # new, contacted, qualified, won, lost
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
