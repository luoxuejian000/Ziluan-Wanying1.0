import sys
sys.path.insert(0, '.')
from memory.biomimetic import BiomimeticMemoryLayer

memory = BiomimeticMemoryLayer()

report_path = "../thinkcheck-agent-v6/test_b_pure_report.txt"
with open(report_path, "r", encoding="utf-8") as f:
    report_text = f.read()

key_metrics = {
    "U_range": "[0.256, 0.405]",
    "A_range": "[0.0, 0.400]",
    "flip_step": 0,
    "H_driven_by": "D"
}

memory.store_memory(
    content=report_text[:500],
    core_concepts=["文案分析", "U/D/A/H", "翻转点", "语义漂移"],
    field_state={"U": 0.343, "D": 0.515, "A": 0.156, "H": 0.245},
    outcome="success"
)

print("分析结果已存入仿生记忆层。")
print("当前记忆数:", len(memory.store.memories))
print("当前概念数:", len(memory.store.concept_index))
