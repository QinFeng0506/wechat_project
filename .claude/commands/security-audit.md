请按照项目根目录 Skill.md 文件中「security-audit」章节的说明执行。

---

## 意图识别

收到 `/security-audit` 后，先解析用户输入，判断审计范围和深度：

| 用户说法示例 | 审计模式 | 说明 |
|-------------|:------:|------|
| `/security-audit`（无参数） | **全面审计** | 源码 + 配置 + 云开发，全量扫描 |
| `/security-audit 快速` | **快速扫描** | 只查 🔴 严重级别 |
| `/security-audit pages/admin/` | **目录审计** | 只审计管理后台页面 |
| `/security-audit app.js` | **单文件审计** | 只审计指定文件 |

---

## 审计范围定义

### 全面审计需要扫描的文件

| 范围 | 文件类型 | 搜索方式 |
|------|----------|----------|
| 页面源码 | `pages/**/*.js` `pages/**/*.wxml` | Glob 扫描 |
| 工具模块 | `utils/*.js` | 排除 `data.js` |
| 全局文件 | `app.js` `app.json` | 直接读取 |
| 配置文件 | `project.config.json` | 直接读取 |
| 云函数 | `cloudfunctions/**/*.js` | Glob 扫描 |

---

## 七大审计检查类别

### 检查项 1：硬编码敏感信息 🔴 严重

> **目标**：查找代码中是否明文写入了密码、密钥、AppSecret 等。

搜索关键词（不区分大小写）：
- `password`、`secret`、`apiKey`、`token`、`access_key`
- `AppSecret`、`private_key`
- `env:` 云环境 ID

**防误报**：区分变量声明（`let password = ''`）和真实硬编码（`const API_KEY = 'sk-xxx'`）。

### 检查项 2：云开发安全配置 🔴 严重

> **目标**：检查云开发相关配置和权限。

1. 检查 `app.js` 中 `wx.cloud.init()` 的环境 ID 是否硬编码
2. 检查云函数的数据库操作是否有权限校验
3. 建议的数据库权限设置（见 Skill.md）

### 检查项 3：数据注入风险 🔴 严重

> **目标**：检查用户输入是否被直接写入数据库。

搜索模式：
- `db.collection(...).add({ data: <用户输入> })` — 确认是否过滤
- `wx.request` 的参数拼接

### 检查项 4：敏感数据泄露 🟡 中等

> **目标**：检查用户隐私数据是否被不安全处理。

搜索模式：
- `console.log(.*openid`
- `console.log(.*phoneNumber`
- `console.log(.*userInfo`

### 检查项 5：输入验证缺失 🟡 中等

> **目标**：检查用户输入是否有校验。

重点检查：
- 预约金额/积分数量是否有范围校验
- 预约备注是否有长度限制
- 管理后台的输入是否有校验
- 图片上传是否限制类型和大小

### 检查项 6：权限控制 🟡 中等

> **目标**：检查管理员功能是否有权限校验。

检查所有 `pages/admin/` 页面的 `onLoad` 中是否有 `isAdmin` 校验。

### 检查项 7：其他安全隐患 🟢~🟡

- `console.log` 残留
- 硬编码的 URL/域名
- 未处理异常（缺少 try-catch 的云函数调用）
- 旧版 `wx.getUserInfo` 的使用（应用 `wx.getUserProfile` 替代）
