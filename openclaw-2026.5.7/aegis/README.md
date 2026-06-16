# Aegis 感知子系统

基于 WiFi CSI (Channel State Information) 的环境感知与行为识别系统。

## 功能特性

- **CSI 数据采集**：支持 ESP32 和 nexmon 两种硬件平台
- **实时特征提取**：动态基线、稳定度趋势、异常检测
- **多源数据融合**：模拟、串口、UDP 三种输入模式
- **自动状态调谐**：基于谐振理论的自适应参数调整
- **四重公理引擎**：关系本体论、矛盾动力论、实践介入论、谐振调谐论

## 目录结构

```
aegis/
├── firmware/          # ESP32 固件补丁
├── src/               # Python 源代码
│   ├── __init__.py
│   ├── csi_parser.py     # CSI 数据解析器
│   ├── csi_features.py   # 特征提取器
│   ├── csi_source.py     # 数据源管理
│   ├── aegis_daemon.py   # 守护进程
│   ├── core.py           # 核心引擎
│   └── crystalmind_integration.py  # 水晶之心集成
├── requirements.txt
└── README.md
```

## 快速开始

### 安装依赖

```bash
pip install -r requirements.txt
```

### 运行示例

```bash
python demo_full_aegis.py
```

## 理论根基

### 四重公理

1. **关系本体论**：基于历史基线构建动态关系场
2. **矛盾动力论**：分析矛盾演变轨迹（一阶/二阶变化率）
3. **实践介入论**：预警包含完整证据链和可解释建议
4. **谐振调谐论**：权重根据和谐度动态平滑计算

## 硬件支持

- **ESP32**：支持 active STA 模式的 CSI 采集
- **nexmon**：支持 Broadcom 芯片的全频段 CSI 采集

## 许可证

MIT License