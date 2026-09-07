"""Seed the database with a default admin, stations, products, and settings.

Usage: python -m app.seed
"""
from .database import Base, SessionLocal, engine
from .models import CafeSettings, Product, Role, Station, User
from .services.security import hash_password


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            db.add(
                User(
                    username="admin",
                    full_name="Cafe Admin",
                    password_hash=hash_password("admin123"),
                    role=Role.ADMIN,
                )
            )
            print("Created default admin: admin / admin123")

        if db.query(Station).count() == 0:
            for i in range(1, 11):
                db.add(
                    Station(
                        name=f"PC-{i:02d}",
                        specs="i5 / 8GB / 256GB SSD",
                        hourly_rate=50.00,
                    )
                )
            print("Created 10 stations (PC-01..PC-10)")

        if db.query(Product).count() == 0:
            for name, category, price in [
                ("Mineral Water", "drinks", 30.00),
                ("Soda", "drinks", 50.00),
                ("Coffee", "drinks", 80.00),
                ("Chips", "snacks", 100.00),
                ("Mandazi", "snacks", 20.00),
                ("Print (B&W)", "services", 20.00),
                ("Print (Color)", "services", 50.00),
                ("Photocopy", "services", 10.00),
            ]:
                db.add(Product(name=name, category=category, price=price, stock=100))
            print("Created 8 products")

        if db.get(CafeSettings, 1) is None:
            db.add(CafeSettings(id=1))
            print("Created default settings")

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
