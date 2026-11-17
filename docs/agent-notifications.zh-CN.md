# 让 Agent 提醒回合结束

[English](agent-notifications.md) · [第一次点灯](getting-started.zh-CN.md) · [支持](support.zh-CN.md)

core `535621a689e5a9e35c5e897aadcd4b023d2f157b` 的通知示例通过已有 nb1 daemon
播放一次有限的蓝色 blink。蓝色表示**回合结束**，不判断任务成功。默认只预览，
不安装 hook、不启动 daemon、不使用 USB 直连。

## 快速预览

在同版 core 源码 checkout 中运行：

```sh
python3 examples/command-notify/codex_notify.py \
  '{"type":"agent-turn-complete","thread-id":"demo-thread","turn-id":"demo-turn"}'
```

合成事件不创建 Job 或报告。请保留整个示例目录，适配器需要相邻的 `notify.py`。
这些 Python 示例不包含在 CLI 候选归档内。

| 入口 | 输入 | 用途 |
| --- | --- | --- |
| `codex_notify.py` | Codex 外部 `notify` 追加的单个 JSON 参数。 | 中性的回合结束提醒。 |
| `codex_stop.py` | stdin 上的 lifecycle Stop JSON。 | 独立的 Stop hook 接收器。 |
| `notify.py` | `--` 后的普通命令 argv。 | 执行命令，按退出码选择绿／红色。 |

## 选择一次 Codex 调用

先选好 [daemon 与设备](getting-started.zh-CN.md)，准备已存在的私有报告目录，以及
Python、适配器、nb1 的绝对路径。单次调用的 `-c notify=[...]` 数组里，给适配器
传入 `--execute`、`--nb1-binary`、`--endpoint`、`--serial`、`--report-dir`。
Codex 会追加真实 JSON，不要把上面的合成事件写进数组。

[固定源码版本的 Codex 指南](https://github.com/b1ug/nb1/blob/535621a689e5a9e35c5e897aadcd4b023d2f157b/examples/command-notify/CODEX.zh-CN.md)
提供可复制的完整命令，使用 `--ignore-user-config`、`--ephemeral` 与 read-only
模型沙盒，也说明了另一条 Stop 入口。选项已在 `codex-cli 0.166.0` 上核对，模型由
当前安装的可用范围选择。项目内配置不能覆盖 `notify`，此流程不修改全局配置。
外部 notify 运行明确指定的宿主机程序，其权限与模型命令沙盒分别处理。

## 看报告，不只看退出码

适配器先保存私有哈希报告与原始短 Job ID，再做唯一一次提交。结果不确定时，使用
报告的 `job_lookup_argv` 查询，不重试、不自动取消、不改走直连。同一 thread／turn
再次投递会保留原报告且不增加 POST；删除报告会移除这个事件的抑制门槛。
报告不保存消息正文或原始事件 ID。

匹配的成功终态说明软件执行／清理完成。适配器退出 `0` 也可能是预览、忽略输入或
通知失败，应查看 `notification.state` 与 `outcome_unknown`。记录因重启／淘汰而
不存在，不能证明从未执行。

[已有验收记录](https://github.com/b1ug/nb1/blob/535621a689e5a9e35c5e897aadcd4b023d2f157b/examples/command-notify/VERIFICATION.md#real-codex-notify-acceptance--2026-11-13)
在 macOS 上通过 23 项测试与四次真实 Codex 回合。最终成功回合到达真实 Go 内存
执行器，不可达回合保留 unknown，Codex 仍返回 `0`。重复投递检查是明确执行的合成
测试。这些是软件证据，不代表实体灯光、已安装的 Stop hook 或 Windows 通过；一次
观察到的通知先于 CLI 退出完成，也不是通用时序保证。
