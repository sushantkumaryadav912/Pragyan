import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.db import Base
from app.services.response.action_executor import ResponseActionExecutor
from app.services.threat_intel.matcher import ThreatIntelMatcher

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
async def test_response_action_execution(async_db: AsyncSession):
    action = await ResponseActionExecutor.execute_action(
        db=async_db,
        action_type="ISOLATE_HOST",
        target_ip="192.168.1.45",
        reason="Test incident containment"
    )
    assert action.id is not None
    assert action.action_type == "ISOLATE_HOST"
    assert action.status == "EXECUTED"

    actions = await ResponseActionExecutor.list_actions(async_db)
    assert len(actions) == 1
    assert actions[0].target_ip == "192.168.1.45"

@pytest.mark.asyncio
async def test_threat_intel_matching(async_db: AsyncSession):
    ioc = await ThreatIntelMatcher.add_ioc(
        db=async_db,
        ioc_type="DOMAIN",
        value="malicious-c2.org",
        threat_category="C2 Server",
        severity="CRITICAL",
        source="AlienVault OTX"
    )
    assert ioc.id is not None
    assert ioc.value == "malicious-c2.org"

    matched = await ThreatIntelMatcher.match_indicator(async_db, "malicious-c2.org")
    assert matched is not None
    assert matched.threat_category == "C2 Server"

    unmatched = await ThreatIntelMatcher.match_indicator(async_db, "google.com")
    assert unmatched is None
