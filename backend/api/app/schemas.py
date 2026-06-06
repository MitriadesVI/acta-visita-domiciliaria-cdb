from datetime import datetime, date, time
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, ConfigDict


# ---- Auth ----
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---- Usuarios ----
class UsuarioBase(BaseModel):
    email: EmailStr
    nombre: str
    rol: str = "campo"


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    rol: Optional[str] = None
    activo: Optional[bool] = None
    password: Optional[str] = None


class UsuarioOut(UsuarioBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    activo: bool
    created_at: datetime


# ---- Casos ----
class CasoBase(BaseModel):
    codigo: str
    nombre_adulto_mayor: Optional[str] = None
    documento: Optional[str] = None
    direccion: Optional[str] = None
    barrio: Optional[str] = None
    fecha_recibido: Optional[date] = None
    origen: str = "manual"
    correo_msg_id: Optional[str] = None
    estado: str = "recibido"
    resultado: Optional[str] = None
    observacion: Optional[str] = None
    enviado_juridica: bool = False
    asignado_a: Optional[str] = None


class CasoCreate(CasoBase):
    pass


class CasoUpdate(BaseModel):
    nombre_adulto_mayor: Optional[str] = None
    documento: Optional[str] = None
    direccion: Optional[str] = None
    barrio: Optional[str] = None
    fecha_recibido: Optional[date] = None
    estado: Optional[str] = None
    resultado: Optional[str] = None
    observacion: Optional[str] = None
    enviado_juridica: Optional[bool] = None
    asignado_a: Optional[str] = None


class CasoOut(CasoBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    creado_por: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ---- Visitas ----
class VisitaBase(BaseModel):
    caso_id: str
    usuario_id: Optional[str] = None
    fecha_programada: date
    hora_programada: Optional[time] = None
    estado: str = "pendiente"
    notas: Optional[str] = None
    acta_id: Optional[str] = None


class VisitaCreate(VisitaBase):
    pass


class VisitaUpdate(BaseModel):
    usuario_id: Optional[str] = None
    fecha_programada: Optional[date] = None
    hora_programada: Optional[time] = None
    estado: Optional[str] = None
    notas: Optional[str] = None
    acta_id: Optional[str] = None


class VisitaOut(VisitaBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    creado_por: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ---- Actas ----
class ActaUpsert(BaseModel):
    local_uuid: Optional[str] = None
    caso_id: Optional[str] = None
    estado: str = "borrador"
    form_data: dict[str, Any] = {}
    nombre_adulto_mayor: Optional[str] = None
    fecha_visita: Optional[str] = None


class ActaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    local_uuid: Optional[str] = None
    caso_id: Optional[str] = None
    usuario_id: Optional[str] = None
    estado: str
    form_data: dict[str, Any]
    nombre_adulto_mayor: Optional[str] = None
    fecha_visita: Optional[str] = None
    pdf_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ArchivoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    acta_id: str
    tipo: str
    url: str
    descripcion: Optional[str] = None
    created_at: datetime
