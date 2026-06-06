import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Boolean, DateTime, Date, Time, ForeignKey, Text
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from .database import Base


# ---- Valores permitidos (documentados; columnas String para migraciones simples) ----
ROLES = ("admin", "coordinador", "tecnico")
# Ciclo de vida del caso (flujo real del Programa Adulto Mayor):
# recibido -> agendado -> (no_ubicado | valorado) -> en_comite -> resuelto -> cerrado
ESTADO_CASO = ("recibido", "agendado", "no_ubicado", "valorado", "en_comite", "resuelto", "cerrado")
RESULTADO_CASO = ("aplica", "no_aplica", "remitir")
ESTADO_VISITA = ("pendiente", "realizada", "no_ubicado", "cancelada", "reprogramada")
ESTADO_ACTA = ("borrador", "en_hold", "lista", "impresa")
ORIGEN_CASO = ("correo", "oficio", "redes", "manual")


def _uuid():
    return str(uuid.uuid4())


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    nombre = Column(String, nullable=False)
    rol = Column(String, nullable=False, default="tecnico")  # ver ROLES
    password_hash = Column(String, nullable=False)
    activo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Caso(Base):
    __tablename__ = "casos"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    # Radicado. OPCIONAL: los casos de oficio/redes llegan sin radicado.
    # Postgres permite múltiples NULL en una columna unique (no choca entre sí).
    codigo = Column(String, unique=True, nullable=True, index=True)
    radicados_relacionados = Column(String, nullable=True)  # otros radicados del mismo caso (Sonia Padilla = 2)
    nombre_adulto_mayor = Column(String, nullable=True)
    documento = Column(String, nullable=True)
    direccion = Column(String, nullable=True)
    barrio = Column(String, nullable=True)
    telefono = Column(String, nullable=True)  # contacto para coordinar la visita
    origen = Column(String, nullable=False, default="manual")  # ver ORIGEN_CASO
    fuente = Column(String, nullable=True)  # quién/qué originó (adultomayor, jurídica, personería, redes…)
    remitente = Column(String, nullable=True)  # correo del abogado/área que remite (a quién responder)
    asunto = Column(Text, nullable=True)
    correo_msg_id = Column(String, nullable=True)  # link al correo de intake (Hermes)
    estado = Column(String, nullable=False, default="recibido", index=True)  # ver ESTADO_CASO
    resultado = Column(String, nullable=True)  # ver RESULTADO_CASO (al resolver)
    observacion = Column(Text, nullable=True)  # nota breve de cierre / WhatsApp
    enviado_juridica = Column(Boolean, nullable=False, default=False)
    pqrd_respondido = Column(Boolean, nullable=False, default=False)  # estado de respuesta PQRD (matriz)
    # --- Trazabilidad de hitos ---
    fecha_recibido = Column(Date, nullable=True)        # primer correo / ingreso
    fecha_acta_recibida = Column(Date, nullable=True)   # acta/soportes de centrodbienestar2019
    fecha_respuesta = Column(Date, nullable=True)       # mi respuesta al abogado remitente
    fecha_vence = Column(Date, nullable=True)           # vencimiento, si aplica
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
