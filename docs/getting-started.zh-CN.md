# 点亮你的第一盏灯

[English](getting-started.md) · [安装方式](install.zh-CN.md) · [接入 AI Agent](agents.zh-CN.md)

在插着 blink(1) 的电脑上启动一个 nb1 daemon，CLI、HTTP API、浏览器调试器和 AI 就能共用同一盏灯。以下步骤适用于 v0.1.4。

## 安装 nb1

macOS 或 Linux 已安装 Homebrew 时，运行：

```sh
brew tap b1ug/tap
brew install b1ug/tap/nb1
nb1 version --json
```

手动安装可按平台[下载并校验安装包](install.zh-CN.md#choose-and-verify-a-download)。提供 Mac、Linux 的 arm64／amd64 版，以及 Windows amd64 版。下文假定终端能直接运行 `nb1`。如果只做了解压，请在解压目录用 `./nb1`，PowerShell 用 `.\nb1.exe`。用 `version --json` 确认这里使用的是 `v0.1.4`。

## 启动服务，播放一次

如果电脑上已经运行 nb1，先检查服务地址。v0.1.3 引入、并由 v0.1.4 沿用的默认地址是 `http://127.0.0.1:5885`。旧服务显式配置过监听地址时会继续使用原地址，请把下文和 MCP 配置中的地址一起替换。Windows PowerShell 中的 curl 示例请用 `curl.exe`。

```sh
curl -fsS http://127.0.0.1:5885/healthz
```

返回 `"status":"ok"` 和 `"api_version":"v1"`，就可以复用已有服务。全新安装时，插上灯，运行 `nb1 list`，用查到的序列号替换下方的 `DEVICE_SERIAL`。有多盏灯时用英文逗号分隔各个序列号。

```sh
nb1 server --devices DEVICE_SERIAL
```

保持该终端打开，Ctrl-C 可停止前台服务。macOS 和 Linux 如需登录自启，可参考[安装用户服务](install.zh-CN.md#optional-user-service)。Windows 使用前台服务。

另开终端，查看该服务配置的设备。应当能看到目标灯的序列号和 `"connection":"online"`。服务健康时，在线设备数也可能是零。

```sh
curl -fsS http://127.0.0.1:5885/v1/devices
```

**用浏览器播放。** 打开 [5885 端口上的本地调试器](http://127.0.0.1:5885/demo/)，选中对应序列号，选择**脉冲**并点**播放**。**预览**会在屏幕上演示。要让两颗 LED 常亮不同颜色，可选**常亮 → 分色**，分别设置 **LED 1 · blink(1)** 和 **LED 2 · ThingM**。调试器共用 daemon 的连接。启用了本地 Token 鉴权时，请使用带凭据的 CLI 或 API。[接入设置](remote-access.zh-CN.md)

**用 CLI 播放。** 将以下内容保存为 `action.json`，然后指定序列号播放：

```json
{"action":{"kind":"pulse","color":"teal","cycles":3}}
```

```sh
nb1 control run DEVICE_SERIAL action.json --wait
```

Job 的 `status` 为 `succeeded` 表示执行成功。只想查看编译后的 Sequence 时，可用 `nb1 control preview action.json`，没有灯也可以预览。

## 用 HTTP 播放同一效果

将以下内容保存为 `job.json`，填入在线设备的真实序列号。文件和下方查询地址应使用同一个 Job ID。每次**新播放**使用一个新 ID。

```json
{"id":"first-teal-pulse","serial":"DEVICE_SERIAL","action":{"kind":"pulse","color":"teal","cycles":3}}
```

```sh
curl -i -H "Content-Type: application/json" --data-binary "@job.json" http://127.0.0.1:5885/v1/jobs
curl -fsS http://127.0.0.1:5885/v1/jobs/first-teal-pulse
```

`202 Accepted` 表示服务已接受请求。接下来只重复 GET，直到 Job 进入终态；中途丢失响应，也查原 ID。同一盏灯的默认策略仍是遇忙拒绝；明确需要时可设 `policy: "queue"` 排队，或设 `policy: "preempt"` 抢占。每个序列号有独立调度器。[API 字段与错误码](api-v1.zh-CN.md) · [让 Codex 通过 MCP 调用](agents.zh-CN.md#set-up-mcp)

## 在多只灯之间选择 {#choose-among-several-lights}

显式位置参数序列号优先于 `--device`、`NB1_DEVICE`，再到 profile `device`。均未指定时，v0.1.4 读取 daemon 的已配置设备缓存，按序列号的字节序升序排列，选择第一只连接状态为 `online` 的设备。没有在线设备时，选择第一只已配置序列号：`state` 显示该目标的状态，`run` 返回它的真实错误。这个顺序不是 USB 插入顺序。

例如，把以下示例序列号换成 `list` 的实际输出，用 `nb1 server --devices 20000002,20000001` 启动服务，再在另一个终端运行：

```sh
nb1 control state
nb1 control run action.json --wait
nb1 control run 20000002 action.json --wait
```

前两条使用默认规则；第三条明确选择 `20000002`，即使另有设备在线也不改变目标。配置了多只设备且自动选择时，stderr 会以英文提示数量与所选序列号，stdout 保持 JSON。设备忙、失败或结果未知都不会把请求转给下一只灯。HTTP 和 MCP 可省略 `serial` 以使用 [daemon 路由](trigger-routing.zh-CN.md)，direct 仍须明确或首选目标。

v0.1.4 内嵌 Workbench 首次加载采用相同序列号顺序。选择设备、点击页面内的**刷新**控件或切换语言都不会播放。该控件在当前打开的页面内保留目标，包括离线设备；目标从配置中消失时，也保留其序列号和说明，直到你选择另一只。无法确认所选设备在线时，**播放**会禁用并显示理由，可用**刷新**重新检查或主动选择设备。浏览器整页重新加载或打开另一个 Workbench 入口时，会重新采用默认选择，不跨页面保存所选设备。结果未知的 Job 仍保留原 ID 与目标，绝不自动重播。

## 想直接播放一次？

**共享服务与 USB 直连。** 内嵌调试器、CLI 和 MCP 共用 daemon。独立的 WebHID 网页（开发预览版）与 Chrome 提醒扩展（实验版）各自打开 USB；切换前请让原控制端释放这盏灯。[浏览器设备权限与扩展设置](browser.zh-CN.md)

先让其他控制进程释放设备，再运行：

```sh
nb1 control --direct run DEVICE_SERIAL action.json
```

direct 始终等待，使用同一设备所有权锁，不接受 `--id`、`--endpoint`，也没有可以在
之后查询的 daemon Job。普通 `control` 遇到 daemon 不可达会明确报错，不自动启动，
不静默切换 USB 直连。

## 保存你的选择

`nb1 config init` 创建私有模板，不覆盖既有文件；`config path`、`config show`
查看当前文件与配置。macOS/Linux 默认为 `~/.config/nb1/config.yaml`，绝对路径的
`XDG_CONFIG_HOME` 可选择其他根目录；Windows 使用 `%APPDATA%\nb1`。profile 可设
默认 `device`、`server.devices`、本机颜色／Pattern 存储与 Job 终态保留参数。
详见[配置与支持](support.zh-CN.md)。

继续阅读 [API 参考](api-v1.zh-CN.md)与[统一术语](api-v1-terminology.zh-CN.md)。
颜色支持名称、Hex3／Hex6、RGB8、HSV／HSB 与本机 `@name` 引用。Action 描述意图，
由核心编译为 Sequence，再作为 Job 执行。

依据：[nb1 v0.1.4 安装指南](https://github.com/b1ug/nb1/blob/0a2199cab89621888782baa154522c37ad83b641/docs/install.zh-CN.md)
与[当前 API 合同](https://github.com/b1ug/nb1/blob/0a2199cab89621888782baa154522c37ad83b641/docs/api-v1.md)。
