# ============================================================
# 仿生记忆层 (Biomimetic Memory Layer)
# 用于紫鸾·万翎物理集群的升级模块
#
# 理论根基：晶脉哲学四重公理
# - 关系本体论：记忆是场域中的引力源，不是外部标签
# - 矛盾动力论：失谐（A值升高）是唤醒记忆的驱动力
# - 实践介入论：每一次记忆唤醒都可审计
# - 谐振调谐论：记忆帮助系统更快回归稳态
#
# 严防工具理性悖论：记忆不是外部规则层，不强制覆盖
# ============================================================

import numpy as np
import time
from typing import Dict, List, Optional, Tuple, Any
from collections import deque
from dataclasses import dataclass, field
import json
import hashlib

# ============================================================
# 核心数据结构
# ============================================================

@dataclass
class MemoryVector:
    """
    记忆向量：一段关键经验的场域投影。
    不是存储原始文本，而是存储其与场域核心概念的关系向量。
    """
    vector: np.ndarray                          # 记忆的高维向量表示
    context_hash: str                            # 上下文哈希，用于去重
    core_concepts: List[str]                     # 相关核心概念
    resonance_signature: Dict[str, float]        # 谐振签名 {U, D, A, H}
    outcome: str                                 # 事件结果（成功/失败/待定）
    timestamp: float
    activation_count: int = 0                    # 被唤醒次数
    strength: float = 1.0                       # 记忆强度 (0~1)
    ttl: float = 3600.0                          # 生存时间（秒）


@dataclass
class MemoryAuditEntry:
    """记忆操作审计记录（实践介入论）"""
    action: str                                  # "store", "retrieve", "evolve", "forget"
    memory_hash: str
    reason: str
    field_state_before: Dict[str, float]
    field_state_after: Optional[Dict[str, float]]
    timestamp: float


# ============================================================
# 记忆存储库 (MemoryStore) —— 关系本体论的工程实现
# ============================================================

class MemoryStore:
    """
    记忆存储库：管理所有记忆向量及其关系网络。
    记忆不是孤立的标签，而是通过核心概念相互关联的引力源网络。
    """
    def __init__(self, max_memories: int = 10000, vector_dim: int = 384):
        self.memories: Dict[str, MemoryVector] = {}
        self.concept_index: Dict[str, List[str]] = {}  # 概念 -> 记忆ID列表
        self.max_memories = max_memories
        self.vector_dim = vector_dim
        self.audit_log: List[MemoryAuditEntry] = []

    def _encode(self, content: str) -> np.ndarray:
        """将文本编码为向量（简化版本）"""
        hash_val = int(hashlib.md5(content.encode()).hexdigest(), 16)
        np.random.seed(hash_val)
        return np.random.randn(self.vector_dim).astype(np.float32)

    def _evict_weakest(self):
        """淘汰最弱的记忆（基于强度和时间）"""
        oldest = min(self.memories.keys(), key=lambda k: 
                     self.memories[k].strength * (1.0 - (time.time() - self.memories[k].timestamp) / 3600.0))
        self._audit("forget", oldest, "内存淘汰", {}, None)
        # 从概念索引中移除
        for concept in self.memories[oldest].core_concepts:
            if concept in self.concept_index:
                self.concept_index[concept].remove(oldest)
                if not self.concept_index[concept]:
                    del self.concept_index[concept]
        del self.memories[oldest]

    def _audit(self, action: str, memory_hash: str, reason: str, 
               before: Dict[str, float], after: Optional[Dict[str, float]]):
        """记录审计日志"""
        entry = MemoryAuditEntry(
            action=action,
            memory_hash=memory_hash,
            reason=reason,
            field_state_before=before,
            field_state_after=after,
            timestamp=time.time()
        )
        self.audit_log.append(entry)
        # 保留最近1000条审计记录
        if len(self.audit_log) > 1000:
            self.audit_log.pop(0)

    def store(self, content: str, core_concepts: List[str],
              field_state: Dict[str, float], outcome: str = "pending") -> Optional[str]:
        """
        存储一段记忆。记忆被编码为向量，并与核心概念建立关系。
        如果已存在相似记忆，则强化而非重复存储（关系本体论：同一性由关系界定）。
        """
        context_hash = hashlib.md5(content.encode()).hexdigest()[:16]

        if context_hash in self.memories:
            existing = self.memories[context_hash]
            existing.strength = min(1.0, existing.strength + 0.1)
            existing.activation_count += 1
            existing.ttl = max(existing.ttl, 3600.0)
            self._audit("reinforce", context_hash,
                        f"强化已有记忆: {core_concepts[:3]}", field_state, None)
            return context_hash

        vector = self._encode(content)

        resonance_signature = {
            "U": field_state.get("U", 0.5),
            "D": field_state.get("D", 0.0),
            "A": field_state.get("A", 0.0),
            "H": field_state.get("H", 0.5)
        }

        memory = MemoryVector(
            vector=vector,
            context_hash=context_hash,
            core_concepts=core_concepts,
            resonance_signature=resonance_signature,
            outcome=outcome,
            timestamp=time.time()
        )

        self.memories[context_hash] = memory

        for concept in core_concepts:
            if concept not in self.concept_index:
                self.concept_index[concept] = []
            self.concept_index[concept].append(context_hash)

        if len(self.memories) > self.max_memories:
            self._evict_weakest()

        self._audit("store", context_hash,
                    f"存储新记忆: {core_concepts[:3]}", field_state, None)
        return context_hash

    def retrieve(self, query_concepts: List[str], current_field: Dict[str, float],
                 top_k: int = 5) -> List[Tuple[MemoryVector, float]]:
        """
        根据当前场域状态和查询概念，检索最相关的记忆。
        记忆不是被"读取"的，而是被"唤醒"的——只有与当前场域共享概念的
        记忆才会被检索（关系本体论：同一性由关系界定）。
        """
        candidates = set()
        for concept in query_concepts:
            if concept in self.concept_index:
                candidates.update(self.concept_index[concept])

        if not candidates:
            self._audit("retrieve", "none",
                        f"无相关记忆: {query_concepts[:3]}", current_field, None)
            return []

        scored = []
        current_vector = self._encode(" ".join(query_concepts))
        current_U = current_field.get("U", 0.5)
        current_A = current_field.get("A", 0.0)

        for mem_hash in candidates:
            memory = self.memories[mem_hash]
            sim = np.dot(current_vector, memory.vector) / (
                np.linalg.norm(current_vector) * np.linalg.norm(memory.vector) + 1e-8
            )
            resonance_match = 1.0 - abs(current_U - memory.resonance_signature["U"])
            contradiction_drive = current_A * 0.5
            strength_bonus = memory.strength

            score = (0.4 * sim + 0.3 * resonance_match +
                     0.2 * contradiction_drive + 0.1 * strength_bonus)
            scored.append((memory, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        
        results = []
        for memory, score in scored[:top_k]:
            memory.activation_count += 1
            memory.strength = min(1.0, memory.strength + 0.02)
            results.append((memory, score))

        if results:
            self._audit("retrieve", results[0][0].context_hash,
                        f"唤醒记忆: {query_concepts[:3]}", current_field, None)

        return results

    def evolve(self, memory_hash: str, new_outcome: str, new_field_state: Dict[str, float]):
        """
        进化记忆：根据新结果更新记忆的结果状态。
        这是记忆"学习"的核心机制——不是替换旧记忆，而是让它进化。
        """
        if memory_hash not in self.memories:
            return

        memory = self.memories[memory_hash]
        old_outcome = memory.outcome
        memory.outcome = new_outcome
        memory.strength = min(1.0, memory.strength + 0.15)

        self._audit("evolve", memory_hash,
                    f"记忆进化: {old_outcome} -> {new_outcome}", {}, new_field_state)

    def get_audit_log(self, limit: int = 50) -> List[MemoryAuditEntry]:
        """获取审计日志（实践介入论）"""
        return list(reversed(self.audit_log[-limit:]))


# ============================================================
# 记忆唤醒器 (MemoryAwakener) —— 矛盾动力论的工程实现
# ============================================================

class MemoryAwakener:
    """
    记忆唤醒器：根据当前场域状态决定何时唤醒记忆。
    核心逻辑：当矛盾张力（A值）升高时，自动唤醒相关记忆。
    """
    def __init__(self, memory_store: MemoryStore):
        self.memory_store = memory_store
        self.recent_concepts = deque(maxlen=50)
        self.last_wake_time = 0.0
        self.wake_cooldown = 2.0  # 唤醒冷却时间

    def observe_concepts(self, concepts: List[str]):
        """观察当前场域中的核心概念"""
        self.recent_concepts.extend(concepts)

    def should_wake(self, field_state: Dict[str, float]) -> bool:
        """判断是否应该唤醒记忆（矛盾动力论）"""
        A = field_state.get("A", 0.0)
        dA = field_state.get("dA", 0.0)
        
        # 当矛盾张力升高且超过阈值时，唤醒记忆
        if A > 0.3 and dA > 0.01:
            if time.time() - self.last_wake_time > self.wake_cooldown:
                return True
        return False

    def wake(self, field_state: Dict[str, float]) -> List[Tuple[MemoryVector, float]]:
        """唤醒相关记忆"""
        if not self.should_wake(field_state):
            return []

        self.last_wake_time = time.time()
        query_concepts = list(set(self.recent_concepts))[-10:]
        
        if not query_concepts:
            return []

        memories = self.memory_store.retrieve(query_concepts, field_state, top_k=3)
        
        if memories:
            field_state["memory_awakened"] = len(memories)
            # 谐振调谐论：记忆帮助系统回归稳态
            for mem, _ in memories:
                if mem.outcome == "success":
                    field_state["H"] = min(1.0, field_state.get("H", 0.5) + 0.05)

        return memories


# ============================================================
# 记忆融合器 (MemoryIntegrator) —— 谐振调谐论的工程实现
# ============================================================

class MemoryIntegrator:
    """
    记忆融合器：将唤醒的记忆融合到场域决策中。
    关键特性：记忆不直接给出答案，而是作为场域状态的调制因子。
    """
    def __init__(self):
        self.influence_history = deque(maxlen=20)

    def integrate(self, memories: List[Tuple[MemoryVector, float]],
                  field_state: Dict[str, float]) -> Dict[str, float]:
        """
        将记忆融合到场域状态中。
        记忆不强制改变决策，而是通过调谐权重来影响系统。
        """
        if not memories:
            return field_state

        # 计算记忆影响
        total_influence = 0.0
        for memory, score in memories:
            if memory.outcome == "success":
                # 成功记忆增加和谐度
                field_state["H"] = min(1.0, field_state.get("H", 0.5) + score * 0.08)
                field_state["A"] = max(0.0, field_state.get("A", 0.0) - score * 0.05)
                total_influence += score

        if total_influence > 0:
            self.influence_history.append(total_influence)

        return field_state


# ============================================================
# 仿生记忆系统 (BiomimeticMemorySystem) —— 完整集成
# ============================================================

class BiomimeticMemorySystem:
    """
    仿生记忆系统：将所有组件整合为一个完整的记忆系统。
    这是紫鸾·万翎物理集群的记忆核心。
    """
    def __init__(self):
        self.store = MemoryStore()
        self.awakener = MemoryAwakener(self.store)
        self.integrator = MemoryIntegrator()

    def observe(self, concepts: List[str], field_state: Dict[str, float]):
        """观察场域状态"""
        self.awakener.observe_concepts(concepts)

    def store_memory(self, content: str, core_concepts: List[str],
                     field_state: Dict[str, float], outcome: str = "pending"):
        """存储记忆"""
        return self.store.store(content, core_concepts, field_state, outcome)

    def process(self, field_state: Dict[str, float]) -> Dict[str, float]:
        """
        完整的记忆处理流程：
        1. 检查是否需要唤醒记忆（矛盾动力论）
        2. 唤醒相关记忆（关系本体论）
        3. 将记忆融合到场域中（谐振调谐论）
        4. 记录审计日志（实践介入论）
        """
        # 检查是否需要唤醒记忆
        if self.awakener.should_wake(field_state):
            memories = self.awakener.wake(field_state)
            if memories:
                field_state = self.integrator.integrate(memories, field_state)
                field_state["memory_active"] = True
            else:
                field_state["memory_active"] = False
        else:
            field_state["memory_active"] = False

        return field_state

    def get_diagnostics(self) -> Dict[str, Any]:
        """获取系统诊断信息"""
        return {
            "memory_count": len(self.store.memories),
            "concept_count": len(self.store.concept_index),
            "audit_entries": len(self.store.audit_log),
            "influence_history": list(self.integrator.influence_history)
        }

    def save_state(self, filepath: str):
        """保存记忆状态"""
        state = {
            "memories": {k: {
                "vector": v.vector.tolist(),
                "context_hash": v.context_hash,
                "core_concepts": v.core_concepts,
                "resonance_signature": v.resonance_signature,
                "outcome": v.outcome,
                "timestamp": v.timestamp,
                "activation_count": v.activation_count,
                "strength": v.strength,
                "ttl": v.ttl
            } for k, v in self.store.memories.items()},
            "concept_index": self.store.concept_index,
            "saved_at": time.time()
        }
        with open(filepath, "w") as f:
            json.dump(state, f)

    def load_state(self, filepath: str):
        """加载记忆状态"""
        with open(filepath, "r") as f:
            state = json.load(f)
        
        self.store.memories = {}
        for k, v in state["memories"].items():
            self.store.memories[k] = MemoryVector(
                vector=np.array(v["vector"], dtype=np.float32),
                context_hash=v["context_hash"],
                core_concepts=v["core_concepts"],
                resonance_signature=v["resonance_signature"],
                outcome=v["outcome"],
                timestamp=v["timestamp"],
                activation_count=v["activation_count"],
                strength=v["strength"],
                ttl=v["ttl"]
            )
        self.store.concept_index = state["concept_index"]
