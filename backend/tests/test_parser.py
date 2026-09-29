from app.services.discovery.parser import parse_nmap_xml

SAMPLE_XML = """<?xml version="1.0"?>
<nmaprun scanner="nmap">
  <host>
    <status state="up"/>
    <address addr="192.168.1.20" addrtype="ipv4"/>
    <address addr="AA:BB:CC:DD:EE:FF" addrtype="mac"/>
    <hostnames><hostname name="server.local"/></hostnames>
    <ports>
      <port protocol="tcp" portid="22">
        <state state="open"/>
        <service name="ssh" product="OpenSSH" version="8.9"/>
      </port>
      <port protocol="tcp" portid="80">
        <state state="open"/>
        <service name="http" product="nginx"/>
      </port>
      <port protocol="tcp" portid="8080">
        <state state="closed"/>
        <service name="http-proxy"/>
      </port>
    </ports>
    <os><osmatch name="Linux 5.x"/></os>
  </host>
</nmaprun>
"""


def test_parse_basic_host():
    hosts = parse_nmap_xml(SAMPLE_XML)
    assert len(hosts) == 1
    h = hosts[0]
    assert h.ip == "192.168.1.20"
    assert h.mac == "AA:BB:CC:DD:EE:FF"
    assert h.hostname == "server.local"
    assert h.os == "Linux 5.x"
    # Only the two open ports are kept.
    assert len(h.services) == 2
    ports = {s.port for s in h.services}
    assert ports == {22, 80}
    ssh = next(s for s in h.services if s.port == 22)
    assert ssh.name == "ssh"
    assert ssh.product == "OpenSSH"


def test_parse_empty():
    assert parse_nmap_xml("") == []
