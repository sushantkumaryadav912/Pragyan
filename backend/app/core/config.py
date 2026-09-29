"""Application configuration loaded from environment / .env."""
from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database
    database_url: str = "postgresql+asyncpg://pragyan:pragyan_dev_pw@localhost:55432/pragyan"

    # Redis
    redis_url: str = "redis://localhost:6381/0"

    # Scanning
    scan_allowlist: str = "192.168.0.0/16,10.0.0.0/8,172.16.0.0/12,127.0.0.0/8"
    nmap_flags: str = "-sV -T4"

    # CORS
    cors_origins: str = "http://localhost:5173"

    @property
    def allowlist_networks(self) -> list[str]:
        return [c.strip() for c in self.scan_allowlist.split(",") if c.strip()]

    @property
    def nmap_flag_list(self) -> list[str]:
        return [f.strip() for f in self.nmap_flags.split() if f.strip()]

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
