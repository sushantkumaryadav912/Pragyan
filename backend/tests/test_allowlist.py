import pytest

from app.services.discovery.allowlist import TargetNotAllowed, validate_target


def test_accepts_private_cidr():
    assert validate_target("192.168.1.0/24") == "192.168.1.0/24"


def test_accepts_private_host():
    assert validate_target("10.0.0.5") == "10.0.0.5/32"


def test_accepts_loopback():
    assert validate_target("127.0.0.1") == "127.0.0.1/32"


def test_rejects_public():
    with pytest.raises(TargetNotAllowed):
        validate_target("8.8.8.0/24")


def test_rejects_invalid():
    with pytest.raises(TargetNotAllowed):
        validate_target("not-an-ip")
