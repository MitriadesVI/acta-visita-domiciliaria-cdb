#!/usr/bin/env python3
"""
Puente PQRD: Matriz (Google Sheets) + Gmail  ->  app Acta (API /casos/sync)

Lo corre Hermes en el mismo entorno que pqrd_monitor.py (reusa el token de
Google en ~/.hermes/google_token.json). NO toca el monitor ni el Sheet de
escritura: solo LEE el Sheet y Gmail y empuja los casos a la app.

Por cada radicado deriva las 3 fechas de seguimiento:
  - fecha_recibido        -> columna D del Sheet (o, si falta, no se envía)
  - fecha_acta_recibida   -> correo de centrodbienestar2019@gmail.com con ese radicado
  - fecha_respuesta       -> tu correo ENVIADO con ese radicado (respuesta al remitente)

Variables de entorno:
  APP_API_URL   (ej. https://api.157.173.105.139.sslip.io)
  APP_USER      (email de un usuario admin o coordinador de la app)
  APP_PASS      (su contraseña)

Uso:
  python3 pqrd_bridge.py            # sincroniza
  python3 pqrd_bridge.py --dry-run  # muestra qué enviaría, sin escribir
"""
import os
import re
import sys
import json
import urllib.request
import urllib.parse
from datetime import datetime, timezone, timedelta
from pathlib import Path

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

TOKEN_PATH = Path.home() / ".hermes" / "google_token.json"
SHEET_ID = "1OFN_dGqsdkQgjcHt-csbpphDuKEpDqM-Ja6lx5TpQpg"
SHEET_RANGE = "Casos!A1:I1000"

APP_API_URL = os.environ.get("APP_API_URL", "https://api.157.173.105.139.sslip.io").rstrip("/")
APP_USER = os.environ.get("APP_USER", "")
APP_PASS = os.environ.get("APP_PASS", "")

ACTA_SENDER = "centrodbienestar2019@gmail.com"
LOOKBACK = "newer_than:200d"

RADICADO_PATTERNS = [
    re.compile(r'EXT-QUILLA-\d{4}-\d+', re.IGNORECASE),
    re.compile(r'\b\d{4}-\d{4,}\b'),
]


# ── Google ─────────────────────────────────────────────────────────
def google(service):
    creds = Credentials.from_authorized_user_file(str(TOKEN_PATH))
    return build(service, 'v3' if service == 'people' else ('v4' if service == 'sheets' else 'v1'),
                 credentials=creds)


def norm_rad(s):
    return re.sub(r'[^A-Z0-9-]', '', str(s).upper().strip())


def extract_radicados(text):
    found = set()
    for p in RADICADO_PATTERNS:
        for m in p.findall(text or ''):
            found.add(norm_rad(m))
    return found


def parse_fecha(s):
    if not s:
        return None
    try:
        return datetime.strptime(str(s).strip(), "%Y-%m-%d").date().isoformat()
    except Exception:
        return None


def ms_to_date(ms):
    # internalDate de Gmail (ms epoch UTC) -> fecha en hora Colombia (UTC-5)
    return (datetime.fromtimestamp(int(ms) / 1000, tz=timezone.utc)
            - timedelta(hours=5)).date().isoformat()


def gmail_date_map(gmail, query, keep="min"):
    """Devuelve {radicado_norm: fecha_iso} a partir de los correos que cruzan la query.
    keep='min' guarda la fecha más antigua; 'max' la más reciente."""
    out = {}
    res = gmail.users().messages().list(userId='me', q=query, maxResults=200).execute()
    for meta in res.get('messages', []):
        msg = gmail.users().messages().get(
            userId='me', id=meta['id'], format='metadata',
            metadataHeaders=['Subject']
        ).execute()
        headers = {h['name']: h['value'] for h in msg['payload'].get('headers', [])}
        subject = headers.get('Subject', '')
        fecha = ms_to_date(msg.get('internalDate', 0))
        for rad in extract_radicados(subject):
            if rad not in out:
                out[rad] = fecha
            else:
                out[rad] = min(out[rad], fecha) if keep == "min" else max(out[rad], fecha)
    return out


# ── App API ────────────────────────────────────────────────────────
def api_login():
    data = urllib.parse.urlencode({"username": APP_USER, "password": APP_PASS}).encode()
    req = urllib.request.Request(f"{APP_API_URL}/auth/login", data=data,
                                 headers={"Content-Type": "application/x-www-form-urlencoded"})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())["access_token"]


def api_sync(token, items):
    body = json.dumps(items).encode()
    req = urllib.request.Request(f"{APP_API_URL}/casos/sync", data=body, headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    })
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


def main():
    dry = "--dry-run" in sys.argv
    if not APP_USER or not APP_PASS:
        print("❌ Define APP_USER y APP_PASS (usuario admin/coordinador de la app).")
        sys.exit(1)

    sheets = google('sheets')
    gmail = google('gmail')

    print("📊 Leyendo matriz...")
    rows = sheets.spreadsheets().values().get(spreadsheetId=SHEET_ID, range=SHEET_RANGE).execute().get('values', [])
    print(f"   {len(rows)} filas.")

    print("📧 Derivando fechas de acta (centrodbienestar2019)...")
    acta_map = gmail_date_map(gmail, f"from:{ACTA_SENDER} {LOOKBACK}", keep="min")
    print(f"   {len(acta_map)} radicados con acta.")

    print("📧 Derivando fechas de respuesta (tus correos enviados)...")
    resp_map = gmail_date_map(gmail, f"in:sent from:me {LOOKBACK} (EXT-QUILLA OR asilo OR abandono)", keep="max")
    print(f"   {len(resp_map)} radicados con respuesta.")

    items = []
    for row in rows[1:]:
        radicado = row[1].strip() if len(row) > 1 else ""
        if not radicado:
            continue
        rad_n = norm_rad(radicado)
        item = {
            "codigo": radicado,
            "origen": "correo",
            "nombre_adulto_mayor": row[2].strip() if len(row) > 2 else None,
            "fuente": row[4].strip() if len(row) > 4 else None,
            "asunto": row[5].strip() if len(row) > 5 else None,
            "pqrd_respondido": (str(row[6]).strip().upper() in ("SÍ", "SI", "S")) if len(row) > 6 else False,
            "fecha_recibido": parse_fecha(row[3]) if len(row) > 3 else None,
            "fecha_acta_recibida": acta_map.get(rad_n),
            "fecha_respuesta": resp_map.get(rad_n),
        }
        items.append({k: v for k, v in item.items() if v is not None})

    print(f"📦 {len(items)} casos con radicado para sincronizar.")
    if dry:
        print(json.dumps(items[:5], indent=2, ensure_ascii=False))
        print("(--dry-run: no se escribió nada)")
        return

    token = api_login()
    result = api_sync(token, items)
    print(f"✅ Sync: {result}")


if __name__ == "__main__":
    main()
