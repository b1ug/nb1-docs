# 点亮你的第一盏灯

[English](getting-started.md) · [安装 nb1](install.zh-CN.md) · [排查问题](support.zh-CN.md)

nb1 是同一个程序的两种明确模式：前台 server 让 CLI、HTTP、MCP 与内嵌工作台共用
设备；direct 无需 server，前台播放一次请求。本页介绍原生工具套件。
下载匹配平台的 v0.1.2；既有实物证据单独限定于 macOS／MK2／FW204。

## 启动 server 并播放

[核验并解压 v0.1.2](install.zh-CN.md)后，进入 CLI 目录。把 `DEVICE_SERIAL` 换成
`list` 显示的设备序列号：

```sh
./nb1 list
./nb1 server --devices DEVICE_SERIAL
```

server 保持在这个终端运行。在另一个终端进入相同目录，将以下内容保存为 `action.json`：

```json
{"action":{"kind":"pulse","color":"teal","cycles":3}}
```

```sh
./nb1 control devices
./nb1 control run DEVICE_SERIAL action.json --wait
```

Preview 可选：用 `./nb1 control preview action.json` 查看编译计划而不播放。`run --wait` 等待 Job 终态，应检查状态是否成功，并保留返回
的 ID 与 endpoint，方便以后查询。默认地址是 `http://127.0.0.1:8931`，打开该 server
的 `/demo/` 路径即可使用中英双语内嵌工作台。文档站本身不打开 USB；独立的[浏览器工具](browser.zh-CN.md)提供显式 WebHID 访问。

用 Ctrl-C 停止前台 server。安装程序或运行 `server` 都不会安装登录服务。

::: tip 工作台操作
**播放**会检查当前草稿与所选设备，通过后提交一次。**预览**按需使用，在屏幕上播放效果。

设置两种常亮颜色时，在**常亮**中选择**分色**，分别编辑 **LED 1 · blink(1)** 与 **LED 2 · ThingM**。一次播放会把两种颜色作为一个 Sequence 提交，也可以继续使用两灯同色。
:::

## 在多只灯之间选择 {#choose-among-several-lights}

::: info 版本边界 · 即将到来的 v0.1.3
以下行为为尚未发布的 v0.1.3 准备。v0.1.2 中，daemon 配置了多只设备时仍须明确选择目标。用 `./nb1 version --json` 查看 CLI 版本；安装新程序不会替换已运行的 server 或其中的 Workbench。
:::

显式位置参数序列号优先于 `--device`、`NB1_DEVICE`，再到 profile `device`。均未指定时，v0.1.3 读取 daemon 的已配置设备缓存，按序列号的字节序升序排列，选择第一只连接状态为 `online` 的设备。没有在线设备时，选择第一只已配置序列号：`state` 显示该目标的状态，`run` 返回它的真实错误。这个顺序不是 USB 插入顺序。

例如，把以下示例序列号换成 `list` 的实际输出，用 `./nb1 server --devices 20000002,20000001` 启动服务，再在另一个终端运行：

```sh
./nb1 control state
./nb1 control run action.json --wait
./nb1 control run 20000002 action.json --wait
```

前两条使用默认规则；第三条明确选择 `20000002`，即使另有设备在线也不改变目标。配置了多只设备且自动选择时，stderr 会以英文提示数量与所选序列号，stdout 保持 JSON。设备忙、失败或结果未知都不会把请求转给下一只灯。HTTP 与 MCP 仍须显式 `serial`，direct 仍须明确或首选目标。

v0.1.3 内嵌 Workbench 首次加载采用相同序列号顺序。选择设备、刷新或切换语言都不会播放。刷新保留当前目标，包括离线设备；目标从配置中消失时，也保留其序列号和说明，直到你选择另一只。无法确认所选设备在线时，**播放**会禁用并显示理由，可用**刷新**重新检查或主动选择设备。结果未知的 Job 保留原 ID，绝不自动重播。

## 想直接播放一次？

先让其他控制进程释放设备，再运行：

```sh
./nb1 control --direct run DEVICE_SERIAL action.json
```

direct 始终等待，使用同一设备所有权锁，不接受 `--id`、`--endpoint`，也没有可以在
之后查询的 daemon Job。普通 `control` 遇到 daemon 不可达会明确报错，不自动启动，
不静默切换 USB 直连。

## 保存你的选择

`./nb1 config init` 创建私有模板，不覆盖既有文件；`config path`、`config show`
查看当前文件与配置。macOS/Linux 默认为 `~/.config/nb1/config.yaml`，绝对路径的
`XDG_CONFIG_HOME` 可选择其他根目录；Windows 使用 `%APPDATA%\nb1`。profile 可设
默认 `device`、`server.devices`、本机颜色／Pattern 存储与 Job 终态保留参数。
详见[配置与支持](support.zh-CN.md)。

继续阅读 [API 参考](api-v1.zh-CN.md)与[统一术语](api-v1-terminology.zh-CN.md)。
颜色支持名称、Hex3／Hex6、RGB8、HSV／HSB 与本机 `@name` 引用。Action 描述意图，
由核心编译为 Sequence，再作为 Job 执行。

依据：[nb1 v0.1.2 安装指南](https://github.com/b1ug/nb1/blob/88fc2be8326c076b6f09932054b0c8f11d89c0a0/docs/install.zh-CN.md)
与[当前 API 合同](https://github.com/b1ug/nb1/blob/88fc2be8326c076b6f09932054b0c8f11d89c0a0/docs/api-v1.md)。
