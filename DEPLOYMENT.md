# 🚀 GitHub Pages 部署教學

本文將詳細說明如何將 Partner Store Project 部署到 GitHub Pages，讓你的員工優惠平台可以在線上正常運行。

## 📋 部署前準備

### 1. 確認專案狀態
```bash
# 確保專案可以正常建置
npm run build

# 確認建置成功
ls dist/
```

### 2. 建立 GitHub Repository
1. 登入 [GitHub](https://github.com)
2. 點擊右上角 "+" → "New repository"
3. 輸入 repository 名稱（例如：`partner-store-project`）
4. 設定為 **Public**（GitHub Pages 免費版需要公開 repo）
5. 點擊 "Create repository"

## 🔧 配置 Vite 建置設定

### 1. 修改 `vite.config.js`
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/your-repo-name/', // 替換為你的 repo 名稱
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

**重要**: 將 `your-repo-name` 替換為你實際的 GitHub repository 名稱

### 2. 建立部署腳本
在 `package.json` 中添加部署腳本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

### 3. 安裝 gh-pages
```bash
npm install --save-dev gh-pages
```

## 📤 方法一：自動部署（推薦）

### 1. 建立 GitHub Actions 工作流程

建立 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 2. 推送代碼到 GitHub
```bash
# 初始化 Git（如果還沒有）
git init

# 添加所有文件
git add .

# 建立初始提交
git commit -m "🎉 Initial commit: Employee offers platform"

# 連接遠端 repository
git remote add origin https://github.com/your-username/your-repo-name.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

### 3. 啟用 GitHub Pages
1. 在 GitHub repository 頁面，點擊 "Settings"
2. 滾動到 "Pages" 部分
3. 在 "Source" 下選擇 "GitHub Actions"
4. 等待部署完成（約 2-5 分鐘）

## 📤 方法二：手動部署

### 1. 建置專案
```bash
npm run build
```

### 2. 手動部署
```bash
# 使用 gh-pages 套件
npm run deploy

# 或手動推送 dist 資料夾
git subtree push --prefix dist origin gh-pages
```

### 3. 設定 GitHub Pages
1. 在 repository "Settings" → "Pages"
2. Source 選擇 "Deploy from a branch"
3. Branch 選擇 "gh-pages" 
4. 資料夾選擇 "/ (root)"
5. 點擊 "Save"

## 🔍 部署後檢查

### 1. 確認部署狀態
- 在 repository 的 "Actions" 頁籤查看部署狀態
- 綠色勾勾表示部署成功
- 紅色 X 表示部署失敗，點擊查看錯誤訊息

### 2. 訪問網站
部署成功後，你的網站將可以在以下網址訪問：
```
https://your-username.github.io/your-repo-name/
```

### 3. 測試功能
- ✅ 檢查頁面是否正常載入
- ✅ 測試GPS定位功能（需要 HTTPS）
- ✅ 測試手動地址搜尋
- ✅ 確認優惠卡片顯示正常
- ✅ 測試優惠詳情彈窗

## 🐛 常見問題排除

### 問題 1: 頁面顯示 404
**原因**: `base` 路徑設定錯誤

**解決方案**:
```javascript
// vite.config.js
export default defineConfig({
  base: '/your-actual-repo-name/', // 確保與 GitHub repo 名稱一致
})
```

### 問題 2: 資源無法載入
**原因**: 相對路徑問題

**解決方案**:
1. 確認 `vite.config.js` 中的 `base` 設定
2. 重新建置並部署：
```bash
npm run build
git add dist
git commit -m "Fix asset paths"
git push
```

### 問題 3: 地理定位無法使用
**原因**: HTTP 環境下瀏覽器限制

**解決方案**: GitHub Pages 自動提供 HTTPS，確保使用 `https://` 網址訪問

### 問題 4: 部署失敗
**檢查步驟**:
1. 確認 Node.js 版本相容性
2. 檢查 `package.json` 語法
3. 查看 GitHub Actions 錯誤日誌
4. 確認所有依賴都已正確安裝

## 🔄 更新部署

### 自動更新（推薦）
每次推送到 `main` 分支時會自動觸發部署：
```bash
# 修改代碼後
git add .
git commit -m "✨ Add new feature"
git push origin main
```

### 手動更新
```bash
npm run build
npm run deploy
```

## 🌍 自定義域名（選用）

如果你有自己的域名：

### 1. 建立 CNAME 文件
在 `public/` 資料夾建立 `CNAME` 文件：
```
your-domain.com
```

### 2. 設定 DNS
在你的域名提供商設定 CNAME 記錄：
```
CNAME    www    your-username.github.io
```

### 3. GitHub 設定
在 repository "Settings" → "Pages" → "Custom domain" 輸入你的域名

## 📊 部署最佳實踐

### 1. 環境變數管理
```javascript
// 在代碼中使用環境檢查
const isProduction = import.meta.env.PROD
const baseURL = isProduction 
  ? 'https://your-username.github.io/your-repo-name/' 
  : 'http://localhost:5173/'
```

### 2. 建置最佳化
```javascript
// vite.config.js
export default defineConfig({
  build: {
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'pinia']
        }
      }
    }
  }
})
```

### 3. 快取策略
GitHub Pages 會自動處理靜態資源快取，但可以在 `public/` 添加 `_headers` 文件進行自定義

## ✅ 部署檢查清單

- [ ] `vite.config.js` 中 `base` 路徑正確
- [ ] GitHub repository 設定為 Public
- [ ] GitHub Actions 工作流程文件已建立
- [ ] 代碼已推送到 `main` 分支
- [ ] GitHub Pages 已啟用並設定為 GitHub Actions
- [ ] 部署成功（Actions 頁籤顯示綠色）
- [ ] 網站可以正常訪問
- [ ] 所有功能測試通過

## 🎉 完成！

恭喜！你的員工優惠平台現已成功部署到 GitHub Pages。員工們現在可以透過網址隨時隨地查找附近的專屬優惠了！

---

## 📞 需要幫助？

如果在部署過程中遇到問題：
1. 檢查 GitHub Actions 的錯誤日誌
2. 確認所有設定檔案語法正確
3. 參考 [GitHub Pages 官方文檔](https://docs.github.com/pages)
4. 在專案 Issues 中尋求協助