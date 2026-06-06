import uuid

import boto3
from botocore.client import Config

from .config import settings

_client = None


def _s3():
    global _client
    if _client is None:
        _client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint,
            aws_access_key_id=settings.s3_access_key,
            aws_secret_access_key=settings.s3_secret_key,
            region_name=settings.s3_region,
            config=Config(signature_version="s3v4"),
        )
    return _client


def ensure_bucket():
    """Crea el bucket si no existe (idempotente)."""
    s3 = _s3()
    try:
        existing = [b["Name"] for b in s3.list_buckets().get("Buckets", [])]
        if settings.s3_bucket not in existing:
            s3.create_bucket(Bucket=settings.s3_bucket)
    except Exception as e:  # noqa: BLE001
        # No bloquear el arranque si MinIO aún no está listo.
        print(f"[storage] No se pudo verificar/crear el bucket: {e}")


def subir_archivo(contenido: bytes, content_type: str, prefijo: str = "actas") -> str:
    """Sube bytes al storage y devuelve la URL pública."""
    ext = (content_type.split("/")[-1] or "bin").split(";")[0]
    key = f"{prefijo}/{uuid.uuid4()}.{ext}"
    _s3().put_object(
        Bucket=settings.s3_bucket,
        Key=key,
        Body=contenido,
        ContentType=content_type,
    )
    return f"{settings.s3_public_url}/{settings.s3_bucket}/{key}"
