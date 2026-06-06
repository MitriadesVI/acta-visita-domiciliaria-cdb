# Backend — Acta de Visita Domiciliaria (FastAPI)

Backend de gestión de casos, visitas y actas para el Programa Adulto Mayor.
Pensado para desplegarse en **Contabo** con Docker. El frontend (Next.js) sigue
en Netlify y consume esta API.

## Qué resuelve

- **Diligenciamiento/entrega del acta:** sincroniza las actas hechas en campo
  (local-first / IndexedDB) y guarda fotos y firmas en storage (URL, no base64).
- **Seguimiento:** flujo de gestión del caso → agendar visita (con histórico) →
  acta → aprobación, con alertas como *“casos aprobados sin acta”*.

## Modelo de datos

- `usuarios` — roles: **admin**, **supervisor**, **apoyo**, **campo**.
- `casos` — `codigo` ÚNICO que enlaza todo (intake → visita → acta → aprobación).
- `visitas` — agendamiento con histórico (quién, cuándo, estado).
- `actas` — `form_data` (JSONB) + `local_uuid` para sync idempotente.
- `archivos` — fotos/firmas en storage, referenciadas por URL.

## Roles (resumen)

| Acción | admin | supervisor | apoyo / campo |
|---|---|---|---|
| Gestionar usuarios | ✅ | — | — |
| Crear/editar casos | ✅ | ✅ | — |
| Agendar visitas | ✅ | ✅ | — |
| Ver alertas (aprobado sin acta) | ✅ | ✅ | — |
| Crear/editar **sus** actas | ✅ | ✅ | ✅ |
| Ver **todas** las actas/casos | ✅ | ✅ | solo asignados |

## Endpoints principales

```
POST   /auth/login                          # JWT (username = email)
GET    /auth/me
GET    /usuarios            POST /usuarios            PATCH /usuarios/{id}
GET    /casos              POST /casos               PATCH /casos/{id}   GET /casos/{id}
GET    /casos/alertas/aprobados-sin-acta    # anti-join de seguimiento
GET    /visitas           POST /visitas             PATCH /visitas/{id}  DELETE /visitas/{id}
GET    /actas             POST /actas (upsert sync) GET /actas/{id}      DELETE /actas/{id}
POST   /actas/{id}/archivos                 # sube foto/firma a storage
GET    /health
```
Documentación interactiva en `/docs` (Swagger) al levantar la API.

## Desplegar en Contabo

1. Instala Docker y Docker Compose en el VPS.
2. Copia esta carpeta `backend/` al servidor.
3. `cp .env.example .env` y edita los valores (claves, dominios, CORS).
   - `SECRET_KEY`: `openssl rand -hex 32`
4. Apunta tus DNS `api.tudominio.gov.co` y `files.tudominio.gov.co` al VPS, y
   edita `Caddyfile` con esos dominios.
5. `docker compose up -d --build`
6. Verifica: `https://api.tudominio.gov.co/health` → `{"status":"ok"}`.
   - Swagger: `https://api.tudominio.gov.co/docs`
   - Se crea el admin de `.env` en el primer arranque.

## Desarrollo local

```bash
cd api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Necesitas un Postgres local y, opcional, MinIO. Ajusta DATABASE_URL en el entorno.
uvicorn app.main:app --reload
```

## Pendientes (siguientes pasos)

- Migraciones con **Alembic** (hoy usa `create_all` para arrancar rápido).
- Capa de **sincronización en el frontend** (uuid + syncStatus + subida de fotos).
- **Intake de correos** (Fase 3) con el agente **Hermes**: una tool que inserta
  el caso en `casos` (origen=correo) en vez de Excel.
- Backups automáticos (`pg_dump` por cron) y política de retención.
