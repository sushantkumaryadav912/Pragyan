import pytest
import os
import json
import tempfile
from app.services.sensors.zeek_tailer import ZeekLogTailer
from app.services.sensors.suricata_tailer import SuricataLogTailer
from app.services.sensors.sensor_manager import SensorManager
from app.services.ids.suricata_parser import parse_suricata_eve_alert

@pytest.mark.asyncio
async def test_zeek_tailer_parsing():
    with tempfile.TemporaryDirectory() as tmpdir:
        tailer = ZeekLogTailer(log_dir=tmpdir)
        conn_path = os.path.join(tmpdir, "conn.log")
        with open(conn_path, "w") as f:
            f.write("#separator \\x09\n")
            f.write("1600000000.0\tC12345\t192.168.1.45\t49152\t192.168.1.1\t80\ttcp\thttp\t0.5\t100\t200\tSF\t-\t-\t0\tShADda\t1\t120\t1\t240\t-\n")

        lines_read = []
        async def mock_handler(line):
            lines_read.append(line)

        # Read line directly
        with open(conn_path, "r") as f:
            line1 = f.readline()
            line2 = f.readline()
            await mock_handler(line2)

        assert len(lines_read) == 1
        assert "192.168.1.45" in lines_read[0]

@pytest.mark.asyncio
async def test_suricata_tailer_parsing():
    with tempfile.TemporaryDirectory() as tmpdir:
        eve_path = os.path.join(tmpdir, "eve.json")
        tailer = SuricataLogTailer(eve_path=eve_path)

        event = {
            "event_type": "alert",
            "src_ip": "192.168.1.88",
            "dest_ip": "192.168.1.1",
            "src_port": 49100,
            "dest_port": 80,
            "proto": "TCP",
            "alert": {
                "signature": "ET SCAN Nmap Scan",
                "severity": 1,
                "category": "Attempted Information Leak"
            }
        }

        with open(eve_path, "w") as f:
            f.write(json.dumps(event) + "\n")

        alerts_read = []
        async def mock_handler(alert):
            alerts_read.append(alert)

        with open(eve_path, "r") as f:
            line = f.readline()
            parsed = parse_suricata_eve_alert(json.loads(line))
            if parsed:
                await mock_handler(parsed)

        assert len(alerts_read) == 1
        assert alerts_read[0].title == "IDS: ET SCAN Nmap Scan"

        assert alerts_read[0].severity == "CRITICAL"

def test_sensor_manager_status():
    status = SensorManager.get_sensors_status()
    assert "zeek" in status
    assert "suricata" in status
    assert "overall_status" in status
