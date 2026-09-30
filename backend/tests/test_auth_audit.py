import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.db import Base
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.repositories.users import create_user, get_user_by_username
from app.repositories.audit import log_audit_event, list_audit_logs

@pytest_asyncio.fixture
async def async_db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    Session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with Session() as session:
        yield session

    await engine.dispose()

@pytest.mark.asyncio
async def test_password_hashing_and_jwt():
    raw_pwd = "SuperSecretPassword123!"
    hashed = hash_password(raw_pwd)
    assert hashed != raw_pwd
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

    token = create_access_token({"sub": "testuser", "role": "ANALYST"})
    decoded = decode_access_token(token)
    assert decoded["sub"] == "testuser"
    assert decoded["role"] == "ANALYST"

@pytest.mark.asyncio
async def test_user_creation_and_auth(async_db: AsyncSession):
    user = await create_user(
        async_db,
        username="secops_analyst",
        email="analyst@corp.internal",
        password="AnalystPassword123!",
        role="ANALYST"
    )
    assert user.id is not None
    assert user.role == "ANALYST"

    fetched = await get_user_by_username(async_db, "secops_analyst")
    assert fetched is not None
    assert verify_password("AnalystPassword123!", fetched.hashed_password) is True

@pytest.mark.asyncio
async def test_audit_logging(async_db: AsyncSession):
    log = await log_audit_event(
        async_db,
        username="admin",
        action="BLOCK_IP",
        target="192.168.1.45",
        details="Remediation for correlated incident INC-1042"
    )
    assert log.id is not None
    assert log.action == "BLOCK_IP"

    logs = await list_audit_logs(async_db)
    assert len(logs) == 1
    assert logs[0].target == "192.168.1.45"
