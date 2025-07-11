# 🏪 Partner Store Project - 員工優惠 + 社群推薦平台

> 為員工提供專屬優惠搜尋與社群推薦店家的綜合服務平台

## 📱 核心使用情境

**「作為一名員工，當我在外面（例如：午休、拜訪客戶後），我希望能打開手機，立即看到離我最近的合作店家提供了哪些專屬優惠，並快速了解如何使用這些優惠。」**

## ✨ 主要功能

### 🎯 雙模式優惠檢視 (NEW!)
- **📍 附近優惠**: 基於GPS定位的5km範圍內實體店家優惠
- **👑 通用優惠**: 全通路適用的員工專屬服務優惠
- **智慧切換**: 頂部切換器讓使用者自由選擇檢視模式
- **數量顯示**: 即時顯示每種類型的可用優惠數量

### 🚀 智慧優惠分類系統 (NEW!)
- **自動分類**: 根據店家地理座標自動區分實體店家與線上服務
- **彈性檢視**: 使用者可依需求切換「附近實體優惠」或「全通路服務」
- **引導機制**: 當附近無優惠時，自動推薦全通路優惠選項
- **優化體驗**: 解決地理位置限制，提供更多優惠選擇

### 📍 增強位置服務
- **GPS定位**: 一鍵取得當前精確位置
- **地址搜尋**: 整合 ArcGIS API，支援台灣全境地址查詢
- **快速選擇**: 預設常用地點（台北車站、信義區等）
- **即時建議**: 輸入時提供智能地址建議

### 🎆 社群推薦系統 (NEW!)
- **社群推薦**: 網友推薦的好吃、好玩店家
- **智慧標籤**: 自動區分優惠類型和社群推薦
- **雙篩選器**: 員工專享 + 社群推薦獨立篩選
- **純推薦支援**: 支援沒有優惠但值得一去的店家

### 🏷️ 優惠資訊展示
- **卡片式設計**: 3秒內理解核心優惠資訊
- **詳細說明**: 完整使用須知和有效期限
- **一鍵操作**: 直接撥打電話或開啟導航
- **條件顯示**: 距離資訊僅在實體店家優惠中顯示

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
│   ├── OfferCard.vue    # 優惠卡片組件（支援條件距離顯示）
│   ├── OfferList.vue    # 優惠列表組件（雙檢視模式切換）
│   ├── OfferModal.vue   # 優惠詳情彈窗
│   ├── CustomLocationInput.vue  # 自定義位置輸入
│   └── Icon.vue         # 圖標組件
├── stores/
│   └── useStoreStore.js # Pinia 狀態管理（新增 channelOffers & nearbyPhysicalOffers getters）
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
  "phone": "聯絡電話",        // 可選欄位，無電話的店家可省略或設為 null
  "lat": 25.0338,          // 有座標 = 實體店家 (附近優惠)
  "lng": 121.5645,         // 無座標 = 全通路服務 (通用優惠)
  "openingHours": "營業時間",
  "offers": [
    {
      "offer_id": 101,
      "store_id": 1,
      "type": "discount",
      "title": "優惠標題",
      "description": "優惠詳細說明",
      "validUntil": "2024-12-31",
      "communityRecommended": true,  // 社群推薦 (取代 featured)
      "isEmployeeOffer": true       // true=員工專享, false=一般優惠, null=純社群推薦
    }
  ]
}
```

### 優惠資料格式 (Offers 表)
```json
{
  "offer_id": 101,                    // 優惠的唯一識別碼
  "store_id": 1,                      // 關聯到 Stores 表的店家 ID
  "type": "discount",                // 優惠類型：discount, cashback, gift, member, bundle
  "title": "員工專享：美食街餐電8折",
  "description": "出示員工證享美食街所有餐電8折優惠，不限消費金額",
  "validUntil": "2025-12-31",         // 優惠有效截止日期
  "communityRecommended": true,       // 是否為社群推薦
  "isEmployeeOffer": true             // true=員工專享, false=一般優惠, null=純社群推薦
}
```

### 🔄 智慧分類系統 (NEW!)

#### 店家地理分類
- **實體店家**: `lat` 和 `lng` 有有效座標值 → 顯示在「📍 附近優惠」
- **全通路服務**: `lat` 或 `lng` 為 `null` → 顯示在「👑 通用優惠」
- **距離計算**: 僅對有座標的實體店家計算距離和步行時間

#### 優惠類型標籤
- **員工專享**: `isEmployeeOffer: true` → 👤 藍紫色標籤
- **一般優惠**: `isEmployeeOffer: false` → 👥 綠色標籤
- **純社群推薦**: `isEmployeeOffer: null` + `communityRecommended: true` → ⭐ 金色標籤
- **社群推薦**: `communityRecommended: true` → ❤️ 紅橙色標籤

### 優惠類型
- `discount` - 折扣優惠
- `cashback` - 現金回饋  
- `gift` - 贈品活動
- `member` - 會員專屬
- `bundle` - 套餐組合

## 📈 更新日誌

### v3.1.0 - 定位系統相容性優化 (2025-01-09)

#### 🔧 技術架構優化
- **雙重備援定位**: 高精準度失敗時自動降級為低精準度定位
- **延長超時時間**: 高精準度模式從 10 秒延長到 20 秒
- **原生 Android 瀏覽器支援**: 顯著提升舊版瀏覽器定位成功率
- **網路定位備援**: 使用 Wi-Fi/基地台定位作為 GPS 失敗時的備案

#### 🎯 使用者體驗改善
- **無感知切換**: 使用者不會察覺定位方式的自動切換
- **提升成功率**: 室內或 GPS 訊號弱環境下的定位改善
- **向後相容**: 完全相容現有功能，無需額外設定

### v3.0.0 - 社群推薦系統 (2025-01-09)

#### 🎆 重大功能新增
- **社群推薦系統**: 新增 `communityRecommended` 欄位取代 `featured`
- **純推薦支援**: 支援沒有優惠但值得一去的店家 (`isEmployeeOffer: null`)
- **雙篩選器**: 員工專享 + 社群推薦獨立篩選功能
- **智慧標籤**: 自動區分優惠類型和社群推薦

#### 🎨 視覺設計升級
- **三種標籤類型**: 員工專享(藍紫)、一般優惠(綠色)、純社群推薦(金色)
- **雙標籤支援**: 同時顯示社群推薦和優惠類型標籤
- **響應式佈局**: 篩選器在手機版垂直排列，桌面版水平排列

#### 🔧 技術架構優化
- **空值相容性**: 支援 `isEmployeeOffer` 為 `null/undefined` 的情況
- **向後相容**: 同時支援 `featured` 和 `communityRecommended` 欄位
- **篩選邏輯強化**: 嚴格檢查優惠類型，避免空值干擾

### v2.0.0 - 雙模式優惠檢視系統 (2024-06-23)

#### 🚀 重大功能更新
- **新增雙檢視模式**: 分離「📍 附近優惠」與「👑 通用優惠」
- **頂部切換器**: 檢視模式切換器移至頂部，優化使用者選擇體驗
- **智慧分類系統**: 根據店家座標自動分類實體店家與全通路服務
- **數量徽章**: 即時顯示每種檢視模式的可用優惠數量

#### 🎯 使用者體驗改善
- **靈活檢視控制**: 使用者可自由選擇想查看的優惠類型
- **優化引導機制**: 當附近無優惠時，明顯推薦全通路優惠
- **條件式UI**: 距離資訊僅在實體店家優惠中顯示
- **平滑過渡動畫**: 檢視切換時的流暢視覺效果

#### 🛠️ 技術架構升級
- **Pinia Store 增強**: 新增 `channelOffers` 和 `nearbyPhysicalOffers` getters
- **智慧邏輯判斷**: 改用座標存在性判斷店家類型，不依賴 `store_type` 欄位
- **組件優化**: `OfferCard.vue` 支援條件式距離顯示
- **響應式設計**: 檢視切換器完全支援行動裝置

#### 📋 解決問題
- 修復了使用者在附近無優惠時無法發現全通路優惠的問題
- 優化了資料分類邏輯，適應現有資料結構
- 改善了介面資訊架構，避免單一頁面資訊過載

---

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
3. 設定優惠類型：
   - `isEmployeeOffer: true` - 員工專享優惠
   - `isEmployeeOffer: false` - 一般優惠
   - `isEmployeeOffer: null` - 純社群推薦（無優惠）
4. 設定社群推薦：`communityRecommended: true` 標記為社群推薦店家

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

### Q: 原生 Android 瀏覽器無法取得位置
**A**: 已優化定位系統，包含：
1. 雙重備援機制：高精準度失敗時自動嘗試低精準度定位
2. 延長超時時間：給予 GPS 更充裕的反應時間
3. 網路定位備援：使用 Wi-Fi/基地台定位提升成功率
4. 確保使用 HTTPS 協定訪問網站

## 📞 聯絡資訊

如有問題或建議，請透過以下方式聯絡：
- 建立 [Issue](../../issues)
- 發送 Pull Request
- 查看 [部署教學](DEPLOYMENT.md)

---

**🎯 專為員工設計，讓尋找優惠變得簡單直接！**
