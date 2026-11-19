# API v1 实现 {#api-v1-implementation}

[English](api-v1.md)

本页对应 nb1 v0.1.3 的 HTTP API。程序返回的标识、错误及 JSON 字段保持英文。[变更记录](changelog.zh-CN.md)

本版有 19 个 HTTP 操作，覆盖设备控制、内容库、Trigger 路由与诊断。内嵌工作台使用同一 daemon。

[OpenAPI 3.1 规范](https://github.com/b1ug/nb1/blob/48895be5babc11d6f3b2a7ab16e316bd564e726e/docs/api-v1.openapi.json)描述当前 HTTP 操作、请求与响应 schema、约束和软件测试样例。`resolve` 是合法的本地颜色名，因此它有明确的 PUT 操作，与 POST 颜色解析操作并存。

## 用户配置 {#user-configuration}

在 macOS 和 Linux 上，配置文件为 `$XDG_CONFIG_HOME/nb1/config.yaml`。`XDG_CONFIG_HOME` 为空或未设置时，使用 `~/.config/nb1/config.yaml`。非空 XDG 根目录必须是绝对路径；相对值会报错。Windows 保留其原生用户配置位置，通常为 `%APPDATA%\nb1\config.yaml`，选择此位置时不使用 XDG。配置文件的选择优先级依次为 `--config`、`NB1_CONFIG`、默认配置路径。可选的默认配置文件不存在时，仍可使用既有的 `setting.yaml` 查找路径。显式指定的文件缺失或无效时会报错。

```sh
nb1 config path
nb1 config init
nb1 config show
```

`config init` 在选定的配置路径创建私有模板，拒绝覆盖已有文件。在该配置文件创建之前，`config path` 和 `config show` 可能会报告既有的 `setting.yaml` 回退来源。模板中为空的 `device` 和 `server.devices` 把设备选择留给用户。这些命令不会枚举 USB，也不会启动 daemon。`config show` 展示从所选文件、默认值与环境解析出的设置，包括 `NB1_DEVICE`、`NB1_PORT` 和 `NB1_LIBRARY_DIR`；它不检查或重新加载正在运行的 daemon。

默认仅在回环地址监听。启用远程访问时，在独立 HTTPS listener 配置证书、密钥与 Bearer token；同一 listener 可提供 `/v1` 和 `/mcp`。本机可另配 `server.local_token_file`。[配置示例](remote-access.zh-CN.md)

```yaml
device: ""
server:
  devices: []
  listen: "127.0.0.1:5885"
jobs:
  terminal_limit: 16384
  terminal_ttl: 30m
library_dir: ""
```

`device` 是空字符串，或用引号包住的八位十六进制序列号。`server.devices` 是由这类字符串组成的显式列表。`jobs.terminal_limit` 必须是正整数，`jobs.terminal_ttl` 必须是正时长，例如 `30m` 或 `1h`。这些默认值都可以由用户调整。`library_dir` 为空时，在默认配置文件所属的应用根目录下选择 `library`；在 macOS/Linux 上，这也包括选定的 XDG 根目录。自定义库路径必须是绝对路径。

切换配置文件不会改变应用的默认存储基址。设备归属锁继续使用既定的原生系统策略，即 `os.UserConfigDir()/nb1/device-locks`。在 macOS 上，它是 `~/Library/Application Support/nb1/device-locks`，与 XDG 配置文件及库分开。保留这一协调目录，使控制器能够共享默认设备租约。显式覆盖锁目录时，访问该设备的所有控制器必须使用同一目录。配置与库文件会留在原位置，除非用户明确选择其他位置；这个路径策略不执行文件迁移。

## Action 与 Sequence {#actions-and-sequences}

Action 描述意图，Sequence 精确指定目标与时序。二者使用同一执行核心，但默认结束行为不同：`set`、`off`、`fade` 总是保持最终输出；原始 Sequence 默认使用 `on_finish: "off"`。

从视觉意图理解，Set 是设色，Off 是熄灯，Fade 是渐变，Blink 是闪烁，Breathe 是呼吸，Pulse 是脉冲，Alternate 是交替，Orbit 是环绕，Rainbow 是彩虹。这些中文释义便于理解和查找效果；实际 API 仍只接受下表规定的小写 kind 值。

### Action 字段 {#action-fields}

`kind` 为必填项，只接受下表中的九个小写名称。每一行列出该 Action 的全部专属字段。属于其他 Action 的字段会被拒绝，即使值为零也不例外。例如，`off` 不接受 `color`，`set` 不接受 `cycles` 或 `on_finish`。

| 字段 | 必填性／省略行为 | 可接受值 |
| --- | --- | --- |
| `kind` | 必填。 | `set`、`off`、`fade`、`blink`、`breathe`、`pulse`、`alternate`、`orbit`、`rainbow`。 |
| `led` | 可选，默认 `0`；除 `alternate`、`orbit` 外，每种 Action 均可使用。 | 整数 `0` 代表全部输出，`1` 或 `2` 代表一个物理通道。 |
| `color` | `set`、`fade`、`blink`、`breathe`、`pulse` 必填。 | 一个 ColorInput，定义见下文。 |
| `colors` | `alternate`、`orbit` 必填。 | 恰好两个 ColorInput；没有默认配色。 |
| `leds` | `alternate`、`orbit` 可选，默认 `[1,2]`。 | 只接受 `[1,2]` 或 `[2,1]`；顺序决定两个颜色的分配。 |
| `cycles` | 六种有限重复效果可选，默认 `1`。 | 正整数，另受编译后的 Step 数和 24 小时预算限制。不支持无限重复。 |
| `on_finish` | 上述重复效果可选，默认 `"off"`。 | `"off"` 或 `"hold"`；`""` 无效。`set`、`off`、`fade` 不接受此字段，它们总是保持最终输出。 |

所有 Action 时长均使用整数毫秒。JSON 数字应采用非负整数写法，不接受字符串、正负号、小数点或指数。渐变时长使用 10ms 单位；除非明确说明，周期或保持时长不必是 10 的倍数。

| Action | 除 `kind` 外的必填项 | 时序字段：省略默认值；含端点范围 | 每周期编译 Step 数／最大 `cycles` |
| --- | --- | --- | --- |
| `set` | `color` | 无时序字段。立即更新一次，然后保持。 | 1／不接受 |
| `off` | 无 | 无时序字段。把选定输出设为黑色，然后保持。此操作不会取消另一个 Job。 | 1／不接受 |
| `fade` | `color`、`duration_ms` | `duration_ms`：必填，10–600,000，且为 10 的倍数。从设备当前颜色开始，最后保持目标色。 | 1／不接受 |
| `blink` | `color` | `on_ms`：250；10–3,600,010。`off_ms`：250；范围相同。二者均已包括每次更新的 10ms 预留时间。 | 2／512 |
| `breathe` | `color` | `period_ms`：2,000；330–9,600,314。对称包络，当前由 16 次渐变加初始黑色 Step 构成。 | 17／60 |
| `pulse` | `color` | `attack_ms`：60；10–600,000，且为 10 的倍数。`decay_ms`：240；范围与单位相同。`rest_ms`：700；0–3,600,000。 | 3／341 |
| `alternate` | `colors` | `period_ms`：2,000；40–7,200,040。两色通过四次有序的立即写入交换分配。 | 4／256 |
| `orbit` | `colors` | `period_ms`：3,000；200–2,400,000。四组成对渐变，亮度错相变化；使用 interval 时序。 | 4／256 |
| `rainbow` | 无 | `period_ms`：3,000；150–4,200,143。依次经过七个固定锚点，再返回红色。 | 8／128 |

表中每行的周期最大值是额外上限，并不表示每种时长组合都能满足预算。任何编译后的 Action 还必须满足最多 1,024 个实际执行 Step，以及 86,400,000ms 的标称总时长。Rainbow 的七个锚点为 `#ff0000`、`#ffa500`、`#ffff00`、`#00ff00`、`#0000ff`、`#4b0082`、`#8f00ff`；第八个 Step 返回首色。可以预览编译计划，检查取整后的渐变时长和更新预留时间。

### ColorInput {#colorinput}

ColorInput 是创作时使用的颜色值，适用于 Action 的 `color`／`colors`、Sequence Target 的 `color`（包括 `initial` 和 `steps`），以及颜色解析与保存。省略颜色不会选取默认色。

| 形式 | 示例 | 规则 |
| --- | --- | --- |
| 颜色名称 | `"rebeccapurple"` | 148 个固定、不透明的 CSS 颜色名之一。ASCII 大小写不敏感；首尾 ASCII 空白会被去除。不支持 `transparent` 和 `currentColor`。 |
| Hex | `"#369"`、`"#336699"` | `#` 后必须恰好有三位或六位十六进制数字，大小写不敏感。首尾 ASCII 空白会被去除。不接受 alpha，也不接受没有 `#` 的裸十六进制值。 |
| RGB8 | `{"space":"rgb8","r":32,"g":96,"b":128}` | 恰好这四个字段，全部必填。通道值为 0–255 的整数。 |
| HSV／HSB | `{"space":"hsv","h_deg":210,"s_pct":75,"v_pct":50}` | 恰好这四个字段，全部必填。`h_deg`：含端点的 0–360，360 等同于 0。`s_pct`、`v_pct`：含端点的 0–100。HSB 使用相同的 `hsv` 传输形式；不接受 `space:"hsb"`。 |
| 本地别名 | `"@status-ok"` | `@` 后为精确的小写名称，匹配 `[a-z][a-z0-9-]{0,31}`；不允许首尾空白。需要可读的本地库，且该颜色已经保存。 |

RGB8 通道不接受小数点、正负号或指数写法。HSV 通道接受普通非负十进制数字，最多六位小数，不接受正负号或指数。HSV 转换会将最终各 RGB8 通道四舍五入到最近整数，恰好一半时向上取整。对象中的通道没有默认值。数组、`rgb(...)` 等 CSS 函数字符串、HSL 和 alpha 不属于这套语法。

每个 ColorInput 最多占 4,096 个编码后的 JSON 字节。普通颜色字符串在去除首尾空白之前，最多为 64 个解码后的字节。解析结果是精确、小写的 `#rrggbb`，不会额外执行主机 gamma 修正或光学校准。别名不存在属于无效颜色（`400 invalid_request`）；库不可用或不可读则返回 `503 unavailable`。

### Sequence 与 Step 字段 {#sequence-and-step-fields}

Sequence 描述主机端的低层计划。创作时，Target 颜色接受与 Action 相同的 ColorInput：Hex3／Hex6、名称、RGB8／HSV 对象和本地别名。核心会在预览、播放或保存 Pattern 前完成解析。规范化响应与保存的 Pattern 只包含精确的小写 Hex6 颜色，以固定已经解析的值。

| Sequence 字段 | 必填性／省略行为 | 可接受值 |
| --- | --- | --- |
| `timing` | 必填。 | `"serial"` 或 `"interval"`。 |
| `steps` | 必填。 | 按执行顺序排列的 1–1,024 个 Step 对象；`[]` 无效。 |
| `initial` | `interval` 必填；`serial` 禁止，空数组也不例外。 | 一个或两个 Target 对象，物理 `led` 值为互不重复的 `1`／`2`。在全部重复开始之前只应用一次。 |
| `repeat` | 可选，默认 `1`。 | 正整数，满足 `len(steps) * repeat <= 1024`；显式 `0` 无效。 |
| `on_finish` | 可选，默认 `"off"`。 | `"off"` 或 `"hold"`；空字符串无效。 |

| Step／Target 字段 | 必填性／省略行为 | 可接受值 |
| --- | --- | --- |
| Step `targets` | 必填。 | Serial：恰好一个 Target。Interval：数量和 LED 顺序必须与 `initial` 相同。 |
| Step `fade_ms` | 可选，默认 `0`。 | 整数 0–600,000，且为 10 的倍数。零值通过兼容的 fade 命令选择立即更新。 |
| Step `hold_ms` | 仅 serial 可用；可选，默认 `0`。interval Step 禁止，`0` 也不例外。 | 整数 0–3,600,000。 |
| Step `interval_ms` | interval Step 必填；serial Step 禁止。 | 整数 50–600,000，且不小于 `fade_ms`。 |
| Target `led` | 必填，选择全部输出时也不可省略。 | Serial：`0`、`1` 或 `2`。Interval／initial：`1` 或 `2`，不可重复。不接受字符串选择器。 |
| Target `color` | 必填。 | 上文定义的一个 ColorInput。例如，`"#abc"` 变为 `"#aabbcc"`，`"red"` 变为 `"#ff0000"`。规范化输出始终为小写 Hex6。 |

上述所有时序、重复次数和 LED 字段都使用整数 JSON 数字，不使用带引号的数字、小数或指数写法。ColorInput 的通道数字遵循前述独立规则。整个计划必须满足最多 1,024 个执行 Step 和 24 小时标称预算。不支持无边界或隐含无限的 Sequence。

Serial 标称时长为 `repeat * sum(fade_ms + hold_ms + 10)`。Interval 标称时长包括 `10ms * len(initial)`、重复的间隔，以及可能需要的最终稳定预留时间。默认 Pulse 展开后为 1,030ms；一个默认 Orbit 周期包含 3,000ms 的间隔及 40ms 初始／结束预留时间，总计 3,040ms。

这些是主机调度预算，不是光学截止时间。原生 I/O、定时器迟到、观测和清理都可能延长实际经过时间。Interval 中的目标写入按设备更新间距有序执行，并非同时发生；间隔迟到也不会触发一串突发补写。主机 Sequence 不会上传 DeviceSequence 或写入设备 Flash。

创建一个只包含一个 Action 或 Sequence 的输入文件，例如 `{"action":{"kind":"pulse","color":"lime","cycles":2}}`，可直接用 CLI 播放；预览可选。

```sh
nb1 control --endpoint http://127.0.0.1:5885 run action.json --wait
nb1 control --endpoint http://127.0.0.1:5885 state
nb1 control --endpoint http://127.0.0.1:5885 job j_7K3XJNY9ZM
nb1 control --endpoint http://127.0.0.1:5885 cancel j_7K3XJNY9ZM --wait
```

需要检查编译结果而不播放时，可单独使用 `nb1 control preview action.json`。

`control run [SERIAL] FILE` 和 `control state [SERIAL]` 的设备选择优先级依次为：显式位置参数序列号、根命令 `--device`、`NB1_DEVICE`、配置文件 `device`。明确或首选的目标即使离线、缺失也会保留；提交失败或结果未知都不会改选其他设备。

使用 `control run FILE --daemon-default` 可以显式委托 daemon 选择目标。HTTP 与 MCP 播放请求省略 `serial` 时也使用 daemon 路由。[设备选择及绑定顺序](trigger-routing.zh-CN.md)

均未指定目标时，v0.1.3 把 daemon 缓存中的已配置设备按序列号的字节序升序排列，选择第一只 `connection: "online"` 的设备。没有在线设备时，选择第一只已配置序列号，使 `state` 显示该目标状态、`run` 返回该目标的真实错误。空列表报错；未知或缺失连接状态不算在线。存在活动 Job 不会把在线设备排除在选择之外。

配置了多只设备时，自动选择会向 stderr 写一条英文提示，包含数量、所选序列号和覆盖方法；stdout 保持原 JSON。每次调用只选择一次。之后出现 `device_busy`、目标缺失／离线或结果未知，都不会转向另一只灯或重新提交。此查找不枚举 USB、不启动 daemon、不保存新偏好，也不转为直接访问。`control devices` 仍列出 daemon 已配置的设备，不表示每只都在线。

`control preview FILE` 默认省略 `serial`，即使配置文件含有首选设备也如此。需要选定设备的缓存能力检查时，显式添加 `--serial SERIAL`。

## daemon 选择与连接失败 {#daemon-selection-and-connection-failures}

默认情况下，`control` 调用选定的本机回环 daemon，不会启动 daemon 或静默回退到 USB。连接失败时，会提示如何显式执行 `nb1 server --devices SERIAL --listen HOST:PORT` 启动服务、用 `nb1 service start` 启动已经安装的用户服务，或使用独立基础命令 `nb1 --device SERIAL read state` 直接检查 USB。

在设备和端点已知时，提示会使用实际请求的值。提交响应丢失后，仍会保留原 Job ID 与查询命令；这不等于 daemon 从未收到请求。不进行自动重新提交。若要进行一次新的前台 Action／Sequence 播放，应显式选择 `control --direct run`；它不会重放结果不确定的 daemon 提交。

## HTTP 操作 {#http-operations}

下表为当前运行时的 API v1 路由。成功响应体直接使用下文描述的值，不再套一层 `result` 包装。它们使用 JSON，并设置 `Cache-Control: no-store`。预览会编译并按需检查缓存能力，绝不启动播放。

### 通用请求规则 {#common-request-rules}

- 带请求体的操作必须使用 `Content-Type: application/json`；接受 `charset=utf-8` 等媒体类型参数。整个请求体连同空白最多 1,048,576 字节。每个内嵌 ColorInput 还有更小的 4,096 字节上限。
- 发送一个有效的 Unicode JSON 对象。未知键、重复键、大小写不正确的键、尾随值、超过 64 层的嵌套，以及任意位置显式出现的 `null` 都会被拒绝。省略可选字段才能使用文档指定的默认值；`null` 不表示省略。
- 空值不是通用默认值。`id: ""` 请求生成 Job ID；`title: ""` 清空 Pattern 标题。空的 `serial`、`pattern_id`、`color`、`timing`、`on_finish`，以及必填目标／Step 的空数组都无效。
- 除 Job 取消可使用 `serial` 外，预览、Job、设备和库路由拒绝查询参数，单独尾随的 `?` 也不例外。Job 查询／取消及设备／库 GET 路由不接受请求体，连 `{}` 或分块传输的请求体也不接受。没有请求体时无需 `Content-Type`。共享的 `/healthz`、`/v1/transport-metrics` 处理器目前只检查方法，不检查请求体／查询值；客户端两者都不应发送。
- 本机 listener 使用回环 Host。若存在浏览器 `Origin`，它必须与请求 scheme 和精确的 Host／端口匹配。没有 Origin 时接受非浏览器客户端；其他浏览器来源，包括 `Origin: null`，均被拒绝。跨机连接可显式配置独立的 HTTPS listener。

- 远程 HTTPS listener 上，发送 `Authorization: Bearer <token>` 并使用配置的 Host 与端口。浏览器提供的 Origin 必须与其 HTTPS 来源一致。远程设备状态可读 `GET /v1/devices`。仅本机提供 `/healthz`、`/v1/presence`、`/v1/service-status` 和 `/demo/`。
- 本机 presence 与 service-status 诊断也支持 `https://b1ug.github.io` 及 HTTP/HTTPS 回环来源。WebHID 首先读取 presence 标识，然后按同一端口读取状态摘要。configured 是配置的设备数，online 是缓存在线的设备数，0 为已知结果；`devices: null` 代表计数不可用。浏览器可能要求本地网络权限。计数说明 daemon 的缓存状态；它不能识别某个具体设备是否被占用。
- 启用 `server.local_token_file` 时，本机 `/healthz` 和 `/v1/presence` 仍可无 token 访问，`/v1/service-status` 及其他 API 需 token，内嵌调试器返回 `403 workbench_unavailable`。WebHID 可提示检测到 nb1，设备数未知。

### 请求与成功状态 {#requests-and-success-statuses}

| 请求 | 必填输入 | 可选输入／省略默认值 | 成功响应 |
| --- | --- | --- | --- |
| `POST /v1/preview` | `action`、`sequence`、`pattern_id` 三者中恰好一个。 | `serial`：省略表示仅编译，不检查设备。 | `200`，Preview 对象。 |
| `POST /v1/jobs` | `action`、`sequence`、`pattern_id`、`trigger` 四选一。 | 省略 `serial` 使用 daemon 路由；省略 `id` 或传 `""` 生成 ID。 | 新受理为 `202`，匹配的重放为 `200`。返回 Job 及 `Location: /v1/jobs/{id}`。 |
| `GET /v1/jobs/{id}` | 路径中的 Job ID；无请求体。 | 无。 | `200`，Job 对象，包括该 Job 已失败的情形。 |
| `POST /v1/jobs/{id}/cancel` | 路径中提供 Job ID，无请求体。 | 可选查询参数 `serial` 必须匹配已受理 Job 的设备；省略只按 ID 取消。 | 取消中为 `202`，已终止或执行前已取消为 `200`。返回当前 Job。 |
| `POST /v1/colors/resolve` | `color`：一个 ColorInput。 | 无。 | `200`，`{"color":"#rrggbb"}`。不保存或播放。 |
| `GET /v1/colors` | 无请求体。 | 无。 | `200`，Color 记录数组；空库返回 `[]`。 |
| `PUT /v1/colors/{name}` | 路径中的颜色名，以及请求体中的 `color`：一个 ColorInput。 | 无。 | `200`，保存后的 Color 记录；创建与替换均如此。 |
| `GET /v1/patterns` | 无请求体。 | 无。 | `200`，`{id,title?}` 摘要数组，不包含 Sequence 内容。空库返回 `[]`。 |
| `GET /v1/patterns/{id}` | 路径中的 Pattern ID；无请求体。 | 无。 | `200`，完整 Pattern 记录。 |
| `PUT /v1/patterns/{id}` | 路径中的 Pattern ID，以及请求体中 `action` 或 `sequence` 恰好一个。 | `title`：省略或 `""` 均表示无标题，并替换原标题。 | `200`，完整保存的 Pattern；创建与替换均如此。不播放。 |
| `GET /v1/triggers` | 无请求体或查询。 | 无。 | `200`，有序映射数组，文件不存在时为空。 |
| `GET /v1/triggers/check` | 无请求体或查询。 | 无。 | `200`，`{"items":[...]}` 按项记录 Pattern、设备绑定诊断。 |
| `GET /v1/presence` | 无。 | 无。 | `200`，固定服务标识 `{"service":"nb1","api_version":"v1"}`。 |
| `GET /v1/service-status` | 无。 | 无。 | `200`，返回 `service`、`api_version`、`health`，以及包含 `configured`、`online` 的 `devices` 对象。无法获取设备数时该字段为 `null`。 |
| `GET /v1/devices` | 无请求体。 | 无。 | `200`，按序列号排序的已配置设备状态；没有配置设备时为 `[]`。不发现 USB。 |
| `GET /v1/devices/{serial}` | 路径中的已配置序列号；无请求体。 | 无。 | `200`，一个缓存的 Device 对象。没有匹配序列号时返回 `404`。 |
| `GET /healthz` | 无字段。 | 无。 | `200`，`{"status":"ok","api_version":"v1"}`。HTTP 健康不代表设备可用。 |
| `GET /v1/transport-metrics` | 无字段。 | 无。 | `200`，TransportMetric 数组；没有计数器时为 `[]`。 |

每项操作均不接受表中未列出的请求体字段。例如，Pattern PUT 不接受请求体 `id` 或 `pattern_id`；Color PUT 不接受请求体 `name`。`PUT /v1/colors/resolve` 保存名为 `resolve` 的合法颜色；同一路径上的 `POST` 则只解析颜色，不保存。

Job ID 与 Pattern ID 为大小写敏感的字符串，包含 1–64 个 ASCII 字母、数字、连字符或下划线。本地颜色名大小写敏感，必须是匹配 `[a-z][a-z0-9-]{0,31}` 的小写字符串。预览／提交中的 `serial` 一旦出现，就必须是非空字符串，包含 1–128 个 ASCII 字母、数字、连字符或下划线；要执行，必须与已配置设备精确匹配。HTTP 语法比配置文件中的八位十六进制设备设置更宽。设备 GET 直接查询缓存；路径值未匹配时返回 `404`，而不另行返回序列号格式错误。

执行输入可以用 `{"pattern_id":"gentle-pulse"}` 引用本地保存的 Pattern。编译新输入时，该引用必须存在。Pattern PUT 则要求 Action 或 Sequence，并固定解析后的 Sequence。对仍被保留的 Job 进行匹配重放时，会在读取当前库之前直接返回原 Job。

### Preview 与 Job 响应 {#preview-and-job-responses}

Preview 总是返回 `sequence`（规范化计划）、`total_steps`（含重复次数的 1–1,024 整数）、`nominal_duration_ms`（24 小时预算内的整数毫秒）、`required_capabilities`（字符串数组）和 `device_check`：

| `device_check.status` | 含义 |
| --- | --- |
| `not_requested` | 省略了 `serial`，没有选定设备。 |
| `unknown` | 已配置设备不在线，或没有缓存能力；原因见 `reason`。 |
| `unsupported` | 已缓存的在线设备能力无法覆盖编译计划；原因见 `reason`。 |
| `supported` | 缓存能力覆盖该计划。但设备之后可能变忙或离线，受理仍可能失败。 |

未配置的序列号返回 `404`，不属于 `unknown` 检查结果。在线设备的能力列表非空、但缺少所需能力时，Preview 仍成功返回 `unsupported`，提交该计划则返回 `422 unsupported_capability`。空能力列表仍属于 `unknown`。

Serial 计划要求 `set`、`sequence`、`raw-rgb`；interval 计划要求 `set`、`raw-rgb` 以及当前的 `mk2-basic` 能力配置。`on_finish` 为 `"hold"` 时，二者还增加 `hold`。返回的 `required_capabilities` 使用这些公开名称，并不保证未经实测的设备代际在物理上支持它们。

| Job 字段 | 出现规则／含义 |
| --- | --- |
| `id`、`serial` | 始终出现。标识这次受理的执行及设备。 |
| `status` | 始终出现：`queued`、`running`、`cancelling`、`succeeded`、`cancelled`、`failed`。 |
| `target_source` | 路由请求返回选灯来源：`request`、`trigger`、`default`、`single_device` 或 `fallback`。普通显式 v1 提交可省略此字段。 |
| `completed_steps`、`total_steps` | 始终为整数，满足 `0 <= completed_steps <= total_steps <= 1024` 且 `total_steps >= 1`。计数包括重复，不包括 interval 初始目标和清理。进度表示主机 Step／interval 完成，不表示光学稳定。 |
| `created_at` | 始终出现，为 UTC 时间戳。 |
| `started_at` | 执行开始前省略；尚在队列就被取消的 Job 可以始终省略。 |
| `finished_at` | 到达终态前省略；出现即表示 Job 已终止。 |
| `error` | 为空时省略。失败时提供供人阅读的说明，不是内嵌的 HTTP 错误对象。 |

时间戳采用 RFC 3339 格式，可以含小数秒。提交或取消响应中的 `202` 确认的是状态转换，不是播放成功或灯已熄灭。应轮询原 Job ID。取消与完成发生竞争时，可能返回原有的成功终态 Job；对终态 Job 重复取消，其状态和完成时间不变。

对于真正开始执行的 Job，只有在设备清理与读回之后，才发布成功或已取消的终态。取消仍在队列中的 Job，会把它移出队列而不执行其设备写入；不会另做一次清理／读回，也不会熄灭另一个 Job。清理或读回失败具有更高优先级，因此即使已请求取消，仍可能得到 `failed`。失败的 Job 不保证设备已熄灭。

### 设备、库与指标响应 {#device-library-and-metric-responses}

| 记录 | 字段与省略规则 |
| --- | --- |
| Device | 始终包含 `serial`、`product`、`connection`、`capabilities`、`queue_depth`、`observed`。`product` 可以为空；能力可以为 `[]`。`queue_depth` 是非负整数，受运行时队列上限约束，最多 1,024。`firmware` 为整数，未知时省略。没有活动 Job 时省略 `active_job`。取得观测前，`observed` 为 `null`；取得后为 `{led1,led2,sampled_at}`。两个颜色都是设备原始 RGB 值，时间戳说明采样时刻。 |
| Color | 始终为 `{name,color}`；`color` 是规范的小写 Hex6。保存别名时固定其解析值，不保存动态引用。 |
| Pattern 摘要 | 始终含 `id`；`title` 为空时省略。GET 列表只返回摘要。 |
| 完整 Pattern | 始终含 `id` 和规范化的 `sequence`；`title` 为空时省略。PUT 省略标题会清除原标题。 |
| TransportMetric | 始终含 `serial`、`operation`、`calls`、`attempts`、`retries`、`failures`。计数器为无符号 64 位 JSON 整数。`calls` 统计逻辑 SDK 操作；`attempts` 包含首次尝试；`retries` 统计额外尝试；`failures` 统计最终失败的操作。可选 `last_error` 是历史信息，也可能描述后来已恢复的操作。计数器在当前驱动的生命周期中累加。 |

设备连接状态可能为 `connecting`、`online`、`offline`、`busy`、`error`、`closing`、`closed`。Interval 播放期间，为维护调度，worker 会推迟周期性 RGB 查询，所以缓存值可能早于当前 Job。缓存 RGB 值或成功的最终读回不衡量物理亮度、平滑程度或相机所见颜色；光学观测应独立进行。

### HTTP 错误与结果不确定 {#http-errors-and-uncertain-results}

HTTP 错误采用 `{"error":{"code":"...","message":"..."}}`。Action 编译无效时，还可能出现 `error.field`，例如 `action.color`、`action.colors[1]`。该字段可省略；Sequence 或其他验证错误可能只在 `message` 中描述位置。程序处理应使用状态码和 `code`；供人阅读的消息不是稳定标识。

| 状态码 | `error.code` | 当前原因／处理方式 |
| --- | --- | --- |
| `400` | `invalid_request` | JSON 语法或结构无效，未知／重复／null 字段，标识符、颜色、时序无效，禁止的位置出现 body／query，缺少必填输入，或只读运行时拒绝执行。颜色别名不存在也使用此码。 |
| `400` | `invalid_json` | 读取 HTTP 请求体时出错。这些 v1 带请求体路由的常规 JSON 解码／验证失败使用 `invalid_request`。 |
| `401` | `unauthorized` | 提供该 listener 配置的 Bearer token；响应头为 `WWW-Authenticate: Bearer`。 |
| `403` | `invalid_host`、`invalid_origin` | HTTPS Host 或浏览器来源与远程 listener 配置不匹配。 |
| `409` | `job_target_mismatch` | 取消的目标与原 Job 绑定序列号不同。 |
| `400` | `target_required` | 有多只托管设备，请求、Trigger 和配置均未确定目标。 |
| `404` | `trigger_not_found`、`device_not_managed` | Trigger 不存在或选定设备未受托管。 |
| `503` | `device_offline`、`invalid_trigger_config` | 选定设备离线或当前映射文件无效。 |
| `403` | `local_only` | Host 不是回环地址，或浏览器 Origin 不匹配。 |
| `404` | `not_found` | 路由不存在，或找不到对应的已配置设备、保留的 Job、已保存 Pattern。Job 已过期／被淘汰也使用此码；记录不存在不证明它从未执行。 |
| `405` | `method_not_allowed` | 不支持该方法。`Allow` 列出路由支持的方法；HEAD 不隐含等同于 GET。 |
| `409` | `job_conflict` | 被保留的 ID 已绑定其他设备或 JSON 输入。查询原 ID；不要为重试结果不确定的任务而另造新 ID。 |
| `409` | `device_busy` | 所选设备已被占有／正忙，或已有竞争的执行／检查。API v1 拒绝这次提交，不接受 replace／queue 策略字段；另一设备上的工作不会令当前目标变忙。 |
| `413` | `body_too_large` | HTTP 请求体超过 1 MiB。更小的 ColorInput 或编译后 Pattern 限制被违反时，使用 `400 invalid_request`。 |
| `415` | `json_required` | 带请求体的操作缺少 Content-Type、格式错误，或不是 `application/json`。 |
| `422` | `unsupported_capability` | 提交所需能力不在设备的缓存配置中。 |
| `429` | `library_capacity` | 库记录数量超过上限，或添加新颜色／Pattern 将超容量。已满时仍可替换已有记录。 |
| `503` | `unavailable` | 运行时关闭／离线，服务不支持 Sequence 执行，请求上下文结束，或本地库不可用／不可读／不安全／被锁定。 |
| `500` | `internal_error` | 意料之外的同步服务故障。记录响应与原标识符，再决定下一步。 |

HTTP 错误描述请求处理或受理。已接受的 Job 仍可能因原生 I/O、调度或清理失败；GET 仍返回 `200`，但包含 `status: "failed"` 和 Job `error`。不要把每个 `200` 都当成播放成功，也不要把所有传输失败都当成拒绝受理。

提交发生超时、断连或响应丢失时，保留预先生成的原 ID，并据此查询。不要自动再次 POST、另分配 ID 或改走直连 USB。重启、过期、淘汰后记录缺失，结果仍然不确定。省略 `id` 很方便，但若首个响应丢失，调用者可能无从知道自动生成的 ID。没有列举保留 Job 的端点。

库 PUT 也有结果不确定的边界：替换可能已经完成，之后才出现文件系统错误或响应丢失。应先按原 ID 读取 Pattern，或查看颜色列表／解析其 `@name`，再决定是否另做 PUT。此 v1 库没有专门的提交不确定错误码或 revision 前置条件；其他写入者可以替换当前值。

请求截止时间限制调用者的等待，不限制已经在执行的同步原生调用。只要 worker 仍存活且调用未返回，就继续保留原生设备归属。既有传输重试可能重复一次 fade 写入；Job ID 去重是受理控制，不保证物理更新恰好执行一次。进程退出或原生崩溃可能在此 JSON 错误约定之外切断连接，daemon 重启后也没有此前内存中的 Job 记录。

## CLI 连接策略 {#cli-connection-policy}

已确认的 `nb1 control` 默认行为是：报告 daemon 不可达，让用户明确选择启动 daemon 或直接访问。它不能自行启动 daemon，也不能自动回退到 USB。启动 `nb1 server` 不会安装系统服务。

若要不经 HTTP 明确执行一次前台播放，可以使用相同的 Action、Sequence 或已保存 Pattern 输入：

```sh
nb1 control --direct run DEVICE_SERIAL action.json
nb1 control --direct run DEVICE_SERIAL action.json --timeout 2m
```

Direct 模式仅用于 `run`，始终等待完成，不要求 daemon 或已安装服务。序列号必须来自位置参数、`--device`、`NB1_DEVICE` 或配置文件 `device`。Direct 不会发现默认设备；它先验证输入并解析本地颜色和 Pattern，再打开设备，之后使用与 daemon 相同的编译器和执行核心。daemon 或其他进程占有设备时，原生归属锁会拒绝第二个控制器。

每次调用都是一次新播放，Job ID 仅属于该进程。Direct 拒绝 `--id` 和 `--endpoint`。后续命令无法查询或去重这个 Job。不显式指定 `--timeout` 时，有效的有限 Sequence 会运行至完成。显式超时或 Ctrl-C 会请求取消，随后另行等待有界清理，默认十秒。`hold` 成功完成时，释放句柄而不额外发送熄灭命令。

输出包含 `mode: "direct"`、已创建的 Job 以及 `engine_closed`。这个布尔值报告已经确认的引擎关闭，不代表播放成功或光学观测。应分别检查 Job 状态和命令结果。清理等待超时时，命令报告未知设备状态；等待截止时间不会取消原生调用。原生 I/O 仍未返回时，引擎不会主动释放句柄或设备租约。进程终止、原生崩溃属于独立限制；命令有界退出并不证明设备清理已经完成。

在 macOS 和 Linux 上，可以通过当前运行的可执行文件安装当前用户的登录服务：

```sh
nb1 service install --devices DEVICE_SERIAL --start
```

省略 `--binary` 时，通过操作系统选择当前进程的可执行文件，不会在 PATH 中寻找另一个安装。显式 `--binary /absolute/path/to/nb1` 会覆盖此选择。原生服务管理器会验证文件并解析符号链接，再保存配置。不带 `--start` 时，安装会启用登录加载，但不请求立即启动。

服务安装从自身命令行参数与选定配置文件中解析设备和监听地址。若选择了配置文件，会记录其实际绝对路径，并把设备／监听值保存为显式启动参数。这些参数使已经安装的设备选择和地址不会因配置文件编辑而改变。macOS/Linux 托管服务还在受控启动环境中记录选定的 XDG 根目录，使默认库在不同登录环境下保持稳定。库与 Job 缓存设置会在重启时从配置读取。要改变设备列表或监听地址，应显式更新托管服务配置。

跨平台 `service render` 仍要求明确的目标 `--binary` 路径。Windows 服务安装尚不支持。Homebrew 构建默认选择已校验的稳定 `opt/nb1/bin/nb1` 入口；升级包不会自动重启 daemon。显式 `--binary` 路径保持固定，必须保留对应程序。不同升级／回滚约定见[包生命周期](https://github.com/b1ug/nb1/blob/48895be5babc11d6f3b2a7ab16e316bd564e726e/packaging/homebrew/README.md#upgrades-and-service-paths)。

## 设备执行范围 {#device-execution-scope}

先解析目标 `serial`，再进行受理判断。每只已配置的实体设备都有自己的原生拥有者、worker、活动执行槽、待处理工作与缓存状态。A 设备忙，不阻塞 B 设备上本来可以接受的工作。CLI、HTTP、MCP 与内嵌 Workbench 共用同一设备 worker；换一个客户端不会增加执行槽。

| 事项 | 范围 | 含义 |
| --- | --- | --- |
| 原生归属、活动执行和待处理工作 | 一个实体 `serial` | LED 1 与 LED 2 共用执行槽；选择另一个 LED 不能绕过同设备 busy。 |
| 连接、`active_job`、`queue_depth` 和 RGB 观察 | 一个实体 `serial` | 描述该设备，不是 daemon 全局播放队列。 |
| 取消 Job | 被取消 Job 已保存的 `serial` | 只改变该 Job 及其设备清理，不取消另一设备的 Job 或待处理工作。 |
| 保留中的 Job ID | 整个 daemon | 把同一 ID 用于另一个 serial 会冲突；独立执行须有各自 ID。 |
| 终态 TTL/LRU 缓存 | 整个 daemon | 历史记录保留与待播容量分开；缓存压力不取消已接受的非终态工作。 |
| 配置、内容库与服务生命周期 | daemon 实例 | 设备共享这些资源。显式关闭 daemon 会影响其受管设备，与取消单个 Job 不同。 |

API v1 是**每设备遇忙拒绝**。Job 在 worker 开始前可能短暂处于 `queued`，设备也会报告 `queue_depth`；这不表示已公开把竞争任务排在忙设备后面的策略。取消尚未开始的 Job 会移除它，不执行该任务的设备写入。

未来的队列容量、等待截止时间、抢占和显式清队必须归属于 Job 冻结后的最终 serial。A 设备不能占用 B 的队列容量或取消其工作。这些公开操作仍属规划；内部替换代码不是公开策略合同，未来抢占是否保留已有待播 Job 仍需定稿。

## Job ID 与去重 {#job-ids-and-deduplication}

省略 `id` 或传入空值时，会生成 `j_` 加十个随机 Crockford Base32 字符。自定义 ID 接受 1–64 个 ASCII 字母、数字、连字符、下划线。CLI 在提交前生成 ID，便于响应丢失后仍报告原 ID。

daemon 保留每个活动 Job。终态 Job 采用可配置的软 TTL，从终态完成时刻起计，默认三十分钟。LRU 压力或 daemon 重启可令记录提前消失。Job 查询、匹配的重复提交、终态取消查询都会更新其 LRU 顺序，但不延长最初过期时间。相同 ID、相同设备、相同 JSON 输入会返回既有 Job，HTTP 200；输入或设备不同则返回 HTTP 409。输入身份比较忽略对象键顺序，保留数组顺序和数字写法。比较的是创作输入，不只是编译结果：省略默认值与显式填写默认值、改变颜色名大小写、改用等效 Hex，都可能产生冲突，即使最终灯光相同。

终态缓存默认最多 16,384 个 Job。使用配置 `jobs.terminal_limit` 或服务参数 `--job-cache-size` 设置正容量，用 `jobs.terminal_ttl` 或 `--job-cache-ttl` 设置正 TTL。显式服务参数优先于配置文件；重启 daemon 后生效。超出选定容量时，淘汰最近最少使用的终态记录。活动 Job 始终固定保留，并在进入终态时释放执行计划。新执行仍由设备归属与单个 Sequence 限制约束；缓存容量不会拒绝新 Job。

去重只在原记录仍被保留时有效。过期或淘汰后，提交同一 ID 可以开始新 Job。记录属于当前 daemon 进程内存。默认三十分钟 TTL 是保留时长的上界，不是有保证的去重窗口，也不保证恰好执行一次。

## 本地颜色与 Pattern {#local-colors-and-patterns}

daemon 选择库的优先级依次为 `--library-dir`、`NB1_LIBRARY_DIR`、配置中的 `library_dir`、稳定的每用户 `nb1/library` 默认目录。颜色和 Pattern 已存放于此。仅改变 `--config` 路径不会迁移库。读取返回保存的记录或空列表，不会创建缺失目录。库未配置或不可读，不会妨碍普通 Sequence 或不使用别名的 Action 编译；需要库的操作返回 `503 unavailable`。

写入会创建所需目录，并原子替换一条完整记录，不做局部更新。省略 `title` 会清空原标题。库最多支持 256 个具名颜色和 128 个 Pattern，序列化记录连同格式最多 1 MiB，标题最多 256 个 Unicode 码点。达到记录数上限后仍可替换已有记录。Pattern ID 即使在大小写不敏感的文件系统上也保留大小写。若任何记录不可读，列表整体失败，不静默返回部分结果。目前没有库删除、revision 或 compare-and-swap 操作。

使用同一协调机制的写入者会串行保存。锁竞争最多等待约两秒，然后返回 `503 unavailable`；这并不约束全部文件系统 I/O。并发成功保存可能相互替换值；发生错误响应后，前述不确定写入恢复规则仍适用。

```sh
nb1 control colors set status-ok lime
nb1 control colors list
nb1 control patterns save gentle-pulse action.json --title "Gentle pulse"
nb1 control patterns get gentle-pulse
nb1 control patterns list
```

保存 Pattern 时固定已经解析的 Sequence。修改颜色或 Pattern 影响新 Job。重复提交已经受理的 Job，会先返回原 Job，而不再读取库；其引用记录已更新或暂时不可用时也一样。

## 首批交付范围 {#initial-delivery-scope}

已有实物证据覆盖记录中的 macOS 27.2／arm64／blink(1) MK2／固件 204 组合。其他操作系统和架构的发行包分别记录真实构建与软件证据；软件 CI 或包文件名不等于实体 USB、MK3、重启或非易失存储验收。

既有 I/O 重试恢复仍是记录中的限制。源码标签或二进制发布不会扩大硬件证据范围。实际下载见[安装指南](install.zh-CN.md)；开发候选保留独立来源与验收记录。

## 实现顺序与验收 {#implementation-sequence}

源码交付包含核心执行路径、本地库、上文 HTTP 操作、CLI 命令、显式直连运行、内嵌 Web 和 MCP 适配器。软件检查覆盖集成路由、direct 生命周期和 Agent 流程。已有有限 macOS 27.2／MK2 FW204 CLI／HTTP 记录覆盖 serial／interval、Orbit、Job 重放、busy 拒绝、取消、RGB 缓存读回与设备归属；其他记录覆盖 direct set／hold、超时／SIGINT、真实 stdio MCP 和内嵌 Web 行为。所有记录保留准确源码与二进制身份，不因新版本发布自动重新取得硬件验收资格。DeviceSequence 路由仍为计划。[术语表](api-v1-terminology.zh-CN.md)规定各入口的命名。

macOS/Linux 用户服务安装将 `XDG_CONFIG_HOME` 固定为安装时已验证的配置根目录。不同的登录 manager 环境不能把所选配置或默认库重定向到别处。设备锁继续遵循前述原生系统协调策略。单独渲染时，可用 `service render --user-config-root` 指定目标配置根目录；这不授予文件系统访问权限。
