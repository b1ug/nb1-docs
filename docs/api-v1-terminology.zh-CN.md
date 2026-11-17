# API v1 术语

[English](api-v1-terminology.md)

本页对应核心提交 `2c9742550f44a01b4ba0d2d2adc70f26ac8f3484` 的英文术语表；其内容与 `ff91e16fec91a219a0f54c14c0065492a078375c` 快照相同。以下名称在 API schema、CLI 帮助、文档、示例与 Web 文案中保持英文，解释文字译为中文。

| 名称 | 含义 |
| --- | --- |
| Action | 由核心编译的具名灯光意图。 |
| Sequence | 一组有序的 Step，采用 serial 或 interval 时序。 |
| Step | 按顺序排列的 LED 目标、渐变时长，以及一条时序规则。 |
| Job | 一次已受理的执行，包含 ID、进度与终态。 |
| Pattern | 保存在本机、可重复使用的 Sequence。 |
| DeviceSequence | 使用设备原生内存格式表示的序列。 |

Action 种类为 `set`、`off`、`fade`、`blink`、`breathe`、`pulse`、`alternate`、`orbit`、`rainbow`。

自动生成的 Job ID 是 `j_` 加十个随机 Crockford Base32 字符。省略 ID 或传入空值，都表示请求生成。去重记录覆盖整个活动 Job；终态记录从完成时刻起采用可配置的软 TTL，并受可配置的 LRU 容量约束，默认三十分钟、16,384 条。在 daemon 启动时，配置文件的 `jobs.terminal_ttl`／`jobs.terminal_limit`，以及服务参数 `--job-cache-ttl`／`--job-cache-size` 决定这些值。LRU 压力或重启可能让记录提前消失，所以 TTL 不保证一个完整的去重窗口。查询、匹配的重复提交、终态取消操作会更新 LRU 顺序，但不会延长最初过期时间。过期或淘汰后，同一 ID 可以再次被接受。这些记录属于正在运行的 daemon 进程。

显式 `control --direct run` 也通过同一核心执行 Job，但 ID 只属于该前台进程。每次调用都是新播放。Direct 拒绝 `--id`，不会创建供后续查询或去重的 daemon 保留记录。

具体字段与当前实现范围见 [API v1 中文规范](api-v1.zh-CN.md)。
