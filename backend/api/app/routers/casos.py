from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Caso, Acta, Usuario
from ..deps import get_current_user, require_roles
from ..schemas import CasoCreate, CasoUpdate, CasoOut

router = APIRouter(prefix="/casos", tags=["casos"])


@router.get("", response_model=list[CasoOut])
def listar(
    estado: str | None = None,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user),
):
    q = db.query(Caso)
    if estado:
        q = q.filter(Caso.estado == estado)
    # El personal de campo solo ve los casos asignados a sí mismo.
    if user.rol in ("campo", "apoyo"):
        q = q.filter(Caso.asignado_a == user.id)
    return q.order_by(Caso.created_at.desc()).all()


@router.get("/alertas/aprobados-sin-acta", response_model=list[CasoOut])
def aprobados_sin_acta(
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin", "supervisor")),
):
    """Casos aprobados que aún no tienen acta generada (anti-join)."""
    return (
        db.query(Caso)
        .outerjoin(Acta, Acta.caso_id == Caso.id)
        .filter(Caso.aprobado.is_(True), Acta.id.is_(None))
        .order_by(Caso.fecha_aprobacion.asc().nullslast())
        .all()
    )


@router.post("", response_model=CasoOut, status_code=201)
def crear(
    data: CasoCreate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(require_roles("admin", "supervisor")),
):
    if db.query(Caso).filter(Caso.codigo == data.codigo).first():
        raise HTTPException(400, "Ya existe un caso con ese código")
    caso = Caso(**data.model_dump(), creado_por=user.id)
    db.add(caso)
    db.commit()
    db.refresh(caso)
    return caso


@router.get("/{caso_id}", response_model=CasoOut)
def obtener(caso_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    caso = db.query(Caso).filter(Caso.id == caso_id).first()
    if not caso:
        raise HTTPException(404, "Caso no encontrado")
    return caso


@router.patch("/{caso_id}", response_model=CasoOut)
def actualizar(
    caso_id: str,
    data: CasoUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin", "supervisor")),
):
    caso = db.query(Caso).filter(Caso.id == caso_id).first()
    if not caso:
        raise HTTPException(404, "Caso no encontrado")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(caso, k, v)
    db.commit()
    db.refresh(caso)
    return caso
