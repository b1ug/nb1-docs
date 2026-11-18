# 支持与排障

[English](support.md) · [第一次亮灯](getting-started.zh-CN.md) · [安装](install.zh-CN.md)

从选定 CLI 目录开始，只读检查：

```sh
./nb1 version --json
./nb1 config path
./nb1 config show
./nb1 doctor --json
```

`doctor` 检查构建信息、daemon 健康与设备缓存，不扫描或打开 USB。包括 daemon 不可达在内，需要关注时可能退出 `1`。`config show` 只展示当前进程的解析设置，不重载运行中的 server。

## 常见情况

| 现象 | 下一步 |
| --- | --- |
| `control` 连不上 daemon | 启动 `nb1 server --devices DEVICE_SERIAL`，或明确选 `control --direct run`；不会自动启动或回退 USB。 |
| 没有设备 | 用 `nb1 list` 检查连接和原生访问；`control devices` 读取 daemon 已配置的缓存，不是新 USB 扫描。 |
| 多设备提示必须指定序列号 | v0.1.2 使用 `control run SERIAL FILE` 或设置首选目标。即将到来的 v0.1.3 才加入确定的自动选择，见[版本边界](getting-started.zh-CN.md#choose-among-several-lights)。 |
| Workbench 播放不可用 | v0.1.3 预览会在播放旁说明未就绪理由。刷新或明确选择在线目标；缺失目标会保留，不静默替换。未知 Job 应查询原 ID，不能重播。 |
| 设备忙 | 让当前拥有者释放，包括独立 WebHID 网页／扩展；不要删除活跃锁来强行访问。 |
| 端口已占用 | 查看现有 server，或同时选择新 `--listen` 与客户端 `--endpoint`。 |
| 提交超时 | 保留原 endpoint 与 Job ID，先查询原任务，不自动替换或重新播放。 |
| 服务 active 但灯不可用 | 分别检查 `service status --json`、HTTP 与设备状态；注册不等于 USB 就绪。 |

查询原 ID 与目标设备：

```sh
./nb1 control job JOB_ID
./nb1 control state DEVICE_SERIAL
```

设备 RGB 是带时间戳的缓存，不是发光测量。Job 存在内存中，重启、过期或 LRU 淘汰都可能令记录消失；记录缺失不证明没有播放。直连 Job 不能稍后向 daemon 查询。

## 正式软件与硬件证据

[nb1 v0.1.2](https://github.com/b1ug/nb1/releases/tag/v0.1.2) 固定源码 `88fc2be8326c076b6f09932054b0c8f11d89c0a0`，依赖 blink1-go v0.0.2、GID v0.0.3 与 colorkit v0.1.0，原生发行使用 Go 1.27.4。

| 范围 | 证据 |
| --- | --- |
| [五个原生目标与正式发布](https://github.com/b1ug/nb1/actions/runs/44234583008) | macOS／Linux arm64、amd64 及 Windows amd64 的 CLI／MCP help、版本、协议、系统依赖、解包与离线 daemon／HTTP 检查通过；13 个公开文件与五平台包内记录已下载核验；实际下载的 Mac CLI／MCP 版本、help 与协议检查通过，没有访问 USB。 |
| [主干测试](https://github.com/b1ug/nb1/actions/runs/44231909420)与[候选／daemon 检查](https://github.com/b1ug/nb1/actions/runs/44231909402) | 发行源码的十六项适用软件任务通过；源码和二进制身份分别记录。 |
| 预编译运行要求 | CLI／server：macOS 15.0+、Linux glibc 2.38+；MCP：macOS 13.0+ 或静态 Linux ELF。Mac 包未经过 Developer ID 公证。 |
| 实体 blink(1) | 已有限 macOS arm64／MK2／FW204 记录保留原来源、日期和限制；本次发行没有新增实体 USB／相机验证。 |

既有 Mac／MK2 记录出现过可恢复 Darwin I/O 错误。软件 CI 与标签不等于 Linux／Windows 实体 USB、MK3、重启／登录、校准颜色或准确 USB 到发光时序验收。[已记录平台证据](https://github.com/b1ug/nb1/blob/b5cfe68cbb412d81a80d948b845aee5b0aba586b/docs/daemon-validation.zh-CN.md)。

## 配置与设备归属

Mac/Linux 默认 `~/.config/nb1/config.yaml`，设置绝对 `XDG_CONFIG_HOME` 时跟随该根目录。Windows 为 `%APPDATA%\nb1\config.yaml`。`--config` 优先于 `NB1_CONFIG`。本机颜色和 Pattern 使用默认应用库或绝对 `library_dir`。

Mac 归属锁仍在 `~/Library/Application Support/nb1/device-locks`。仅切配置不会移动锁或默认库；覆盖锁目录时各控制器必须一致。本机 Pattern 与设备 RAM、Flash、上电设置分开。

Windows 已包含前台运行，未实现自动服务安装／启停／卸载。Linux 服务需要用户级 systemd manager；缺少它的容器使用前台 server。

报告问题时提供 OS／架构、已知型号／固件、`version --json`、准确命令、去敏错误及预期／实际结果。不要包含认证信息、消息正文或无关路径。[完整 API 错误与恢复](api-v1.zh-CN.md)。
