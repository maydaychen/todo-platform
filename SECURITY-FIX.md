# 🔐 安全修复通知

## ⚠️ 问题说明

GitHub 检测到项目中包含敏感信息（密码）。

## 🛠️ 已修复的问题

### 1. 移除硬编码密码

**文件**: `backend/scripts/init-db.js`

**之前**:
```javascript
const password = 'gjy!MVX!mcx.etb7vwe' // 硬编码密码
```

**现在**:
```javascript
const password = process.env.INITIAL_PASSWORD || 'ChangeMe@123456' // 从环境变量读取
```

### 2. 清理 Git 历史

密码仍然存在于 Git 历史记录中，需要清理：

```bash
# 方法 1: 使用 BFG Repo-Cleaner（推荐）
# 安装 BFG
curl -L https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar -o bfg.jar

# 清理密码
java -jar bfg.jar --replace-text passwords.txt repo.git

# 方法 2: 使用 git filter-branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/scripts/init-db.js" \
  --prune-empty --tag-name-filter cat -- --all

# 推送清理后的历史
git push --force --all
git push --force --tags
```

### 3. 更新 .env.example

已添加 `INITIAL_PASSWORD` 变量说明。

## 📋 后续操作

### 立即执行

1. **修改 GitHub 密码**（如果已泄露）
2. **通知用户修改密码**
3. **清理 Git 历史**（见上方命令）

### 长期建议

1. **使用密钥管理服务**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault

2. **添加预提交钩子**
   ```bash
   # 安装 detect-secrets
   pip install detect-secrets
   
   # 初始化
   detect-secrets scan > .secrets.baseline
   
   # 预提交检查
   detect-secrets-hook --baseline .secrets.baseline
   ```

3. **GitHub Secret Scanning**
   - 启用 GitHub Advanced Security
   - 开启 Secret Scanning 功能

## ✅ 当前状态

| 项目 | 状态 |
|------|------|
| 代码中的密码 | ✅ 已移除 |
| Git 历史中的密码 | ⚠️ 需要清理 |
| .env 文件 | ✅ 已在 .gitignore |
| .env.example | ✅ 已更新 |

## 📞 联系方式

如有疑问，请联系项目维护者。

---

**修复日期**: 2026-03-12  
**修复者**: Haro 🤖
