"""
集成层：CrystalMind桥接器
理论注入：实践介入论 - 评估者的介入改变系统状态
"""
import time, json, statistics
from collections import deque
from typing import Optional

class AegisFlipPointBridge:
    def __init__(self, window_size=20):
        self.window_size = window_size
        self.history = []
        self.A_inert_threshold = 0.012
        self.A_boundary_low = 0.25
        self.A_boundary_high = 0.70
        self.dom_anomaly_ratio = 2.0
        self.dom_tiny_threshold = 0.008
        self.plunge_delta = 0.20
        self.jump_delta = 0.08
        self.h_jump_threshold = 0.03

    def feed(self, snap: dict) -> Optional[dict]:
        self.history.append(snap)
        if len(self.history) > self.window_size:
            self.history.pop(0)
        if len(self.history) < 5:
            return None
        
        A_seq = [h.get("A_proxy", 0.0) for h in self.history]
        H_seq = [h.get("H_proxy", 0.5) for h in self.history]
        U_seq = [h.get("U_proxy", 0.5) for h in self.history]
        
        last_A = A_seq[-1]
        prev_A = A_seq[-2] if len(A_seq) >= 2 else last_A
        last_H = H_seq[-1]
        prev_H = H_seq[-2] if len(H_seq) >= 2 else last_H
        
        A_inert_std = statistics.stdev(A_seq[-5:]) if len(A_seq) >= 5 else 999
        A_boundary = (last_A <= self.A_boundary_low) or (last_A >= self.A_boundary_high)
        A_inert = (A_inert_std <= self.A_inert_threshold) and A_boundary
        
        dom_diff = abs(last_A - prev_A) if len(A_seq) >= 2 else 0
        mean_abs_dom = statistics.mean([abs(A_seq[i] - A_seq[i-1]) for i in range(1, len(A_seq))]) if len(A_seq) > 1 else 0.001
        dom_anomaly = dom_diff > self.dom_anomaly_ratio * mean_abs_dom
        dom_tiny = dom_diff < self.dom_tiny_threshold
        
        if len(U_seq) >= 5:
            sigma_D_current = statistics.stdev(U_seq[-5:])
        else:
            sigma_D_current = 0
        if len(U_seq) >= 10:
            sigma_D_prev = statistics.stdev(U_seq[-10:-5])
        else:
            sigma_D_prev = sigma_D_current
        sigma_D_trend = sigma_D_current < sigma_D_prev
        
        jump = abs(last_A - prev_A) >= self.jump_delta and A_boundary
        plunge = (prev_A - last_A) >= self.plunge_delta and (last_H - prev_H) >= self.h_jump_threshold
        
        primary = A_inert and (dom_anomaly or dom_tiny) and sigma_D_trend
        alt1 = jump and dom_anomaly
        alt2 = plunge and (dom_anomaly or sigma_D_trend)
        
        if primary or alt1 or alt2:
            paths = []
            if primary: paths.append("primary")
            if alt1: paths.append("alt1")
            if alt2: paths.append("alt2")
            alert = {
                "alert": True,
                "paths": paths,
                "A_proxy": round(last_A, 4),
                "H_proxy": round(last_H, 4),
                "A_inert_std": round(A_inert_std, 4),
                "dom_anomaly": bool(dom_anomaly),
                "sigma_D_trend": bool(sigma_D_trend),
                "timestamp": snap.get("ts", time.time()),
            }
            with open("aegis_alerts.jsonl", "a") as f:
                f.write(json.dumps(alert, ensure_ascii=False) + "\n")
            return alert
        return None

def make_csi_text_stream(aegis_daemon):
    def stream():
        snap = aegis_daemon.latest
        if snap is None:
            return ""
        return json.dumps(snap)
    return stream