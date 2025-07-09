<template>
  <div class="offer-list">
    <!-- 統一控制面板 -->
    <div class="control-panel">
      <!-- 員工專享切換器 -->
      <div class="employee-filter-section">
        <button 
          @click="toggleEmployeeOnly" 
          :class="{ active: filters.employeeOnly }"
          class="employee-toggle-btn">
          <Icon :name="filters.employeeOnly ? 'user-check' : 'users'" size="sm" />
          {{ filters.employeeOnly ? '只顯示員工專享' : '顯示所有優惠' }}
          <span v-if="filters.employeeOnly" class="employee-badge">專享</span>
        </button>
      </div>

      <!-- 檢視模式切換器 -->
      <div v-if="userLocation && (channelOffers.length > 0 || nearbyPhysicalOffers.length > 0)" class="view-switcher-section">
        <div class="view-switcher">
          <button 
            @click="currentView = 'all'" 
            :class="{ active: currentView === 'all' }"
            class="view-btn">
            <Icon name="grid" size="sm" />
            顯示所有優惠
            <span v-if="totalOffersCount > 0" class="count-badge">{{ totalOffersCount }}</span>
          </button>
          <button 
            @click="currentView = 'nearby'" 
            :class="{ active: currentView === 'nearby' }"
            class="view-btn">
            <Icon name="navigation" size="sm" />
            📍 附近優惠
            <span v-if="nearbyPhysicalOffers.length > 0" class="count-badge">{{ nearbyPhysicalOffers.length }}</span>
          </button>
          <button 
            @click="currentView = 'channel'" 
            :class="{ active: currentView === 'channel' }"
            class="view-btn">
            <Icon name="globe" size="sm" />
            👑 通用優惠
            <span v-if="channelOffers.length > 0" class="count-badge">{{ channelOffers.length }}</span>
          </button>
        </div>
      </div>
    </div>

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
    <div v-else-if="channelOffers.length > 0 || nearbyPhysicalOffers.length > 0" class="offers-container">
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

      <!-- 所有優惠檢視 -->
      <div v-if="currentView === 'all'" class="all-view">
        <!-- 結果摘要 -->
        <div class="results-summary">
          <div class="summary-content">
            <Icon name="grid" class="text-green-500" />
            <h3 class="summary-title">全部 {{ totalOffersCount }} 個優惠</h3>
          </div>
          <div class="summary-info">
            <div class="info-badge">
              <Icon name="check-circle" size="sm" class="text-green-500" />
              <span class="info-text">全部顯示</span>
            </div>
          </div>
        </div>

        <!-- 所有優惠 -->
        <div v-if="totalOffersCount > 0">
          <div class="offers-flow">
            <!-- 附近優惠 -->
            <template v-if="nearbyPhysicalOffers.length > 0">
              <div class="section-divider">
                <Icon name="navigation" size="sm" class="text-blue-500" />
                <span class="section-title">📍 附近優惠 ({{ nearbyPhysicalOffers.length }})</span>
              </div>
              <OfferCard 
                v-for="(offer, index) in nearbyPhysicalOffers" 
                :key="`all-nearby-${offer.store.id}-${offer.title}-${index}`"
                :offer="offer"
                @offer-click="handleOfferClick" 
              />
            </template>
            
            <!-- 通用優惠 -->
            <template v-if="channelOffers.length > 0">
              <div class="section-divider">
                <Icon name="globe" size="sm" class="text-purple-500" />
                <span class="section-title">👑 通用優惠 ({{ channelOffers.length }})</span>
              </div>
              <OfferCard 
                v-for="(offer, index) in channelOffers" 
                :key="`all-channel-${offer.store.id}-${offer.title}-${index}`"
                :offer="offer"
                @offer-click="handleOfferClick" 
              />
            </template>
          </div>
        </div>
      </div>

      <!-- 附近優惠檢視 -->
      <div v-if="currentView === 'nearby'" class="nearby-view">
        <!-- 結果摘要 -->
        <div class="results-summary">
          <div class="summary-content">
            <Icon name="navigation" class="text-blue-500" />
            <h3 class="summary-title">附近 {{ nearbyPhysicalOffers.length }} 個優惠</h3>
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

        <!-- 附近實體店家優惠 -->
        <div v-if="nearbyPhysicalOffers.length > 0">
          <div class="offers-flow">
            <OfferCard 
              v-for="(offer, index) in nearbyPhysicalOffers" 
              :key="`nearby-${offer.store.id}-${offer.title}-${index}`"
              :offer="offer"
              @offer-click="handleOfferClick" 
            />
          </div>
        </div>
        <div v-else class="no-nearby-offers">
          <div class="no-offers-content">
            <Icon name="map-pin" size="lg" class="text-gray-400" />
            <h3 class="no-offers-title">附近暫無實體店家優惠</h3>
            <p class="no-offers-text">
              目前您附近 5km 內沒有實體店家提供優惠
            </p>
            <div class="no-offers-actions">
              <button @click="$emit('get-location')" class="retry-btn">
                <Icon name="refresh" size="sm" />
                重新定位
              </button>
              <button @click="currentView = 'channel'" class="switch-view-btn">
                <Icon name="globe" size="sm" />
                查看通用優惠
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 通用優惠檢視 -->
      <div v-if="currentView === 'channel'" class="channel-view">
        <!-- 結果摘要 -->
        <div class="results-summary">
          <div class="summary-content">
            <Icon name="globe" class="text-purple-500" />
            <h3 class="summary-title">{{ channelOffers.length }} 個全通路優惠</h3>
          </div>
          <div class="summary-info">
            <div class="info-badge">
              <Icon name="check-circle" size="sm" class="text-green-500" />
              <span class="info-text">全通路適用</span>
            </div>
          </div>
        </div>

        <!-- 類別篩選器 -->
        <div v-if="channelOfferCategories.length > 1" class="category-filter">
          <div class="filter-header">
            <Icon name="filter" size="sm" class="text-gray-500" />
            <span class="filter-label">依類別篩選</span>
            <button v-if="filters.category" @click="clearCategoryFilter" class="clear-filter-btn">
              <Icon name="close" size="sm" />
              清除
            </button>
          </div>
          <div class="filter-options">
            <button 
              @click="setCategoryFilter('')"
              :class="{ active: !filters.category }"
              class="filter-btn">
              全部類別 ({{ allChannelOffersCount }})
            </button>
            <button 
              v-for="category in channelOfferCategories"
              :key="category"
              @click="setCategoryFilter(category)"
              :class="{ active: filters.category === category }"
              class="filter-btn">
              {{ category }} ({{ getCategoryCount(category) }})
            </button>
          </div>
        </div>

        <!-- 全通路優惠 -->
        <div v-if="channelOffers.length > 0">
          <div class="offers-flow">
            <OfferCard 
              v-for="(offer, index) in channelOffers" 
              :key="`channel-${offer.store.id}-${offer.title}-${index}`"
              :offer="offer"
              @offer-click="handleOfferClick" 
            />
          </div>
        </div>
        <div v-else class="no-channel-offers">
          <div class="no-offers-content">
            <Icon name="globe" size="lg" class="text-gray-400" />
            <h3 class="no-offers-title">暫無通用優惠</h3>
            <p class="no-offers-text">
              目前沒有全通路通用優惠
            </p>
            <div class="no-offers-actions">
              <button @click="currentView = 'nearby'" class="switch-view-btn">
                <Icon name="navigation" size="sm" />
                查看附近優惠
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 無優惠狀態 -->
    <div v-else class="no-offers-state">
      <div class="no-offers-content">
        <Icon name="search" size="lg" class="text-gray-400" />
        <h3 class="no-offers-title">附近暫無優惠</h3>
        <p class="no-offers-text">
          目前您附近 5km 內沒有提供優惠的店家
        </p>
        
        <!-- 如果有全通路優惠，優先推薦 -->
        <div v-if="channelOffers.length > 0" class="channel-suggestion">
          <div class="suggestion-content">
            <Icon name="lightbulb" size="md" class="text-yellow-500" />
            <h4 class="suggestion-title">但是有 {{ channelOffers.length }} 個全通路優惠！</h4>
            <p class="suggestion-text">這些優惠可以在任何地點使用，不受位置限制</p>
          </div>
          <button @click="currentView = 'channel'" class="suggestion-btn">
            <Icon name="globe" size="sm" />
            查看通用優惠
          </button>
        </div>

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
    <div v-if="(currentView === 'nearby' && nearbyPhysicalOffers.length > 0) || (currentView === 'channel' && channelOffers.length > 0)" class="search-tips">
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
import { mapState } from 'pinia'
import { useStoreStore } from '../stores/useStoreStore'
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
  computed: {
    ...mapState(useStoreStore, ['channelOffers', 'nearbyPhysicalOffers', 'allStores', 'channelOfferCategories', 'filters']),
    totalOffersCount() {
      return this.channelOffers.length + this.nearbyPhysicalOffers.length
    },
    allChannelOffersCount() {
      // 計算不受篩選影響的全部全通路優惠數量
      const offers = []
      this.allStores
        .filter(store => !store.lat || !store.lng || store.lat === null || store.lng === null)
        .forEach(store => {
          if (store.offers) {
            store.offers
              .filter(offer => offer.isEmployeeOffer)
              .forEach(offer => {
                offers.push(offer)
              })
          }
        })
      return offers.length
    }
  },
  data() {
    return {
      currentView: 'all', // 預設顯示所有優惠
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
    },

    // 類別篩選相關方法
    setCategoryFilter(category) {
      const storeInstance = useStoreStore()
      storeInstance.setFilters({ category })
    },

    clearCategoryFilter() {
      const storeInstance = useStoreStore()
      storeInstance.setFilters({ category: '' })
    },

    getCategoryCount(category) {
      // 計算特定類別的優惠數量
      const offers = []
      this.allStores
        .filter(store => !store.lat || !store.lng || store.lat === null || store.lng === null)
        .filter(store => store.category === category)
        .forEach(store => {
          if (store.offers) {
            store.offers
              .filter(offer => offer.isEmployeeOffer)
              .forEach(offer => {
                offers.push(offer)
              })
          }
        })
      return offers.length
    },

    toggleEmployeeOnly() {
      const storeInstance = useStoreStore()
      storeInstance.setFilters({ employeeOnly: !this.filters.employeeOnly })
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

/* 區塊標題樣式 */
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-text-color);
  margin-bottom: 1rem;
  margin-top: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title:first-child {
  margin-top: 0;
}

.section-title:before {
  content: "";
  width: 4px;
  height: 1.5rem;
  background: var(--primary-color);
  border-radius: 2px;
}

/* 全通路優惠區塊 */
.channel-offers-section {
  margin-bottom: 2rem;
}

/* 附近店家優惠區塊 */
.nearby-offers-section {
  margin-bottom: 2rem;
}

.no-nearby-offers {
  text-align: center;
  padding: 2rem;
  background: var(--surface-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  margin-top: 1rem;
}

/* 統一控制面板樣式 */
.control-panel {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.employee-filter-section {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.employee-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  border: 2px solid var(--border-color);
  background: var(--surface-hover);
  color: var(--text-secondary);
  border-radius: var(--border-radius-lg);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.employee-toggle-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.employee-toggle-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-color: #667eea;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.employee-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.25rem;
}

.view-switcher-section {
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
}

/* 檢視模式切換器樣式 */
.view-switcher {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  padding: 0.875rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.view-btn:hover {
  background: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
}

.view-btn.active {
  background: white;
  color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.count-badge {
  background: var(--primary-color);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: auto;
}

.view-btn.active .count-badge {
  background: var(--primary-color);
}

/* 檢視區塊樣式 */
.all-view,
.nearby-view,
.channel-view {
  animation: fadeIn 0.3s ease-in-out;
}

/* 區塊分隔器樣式 */
.section-divider {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem 0 1rem;
  padding: 0.75rem 1rem;
  background: var(--surface-hover);
  border-radius: var(--border-radius-md);
  border-left: 4px solid var(--primary-color);
}

.section-divider .section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
}

.section-divider:first-child {
  margin-top: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 摘要資訊樣式調整 */
.summary-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface-hover);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
}

.info-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

/* 切換檢視按鈕樣式 */
.switch-view-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--primary-color);
  background: var(--primary-color);
  color: white;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.switch-view-btn:hover {
  background: var(--primary-hover-color);
  border-color: var(--primary-hover-color);
  transform: translateY(-1px);
}

/* 無優惠狀態樣式調整 */
.no-channel-offers {
  text-align: center;
  padding: 3rem 1.5rem;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  margin-top: 1rem;
}

/* 類別篩選器樣式 */
.category-filter {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: space-between;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.clear-filter-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-filter-btn:hover {
  background: var(--surface-hover);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--surface-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-btn:hover {
  background: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.filter-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  font-weight: 600;
}

.filter-btn.active:hover {
  background: var(--primary-hover-color);
  border-color: var(--primary-hover-color);
}

/* 全通路優惠建議區塊 */
.channel-suggestion {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  border: 2px solid #f0c419;
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  margin: 2rem 0;
  text-align: center;
}

.suggestion-content {
  margin-bottom: 1.5rem;
}

.suggestion-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #856404;
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.suggestion-text {
  color: #856404;
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.9;
}

.suggestion-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f0c419;
  color: #856404;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: var(--border-radius-lg);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(240, 196, 25, 0.3);
}

.suggestion-btn:hover {
  background: #e6b800;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(240, 196, 25, 0.4);
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

  /* 控制面板響應式 */
  .control-panel {
    margin: 0 -1rem 1.5rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
    padding: 1rem;
  }

  .employee-filter-section {
    margin-bottom: 1rem;
  }

  .employee-toggle-btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.8rem;
  }

  .view-switcher-section {
    padding-top: 1rem;
  }

  .view-switcher {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .view-btn {
    font-size: 0.8rem;
    padding: 0.875rem 1rem;
    justify-content: center;
  }

  .count-badge {
    font-size: 0.7rem;
    padding: 0.125rem 0.5rem;
  }

  /* 區塊分隔器響應式 */
  .section-divider {
    margin: 1.5rem -1rem 1rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
    padding: 0.75rem 1rem;
    border-top: 3px solid var(--primary-color);
  }

  .section-divider .section-title {
    font-size: 0.9rem;
  }

  /* 摘要區塊響應式 */
  .summary-info {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  /* 建議區塊響應式 */
  .channel-suggestion {
    margin: 1.5rem -1rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .suggestion-title {
    font-size: 1rem;
    flex-direction: column;
    gap: 0.25rem;
  }

  .suggestion-btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    width: 100%;
    max-width: 250px;
  }

  /* 類別篩選器響應式 */
  .category-filter {
    margin: 0 -1rem 1.5rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
    padding: 1rem;
  }

  .filter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .filter-options {
    justify-content: center;
  }

  .filter-btn {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
    min-width: 0;
    flex: 1;
    text-align: center;
    justify-content: center;
  }

  .clear-filter-btn {
    align-self: flex-end;
  }
}
</style>