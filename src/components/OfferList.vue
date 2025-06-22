<template>
  <div class="offer-list">
    <!-- 位置狀態提示 -->
    <div v-if="!userLocation" class="location-prompt">
      <div class="prompt-content">
        <Icon name="location" size="lg" class="text-blue-500" />
        <h3 class="prompt-title">設定您的位置</h3>
        <p class="prompt-text">使用GPS定位或手動輸入地址來找到附近的員工專屬優惠</p>
        
        <div class="location-options">
          <button @click="$emit('get-location')" class="get-location-btn primary">
            <Icon name="navigation" size="sm" />
            使用GPS定位
          </button>
          <button @click="showCustomLocation = !showCustomLocation" class="custom-location-btn">
            <Icon name="search" size="sm" />
            手動輸入地址
          </button>
        </div>
      </div>

      <!-- 自定義位置輸入 -->
      <div v-if="showCustomLocation" class="custom-location-section">
        <CustomLocationInput @location-selected="handleCustomLocation" />
      </div>
    </div>

    <!-- 優惠列表 -->
    <div v-else-if="offers.length > 0" class="offers-container">
      <!-- 結果摘要 -->
      <div class="results-summary">
        <div class="summary-content">
          <Icon name="check-circle" class="text-green-500" />
          <h3 class="summary-title">找到 {{ offers.length }} 個附近優惠</h3>
        </div>
        <div class="location-actions">
          <div class="location-info">
            <Icon name="navigation" size="sm" class="text-blue-500" />
            <span class="location-text">5km 範圍內</span>
          </div>
          <button @click="showLocationOptions = !showLocationOptions" class="change-location-btn">
            <Icon name="edit" size="sm" />
            更改位置
          </button>
        </div>
      </div>

      <!-- 位置選項 (在有優惠時顯示) -->
      <div v-if="showLocationOptions" class="location-change-panel">
        <div class="panel-header">
          <h4 class="panel-title">更改搜尋位置</h4>
          <button @click="showLocationOptions = false" class="close-panel-btn">
            <Icon name="close" size="sm" />
          </button>
        </div>
        <div class="location-options-panel">
          <button @click="$emit('get-location'); showLocationOptions = false" class="location-option-btn">
            <Icon name="navigation" size="sm" />
            <div class="option-content">
              <span class="option-title">重新GPS定位</span>
              <span class="option-desc">使用目前所在位置</span>
            </div>
          </button>
          <button @click="showCustomLocationInPanel = !showCustomLocationInPanel" class="location-option-btn">
            <Icon name="search" size="sm" />
            <div class="option-content">
              <span class="option-title">手動輸入地址</span>
              <span class="option-desc">搜尋特定地點附近</span>
            </div>
          </button>
        </div>
        
        <div v-if="showCustomLocationInPanel" class="custom-location-in-panel">
          <CustomLocationInput @location-selected="handlePanelLocationSelected" />
        </div>
      </div>

      <!-- 優惠卡片流 -->
      <div class="offers-flow">
        <OfferCard 
          v-for="(offer, index) in offers" 
          :key="`${offer.store.id}-${offer.title}-${index}`"
          :offer="offer"
          @offer-click="handleOfferClick"
        />
      </div>
    </div>

    <!-- 無優惠狀態 -->
    <div v-else class="no-offers-state">
      <div class="no-offers-content">
        <Icon name="search" size="lg" class="text-gray-400" />
        <h3 class="no-offers-title">附近暫無員工專屬優惠</h3>
        <p class="no-offers-text">
          目前您附近 5km 內沒有提供員工專屬優惠的店家
        </p>
        <div class="no-offers-actions">
          <button @click="$emit('get-location')" class="retry-btn">
            <Icon name="refresh" size="sm" />
            重新定位
          </button>
          <button @click="expandSearch" class="expand-btn">
            <Icon name="zoom-out" size="sm" />
            擴大搜尋範圍至10公里
          </button>
          <button @click="showCustomLocationInEmptyState = !showCustomLocationInEmptyState" class="expand-btn">
            <Icon name="search" size="sm" />
            手動輸入位置
          </button>
        </div>
      </div>

      <div v-if="showCustomLocationInEmptyState" class="custom-location-in-empty-state">
        <CustomLocationInput @location-selected="handleEmptyStateLocationSelected" />
      </div>
    </div>

    <!-- 搜尋提示 -->
    <div v-if="offers.length > 0" class="search-tips">
      <h4 class="tips-title">
        <Icon name="lightbulb" size="sm" class="text-yellow-500" />
        使用便利貼
      </h4>
      <ul class="tips-list">
        <li>點擊優惠卡片查看詳細使用說明</li>
        <li>直接撥打電話確認優惠是否仍有效</li>
        <li>建議在前往前先致電確認營業時間</li>
      </ul>
    </div>
  </div>
</template>

<script>
import OfferCard from './OfferCard.vue'
import CustomLocationInput from './CustomLocationInput.vue'
import Icon from './Icon.vue'

export default {
  name: 'OfferList',
  components: {
    OfferCard,
    CustomLocationInput,
    Icon
  },
  props: {
    offers: {
      type: Array,
      default: () => []
    },
    userLocation: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showCustomLocation: false,
      showLocationOptions: false,
      showCustomLocationInPanel: false,
      showCustomLocationInEmptyState: false // 新增狀態，控制無優惠時的輸入框
    }
  },
  methods: {
    handleOfferClick(offer) {
      this.$emit('offer-selected', offer)
    },

    expandSearch() {
      // 未來可以實作擴大搜尋範圍的功能
      console.log('Expand search radius to 10km')
      this.$emit('expand-search', 10) // 可以將範圍作為參數傳遞
    },

    handleCustomLocation(location) {
      this.showCustomLocation = false
      this.$emit('custom-location-selected', location)
    },

    handlePanelLocationSelected(location) {
      this.showLocationOptions = false
      this.showCustomLocationInPanel = false
      this.$emit('custom-location-selected', location)
    },

    // 新增方法，處理在無優惠狀態下選擇位置後的操作
    handleEmptyStateLocationSelected(location) {
      this.showCustomLocationInEmptyState = false
      this.$emit('custom-location-selected', location)
    }
  },
  emits: ['offer-selected', 'get-location', 'expand-search', 'custom-location-selected']
}
</script>

<style scoped>
.offer-list {
  max-width: 800px;
  margin: 0 auto;
}

/* 位置提示 */
.location-prompt {
  text-align: center;
  padding: 3rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: var(--border-radius-lg);
  color: white;
  margin-bottom: 2rem;
}

.prompt-content {
  max-width: 400px;
  margin: 0 auto;
}

.prompt-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
}

.prompt-text {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.location-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.get-location-btn,
.custom-location-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: var(--border-radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.get-location-btn.primary {
  background: white;
  color: var(--primary-color);
}

.get-location-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.custom-location-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.custom-location-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.custom-location-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

/* 結果摘要 */
.results-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.location-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.change-location-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface-hover);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.change-location-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.location-change-panel {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-text-color);
}

.close-panel-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-panel-btn:hover {
  background: var(--surface-hover);
  color: var(--primary-color);
}

.location-options-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.location-option-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--surface-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.location-option-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.option-title {
  font-weight: 500;
  font-size: 0.875rem;
}

.option-desc {
  font-size: 0.75rem;
  opacity: 0.8;
}

.custom-location-in-panel {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.summary-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-text-color);
}

.location-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface-hover);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
}

.location-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

/* 優惠流 */
.offers-container {
  margin-bottom: 2rem;
}

.offers-flow {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 無優惠狀態 */
.no-offers-state {
  text-align: center;
  padding: 4rem 1.5rem;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  margin-bottom: 2rem;
}

.no-offers-content {
  max-width: 400px;
  margin: 0 auto;
}

.no-offers-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 1rem 0 0.5rem;
}

.no-offers-text {
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 2rem;
}

.no-offers-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-btn, .expand-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-color);
  background: var(--surface-color);
  color: var(--primary-color);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover, .expand-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* 搜尋提示 */
.search-tips {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  margin-top: 2rem;
}

.tips-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-text-color);
  margin-bottom: 1rem;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  padding: 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  border-bottom: 1px solid #e9ecef;
}

.tips-list li:last-child {
  border-bottom: none;
}

.tips-list li:before {
  content: "💡";
  margin-right: 0.5rem;
}

/* 為無優惠狀態下的自定義位置輸入框新增一些間距 */
.custom-location-in-empty-state {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: var(--surface-hover);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .offer-list {
    padding: 0 1rem;
  }

  .results-summary {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .no-offers-actions {
    flex-direction: column;
    align-items: center;
  }

  .retry-btn, .expand-btn {
    width: 100%;
    max-width: 200px;
  }

  .location-prompt {
    margin: 0 -1rem 2rem;
    border-radius: 0;
  }
}
</style>