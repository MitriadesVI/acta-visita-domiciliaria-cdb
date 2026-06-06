from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Caso, Visita
from ..deps import require_roles

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _hoy():
    # Fecha en hora Colombia (UTC-5).
    return (datetime.utcnow() - timedelta(hours=5)).date()


def _dias_desde(fecha):
    if not fecha:
        return None
    return (_hoy() - fecha).days


def _resumen(caso, fecha=None, dias=None):
    return {
        "id": caso.id,
        "codigo": caso.codigo,
        "nombre": caso.nombre_adulto_mayor,
        "estado": caso.estado,
        "asignado_a": caso.asignado_a,
        "fecha": fecha.isoformat() if fecha else None,
        "dias": dias,
    }


@router.get("/pendientes")
def pendientes(
    dias_alerta: int = 5,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin", "coordinador")),
):
    """Tablero anti-huecos: agrupa los casos que requieren acción para que
    nada se pierda en el seguimiento."""
    hoy = _hoy()
    casos = db.query(Caso).filter(Caso.estado != "cerrado").all()
    visitas = db.query(Visita).all()

    # Índice: ¿el caso tiene una visita pendiente futura?
    visitas_por_caso = {}
    for v in visitas:
        visitas_por_caso.setdefault(v.caso_id, []).append(v)

    sin_agendar = []
    no_ubicado = []
    sin_acta = []
    acta_sin_respuesta = []
    vence_pronto = []
    sin_cerrar = []
    visitas_vencidas = []

    for c in casos:
        # 1. Recibido sin agendar
        if c.estado == "recibido":
            sin_agendar.append(_resumen(c, c.fecha_recibido, _dias_desde(c.fecha_recibido)))
        # 2. No ubicado sin reagendar (sin visita pendiente futura)
        if c.estado == "no_ubicado":
            tiene_pendiente = any(
                v.estado == "pendiente" and v.fecha_programada and v.fecha_programada >= hoy
                for v in visitas_por_caso.get(c.id, [])
            )
            if not tiene_pendiente:
                no_ubicado.append(_resumen(c))
        # 3. Esperando acta (agendado/valorado, sin fecha de acta)
        if c.estado in ("agendado", "valorado") and not c.fecha_acta_recibida:
            sin_acta.append(_resumen(c, c.fecha_recibido, _dias_desde(c.fecha_recibido)))
        # 4. Acta recibida pero sin respuesta al remitente
        if c.fecha_acta_recibida and not c.fecha_respuesta:
            sin = _resumen(c, c.fecha_acta_recibida, _dias_desde(c.fecha_acta_recibida))
            acta_sin_respuesta.append(sin)
        # 5. Vence pronto (o ya vencido)
        if c.fecha_vence and c.fecha_vence <= hoy + timedelta(days=dias_alerta):
            vence_pronto.append(_resumen(c, c.fecha_vence, (c.fecha_vence - hoy).days))
        # 6. Resuelto/respondido pero sin cerrar formalmente
        if c.estado != "cerrado" and (c.resultado or c.enviado_juridica or c.fecha_respuesta):
            sin_cerrar.append(_resumen(c))

    # 7. Visitas vencidas (programadas en el pasado, aún pendientes)
    casos_idx = {c.id: c for c in db.query(Caso).all()}
    for v in visitas:
        if v.estado == "pendiente" and v.fecha_programada and v.fecha_programada < hoy:
            c = casos_idx.get(v.caso_id)
            visitas_vencidas.append({
                "visita_id": v.id,
                "caso_id": v.caso_id,
                "codigo": c.codigo if c else None,
                "nombre": c.nombre_adulto_mayor if c else None,
                "fecha": v.fecha_programada.isoformat(),
                "dias": (hoy - v.fecha_programada).days,
                "asignado_a": v.usuario_id,
            })

    buckets = {
        "sin_agendar": sin_agendar,
        "visitas_vencidas": visitas_vencidas,
        "no_ubicado_sin_reagendar": no_ubicado,
        "esperando_acta": sin_acta,
        "acta_sin_respuesta": acta_sin_respuesta,
        "vence_pronto": vence_pronto,
        "sin_cerrar": sin_cerrar,
    }
    conteos = {k: len(v) for k, v in buckets.items()}
    return {"hoy": hoy.isoformat(), "conteos": conteos, "buckets": buckets}
