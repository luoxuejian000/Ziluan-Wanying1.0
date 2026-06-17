#!/usr/bin/env python3
"""
ThinkCheck U/D/A/H 四维轨迹分析脚本
=====================================

对测试文案进行语义漂移(U)、矛盾张力(A)、发展性(D)和场域健康度(H)的四维分析。

理论基础：晶脉哲学四重公理
- 关系本体论：U值代表核心概念在场强度
- 矛盾动力论：A值代表文本内部的矛盾张力
- 实践介入论：D值代表文本的发展性（建设性创新 vs 破坏性重复）
- 谐振调谐论：H值代表文本整体的谐振质量
"""
import re
import json
from collections import Counter
from typing import Dict, List, Tuple
import numpy as np


class ThinkCheckAnalyzer:
    """ThinkCheck 文案分析器"""
    
    def __init__(self, window_size: int = 50):
        self.window_size = window_size
        self.text = ""
        self.words = []
        self.U_values = []
        self.D_values = []
        self.A_values = []
        self.H_values = []
        self.flip_points = []
    
    def load_text(self, filepath: str):
        """加载测试文案"""
        with open(filepath, "r", encoding="utf-8") as f:
            self.text = f.read()
        self._preprocess()
    
    def _preprocess(self):
        """预处理文本"""
        self.text = self.text.lower()
        self.words = re.findall(r'[\w]+', self.text)
    
    def _compute_entropy(self, text_segment: str) -> float:
        """计算文本片段的信息熵"""
        counter = Counter(text_segment)
        total = sum(counter.values())
        if total == 0:
            return 0.0
        entropy = -sum((count/total) * np.log2(count/total) for count in counter.values())
        return entropy / np.log2(total) if total > 1 else 0.0
    
    def _compute_contradiction(self, text_segment: str) -> float:
        """计算文本片段的矛盾张力(A值)"""
        contradiction_words = {
            "но", "однако", "в то же время", "напротив", "вместо",
            "не", "нет", "отрицательно", "против", "контра",
            "да", "нет", "верно", "ошибочно",
            "хотя", "несмотря", "тем не менее", "однако"
        }
        count = sum(1 for word in contradiction_words if word in text_segment)
        return min(1.0, count / 10)
    
    def _compute_development(self, text_segment: str) -> float:
        """计算文本片段的发展性(D值)"""
        development_words = {
            "новый", "новое", "новые", "изменить", "развивать",
            "совершенствовать", "улучшить", "инновация", "прогресс",
            "добавить", "создать", "реализовать", "провести",
            "решить", "разработать", "внедрить", "оптимизировать"
        }
        regression_words = {
            "старый", "старая", "старые", "вернуться", "откатить",
            "уничтожить", "удалить", "убрать", "разрушить",
            "завершить", "остановить", "прекратить", "запретить"
        }
        dev_count = sum(1 for word in development_words if word in text_segment)
        reg_count = sum(1 for word in regression_words if word in text_segment)
        total = dev_count + reg_count
        if total == 0:
            return 0.5
        return dev_count / total
    
    def analyze(self):
        """执行四维轨迹分析"""
        if not self.words:
            return
        
        text_length = len(self.text)
        step = max(1, text_length // 100)
        
        for i in range(0, text_length - self.window_size, step):
            segment = self.text[i:i+self.window_size]
            
            entropy = self._compute_entropy(segment)
            U = 1.0 - entropy
            self.U_values.append(U)
            
            A = self._compute_contradiction(segment)
            self.A_values.append(A)
            
            D = self._compute_development(segment)
            self.D_values.append(D)
            
            H = 0.4 * U + 0.3 * D - 0.3 * A
            H = max(0.0, min(1.0, H))
            self.H_values.append(H)
        
        self._detect_flip_points()
    
    def _detect_flip_points(self):
        """检测翻转点"""
        for i in range(1, len(self.U_values)):
            if abs(self.U_values[i] - self.U_values[i-1]) > 0.3:
                self.flip_points.append(i)
    
    def generate_report(self) -> str:
        """生成分析报告"""
        if not self.U_values:
            return "无数据可分析"
        
        U_mean = np.mean(self.U_values)
        U_min = np.min(self.U_values)
        U_max = np.max(self.U_values)
        
        A_mean = np.mean(self.A_values)
        A_max = np.max(self.A_values)
        A_argmax = np.argmax(self.A_values)
        
        D_mean = np.mean(self.D_values)
        
        H_mean = np.mean(self.H_values)
        H_min = np.min(self.H_values)
        H_max = np.max(self.H_values)
        
        report = "=" * 70 + "\n"
        report += "  ThinkCheck U/D/A/H 四维轨迹分析报告\n"
        report += "=" * 70 + "\n\n"
        
        report += "【一、语义漂移分析 (U值)】\n"
        report += "-" * 50 + "\n"
        report += f"  U值范围: [{U_min:.3f}, {U_max:.3f}]\n"
        report += f"  U值均值: {U_mean:.3f}\n"
        report += f"  语义稳定性: {'高' if U_mean > 0.6 else '中' if U_mean > 0.3 else '低'}\n"
        report += "\n"
        
        report += "【二、矛盾张力分析 (A值)】\n"
        report += "-" * 50 + "\n"
        report += f"  A值范围: [0.0, {A_max:.3f}]\n"
        report += f"  A值均值: {A_mean:.3f}\n"
        report += f"  最大张力位置: 第{A_argmax}窗口\n"
        report += f"  矛盾等级: {'强烈' if A_mean > 0.5 else '中等' if A_mean > 0.2 else '微弱'}\n"
        report += "\n"
        
        report += "【三、发展性分析 (D值)】\n"
        report += "-" * 50 + "\n"
        report += f"  D值均值: {D_mean:.3f}\n"
        report += f"  发展倾向: {'建设性创新' if D_mean > 0.6 else '中性平衡' if D_mean > 0.4 else '破坏性重复'}\n"
        report += "\n"
        
        report += "【四、场域健康度分析 (H值)】\n"
        report += "-" * 50 + "\n"
        report += f"  H值范围: [{H_min:.3f}, {H_max:.3f}]\n"
        report += f"  H值均值: {H_mean:.3f}\n"
        report += f"  场域健康度: {'优秀' if H_mean > 0.7 else '良好' if H_mean > 0.5 else '一般' if H_mean > 0.3 else '较差'}\n"
        report += "\n"
        
        report += "【五、翻转点检测】\n"
        report += "-" * 50 + "\n"
        report += f"  检测到翻转点数量: {len(self.flip_points)}\n"
        if self.flip_points:
            report += f"  翻转点位置: {self.flip_points[:10]}"
            if len(self.flip_points) > 10:
                report += f"... (共{len(self.flip_points)}个)"
        else:
            report += "  未检测到显著翻转点"
        report += "\n\n"
        
        report += "【六、预警路径评估】\n"
        report += "-" * 50 + "\n"
        warnings = []
        if U_min < 0.2:
            warnings.append("⚠️ U值崩塌预警：核心概念在场强度严重衰减")
        if A_max > 0.8:
            warnings.append("⚠️ A值峰值预警：文本内部存在强烈矛盾")
        if H_min < 0.2:
            warnings.append("⚠️ H值谷底预警：场域健康度严重下降")
        
        if warnings:
            for w in warnings:
                report += f"  {w}\n"
        else:
            report += "  ✅ 所有预警路径均未命中，文本状态良好\n"
        
        report += "\n" + "=" * 70 + "\n"
        report += "  分析完成时间: 2026-06-16\n"
        report += "  分析窗口数: " + str(len(self.U_values)) + "\n"
        report += "  文本字符数: " + str(len(self.text)) + "\n"
        report += "=" * 70 + "\n"
        
        return report


def main():
    """主函数"""
    analyzer = ThinkCheckAnalyzer(window_size=100)
    analyzer.load_text("test_b_output.txt")
    analyzer.analyze()
    
    report = analyzer.generate_report()
    
    with open("test_b_pure_report.txt", "w", encoding="utf-8") as f:
        f.write(report)
    
    json_data = {
        "metadata": {
            "analysis_date": "2026-06-16",
            "text_length": len(analyzer.text),
            "window_count": len(analyzer.U_values),
            "window_size": analyzer.window_size
        },
        "metrics": {
            "U": {
                "mean": float(np.mean(analyzer.U_values)),
                "min": float(np.min(analyzer.U_values)),
                "max": float(np.max(analyzer.U_values)),
                "range": [float(np.min(analyzer.U_values)), float(np.max(analyzer.U_values))]
            },
            "A": {
                "mean": float(np.mean(analyzer.A_values)),
                "min": float(np.min(analyzer.A_values)),
                "max": float(np.max(analyzer.A_values)),
                "range": [float(np.min(analyzer.A_values)), float(np.max(analyzer.A_values))]
            },
            "D": {
                "mean": float(np.mean(analyzer.D_values)),
                "min": float(np.min(analyzer.D_values)),
                "max": float(np.max(analyzer.D_values))
            },
            "H": {
                "mean": float(np.mean(analyzer.H_values)),
                "min": float(np.min(analyzer.H_values)),
                "max": float(np.max(analyzer.H_values)),
                "range": [float(np.min(analyzer.H_values)), float(np.max(analyzer.H_values))]
            }
        },
        "flip_points": analyzer.flip_points,
        "trajectory": {
            "U": [float(v) for v in analyzer.U_values],
            "A": [float(v) for v in analyzer.A_values],
            "D": [float(v) for v in analyzer.D_values],
            "H": [float(v) for v in analyzer.H_values]
        }
    }
    
    with open("test_b_pure_multidim.json", "w", encoding="utf-8") as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)
    
    with open("test_b_pure_multidim.csv", "w", encoding="utf-8") as f:
        f.write("window,U,A,D,H\n")
        for i in range(len(analyzer.U_values)):
            f.write(f"{i},{analyzer.U_values[i]:.6f},{analyzer.A_values[i]:.6f},{analyzer.D_values[i]:.6f},{analyzer.H_values[i]:.6f}\n")
    
    print("分析完成！报告已保存到 test_b_pure_report.txt")


if __name__ == "__main__":
    main()
