"""
特征层：CSI特征提取
理论注入：矛盾动力论 - 量化关系场中的矛盾与演化
"""
import numpy as np
from collections import deque
from typing import Optional

class CSIFeatureExtractor:
    def __init__(self, window_size=50):
        self.power_history = deque(maxlen=window_size)
        self.stability_history = deque(maxlen=window_size)
        self.baseline_power = None
        self.baseline_std = None

    def extract(self, frame, prev_amplitude: Optional[np.ndarray] = None) -> dict:
        amp = frame.amplitude.reshape(-1)
        total_power = np.sum(amp**2)
        
        # 动态基线更新 (关系本体论)
        self.power_history.append(total_power)
        if len(self.power_history) > 20:
            recent = np.array(self.power_history)
            self.baseline_power = np.median(recent)
            self.baseline_std = np.std(recent)
        
        # 计算归一化存在分数 (U代理)
        if self.baseline_power is not None and self.baseline_std is not None:
            existence = np.clip((total_power - self.baseline_power) / (self.baseline_std + 1e-9), 0, 1)
        else:
            existence = 0.5
        
        # 计算运动能量 (D代理)
        diff = np.diff(amp)
        motion_energy = np.sqrt(np.mean(diff**2))
        
        # 计算稳定度 (A代理)
        stability = 1.0
        if prev_amplitude is not None:
            corr = np.corrcoef(amp, prev_amplitude.reshape(-1))[0, 1]
            if not np.isnan(corr):
                stability = abs(corr)
        self.stability_history.append(stability)
        
        # 计算短期稳定度趋势 (矛盾动力论核心)
        stability_trend = 0.0
        if len(self.stability_history) > 10:
            recent_stab = np.array(list(self.stability_history)[-10:])
            stability_trend = np.polyfit(range(10), recent_stab, 1)[0]
        
        return {
            "existence": float(existence),
            "motion_energy": float(motion_energy),
            "stability": float(stability),
            "stability_trend": float(stability_trend),
            "total_power": float(total_power),
            "num_tones": len(amp)
        }