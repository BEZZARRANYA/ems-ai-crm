from app import app
from models import db, Client

with app.app_context():
    db.create_all()

    if Client.query.count() == 0:
        db.session.add(Client(name="Nova Promotions", contact_email="booking@novapromo.com"))
        db.session.add(Client(name="Sunset Arena", contact_email="events@sunsetarena.com"))
        db.session.commit()
        print("✅ Seeded 2 clients!")
    else:
        print("ℹ️ Clients already exist, skipping.")