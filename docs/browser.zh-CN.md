# 在浏览器中使用 blink(1)

[English](browser.md) · [原生安装](install.zh-CN.md) · [架构](architecture.zh-CN.md)

[nb1 WebHID 在线版](https://b1ug.github.io/nb1-webhid/)及其[公开源码](https://github.com/b1ug/nb1-webhid)是独立的**开发预览**。前台页面通过共享 Go／WASM 编译器直接使用 WebHID；**nb1 Light Reminders** Chrome 扩展仍为实验版本。它们既不是原生 nb1 daemon，也不是这个静态文档站。原生 nb1 v0.1.3 仍是独立的正式安装路径。

## 先选择谁控制小灯

| 入口 | 设备持有者 | 范围 |
| --- | --- | --- |
| `/demo/` 的 nb1 内嵌 Workbench | 原生 nb1 daemon | 与原生客户端共用本机 HTTP API、Job、颜色与 Pattern。 |
| 独立浏览器页面 | 前台浏览器页面 | 直连 WebHID，九种 Action 与有限 Sequence，可选 Preview、显式 Play、Stop、Off。 |
| 实验性 Chrome 扩展 | 扩展上下文 | 通过 USB 直连控制和设置后台提醒。[已验证的环境](#load-the-chrome-companion)。 |
| 这个文档站 | 无 | 静态指南与装饰模型，不申请硬件权限，不提供 daemon。 |

浏览器不参与原生 nb1 进程锁。直连 WebHID 前，应先停止或断开持有同灯的其他控制者；回到原生 nb1 前先 Disconnect 浏览器持有者。确认框只表示你已完成交接，不能替你释放另一个进程的设备句柄。

## 启动评审网页

在支持的桌面浏览器打开[在线开发预览](https://b1ug.github.io/nb1-webhid/)。源码构建以 [nb1 WebHID README](https://github.com/b1ug/nb1-webhid#build-and-review-locally)为准；网页提供与当前构建匹配的扩展包。前端、Go／WASM 构建和托管具有独立于原生发行的来源身份。开发预览不是稳定原生下载，这个文档站也不托管 USB 控制器。

使用支持 WebHID 的桌面浏览器。释放之前的控制者后，显式 Connect 并使用仅过滤 blink(1) 的选择器。允许选择设备不代表已经成功打开；活动的原生持有者仍可能阻止连接。WebHID 需要浏览器所支持的安全来源或回环地址环境。

在线预览与这个文档站共享 `https://b1ug.github.io` 来源。WebHID 授权按 origin 生效，不同 GitHub Pages 项目路径不隔离设备权限。文档代码不调用 HID，也不请求设备访问；这种代码行为不代表独立的权限边界。

页面默认英文，可切换中文。Solid 依次提供两灯同色、分色、**LED 1 · blink(1)** 与 **LED 2 · ThingM**。**Play** 验证当前草稿，Preview 可选；导入或编辑的 JSON 会保持为草稿，直到你明确返回 Action 控件。

## 播放、停止与离开

浏览器通过随包 WASM 复用 Go 颜色、Action、Sequence 编译与播放计划。JavaScript 提供 WebHID 传输和浏览器计时，不代替原生 daemon 的设备归属或 Job 系统。

Stop 取消后续 Step，不能冻结已经发出的硬件渐变。Off 停调度并显式发送黑色；Disconnect 先停调度再关闭句柄，未确认关闭时保持未知。隐藏或离开页面会停止调度，返回不授权自动重播。

播放期间保持页面可见。浏览器计时与 USB 延迟可能增加实际时长。浏览器 Sequence 结束不是原生 Job，也不是光学测量；未知写入不能显示为成功播放，也不能静默重试。

## 加载 Chrome 扩展

下载[实验性 Chrome 扩展](https://b1ug.github.io/nb1-webhid/extension-download/zh.html)。解压后打开 `chrome://extensions`，启用开发者模式，点**加载已解压的扩展程序**，选择包含 `manifest.json` 的目录。手动安装后也从同一页面获取更新。

2026 年 11 月 20 日，用户在 macOS 的 Chrome for Testing 156 中授权 **0.1.0** 扩展访问一只 blink(1) MK2。我们设好一分钟后的紫色提醒，关闭弹窗和设置页，并在倒计时结束前断开调试器。到点后观察到实体灯亮起，点击 **Off** 后熄灭。

请阅读匹配包的[安装与更新指南](https://b1ug.github.io/nb1-webhid/extension-download/docs/DISTRIBUTION.zh-CN.md)和[隐私指南](https://b1ug.github.io/nb1-webhid/extension-download/docs/PRIVACY.zh-CN.md)。**0.1.1** 通过了中英文工具栏测试，其后台、HID 传输和 Go／WASM 与实测包逐字节相同。扩展单独申请设备权限，连接前请先释放其他控制者。

本次测试期间 Mac 保持唤醒，设备一直连接，授权持续有效。系统睡眠、浏览器重启、撤销授权或拔出设备后的提醒送达情况仍待验证。需要脱离浏览器运行时，也可以使用原生 daemon。平台权限模型见 Chrome 官方[扩展 WebHID 文档](https://developer.chrome.com/docs/extensions/how-to/web-platform/webhid)。

## 在工具间传递 Sequence

可移植请求封装使用相同的 Action／Sequence 词汇：

~~~json
{"sequence":{"timing":"serial","steps":[{"targets":[{"led":0,"color":"#ff0000"}],"fade_ms":0,"hold_ms":1000}],"repeat":1,"on_finish":"off"}}
~~~

导入与导出不播放。断开浏览器并显式启动原生 daemon 后，匹配 API v1 的 CLI 可以预览或保存文件：

~~~sh
./nb1 control preview light.sequence.json
./nb1 control patterns save evening-light light.sequence.json
~~~

Preview 可选；保存主机 Pattern 既不播放，也不写设备内存。浏览器草稿和扩展存储不会自动共享原生文件库；原生命名颜色与 Pattern 需要显式传递流程。

## 数据、权限与兼容性

浏览器页面在本地处理颜色和导入文件，并使用其来源下的存储保存自身偏好。扩展使用独立的 Chrome profile 存储及权限流程。授权前请阅读[隐私与权限指南](https://b1ug.github.io/nb1-webhid/extension-download/docs/PRIVACY.zh-CN.md)；文档本身不能授予权限或检查设备。

当前浏览器工作是开发预览。软件渲染、Go／WASM 与假 HID 测试不构成实体播放、光学或倒计时生命周期资格。成功连接浏览器或原生 Mac／MK2 证据不能证明 Linux／Windows USB、MK3，或另一实体观察角度。设备 Pattern RAM、Flash、Notes 与上电效果仍不属于此浏览器流程。

## 候选身份

[在线构建记录](https://b1ug.github.io/nb1-webhid/site-build.json)列出当前部署的前端来源、扩展版本和 Go／WASM 编译器。当前浏览器构建固定使用 nb1 核心 v0.1.1（`b5cfe68cbb412d81a80d948b845aee5b0aba586b`）。报告问题时请附上构建记录和所下载 ZIP 的校验值。[首次公开预览](https://github.com/b1ug/nb1-webhid/tree/e2701e05aebcc0858cc328df0e728fd5c0cec2e4)的源码可供历史对照。

原生 [nb1 v0.1.3](install.zh-CN.md)、内嵌 Workbench、浏览器开发预览和扩展包是独立交付物。发布预览不会升级已安装的 daemon、更新旧硬件证据，也不代表 Web Store 上架。
