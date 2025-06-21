# 🏪 Partner Store Project - 員工專屬優惠平台

> 為員工提供便捷的附近店家專屬優惠搜尋服務

## 📱 核心使用情境

**「作為一名員工，當我在外面（例如：午休、拜訪客戶後），我希望能打開手機，立即看到離我最近的合作店家提供了哪些專屬優惠，並快速了解如何使用這些優惠。」**

## ✨ 主要功能

### 🎯 員工專屬優惠搜尋
- **自動定位**: 開啟應用自動取得GPS位置
- **手動地址**: 支援輸入任何台灣地址、地標搜尋
- **5km範圍**: 專注於步行可達的附近店家
- **員工專屬**: 只顯示員工可使用的特殊優惠

### 📍 智慧位置服務
- **GPS定位**: 一鍵取得當前精確位置
- **地址搜尋**: 整合 ArcGIS API，支援台灣全境地址查詢
- **快速選擇**: 預設常用地點（台北車站、信義區等）
- **即時建議**: 輸入時提供智能地址建議

### 🏷️ 優惠資訊展示
- **卡片式設計**: 3秒內理解核心優惠資訊
- **詳細說明**: 完整使用須知和有效期限
- **一鍵操作**: 直接撥打電話或開啟導航
- **距離顯示**: 精確距離和預估步行時間

## 🛠️ 技術架構

### 前端技術
- **Vue 3** - 現代化響應式框架
- **Pinia** - 輕量級狀態管理
- **Tailwind CSS** - 實用優先的CSS框架
- **Vite** - 快速建置工具

### 外部服務
- **ArcGIS Geocoding API** - 地址搜尋與座標轉換
- **Browser Geolocation API** - GPS定位服務
- **Google Apps Script API** - 雲端資料管理與存取

### 設計原則
- **行動裝置優先** (Mobile-First)
- **情境驅動** (Context-Driven) 
- **答案先決** (Answer-First)
- **極致簡潔** (Ruthless Simplicity)

## 🚀 快速開始

### 環境需求
- Node.js 16+ 
- npm 7+

### 安裝與運行
```bash
# 複製專案
git clone <repository-url>
cd Partner-Store-Project

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置產品版本
npm run build

# 預覽產品版本
npm run preview
```

### 開發伺服器
啟動後訪問 `http://localhost:5173`（依實際開啟的 port 為準） 開始使用

## 📁 專案結構

```
src/
├── components/           # Vue 組件
│   ├── OfferCard.vue    # 優惠卡片組件
│   ├── OfferList.vue    # 優惠列表組件
│   ├── OfferModal.vue   # 優惠詳情彈窗
│   ├── CustomLocationInput.vue  # 自定義位置輸入
│   └── Icon.vue         # 圖標組件
├── stores/
│   └── useStoreStore.js # Pinia 狀態管理（整合 Google Apps Script）
├── styles/              # 樣式文件
├── App.vue             # 主應用組件
└── main.js             # 應用入口點
```

## 📊 資料結構

### 店家資料格式
```json
{
  "id": 1,
  "name": "店家名稱",
  "category": "店家類別",
  "region": "所在地區",
  "address": "詳細地址",
  "phone": "聯絡電話",
  "lat": 25.0338,
  "lng": 121.5645,
  "openingHours": "營業時間",
  "offers": [
    {
      "type": "discount",
      "title": "優惠標題",
      "description": "優惠詳細說明",
      "validUntil": "2024-12-31",
      "featured": true,
      "isEmployeeOffer": true
    }
  ]
}
```

### 優惠類型
- `discount` - 折扣優惠
- `cashback` - 現金回饋  
- `gift` - 贈品活動
- `member` - 會員專屬
- `bundle` - 套餐組合

## 🔧 開發指南

### 資料管理
專案已整合 **Google Apps Script API** 進行雲端資料管理：

#### 新增店家資料
1. 將店家資料上傳至 Google Drive（JSON 格式）
2. 透過 Google Apps Script 建立 Web API
3. 在 `src/stores/useStoreStore.js` 中更新 `BASE_URL`
4. 使用 `companyId` 參數區分不同公司的資料

#### 本地開發
1. 確保 Google Apps Script API 已部署並可存取
2. 店家基本資訊格式包含座標（可使用 Google Maps 取得）
3. 添加員工專屬優惠（設定 `isEmployeeOffer: true`）

### 自定義樣式
- 主要顏色變數定義在 `src/styles/global.css`
- 組件樣式使用 Tailwind CSS 和 CSS 變數
- 響應式設計優先考慮移動裝置

### API 整合
- 地址搜尋使用 ArcGIS API，限制台灣範圍
- 可在 `CustomLocationInput.vue` 中調整搜尋參數

## 🌐 瀏覽器支援

- ✅ Chrome 80+
- ✅ Firefox 74+  
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 PWA 就緒

專案已配置為 Progressive Web App (PWA)：
- 離線快取支援
- 安裝到桌面功能
- 移動裝置優化

## 🤝 貢獻指南

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

此專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 文件

## 🚀 部署指南

詳細的 GitHub Pages 部署教學請參考 [DEPLOYMENT.md](DEPLOYMENT.md)

### 快速部署
1. Fork 此專案到你的 GitHub 帳號
2. 在 `vite.config.js` 中修改 `base` 為你的 repository 名稱
3. 確保安裝必要依賴：`npm install --save-dev terser`
4. 推送代碼，GitHub Actions 將自動部署
5. 在 repository Settings → Pages 啟用 GitHub Pages

## 🐛 常見問題排除

### Q: 建置時出現 "terser not found" 錯誤
**A**: Vite v3+ 需要手動安裝 terser 進行代碼壓縮
```bash
npm install --save-dev terser
npm run build
```

### Q: GitHub Pages 顯示 404 頁面
**A**: 檢查 `vite.config.js` 中的 `base` 設定是否與 repository 名稱一致
```javascript
export default defineConfig({
  base: '/your-actual-repo-name/', // 必須與 GitHub repo 名稱完全一致
})
```

### Q: 地理定位功能無法使用
**A**: 確保使用 HTTPS 訪問網站，GitHub Pages 會自動提供 HTTPS

### Q: 優惠資料無法載入
**A**: 檢查以下項目：
1. Google Apps Script API 是否正確部署並設為公開存取
2. `src/stores/useStoreStore.js` 中的 `BASE_URL` 是否為正確的 API 網址
3. 瀏覽器控制台是否有 API 請求錯誤
4. 確保傳入正確的 `companyId` 參數

### Q: 手機版介面顯示異常
**A**: 清除瀏覽器快取，確保載入最新的 CSS 檔案

## 📞 聯絡資訊

如有問題或建議，請透過以下方式聯絡：
- 建立 [Issue](../../issues)
- 發送 Pull Request
- 查看 [部署教學](DEPLOYMENT.md)

---

**🎯 專為員工設計，讓尋找優惠變得簡單直接！**
