# 在浏览器中使用 blink(1)

[English](browser.md) · [原生安装](install.zh-CN.md) · [架构](architecture.zh-CN.md)

浏览器工具是独立的**开发预览**。前台页面通过共享 Go／WASM 编译器直接使用 WebHID；Chrome 扩展仍为实验版本。它们既不是原生 nb1 daemon，也不是这个静态文档站。原生 nb1 v0.1.1 仍是独立的正式安装路径。

## 先选择谁控制小灯

| 入口 | 设备持有者 | 范围 |
| --- | --- | --- |
| `/demo/` 的 nb1 内嵌 Workbench | 原生 nb1 daemon | 与原生客户端共用本机 HTTP API、Job、颜色与 Pattern。 |
| 独立浏览器页面 | 前台浏览器页面 | 直连 WebHID，九种 Action 与有限 Sequence，可选 Preview、显式 Play、Stop、Off。 |
| 实验性 Chrome 扩展 | 扩展上下文 | 直连控制与一个提醒流程；没有 Web Store 发行，后台提醒仍待用户验收。 |
| 这个文档站 | 无 | 静态指南与装饰模型，不申请硬件权限，不提供 daemon。 |

浏览器不参与原生 nb1 进程锁。直连 WebHID 前，应先停止或断开持有同灯的其他控制者；回到原生 nb1 前先 Disconnect 浏览器持有者。确认框只表示你已完成交接，不能替你释放另一个进程的设备句柄。

## 启动评审网页

以浏览器项目自己的 README 为准，获取已核验的预览地址、源码构建命令及匹配的扩展包。前端、Go／WASM 构建和托管具有独立于原生发行的来源身份。开发预览不是稳定原生下载，这个文档站也不托管 USB 控制器。

使用支持 WebHID 的桌面浏览器。释放之前的控制者后，显式 Connect 并使用仅过滤 blink(1) 的选择器。允许选择设备不代表已经成功打开；活动的原生持有者仍可能阻止连接。WebHID 需要浏览器所支持的安全来源或回环地址环境。

页面默认英文，可切换中文。Solid 依次提供两灯同色、分色、**LED 1 · blink(1)** 与 **LED 2 · ThingM**。**Play** 验证当前草稿，Preview 可选；导入或编辑的 JSON 会保持为草稿，直到你明确返回 Action 控件。

## 播放、停止与离开

浏览器通过随包 WASM 复用 Go 颜色、Action、Sequence 编译与播放计划。JavaScript 提供 WebHID 传输和浏览器计时，不代替原生 daemon 的设备归属或 Job 系统。

Stop 取消后续 Step，不能冻结已经发出的硬件渐变。Off 停调度并显式发送黑色；Disconnect 先停调度再关闭句柄，未确认关闭时保持未知。隐藏或离开页面会停止调度，返回不授权自动重播。

播放期间保持页面可见。浏览器计时与 USB 延迟可能增加实际时长。浏览器 Sequence 结束不是原生 Job，也不是光学测量；未知写入不能显示为成功播放，也不能静默重试。

## 加载 Chrome 扩展

扩展仍为**实验版本**，未上架 Chrome Web Store，后台提醒行为仍待用户验收。它的源码或开发包版本不代表生产就绪，也不会自动等于原生 CLI 版本。

只使用与浏览器源码匹配的扩展包及安装／隐私说明。开发包通过 Chrome 的**加载已解压的扩展程序**选择包含 `manifest.json` 的目录；扩展设备权限与网站权限独立，连接前仍应释放其他控制者。

浏览器重启、睡眠、授权变化或设备丢失都可能中断提醒，不能依赖扩展保证送达，也不能假设它会重连并补播上一次会话。需要不依赖前台页面的流程时，原生 daemon 是另一条独立路径。平台权限模型见 Chrome 官方[扩展 WebHID 文档](https://developer.chrome.com/docs/extensions/how-to/web-platform/webhid)。

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

浏览器页面在本地处理颜色和导入文件，并使用其来源下的存储保存自身偏好。扩展使用独立的 Chrome profile 存储及权限流程。授权前请阅读匹配包的隐私与安装指南；文档本身不能授予权限或检查设备。

当前浏览器工作是开发预览。软件渲染、Go／WASM 与假 HID 测试不构成实体播放、光学或倒计时生命周期资格。成功连接浏览器或原生 Mac／MK2 证据不能证明 Linux／Windows USB、MK3，或另一实体观察角度。设备 Pattern RAM、Flash、Notes 与上电效果仍不属于此浏览器流程。

## 候选身份

报告问题时使用实际浏览器包的公开源码提交、构建记录和资源散列。Go 编译器输入、前端源码、WASM 和扩展产物可以分别固定来源。分支名、源码链接或 manifest 版本不是发行校验值。

原生 [nb1 v0.1.1](install.zh-CN.md)、内嵌 Workbench、浏览器开发预览和扩展包是独立交付物。发布预览不会升级已安装的 daemon、更新旧硬件证据，也不代表 Web Store 上架。
