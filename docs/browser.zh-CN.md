# 在浏览器中使用 blink(1)

[English](browser.md) · [原生安装](install.zh-CN.md) · [支持范围](support.zh-CN.md)

独立的私有 [nb1-browser 仓库](https://github.com/b1ug/nb1-browser)已提供浏览器工作台与 Chrome 扩展，直连 WebHID 不需要原生 nb1 客户端。这个文档站仍是静态站点，不申请 USB 授权。

## 先选择谁控制小灯

| 入口 | 设备持有者 | 当前行为 |
| --- | --- | --- |
| daemon 的 /demo/ 内嵌工作台 | nb1 daemon | 共用原生 CLI／HTTP／MCP Job、本地颜色与 Pattern。 |
| nb1-browser 网页工作台 | 前台浏览器页面 | 九种 Action 与 serial／interval 有限 Sequence，可选预览、播放、停止和熄灯。 |
| Chrome 扩展 | 扩展 service worker | Set／Off 与一个分钟级提醒，尚无多 Step Pattern 播放器。 |
| 这个文档站 | 无 | 仅提供指南与示例。 |

浏览器不参与原生 nb1 进程锁。直连前请停止 daemon，或断开持有同灯的另一个网页／扩展；回到原生 nb1 前先 Disconnect 浏览器持有者。确认框只表示你已完成交接，不能替你停止其他进程。

## 启动评审网页

仓库为私有，请使用已有权限的账号。需要 Git、Python 3、Node.js 22.12+，以及该仓库指定的 Go 工具链：

~~~sh
git clone https://github.com/b1ug/nb1-browser.git
cd nb1-browser
npm run build
npm test
npm run check
npm run serve
~~~

在受支持的桌面 Chrome 打开 http://127.0.0.1:4176/。这个回环静态服务器与指定端点上的原生 daemon 独立，不安装服务，也不自行打开 USB。

网页默认英文，可显式切换中文。选择动作后调它自己的参数。常亮按两灯同色、分色、**LED 1 · blink(1)**、**LED 2 · ThingM** 排列，字标对应灯体的两个面。Fade／Blink／Breathe／Pulse 使用一个颜色，Alternate／Orbit 使用双色，Off／Rainbow 不需要颜色。交接控制权后，显式 Connect 并使用 Chrome 仅过滤 blink(1) 的选择器。**播放**自动检查当前请求，**预览**可选。编辑或导入高级 JSON 后，原文即为草稿，直到你明确回到动作参数。

## 播放、停止与离开

浏览器通过本地随包 WASM 复用固定 Go 颜色／Action／Sequence 编译器和播放计划，不在 JavaScript 中重写灯效数学。

Stop 取消后续 Step，不能冻结已发出的硬件渐变。Off 停止调度并显式发黑色。Disconnect 先停调度，再关闭句柄，即便在途写入失败也会尝试关闭；无法确认关闭时仍报告结果未知。隐藏或离开页面会停调度，返回不续播、不重放。

播放时保持页面可见。浏览器定时误差和 USB 延迟会增加实际时间。浏览器 Sequence 结束不是原生 Job，也不是光学测量；未知写入不会自动重试或追加清理。

## 加载 Chrome 扩展

网页的 **Extension package and instructions** 提供本地构建 ZIP。它的 manifest 为 0.1.0 开发版本，不是商店发行。

解压后在 chrome://extensions 开启开发者模式，选择**加载已解压的扩展程序**，定位含 manifest.json 的目录。释放其他控制器后从扩展自己的连接页连接。提醒期间可以关闭弹窗；倒计时为 1–1440 的整数分钟，到时颜色保持到 Off。Off 不取消未来提醒，需要时明确取消倒计时。

Chrome 117 是扩展 WebHID API 下限。浏览器重启、睡眠、授权变化或设备丢失时不保证提醒送达。扩展不自动重连或补播上个后台会话的倒计时。包校验、回退、移除和授权撤销见仓库的[安装与更新指南](https://github.com/b1ug/nb1-browser/blob/main/docs/DISTRIBUTION.zh-CN.md)。

## 在工具间传递 Sequence

导出使用既有的规范请求封装：

~~~json
{"sequence":{"timing":"serial","steps":[{"targets":[{"led":0,"color":"#ff0000"}],"fade_ms":0,"hold_ms":1000}],"repeat":1,"on_finish":"off"}}
~~~

导入、导出都不播放。断开浏览器，再显式启动原生 daemon 后，使用匹配 API v1 的 CLI：

~~~sh
./nb1 control preview light.sequence.json
./nb1 control patterns save evening-light light.sequence.json
~~~

保存主机 Pattern 不播放，也不写设备内存。浏览器草稿与扩展存储不会自动共享原生文件库。浏览器 Go 编译边界支持显式别名输入，但当前网页不读取原生已存颜色。

## 数据、权限与兼容性

颜色、JSON 与导入文件均在本地处理。网页按来源保存语言选择；扩展在 Chrome 本地 profile 中保存语言、提醒计划和最近状态。没有遥测、CDN、账号或上传服务。manifest 仅申请 storage 与 alarms，blink(1) 过滤的 WebHID 选择器独立处理设备授权；不申请键盘、录屏、辅助功能或全站点访问。详见[隐私说明](https://github.com/b1ug/nb1-browser/blob/main/docs/PRIVACY.zh-CN.md)。

现有独立 Chromium 156 检查覆盖软件渲染、消息、Go／WASM 与假 HID。用户已确认释放原生占用后 macOS／MK2 浏览器连接成功；完整真实播放、光学与倒计时生命周期仍待验收。连接成功与原生 Mac／MK2 证据均不能证明 Linux／Windows USB 或 MK3。设备 Pattern RAM、Flash、Notes 和上电效果不在此浏览器候选范围内。

Chrome 官方的[扩展 WebHID 指南](https://developer.chrome.com/docs/extensions/how-to/web-platform/webhid)说明 API 下限与授权流程。浏览器有 API，不代表 nb1 硬件已验收。需要不依赖前台网页运行时，请使用原生 daemon。

## 候选身份

浏览器运行逻辑基线：[071f061fb011](https://github.com/b1ug/nb1-browser/tree/071f061fb0115e62ab751c219312489391ff2e9c)。请以实际交付构建中的完整源码身份为准，缩写链接不是发行校验值。固定 Go 来源为 [72c2f097319bc7ce0086204b8e713c8b3f16cbbc](https://github.com/b1ug/nb1/tree/72c2f097319bc7ce0086204b8e713c8b3f16cbbc)。

实际包记录浏览器源码／dirty 状态和产物散列。原生 [nb1 v0.1.0](install.zh-CN.md)与这个私有浏览器候选分开发布；浏览器工具仍未提供公开发行、安装渠道或商店上架。
