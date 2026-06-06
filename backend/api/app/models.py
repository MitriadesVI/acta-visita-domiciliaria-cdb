import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Boolean, DateTime, Date, Time, ForeignKey, Text
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from .database import Base


# ---- Valores permitidos (documentados; columnas String para migraciones simples) ----
ROLES = ("admin", "supervisor", "apoyo", "campo")
ESTADO_CASO = ("nuevo", "asignado", "en_proceso", "visitado", "aprobado", "rechazado", "cerrado")
ESTADO_VISITA = ("pendiente", "realizada", "cancelada", "reprogramada")
ESTADO_ACTA = ("borrador", "en_hold", "lista", "impresa")
ORIGEN_CASO = ("manual", "correo")


def _uuid():
    return str(uuid.uuid4())


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    nombre = Column(String, nullable=False)
    rol = Column(String, nullable=False, default="campo")  # ver ROLES
    password_hash = Column(String, nullable=False)
    activo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Caso(Base):
    __tablename__ = "casos"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    codigo = Column(String, unique=True, nullable=False, index=True)  # ID único que enlaza todo
    nombre_adulto_mayor = Column(String, nullable=True)
    documento = Column(String, nullable=True)
    estado = Column(String, nullable=False, default="nuevo", index=True)  # ver ESTADO_CASO
    origen = Column(String, nullable=False, default="manual")  # ver ORIGEN_CASO
    correo_msg_id = Column(String, nullable=True)  # link al correo de intake (Fase 3 / Hermes)
    aprobado = Column(Boolean, nullable=False, default=False, index=True)
    fecha_aprobacion = Column(Date, nullable=True)
    asignado_a = Column(UUID(as_uuid=False), ForeignKey("usuarios.id"), nullable=True)
    creado_por = Column(UUID(as_uuid=False), ForeignKey("usuarios.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    visitas = relationship("Visita", back_populates="caso", cascade="all, delete-orphan")
    actas = relationship("Acta", back_populates="caso")


class Visita(Base):
    """Agendamiento de visitas con histórico (flujo de gestión del caso)."""
    __tablename__ = "visitas"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    caso_id = Column(UUID(as_uuid=False), ForeignKey("casos.id"), nullable=False, index=True)
    usuario_id = Column(UUID(as_uuid=False), ForeignKey("usuarios.id"), nullable=True)  # quien hará la visita
    fecha_programada = Column(Date, nullable=False, index=True)
    hora_programada = Column(Time, nullable=True)
    estado = Column(String, nullable=False, default="pendiente")  # ver ESTADO_VISITA
    notas = Column(Text, nullable=True)
    acta_id = Column(UUID(as_uuid=False), ForeignKey("actas.id"), nullable=True)  # se llena al generar el acta
    creado_por = Column(UUID(as_uuid=False), ForeignKey("usuarios.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    caso = relationship("Caso", back_populates="visitas")


class Acta(Base):
    __tablename__ = "actas"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    local_uuid = Column(String, unique=True, nullable=True, index=True)  # dedupe en sync desde el dispositivo
    caso_id = Column(UUID(as_uuid=False), ForeignKey("casos.id"), nullable=True, index=True)
    usuario_id = Column(UUID(as_uuid=False), ForeignKey("usuarios.id"), nullable=True, index=True)
    estado = Column(String, nullable=False, default="borrador")  # ver ESTADO_ACTA
    form_data = Column(JSONB, nullable=False, default=dict)
    nombre_adulto_mayor = Column(String, nullable=True)  # desnormalizado para listar/consultar
    fecha_visita = Column(String, nullable=True)
    pdf_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    caso = relationship("Caso", back_populates="actas")
    archivos = relationship("Archivo", back_populates="acta", cascade="all, delete-orphan")


class Archivo(Base):
    """Fotos y firmas guardadas en storage (se referencia por URL, no base64)."""
    __tablename__ = "archivos"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    acta_id = Column(UUID(as_uuid=False), ForeignKey("actas.id"), nullable=False, index=True)
    tipo = Column(String, nullable=False)  # foto | firma_adulto | firma_atendiente | firma_funcionario
    url = Column(String, nullable=False)
    descripcion = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    acta = relationship("Acta", back_populates="archivos")
