from sqlalchemy.orm import Session

from .database import SessionLocal
from .models import Usuario
from .auth import hash_password
from .config import settings


def crear_admin_inicial():
    """Crea el usuario administrador inicial si no existe ninguno."""
    db: Session = SessionLocal()
    try:
        existe = db.query(Usuario).filter(Usuario.email == settings.admin_email).first()
        if existe:
            return
        admin = Usuario(
            email=settings.admin_email,
            nombre=settings.admin_nombre,
            rol="admin",
            password_hash=hash_password(settings.admin_password),
            activo=True,
        )
        db.add(admin)
        db.commit()
        print(f"[seed] Admin inicial creado: {settings.admin_email}")
    finally:
        db.close()
