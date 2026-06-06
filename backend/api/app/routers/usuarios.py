from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Usuario, ROLES
from ..auth import hash_password
from ..deps import require_roles
from ..schemas import UsuarioCreate, UsuarioUpdate, UsuarioOut

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("", response_model=list[UsuarioOut])
def listar(db: Session = Depends(get_db), _=Depends(require_roles("admin", "supervisor"))):
    return db.query(Usuario).order_by(Usuario.created_at.desc()).all()


@router.post("", response_model=UsuarioOut, status_code=201)
def crear(data: UsuarioCreate, db: Session = Depends(get_db), _=Depends(require_roles("admin"))):
    if data.rol not in ROLES:
        raise HTTPException(400, f"Rol inválido. Debe ser uno de: {', '.join(ROLES)}")
    if db.query(Usuario).filter(Usuario.email == data.email).first():
        raise HTTPException(400, "Ya existe un usuario con ese email")
    user = Usuario(
        email=data.email,
        nombre=data.nombre,
        rol=data.rol,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UsuarioOut)
def actualizar(
    user_id: str,
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin")),
):
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(404, "Usuario no encontrado")
    if data.rol is not None:
        if data.rol not in ROLES:
            raise HTTPException(400, f"Rol inválido. Debe ser uno de: {', '.join(ROLES)}")
        user.rol = data.rol
    if data.nombre is not None:
        user.nombre = data.nombre
    if data.activo is not None:
        user.activo = data.activo
    if data.password:
        user.password_hash = hash_password(data.password)
    db.commit()
    db.refresh(user)
    return user
