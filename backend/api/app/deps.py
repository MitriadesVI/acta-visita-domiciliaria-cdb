from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .database import get_db
from .auth import decode_token
from .models import Usuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> Usuario:
    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise cred_exc
    user = db.query(Usuario).filter(Usuario.id == payload["sub"]).first()
    if not user or not user.activo:
        raise cred_exc
    return user


def require_roles(*roles: str):
    """Dependencia que exige que el usuario tenga uno de los roles indicados."""
    def checker(user: Usuario = Depends(get_current_user)) -> Usuario:
        if roles and user.rol not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para esta acción",
            )
        return user
    return checker
