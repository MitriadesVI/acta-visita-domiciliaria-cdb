from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Base de datos
    database_url: str = "postgresql+psycopg2://acta:acta@db:5432/acta"

    # Seguridad / JWT
    secret_key: str = "cambia-esto-en-produccion"
    access_token_expire_minutes: int = 60 * 12  # 12 horas
    algorithm: str = "HS256"

    # Admin inicial (se crea al arrancar si no existe)
    admin_email: str = "admin@acta.local"
    admin_password: str = "admin1234"
    admin_nombre: str = "Administrador"

    # CORS: origen del frontend en Netlify (separar por comas si son varios)
    cors_origins: str = "http://localhost:3000"

    # Almacenamiento de archivos (MinIO / S3)
    s3_endpoint: str = "http://minio:9000"
    s3_public_url: str = "http://localhost:9000"
    s3_access_key: str = "minioadmin"
    s3_secret_key: str = "minioadmin"
    s3_bucket: str = "actas"
    s3_region: str = "us-east-1"

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
