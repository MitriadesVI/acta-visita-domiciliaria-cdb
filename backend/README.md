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

- `usuarios` — roles: **admin**, **coordinador**, **tecnico**.
- `casos` — `codigo` (radicado) ÚNICO que enlaza todo. Estado del flujo real:
  `recibido → agendado → (no_ubicado | valorado) → en_comite → resuelto → cerrado`.
  Incluye `direccion`, `fecha_recibido`, `resultado` (aplica/no_aplica/remitir),
  `observacion` y `enviado_juridica`.
- `visitas` — agendamiento con histórico (quién, cuándo, estado).
- `actas` — `form_data` (JSONB) + `local_uuid` para sync idempotente.
- `archivos` — fotos/firmas en storage, referenciadas por URL.

> El **concepto jurídico** NO se autoría en la app (se hace por correo/WhatsApp).
> La app solo rastrea el caso para evitar que se pierda en el seguimiento.

## Roles

| Acción | admin | coordinador | tecnico |
|---|---|---|---|
| Gestionar usuarios | ✅ | ver | — |
| Crear/editar casos | ✅ | ✅ | — |
| Agendar visitas / cronograma / cerrar | ✅ | ✅ | — |
| Crear/editar **sus** actas | ✅ | ✅ | ✅ |
| Ver **todo** el flujo (casos/visitas/actas) | ✅ | ✅ | solo asignados |

- **admin** = quien define usuarios y roles.
- **coordinador** = jefe jurídico y persona administrativa (agendan, revisan correos, cierran).
- **tecnico** = equipo de campo que realiza visitas y diligencia actas.

## Endpoints principales

```
POST   /auth/login                          # JWT (username = email)
GET    /auth/me
GET    /usuarios            POST /usuarios            PATCH /usuarios/{id}
GET    /casos              POST /casos               PATCH /casos/{id}   GET /casos/{id}
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
