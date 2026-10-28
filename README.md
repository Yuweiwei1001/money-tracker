# 记账（Money Tracker）

一个只在本地运行的极简记账 App。支持收支记录、分类备注、月度预算、按日期导出给 AI 分析；不登录、不联网、不上传数据。

这是一个个人自用的小工具，代码优先保证简单可读，不追求生产级抽象。

## 功能

- **记一笔**：支出 / 收入、金额、分类、日期、备注
- **首页**：本月支出、本月收入、本月结余、预算进度、最近 10 笔
- **明细**：本月 / 上月 / 自定义日期范围，显示区间合计与笔数
- **编辑与删除**：点任意记录修改，删除前二次确认
- **本月预算**：每月一个支出上限，允许超支；第一次超过时提醒，首页常驻“已超支”
- **导出**：Markdown（适合贴给 AI）、CSV（Excel / WPS 可打开）、一键复制文本
- **备份与恢复**：JSON 文件，包含全部记录和预算设置
- **本地优先**：数据只保存在设备上，不需要账号

## 技术栈

- Expo SDK 58 / React Native 0.88 / React 19
- Expo Router
- TypeScript
- expo-sqlite（本地存储）
- expo-file-system / expo-sharing / expo-document-picker / expo-clipboard

## 运行

需要 Node.js 22.13+（Expo SDK 58 的官方要求）。

```bash
git clone https://github.com/Yuweiwei1001/money-tracker.git
cd money-tracker
npm install
npm start
```

手机安装 Expo Go，和电脑连同一个 Wi-Fi，扫描终端里的二维码。

也可以直接在浏览器预览：

```bash
npm run web
```

代码检查：

```bash
npm run typecheck
npm run lint
```

## 数据说明

- 所有账目只保存在设备本地，不联网、不上传、不需要登录。
- Expo Go 和正式安装包的数据不互通；换形态或换手机前，请在设置里生成备份文件。
- 卸载 App 会删除本地数据，卸载前先备份。

## 项目结构

```text
src/
  app/         页面与路由
  components/  通用组件
  hooks/       自定义 Hook
  lib/         数据模型、日期、金额、导出、备份、存储
  store/       全局数据状态
  theme/       颜色与主题
```

## 已知限制

- 第一版分类固定，不能自定义
- 预算目前是每月一个总额，不做按分类预算
- 没有账户（现金 / 微信 / 支付宝）、图表、周期账单
- 没有云同步和登录
- 没有内置 AI 分析、语音记账
- 提醒只在 App 内，不发系统通知

## 后续计划

- 语音记账
- App 内置 AI 分析
- 自定义分类
- 账户与图表
- 云同步（可选）

## 文档

- [第一版需求与验收清单](docs/需求清单-第一版.md)

## 许可证

[MIT](LICENSE)
