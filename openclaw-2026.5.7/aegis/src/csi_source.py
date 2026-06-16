"""
数据源层：CSI输入源管理
支持三种输入模式：模拟、串口、UDP
"""
import random
import numpy as np
import socket
import serial
from typing import Optional, Callable
from .csi_parser import CSIFrame

class CSIInputSource:
    def __init__(self, mode: str = "simulate", port: str = "COM3", udp_port: int = 5500):
        """
        Args:
            mode: 'simulate', 'serial', or 'udp'
            port: Serial port path (for serial mode)
            udp_port: UDP port (for udp mode)
        """
        self.mode = mode.lower()
        self.ser = None
        self.sock = None
        self._running = False
        self.simulation_state = {
            "motion_level": 0.3,
            "stability": 0.8,
            "trend": 0
        }
        
        if self.mode == "serial":
            try:
                self.ser = serial.Serial(port, baudrate=115200, timeout=1)
            except Exception as e:
                print(f"串口初始化失败: {e}")
        
        elif self.mode == "udp":
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            self.sock.bind(("0.0.0.0", udp_port))
            self.sock.settimeout(0.1)
    
    def _generate_simulated_frame(self) -> CSIFrame:
        """生成模拟CSI帧"""
        num_tones = 64
        
        # 添加动态变化
        self.simulation_state["motion_level"] += random.uniform(-0.05, 0.05)
        self.simulation_state["motion_level"] = max(0.1, min(0.9, self.simulation_state["motion_level"]))
        
        self.simulation_state["stability"] += random.uniform(-0.03, 0.03)
        self.simulation_state["stability"] = max(0.3, min(0.99, self.simulation_state["stability"]))
        
        # 生成基础振幅
        base_amp = np.random.normal(50, 15, num_tones)
        base_amp = np.abs(base_amp)
        
        # 根据运动级别添加扰动
        if self.simulation_state["motion_level"] > 0.5:
            perturbation = np.random.normal(0, 20 * self.simulation_state["motion_level"], num_tones)
            base_amp += perturbation
        
        # 限制振幅范围
        base_amp = np.clip(base_amp, 10, 100)
        
        return CSIFrame(
            amplitude=base_amp.reshape(1, -1).astype(np.float32),
            phase=np.random.uniform(-np.pi, np.pi, num_tones).reshape(1, -1).astype(np.float32),
            num_tones=num_tones,
            rssi=-50 - random.uniform(0, 20),
            timestamp=time.time(),
            source="simulate"
        )
    
    def read(self) -> Optional[CSIFrame]:
        """读取一帧CSI数据"""
        if self.mode == "simulate":
            return self._generate_simulated_frame()
        
        elif self.mode == "serial":
            if self.ser is None:
                return None
            try:
                line = self.ser.readline().decode('utf-8', errors='ignore')
                if line:
                    from .csi_parser import parse_esp32_line
                    return parse_esp32_line(line)
            except Exception:
                return None
        
        elif self.mode == "udp":
            if self.sock is None:
                return None
            try:
                data, _ = self.sock.recvfrom(2048)
                from .csi_parser import parse_nexmon_udp
                return parse_nexmon_udp(data)
            except socket.timeout:
                return None
        
        return None
    
    def close(self):
        if self.ser:
            self.ser.close()
        if self.sock:
            self.sock.close()

import time
