from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Visita, Caso, Usuario
from ..deps import get_current_user, require_roles
from ..schemas import VisitaCreate, VisitaUpdate, VisitaOut

router = APIRouter(prefix="/visitas", tags=["visitas"])


@router.get("", response_model=list[VisitaOut])
def listar(
    caso_id: str | None = None,
    estado: str | None = None,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user),
):
    q = db.query(Visita)
    if caso_id:
        q = q.filter(Visita.caso_id == caso_id)
    if estado:
        q = q.filter(Visita.estado == estado)
    # Campo: solo sus visitas asignadas.
    if user.rol in ("campo", "apoyo"):
        q = q.filter(Visita.usuario_id == user.id)
    return q.order_by(Visita.fecha_programada.desc()).all()


@router.post("", response_model=VisitaOut, status_code=201)
def agendar(
    data: VisitaCreate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(require_roles("admin", "supervisor")),
):
    if not db.query(Caso).filter(Caso.id == data.caso_id).first():
        raise HTTPException(404, "El caso indicado no existe")
    visita = Visita(**data.model_dump(), creado_por=user.id)
    db.add(visita)
    # Al agendar, el caso pasa a 'asignado' si estaba 'nuevo'.
    caso = db.query(Caso).filter(Caso.id == data.caso_id).first()
    if caso and caso.estado == "nuevo":
        caso.estado = "asignado"
        if data.usuario_id:
            caso.asignado_a = data.usuario_id
    db.commit()
    db.refresh(visita)
    return visita


@router.patch("/{visita_id}", response_model=VisitaOut)
def actualizar(
    visita_id: str,
    data: VisitaUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin", "supervisor")),
):
    visita = db.query(Visita).filter(Visita.id == visita_id).first()
    if not visita:
        raise HTTPException(404, "Visita no encontrada")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(visita, k, v)
    db.commit()
    db.refresh(visita)
    return visita


@router.delete("/{visita_id}", status_code=204)
def eliminar(
    visita_id: str,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin", "supervisor")),
):
    visita = db.query(Visita).filter(Visita.id == visita_id).first()
    if not visita:
        raise HTTPException(404, "Visita no encontrada")
    db.delete(visita)
    db.commit()
