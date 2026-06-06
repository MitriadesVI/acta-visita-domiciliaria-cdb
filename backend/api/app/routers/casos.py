from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Caso, Usuario
from ..deps import get_current_user, require_roles
from ..schemas import CasoCreate, CasoUpdate, CasoOut, CasoSyncItem, SyncResult

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
    # El personal técnico solo ve los casos asignados a sí mismo.
    if user.rol == "tecnico":
        q = q.filter(Caso.asignado_a == user.id)
    return q.order_by(Caso.created_at.desc()).all()


@router.post("", response_model=CasoOut, status_code=201)
def crear(
    data: CasoCreate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(require_roles("admin", "coordinador")),
):
    # El radicado es opcional (oficio/redes). Solo se valida duplicado si viene.
    if data.codigo and db.query(Caso).filter(Caso.codigo == data.codigo).first():
        raise HTTPException(400, "Ya existe un caso con ese radicado")
    caso = Caso(**data.model_dump(), creado_por=user.id)
    db.add(caso)
    db.commit()
    db.refresh(caso)
    return caso


@router.post("/sync", response_model=SyncResult)
def sync(
    items: list[CasoSyncItem],
    db: Session = Depends(get_db),
    user: Usuario = Depends(require_roles("admin", "coordinador")),
):
    """Upsert por radicado para el puente (Sheet/Gmail -> app). Idempotente:
    los casos sin radicado se omiten (esos se crean a mano en la app)."""
    creados = actualizados = omitidos = 0
    for item in items:
        data = item.model_dump(exclude_unset=True)
        codigo = data.get("codigo")
        if not codigo:
            omitidos += 1
            continue
        existing = db.query(Caso).filter(Caso.codigo == codigo).first()
        if existing:
            for k, v in data.items():
                if v is not None:  # no sobreescribir con nulos
                    setattr(existing, k, v)
            actualizados += 1
        else:
            db.add(Caso(**data, creado_por=user.id))
            creados += 1
    db.commit()
    return SyncResult(creados=creados, actualizados=actualizados, omitidos=omitidos)


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
    _=Depends(require_roles("admin", "coordinador")),
):
    caso = db.query(Caso).filter(Caso.id == caso_id).first()
    if not caso:
        raise HTTPException(404, "Caso no encontrado")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(caso, k, v)
    db.commit()
    db.refresh(caso)
    return caso
