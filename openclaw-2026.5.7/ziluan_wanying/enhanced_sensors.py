"""
紫鸾·万翎 场域感知增强模块
增补：A_inert、σD_trend、U_peak_reversal 检测 + 记忆层最小反思动作

严格遵循晶脉哲学四重公理：
- 关系本体论：所有信号都是场域内部的关系度量，不是外部规则
- 矛盾动力论：增强矛盾张力的感知维度，让系统更敏锐地感知相变前兆
- 实践介入论：所有信号变化都附带审计记录
- 谐振调谐论：信号辅助系统更精准地感知自身状态

严防工具理性悖论：
- 本模块只"观测"和"审计"，不直接触发任何干预动作
- 紫鸾现有的决策树逻辑不变
- 新增信号作为辅助确认信息，写入审计日志，供人类观察者参考
"""
import json
import os
import time
import numpy as np
from typing import List, Dict, Optional


# ============================================================
# 可调参数（可基于历史经验调整）
# ============================================================
A_INERT_WINDOW = 3            # A值活性检测窗口
A_INERT_THRESHOLD = 0.01      # A值短期变异低于此值视为"活性丧失"
A_BOUNDARY_LOW = 0.12         # A值下边界
A_BOUNDARY_HIGH = 0.9         # A值上边界

SIGMA_D_WINDOW = 5            # σD 趋势检测窗口

U_PEAK_LOOKBACK = 3           # U峰值检测回溯窗口
U_DELTA_REVERSAL = -0.05      # U从峰顶跌落超过此值视为反转
U_MIN_GATE = 0.22             # U过低时不检测峰（防噪声）
H_LOW_GATE = 0.35             # H低于此值才关注U反转

AUDIT_PATH = "enhanced_sensor_audit.jsonl"


# ============================================================
# 审计工具
# ============================================================
def _append_audit(entry: Dict, out_path: str = AUDIT_PATH):
    """追尾写审计日志，不读不改旧文件"""
    try:
        os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
        with open(out_path, "a", encoding="utf-8") as fp:
            fp.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception:
        pass


# ============================================================
# 1. A_inert 检测：A值活性丧失
# ============================================================
def detect_A_inert(history: List[Dict], idx: int) -> Optional[Dict]:
    """
    检测A值是否在边界处"锁死"（矛盾张力饱和）。
    返回检测结果字典，或 None。
    """
    if idx < A_INERT_WINDOW:
        return None

    recent_A = []
    for i in range(idx - A_INERT_WINDOW, idx + 1):
        if i < len(history) and "A" in history[i]:
            recent_A.append(history[i]["A"])

    if len(recent_A) < A_INERT_WINDOW:
        return None

    current_A = recent_A[-1]
    is_at_boundary = (current_A <= A_BOUNDARY_LOW) or (current_A >= A_BOUNDARY_HIGH)
    if not is_at_boundary:
        return None

    sigma_A = float(np.std(recent_A))
    if sigma_A > A_INERT_THRESHOLD:
        return None

    return {
        "signal": "A_INERT",
        "at": idx,
        "current_A": round(current_A, 4),
        "sigma_A": round(sigma_A, 4),
        "boundary": "low" if current_A <= A_BOUNDARY_LOW else "high",
        "description": "A值活性丧失，矛盾张力饱和",
        "source": "enhanced_sensors.detect_A_inert",
    }


# ============================================================
# 2. σD_trend 检测：场域不确定性收敛
# ============================================================
def detect_sigmaD_trend(history: List[Dict], idx: int) -> Optional[Dict]:
    """
    检测D值波动率的趋势是否从上升转为持平或下降。
    返回检测结果字典，或 None。
    """
    if idx < SIGMA_D_WINDOW + 1:
        return None

    sigma_Ds = []
    for i in range(idx - SIGMA_D_WINDOW - 1, idx + 1):
        if i >= len(history):
            break
        if "D" in history[i]:
            local_Ds = []
            for j in range(max(0, i - A_INERT_WINDOW), min(len(history), i + 1)):
                if "D" in history[j]:
                    local_Ds.append(history[j]["D"])
            if len(local_Ds) >= 2:
                sigma_Ds.append(float(np.std(local_Ds)))

    if len(sigma_Ds) < 3:
        return None

    trend = sigma_Ds[-1] - sigma_Ds[-3]
    prev_trend = sigma_Ds[-2] - sigma_Ds[-3] if len(sigma_Ds) >= 3 else 0

    if not (trend <= 0 and prev_trend > 0):
        return None

    return {
        "signal": "SIGMA_D_TREND",
        "at": idx,
        "sigma_D_recent": round(sigma_Ds[-1], 4),
        "sigma_D_prev": round(sigma_Ds[-2], 4) if len(sigma_Ds) >= 2 else 0,
        "description": "场域不确定性收敛，系统在相变前自我整理",
        "source": "enhanced_sensors.detect_sigmaD_trend",
    }


# ============================================================
# 3. U_peak_reversal 检测：U值峰值反转
# ============================================================
def detect_U_peak_reversal(history: List[Dict], idx: int) -> Optional[Dict]:
    """
    检测U值是否在经历一个局部峰值后大幅回落。
    这是统一性在场强度骤降的信号，对应场域相变。
    """
    if idx < U_PEAK_LOOKBACK:
        return None

    win = history[max(0, idx - U_PEAK_LOOKBACK):idx + 1]
    u_vals = [w.get("U", 0.0) for w in win]

    if len(u_vals) < U_PEAK_LOOKBACK:
        return None

    peak_offset = max(range(len(u_vals) - 1), key=lambda i: u_vals[i])
    peak_idx_abs = idx - (len(u_vals) - 1) + peak_offset
    peak_u = u_vals[peak_offset]
    now_u = history[idx].get("U", 0.0)
    now_h = history[idx].get("H", 0.0)

    if peak_u < U_MIN_GATE:
        return None
    if now_h > H_LOW_GATE:
        return None

    du = now_u - peak_u
    if du >= U_DELTA_REVERSAL:
        return None

    return {
        "signal": "U_PEAK_REVERSAL",
        "at": idx,
        "peak_at": peak_idx_abs,
        "peak_U": round(peak_u, 4),
        "now_U": round(now_u, 4),
        "delta_U": round(du, 4),
        "now_H": round(now_h, 4),
        "description": "统一性在场强度骤降，场域相变信号",
        "source": "enhanced_sensors.detect_U_peak_reversal",
    }


# ============================================================
# 4. 记忆层最小反思动作：self-correction审计
# ============================================================
def audit_self_correction(
    memory_snapshot: Dict,
    field_state: Dict,
    prior_actions: List[Dict],
    now_idx: int
) -> Optional[Dict]:
    """
    对记忆层的行为进行最小反思审计。
    检测记忆召回是否与当前场域状态一致，记录任何不一致。
    """
    if not memory_snapshot or not field_state:
        return None

    recall_keys = memory_snapshot.get("recalled_keys", [])
    if not recall_keys:
        return None

    current_U = field_state.get("U", 0.5)
    current_A = field_state.get("A", 0.0)
    current_H = field_state.get("H", 0.5)

    concern_level = 0
    concerns = []

    if current_U < U_MIN_GATE and len(recall_keys) > 3:
        concern_level += 1
        concerns.append("U值过低但记忆召回数量异常")

    if current_A < A_BOUNDARY_LOW:
        concern_level += 1
        concerns.append("A值活性丧失，记忆唤醒可能受阻")

    if current_H < H_LOW_GATE:
        concern_level += 1
        concerns.append("场域健康度低，建议减少记忆负荷")

    if concern_level == 0:
        return None

    return {
        "signal": "SELF_CORRECTION_AUDIT",
        "at": now_idx,
        "concern_level": concern_level,
        "concerns": concerns,
        "field_state": {
            "U": round(current_U, 4),
            "A": round(current_A, 4),
            "H": round(current_H, 4),
        },
        "memory_recall_count": len(recall_keys),
        "description": "记忆层行为与场域状态存在潜在不一致",
        "source": "enhanced_sensors.audit_self_correction",
    }


# ============================================================
# 5. 记忆层反思记录器
# ============================================================
class SelfCorrectionLogger:
    """
    记忆层反思记录器。
    不修改任何参数，只记录"本次发现了什么"和"与历史基线的对比"。
    """

    def __init__(self, log_path: str = "self_correction_log.jsonl"):
        self.log_path = log_path
        self.baseline_hit_rate = 0.85

    def log_comparison(
        self,
        detected_signals: List[str],
        reference_signals: List[str],
        context: Dict
    ):
        """
        记录本次检测到的信号与参考信号的对比。
        如果发现漏标，记录一条反思审计行。
        """
        detected_set = set(detected_signals)
        reference_set = set(reference_signals)

        missed = reference_set - detected_set
        extra = detected_set - reference_set

        entry = {
            "t": time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime()),
            "action": "SELF_CORRECTION_REVIEW",
            "detected": list(detected_set),
            "reference": list(reference_set),
            "missed": list(missed),
            "extra": list(extra),
            "context": context,
        }

        if missed:
            entry["recommendation"] = (
                f"本次漏标了参考信号: {missed}。"
                f"建议检查对应检测通道的灵敏度，或在审计中标记此段为低置信区间。"
            )
            entry["severity"] = "info"

        _append_audit(entry, self.log_path)
        return entry


# ============================================================
# 统一检测入口
# ============================================================
def run_enhanced_detection(
    history: List[Dict],
    idx: int,
    memory_snapshot: Optional[Dict] = None,
    prior_actions: Optional[List[Dict]] = None
) -> List[Dict]:
    """
    运行所有增强检测，返回检测到的信号列表。
    所有信号自动写入审计日志。
    """
    signals = []

    sig = detect_A_inert(history, idx)
    if sig:
        signals.append(sig)
        _append_audit({**sig, "timestamp": time.time()})

    sig = detect_sigmaD_trend(history, idx)
    if sig:
        signals.append(sig)
        _append_audit({**sig, "timestamp": time.time()})

    sig = detect_U_peak_reversal(history, idx)
    if sig:
        signals.append(sig)
        _append_audit({**sig, "timestamp": time.time()})

    if memory_snapshot:
        sig = audit_self_correction(
            memory_snapshot,
            history[idx] if idx < len(history) else {},
            prior_actions or [],
            idx
        )
        if sig:
            signals.append(sig)
            _append_audit({**sig, "timestamp": time.time()})

    return signals


# ============================================================
# 主挂接点：在主循环每轮结束后调用
# ============================================================
def tick(
    history: List[Dict],
    idx: int,
    extra_tags: Optional[Dict] = None
) -> Dict:
    """
    主挂接函数。在主循环每轮计算完 U/D/A/H 后调用一次。
    返回本次检测到的所有增强信号。
    """
    tags = extra_tags or {}
    results = {
        "A_inert": None,
        "sigmaD_trend": None,
        "U_peak_reversal": None,
        "detected_signals": [],
    }

    a_inert = detect_A_inert(history, idx)
    if a_inert:
        results["A_inert"] = a_inert
        results["detected_signals"].append("A_INERT")
        rec = {
            "t": time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime()),
            "alert": "ENHANCED_SIGNAL",
            "detail": a_inert,
            **tags,
        }
        _append_audit(rec)

    sigma_d = detect_sigmaD_trend(history, idx)
    if sigma_d:
        results["sigmaD_trend"] = sigma_d
        results["detected_signals"].append("SIGMA_D_TREND")
        rec = {
            "t": time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime()),
            "alert": "ENHANCED_SIGNAL",
            "detail": sigma_d,
            **tags,
        }
        _append_audit(rec)

    u_rev = detect_U_peak_reversal(history, idx)
    if u_rev:
        results["U_peak_reversal"] = u_rev
        results["detected_signals"].append("U_PEAK_REVERSAL")
        rec = {
            "t": time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime()),
            "alert": "ENHANCED_SIGNAL",
            "detail": u_rev,
            **tags,
        }
        _append_audit(rec)

    return results


# ============================================================
# 演示：增强感知检测
# ============================================================
def demo_enhanced_sensors():
    """演示增强感知检测"""
    print("=" * 70)
    print("  紫鸾·万翎 场域感知增强演示")
    print("=" * 70)

    np.random.seed(42)
    history = []
    for i in range(50):
        U = 0.3 + 0.2 * np.sin(i * 0.1) + np.random.normal(0, 0.02)
        A = max(0.0, min(1.0, 0.1 + 0.1 * np.sin(i * 0.15) + np.random.normal(0, 0.01)))
        D = 0.5 + np.random.normal(0, 0.1)
        H = 0.4 * U + 0.3 * D - 0.3 * A
        H = max(0.0, min(1.0, H))

        history.append({"U": U, "A": A, "D": D, "H": H})

    print(f"\n生成了 {len(history)} 个模拟场域状态点")
    print("-" * 50)

    print("\n【1】使用 run_enhanced_detection 检测：")
    print("-" * 50)
    detected_signals = []
    for idx in range(len(history)):
        signals = run_enhanced_detection(history, idx)
        if signals:
            detected_signals.extend(signals)

    print(f"检测到 {len(detected_signals)} 个增强信号")
    for sig in detected_signals[:5]:
        print(f"  [{sig['at']}] {sig['signal']}: {sig['description']}")
    if len(detected_signals) > 5:
        print(f"  ... 还有 {len(detected_signals) - 5} 个信号")

    print("\n【2】使用 tick() 主挂接函数：")
    print("-" * 50)
    tick_results = []
    for idx in range(len(history)):
        result = tick(history, idx, extra_tags={"agent_id": "demo_agent"})
        if result["detected_signals"]:
            tick_results.append({"idx": idx, "result": result})

    print(f"tick() 返回 {len(tick_results)} 个包含信号的结果")
    for item in tick_results[:5]:
        print(f"  [{item['idx']}] 检测到: {item['result']['detected_signals']}")

    print("\n【3】使用 SelfCorrectionLogger 反思审计：")
    print("-" * 50)
    logger = SelfCorrectionLogger()
    detected_list = [sig["signal"] for sig in detected_signals]
    reference_list = ["A_INERT", "U_PEAK_REVERSAL"]
    context = {"source": "demo", "history_length": len(history)}
    log_entry = logger.log_comparison(detected_list, reference_list, context)
    print(f"  检测到: {log_entry['detected'][:5]}")
    print(f"  参考: {log_entry['reference']}")
    print(f"  漏标: {log_entry['missed']}")
    print(f"  额外: {log_entry['extra'][:3]}")

    print("\n" + "=" * 70)
    print("  演示完成！审计日志已写入 enhanced_sensor_audit.jsonl")
    print("=" * 70)


if __name__ == "__main__":
    demo_enhanced_sensors()
