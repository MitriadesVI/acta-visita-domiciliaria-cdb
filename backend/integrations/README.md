# Integraciones — Puente PQRD

`pqrd_bridge.py` sincroniza la matriz (Google Sheets) + Gmail hacia la app
(`POST /casos/sync`). Lo corre **Hermes** en el mismo entorno que `pqrd_monitor.py`
(reusa `~/.hermes/google_token.json`). No modifica el Sheet ni el monitor.

## Qué hace
- Lee la hoja `Casos` (radicado, nombre, fecha, fuente, asunto, ¿respondido?).
- Deriva de Gmail por radicado:
  - `fecha_acta_recibida` ← correos de `centrodbienestar2019@gmail.com`
  - `fecha_respuesta` ← tus correos enviados con ese radicado
- Hace **upsert por radicado** en la app (idempotente). Los casos sin radicado
  (oficio/redes) se crean a mano en la app, no por aquí.

## Requisitos
- Un usuario **admin o coordinador** en la app para autenticar el puente.
- Librerías de Google ya instaladas (las mismas del monitor).

## Uso
```bash
export APP_API_URL="https://api.157.173.105.139.sslip.io"
export APP_USER="ortizrodrigo39@gmail.com"
export APP_PASS="********"
python3 pqrd_bridge.py --dry-run   # previsualizar
python3 pqrd_bridge.py             # sincronizar
```

Recomendado: agregar al cron justo después de `pqrd_monitor.py`.
