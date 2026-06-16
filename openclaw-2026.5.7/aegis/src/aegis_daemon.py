"""
守护进程：Aegis Daemon
理论注入：谐振调谐论 - 状态自动调谐
"""
import time, threading
from typing import Optional, Dict
from .csi_source import CSIInputSource
from .csi_features import CSIFeatureExtractor
from .core import AegisCoreV2

class AegisDaemon:
    def __init__(self, mode: str = "simulate", interval: float = 0.1):
        self.mode = mode
        self.interval = interval
        self.source = CSIInputSource(mode=mode)
        self.extractor = CSIFeatureExtractor()
        self.core = AegisCoreV2()
        self._running = False
        self._thread = None
        self.latest: Optional[Dict] = None
        self.prev_amplitude = None
    
    def step(self) -> Optional[Dict]:
        """执行单步处理"""
        frame = self.source.read()
        if frame is None:
            return None
        
        # 特征提取
        features = self.extractor.extract(frame, self.prev_amplitude)
        self.prev_amplitude = frame.amplitude
        
        # 核心处理
        result = self.core.process(features)
        
        # 构建输出快照
        snap = result["snapshot"].copy()
        snap.update({
            "existence": features["existence"],
            "stability": features["stability"],
            "motion_energy": features["motion_energy"],
            "A_proxy": snap["A"],
            "H_proxy": snap["H"],
            "U_proxy": snap["U"],
            "D_proxy": snap["D"],
        })
        
        self.latest = snap
        return snap
    
    def start(self):
        """启动守护进程"""
        self._running = True
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()
    
    def _run(self):
        while self._running:
            self.step()
            time.sleep(self.interval)
    
    def stop(self):
        """停止守护进程"""
        self._running = False
        if self._thread:
            self._thread.join()
        self.source.close()
