"""
感知层：CSI解析器
理论注入：关系本体论 - 精确构建CSI关系场
"""
import struct
import numpy as np
from dataclasses import dataclass
from typing import Optional

@dataclass
class CSIFrame:
    """一个CSI帧，即一个关系场快照"""
    amplitude: np.ndarray        # 子载波振幅关系
    phase: Optional[np.ndarray] = None
    num_tones: int = 0
    num_antennas: int = 1
    rssi: float = 0.0
    timestamp: float = 0.0
    source: str = "unknown"

def parse_esp32_line(line: str) -> Optional[CSIFrame]:
    """解析ESP32-CSI-Tool串口输出，构建关系场"""
    line = line.strip()
    if 'CSI' not in line.upper():
        return None
    import re
    hex_match = re.search(r'(?:[0-9a-fA-F]{2}\s*){60,}', line.replace(' ', ''))
    if not hex_match:
        return None
    hex_str = re.sub(r'[^0-9a-fA-F]', '', hex_match.group(0))
    if len(hex_str) < 128:
        return None
    try:
        raw = bytes.fromhex(hex_str)
        n = min(len(raw)//2, 64)
        csi_c = np.zeros(n, dtype=np.complex64)
        for i in range(n):
            r, im = raw[2*i], raw[2*i+1]
            csi_c[i] = complex(r if r < 128 else r - 256, im if im < 128 else im - 256)
        amp = np.abs(csi_c).reshape(1, -1)
        return CSIFrame(amplitude=amp.astype(np.float32), phase=np.angle(csi_c).reshape(1, -1).astype(np.float32), num_tones=n, source="esp32")
    except Exception:
        return None

def parse_nexmon_udp(payload: bytes, num_tones=64) -> Optional[CSIFrame]:
    """解析nexmon_csi UDP数据包，构建关系场"""
    if len(payload) < 14:
        return None
    magic = struct.unpack_from('>H', payload, 0)[0]
    if magic == 0x1111:
        offset = 2
    elif payload[0:4] == b'\x11\x11\x11\x11':
        offset = 4
    else:
        return None
    csi_start = offset + 14
    csi_bytes = payload[csi_start:]
    if len(csi_bytes) < num_tones * 4:
        return None
    csi_c = np.zeros(num_tones, dtype=np.complex64)
    for i in range(num_tones):
        r, im = struct.unpack_from('<h', csi_bytes, i*4), struct.unpack_from('<h', csi_bytes, i*4+2)
        csi_c[i] = complex(r[0], im[0])
    amp = np.abs(csi_c).reshape(1, -1)
    return CSIFrame(amplitude=amp.astype(np.float32), phase=np.angle(csi_c).reshape(1, -1).astype(np.float32), num_tones=num_tones, source="nexmon")

def parse(data):
    """统一解析入口：自动识别数据类型"""
    return parse_nexmon_udp(data) if isinstance(data, bytes) else parse_esp32_line(data)