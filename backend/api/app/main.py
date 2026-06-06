from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .seed import crear_admin_inicial
from .storage import ensure_bucket
from .routers import auth, usuarios, casos, visitas, actas

app = FastAPI(title="Acta Visita Domiciliaria API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    # v1: create_all para arrancar rápido. Migrar a Alembic cuando el esquema se estabilice.
    Base.metadata.create_all(bind=engine)
    crear_admin_inicial()
    ensure_bucket()


@app.get("/health", tags=["infra"])
def health():
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(casos.router)
app.include_router(visitas.router)
app.include_router(actas.router)
