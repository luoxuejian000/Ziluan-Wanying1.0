"""
Aegis Core V2.0 - 晶脉哲学超级工程内核
理论注入：关系本体论、矛盾动力论、实践介入论、谐振调谐论
"""
import time, json, threading, logging
from enum import Enum
from collections import deque
from typing import Optional, Dict, Any, List, Tuple

import numpy as np

class SystemState(Enum):
    NORMAL = "normal"
    ALERT = "alert"
    DANGER = "danger"

class AegisCoreV2:
    """Aegis 核心引擎 V2.0，严格遵循晶脉四重公理"""
    
    def __init__(self, window_size: int = 100, learn_rate: float = 0.1):
        # === 关系本体论：存储完整的感知历史，构建动态关系场 ===
        self.perception_history = deque(maxlen=window_size)
        
        # === 谐振调谐论：初始可协商权重 ===
        self.lambdas = {"U": 0.4, "D": 0.4, "A": 0.2}
        
        # === 内部状态 ===
        self.state = SystemState.NORMAL
        self.learn_rate = learn_rate
        self._running = False
        self._thread = None
        self.latest_snapshot: Optional[Dict[str, Any]] = None
        
        # 用于计算变化趋势的历史序列
        self.a_history = deque(maxlen=20)
        self.h_history = deque(maxlen=20)
        
        logging.basicConfig(level=logging.INFO)

    # =========================================================================
    # 公理驱动：核心处理逻辑
    # =========================================================================
    def process(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """处理一个新的感知数据点"""
        ts = time.time()
        
        # 1. 关系本体论：将当前数据与历史基线对比，生成关系感知快照
        snapshot = self._build_relational_snapshot(features, ts)
        
        # 2. 存储关系快照，更新历史
        self.perception_history.append(snapshot)
        self.a_history.append(snapshot["A"])
        self.h_history.append(snapshot["H"])
        self.latest_snapshot = snapshot
        
        # 3. 谐振调谐论：根据当前状态，平滑调谐内部权重
        self._tune_weights()
        
        # 4. 矛盾动力论：分析矛盾的演变轨迹，判断是否相变
        is_alert, evidence = self._analyze_contradiction_dynamics()
        
        # 5. 实践介入论：生成可解释的告警或状态报告
        if is_alert:
            alert = self._generate_explainable_alert(snapshot, evidence)
            self._log_alert(alert)
            return {"snapshot": snapshot, "alert": alert}
        
        self._log_snapshot(snapshot)
        return {"snapshot": snapshot, "alert": None}

    # =========================================================================
    # 关系本体论：构建动态关系场
    # =========================================================================
    def _build_relational_snapshot(self, features: Dict, ts: float) -> Dict:
        """将孤立的特征点与历史基线结合，构建充满关系的感知快照"""
        # 提取当前特征
        existence = features.get("existence", 0.5)
        motion = features.get("motion_energy", 0.0)
        stability = features.get("stability", 1.0)
        
        # 与历史基线建立关系
        base_power = np.median([s['total_power'] for s in self.perception_history]) if self.perception_history else features.get('total_power', 0.5)
        base_stability = np.median([s['stability'] for s in self.perception_history]) if self.perception_history else 1.0
        
        # 计算当前值相对于历史基线的"位置"
        U = existence
        D = motion
        A = 1.0 - (stability / (base_stability + 1e-9))  # 相对于基线的矛盾值
        
        # 谐振调谐论：计算综合和谐度
        # 对 D 进行归一化处理
        D_normalized = min(D / 10.0, 1.0)  # 将 motion_energy 归一化到 [0, 1]
        H_raw = self.lambdas["U"] * U + self.lambdas["D"] * D_normalized - self.lambdas["A"] * A
        # 将 H 归一化到 [-1, 1]
        H = max(-1.0, min(1.0, H_raw))
        
        # 构建完整的关系快照
        snapshot = {
            "ts": ts,
            "existence": existence,
            "motion_energy": motion,
            "stability": stability,
            "U": round(U, 4),
            "D": round(D, 4),
            "A": round(A, 4),
            "H": round(H, 4),
            "state": self.state.value,
            "total_power": features.get('total_power', 0.0),
            # 关系本体论：携带关键的关系数据
            "relative_to_baseline": {
                "stability_diff": round(stability - base_stability, 4),
                "power_diff": round(features.get('total_power', 0.0) - base_power, 2)
            }
        }
        return snapshot

    # =========================================================================
    # 谐振调谐论：平滑、动态的自我调谐
    # =========================================================================
    def _tune_weights(self):
        """根据当前和谐度及其趋势，平滑地调谐内部权重"""
        if len(self.h_history) < 5:
            return
        
        # 计算和谐度的短期趋势
        recent_h = list(self.h_history)[-5:]
        h_trend = np.polyfit(range(5), recent_h, 1)[0]  # 正值表示上升
        
        # 根据和谐度和趋势，计算目标权重
        # 目标：当H低时，提高U权重（追求稳定）；当H高时，提高D权重（鼓励探索）
        current_h = recent_h[-1]
        target_u = 0.6 - 0.3 * current_h  # H越低，U权重越高
        target_d = 0.2 + 0.4 * (1.0 - current_h)  # H越高，D权重越高
        target_a = 1.0 - target_u - target_d
        
        # 平滑过渡，避免权重跳变
        for k, target in zip(["U", "D", "A"], [target_u, target_d, target_a]):
            self.lambdas[k] += self.learn_rate * (target - self.lambdas[k])
        
        # 归一化
        total = sum(self.lambdas.values())
        for k in self.lambdas:
            self.lambdas[k] /= total

    # =========================================================================
    # 矛盾动力论：分析矛盾演变轨迹，实现事前预警
    # =========================================================================
    def _analyze_contradiction_dynamics(self) -> Tuple[bool, Dict]:
        """分析矛盾的演变轨迹，而非仅仅看绝对值"""
        if len(self.a_history) < 10:
            return False, {}
        
        a_seq = list(self.a_history)
        h_seq = list(self.h_history)
        
        # 一阶变化率：速度
        a_velocity = a_seq[-1] - a_seq[-5] if len(a_seq) >= 5 else 0
        # 二阶变化率：加速度（这才是关键！）
        prev_velocity = a_seq[-5] - a_seq[-10] if len(a_seq) >= 10 else 0
        a_acceleration = a_velocity - prev_velocity
        
        # 判断：矛盾是否在快速加剧？
        is_critical = a_acceleration > 0.05 and a_seq[-1] > 0.4
        
        # 构建完整的证据链
        evidence = {
            "current_A": round(a_seq[-1], 4),
            "current_H": round(h_seq[-1], 4),
            "A_velocity": round(a_velocity, 4),
            "A_acceleration": round(a_acceleration, 4),
            "trigger": "矛盾加速度超过临界值" if is_critical else "N/A"
        }
        
        # 根据矛盾状态切换系统状态
        if a_seq[-1] > 0.7:
            self.state = SystemState.DANGER
        elif is_critical:
            self.state = SystemState.ALERT
        else:
            self.state = SystemState.NORMAL
            
        return is_critical, evidence

    # =========================================================================
    # 实践介入论：生成可解释的告警
    # =========================================================================
    def _generate_explainable_alert(self, snapshot: Dict, evidence: Dict) -> Dict:
        """生成可解释、可追溯、可审计的告警"""
        return {
            "alert": True,
            "timestamp": snapshot["ts"],
            "state": self.state.value,
            "snapshot": {
                "U": snapshot["U"],
                "D": snapshot["D"],
                "A": snapshot["A"],
                "H": snapshot["H"]
            },
            "evidence": evidence,  # 完整的决策证据链
            "weights": dict(self.lambdas),  # 当时的调谐状态
            "recommendation": self._generate_recommendation(snapshot)
        }

    def _generate_recommendation(self, snapshot: Dict) -> str:
        """根据当前状态生成行动建议"""
        if self.state == SystemState.DANGER:
            return "建议立即人工介入，系统已进入危险状态"
        elif self.state == SystemState.ALERT:
            return "系统状态异常，建议密切关注并降低环境不确定性"
        return "系统状态正常"

    # =========================================================================
    # 审计与日志
    # =========================================================================
    def _log_snapshot(self, snap: Dict):
        with open("aegis_snapshot.jsonl", "a") as f:
            f.write(json.dumps(snap) + "\n")

    def _log_alert(self, alert: Dict):
        with open("aegis_alerts.jsonl", "a") as f:
            f.write(json.dumps(alert) + "\n")

    # =========================================================================
    # 生命周期管理
    # =========================================================================
    def start(self, input_stream):
        """启动核心引擎，持续处理输入流"""
        self._running = True
        self._thread = threading.Thread(target=self._run, args=(input_stream,), daemon=True)
        self._thread.start()

    def stop(self):
        self._running = False

    def _run(self, input_stream):
        while self._running:
            try:
                features = input_stream()
                self.process(features)
            except Exception as e:
                logging.error(f"处理异常: {e}")
            time.sleep(0.1)