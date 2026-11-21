# Trigger 路由与默认设备

nb1 v0.1.4 中，调用方可以指定 Trigger 名称，由 daemon 选择目标设备。省略 `serial` 时使用配置的默认设备，或在只管理一只设备时选中它；也可显式传入 `serial`。每台设备有自己的调度器，默认拒绝冲突，也可排队或抢占。

## 选择目标设备

启动 daemon 时，默认播放目标依次取自 `--device`、`NB1_DEVICE` 和配置文件的 `device`。显式的 `server --devices` 决定托管列表。省略该参数时，显式设备覆盖项只托管这一只设备，否则从 `server.devices` 读取配置。普通 CLI 播放自行选灯，使用 `control run FILE --daemon-default` 可委托 daemon。显式位置参数、`--device` 或客户端的 `NB1_DEVICE` 仍优先。

```yaml
device: "20000001"
server:
  devices: ["20000001", "20000002"]
  default_device_fallback: error
```

| 请求情况 | 结果 |
| --- | --- |
| 请求含 `serial` | 选择该托管设备。设备不可用时返回对应错误。 |
| 请求未指定设备，Trigger 有设备绑定 | 选择绑定目标。失联时返回该目标的错误。 |
| 省略序列号，已配置默认设备 | 选择默认设备。默认的 `error` 策略对缺失或离线设备报错；其他设备仍可用。 |
| 默认设备缺失或离线，启用 `single_online` | 仅在恰好有另一只在线设备时选择它，并返回 `target_source: "fallback"`。没有或有多只候选都会拒绝。 |
| 无默认设备或绑定 | 只有一只托管设备时选择它。多设备返回 `400 target_required`。 |
| 目标繁忙或能力不足 | 默认 `reject` 返回 `device_busy`；`queue` 入该设备队列；`preempt` 请求清理活动 Job 后优先运行新 Job。仍会检查能力，目标保持固定。 |

使用默认路由时省略 `serial` 字段。空字符串和 `null` 无效。修改 daemon 启动配置后需重启。Job 会返回已受理的设备序列号，后续查询、重放及取消都绑定到它。

## 选择排队或抢占

在 `POST /v1/jobs` 中传 `policy: "queue"` 或 `policy: "preempt"`，也可在 CLI 使用 `--policy`，或在 MCP `run_light` 中使用同名字段。每台设备默认最多有 8 个等待 Job。抢占会先请求清理活动 Job，再运行新 Job；已有等待项保持相对顺序，被取消的 Job 不会恢复。繁忙结果不会将请求改投其他序列号。限额与恢复方式见 [API v1](api-v1.zh-CN.md#choosing-what-happens-on-a-busy-device)。

## 配置 Trigger

先通过现有 API 保存 Pattern，再把 `triggers.json` 放在同一内容库目录。映射中的 `pattern_id` 必须与已保存的 ID 一致；可选的显示名称可与 Trigger 或 Pattern 的名称不同。

```console
curl -H 'Content-Type: application/json' -X PUT \
  -d '{"action":{"kind":"blink","color":"lime","cycles":3}}' \
  http://127.0.0.1:5885/v1/patterns/build-green
```

```json
{
  "schema_version": 1,
  "triggers": {
    "build.done": {
      "pattern_id": "build-green",
      "serial": "20000002",
      "title": "Build complete"
    }
  }
}
```

Trigger 名称匹配 `[a-z][a-z0-9.-]{0,63}`。可选序列号是八位十六进制字符串。映射文件最多包含 256 项，并限制为 1 MiB。编辑后原子替换文件即可对新提交生效。Windows 上如果编辑器报告共享冲突或拒绝访问，先关闭文件再重试重命名。替换成功前继续使用原映射。文件无效时 Trigger 操作返回 `invalid_trigger_config`，独立的显式播放与健康检查仍可用。

```console
nb1 control triggers
nb1 control triggers --check
nb1 control emit build.done --wait
nb1 --device 20000001 control emit build.done --wait
nb1 control run effect.json --daemon-default --wait
```

`nb1 control triggers --check` 与 `GET /v1/triggers/check` 检查 Pattern、绑定及设备连接缓存。结果保留名称、Pattern ID、可选的序列号与标题，以及 `issues` 数组。可能的诊断为 `pattern_not_found`、`pattern_unavailable`、`device_not_managed`。离线的托管设备会显示离线，仍是有效绑定。HTTP 返回 `200` 及逐项结果；存在有问题的行时，CLI 打印相同报告并以非零状态退出。格式错误返回 `503 invalid_trigger_config`。

在 `POST /v1/jobs` 中从 `action`、`sequence`、`pattern_id`、`trigger` 中选择一项。

```json
{"id":"build-42","trigger":"build.done"}
```

MCP 的 `run_light` 接受相同的 `trigger`、`serial` 和 `id`。相同请求使用原 ID 重试时，daemon 先返回仍保留的原 Job，即使刚修改了映射或设备已掉线。相同 ID 配上不同请求内容会返回 `job_conflict`。响应丢失时先按原 ID 查询。

要核对取消目标，使用 Job 返回的序列号，例如 `nb1 control cancel j_7K3XJNY9ZM --serial 20000002 --wait`，或向 `/v1/jobs/j_7K3XJNY9ZM/cancel?serial=20000002` 提交空请求体的 POST。序列号不匹配时返回 `409 job_target_mismatch`。重试时保留此项检查。

Trigger 播放与其他 Job 共用每设备 worker。默认 `reject`、显式 `queue` 和 `preempt` 都按选定序列号生效；Trigger 每次只选择一个已保存 Pattern。不同设备的竞争任务可以独立运行。
