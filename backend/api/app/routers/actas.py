from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Acta, Archivo, Usuario
from ..deps import get_current_user
from ..schemas import ActaUpsert, ActaOut, ArchivoOut
from ..storage import subir_archivo

router = APIRouter(prefix="/actas", tags=["actas"])


def _puede_ver(user: Usuario, acta: Acta) -> bool:
    return user.rol in ("admin", "coordinador") or acta.usuario_id == user.id


@router.get("", response_model=list[ActaOut])
def listar(
    estado: str | None = None,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user),
):
    q = db.query(Acta)
    # Técnico: solo sus actas. Admin/coordinador: todas.
    if user.rol == "tecnico":
        q = q.filter(Acta.usuario_id == user.id)
    if estado:
        q = q.filter(Acta.estado == estado)
    return q.order_by(Acta.updated_at.desc()).all()


@router.post("", response_model=ActaOut)
def upsert(
    data: ActaUpsert,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user),
):
    """Crea o actualiza un acta. Si llega local_uuid y ya existe, la actualiza
    (sincronización idempotente desde el dispositivo)."""
    acta = None
    if data.local_uuid:
        acta = db.query(Acta).filter(Acta.local_uuid == data.local_uuid).first()

    if acta:
        if not _puede_ver(user, acta):
            raise HTTPException(403, "No puedes modificar esta acta")
        acta.caso_id = data.caso_id
        acta.estado = data.estado
        acta.form_data = data.form_data
        acta.nombre_adulto_mayor = data.nombre_adulto_mayor
        acta.fecha_visita = data.fecha_visita
    else:
        acta = Acta(
            local_uuid=data.local_uuid,
            caso_id=data.caso_id,
            usuario_id=user.id,
            estado=data.estado,
            form_data=data.form_data,
            nombre_adulto_mayor=data.nombre_adulto_mayor,
            fecha_visita=data.fecha_visita,
        )
        db.add(acta)
    db.commit()
    db.refresh(acta)
    return acta


@router.get("/{acta_id}", response_model=ActaOut)
def obtener(acta_id: str, db: Session = Depends(get_db), user: Usuario = Depends(get_current_user)):
    acta = db.query(Acta).filter(Acta.id == acta_id).first()
    if not acta:
        raise HTTPException(404, "Acta no encontrada")
    if not _puede_ver(user, acta):
        raise HTTPException(403, "No puedes ver esta acta")
    return acta


@router.delete("/{acta_id}", status_code=204)
def eliminar(acta_id: str, db: Session = Depends(get_db), user: Usuario = Depends(get_current_user)):
    acta = db.query(Acta).filter(Acta.id == acta_id).first()
    if not acta:
        raise HTTPException(404, "Acta no encontrada")
    if not _puede_ver(user, acta):
        raise HTTPException(403, "No puedes eliminar esta acta")
    db.delete(acta)
    db.commit()


@router.post("/{acta_id}/archivos", response_model=ArchivoOut, status_code=201)
async def subir(
    acta_id: str,
    tipo: str = Form(...),
    descripcion: str | None = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user),
):
    """Sube una foto o firma al storage y la asocia al acta (URL, no base64)."""
    acta = db.query(Acta).filter(Acta.id == acta_id).first()
    if not acta:
        raise HTTPException(404, "Acta no encontrada")
    if not _puede_ver(user, acta):
        raise HTTPException(403, "No puedes modificar esta acta")
    contenido = await file.read()
    url = subir_archivo(contenido, file.content_type or "application/octet-stream")
    archivo = Archivo(acta_id=acta_id, tipo=tipo, url=url, descripcion=descripcion)
    db.add(archivo)
    db.commit()
    db.refresh(archivo)
    return archivo
