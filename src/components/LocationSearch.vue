<template>
  <div class="location-search">
    <div class="search-header">
      <Icon name="location" size="lg" class="text-primary" />
      <h3 class="search-title">附近店家搜尋</h3>
    </div>

    <!-- 位置設定 -->
    <div class="location-section">
      <div class="current-location">
        <div class="location-info">
          <Icon name="navigation" size="sm" class="text-green-500" />
          <span v-if="userLocation" class="location-text">
            已取得您的位置 (精確度: {{ userLocation.accuracy || '未知' }}公尺)
          </span>
          <span v-else class="location-text text-gray-500">未取得位置資訊</span>
        </div>
        <button 
          @click="getCurrentLocation" 
          :disabled="isGettingLocation"
          class="location-btn"
          :class="{ 'loading': isGettingLocation }"
        >
          <Icon 
            :name="isGettingLocation ? 'loading' : 'refresh'" 
            size="sm" 
            :class="{ 'animate-spin': isGettingLocation }"
          />
          {{ isGettingLocation ? '定位中...' : '重新定位' }}
        </button>
      </div>

      <!-- 搜尋半徑設定 -->
      <div class="radius-control">
        <label class="radius-label">搜尋範圍</label>
        <div class="radius-options">
          <button 
            v-for="radius in radiusOptions" 
            :key="radius.value"
            @click="selectedRadius = radius.value"
            class="radius-option"
            :class="{ active: selectedRadius === radius.value }"
          >
            {{ radius.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 附近店家結果 -->
    <div v-if="nearbyStores.length > 0" class="nearby-results">
      <div class="results-header">
        <h4 class="results-title">
          附近 {{ selectedRadius }}km 內找到 {{ nearbyStores.length }} 家店
        </h4>
        <select v-model="sortBy" class="sort-select">
          <option value="distance">距離優先</option>
          <option value="offers">優惠優先</option>
        </select>
      </div>

      <div class="stores-grid">
        <div 
          v-for="store in sortedNearbyStores" 
          :key="store.id"
          class="nearby-store-card"
          @click="$emit('store-selected', store)"
        >
          <div class="store-header">
            <h5 class="store-name">{{ store.name }}</h5>
            <div class="distance-info">
              <Icon name="navigation" size="sm" class="text-blue-500" />
              <span class="distance">{{ store.distance }}km</span>
            </div>
          </div>

          <div class="store-details">
            <div class="store-meta">
              <span class="category">{{ store.category }}</span>
            </div>

            <div v-if="store.featuredOffer" class="quick-offer">
              <Icon name="tag" size="sm" class="text-green-500" />
              <span class="offer-text">{{ store.featuredOffer.title }}</span>
            </div>

            <div class="travel-info">
              <Icon name="clock" size="sm" class="text-gray-500" />
              <span class="travel-time">步行約 {{ calculateWalkTime(store.distance) }} 分鐘</span>
            </div>
          </div>

          <div class="quick-actions">
            <button @click.stop="openMap(store)" class="action-btn map-btn">
              <Icon name="map" size="sm" />
              導航
            </button>
            <button @click.stop="callStore(store)" class="action-btn call-btn">
              <Icon name="phone" size="sm" />
              撥打
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 無結果狀態 -->
    <div v-else-if="userLocation && !isGettingLocation" class="no-results">
      <Icon name="search" size="lg" class="text-gray-400" />
      <h4 class="no-results-title">附近 {{ selectedRadius }}km 內無店家</h4>
      <p class="no-results-text">嘗試擴大搜尋範圍或移動到其他位置</p>
      <button @click="selectedRadius = 10" class="expand-search-btn">
        <Icon name="zoom-out" size="sm" />
        擴大至 10km 搜尋
      </button>
    </div>

    <!-- 需要定位提示 -->
    <div v-else-if="!userLocation && !isGettingLocation" class="location-prompt">
      <Icon name="location" size="lg" class="text-blue-500" />
      <h4 class="prompt-title">開啟位置服務</h4>
      <p class="prompt-text">為您搜尋附近的優惠店家</p>
      <button @click="getCurrentLocation" class="get-location-btn">
        <Icon name="navigation" size="sm" />
        允許取得位置
      </button>
    </div>
  </div>
</template>

<script>
import Icon from './Icon.vue'

export default {
  name: 'LocationSearch',
  components: {
    Icon
  },
  props: {
    allStores: {
      type: Array,
      default: () => []
    },
    userLocation: {
      type: Object,
      default: null
    },
    isGettingLocation: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedRadius: 3, // 預設3km
      sortBy: 'distance',
      radiusOptions: [
        { value: 1, label: '1km' },
        { value: 3, label: '3km' },
        { value: 5, label: '5km' },
        { value: 10, label: '10km' }
      ]
    }
  },
  computed: {
    nearbyStores() {
      if (!this.userLocation) return []

      return this.allStores
        .map(store => ({
          ...store,
          distance: this.calculateDistance(store.lat, store.lng),
          featuredOffer: store.offers?.find(offer => offer.featured)
        }))
        .filter(store => store.distance <= this.selectedRadius)
    },

    sortedNearbyStores() {
      let sorted = [...this.nearbyStores]

      switch (this.sortBy) {
        case 'distance':
          sorted.sort((a, b) => a.distance - b.distance)
          break
        case 'offers':
          sorted.sort((a, b) => {
            const aOffers = a.offers?.length || 0
            const bOffers = b.offers?.length || 0
            return bOffers - aOffers
          })
          break
      }

      return sorted
    }
  },
  methods: {
    getCurrentLocation() {
      this.$emit('get-location')
    },

    calculateDistance(storeLat, storeLng) {
      if (!this.userLocation) return null
      
      const R = 6371
      const dLat = this.deg2rad(storeLat - this.userLocation.lat)
      const dLng = this.deg2rad(storeLng - this.userLocation.lng)
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.deg2rad(this.userLocation.lat)) * Math.cos(this.deg2rad(storeLat)) * 
        Math.sin(dLng/2) * Math.sin(dLng/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      
      return +(R * c).toFixed(1)
    },

    deg2rad(deg) {
      return deg * (Math.PI/180)
    },

    calculateWalkTime(distance) {
      // 假設步行速度 5km/h
      const timeInHours = distance / 5
      const timeInMinutes = Math.round(timeInHours * 60)
      return Math.max(1, timeInMinutes)
    },

    openMap(store) {
      const url = `https://www.google.com/maps/dir/${this.userLocation.lat},${this.userLocation.lng}/${store.lat},${store.lng}`
      window.open(url, '_blank')
    },

    callStore(store) {
      window.open(`tel:${store.phone}`)
    }
  },
  watch: {
    selectedRadius() {
      this.$emit('radius-changed', this.selectedRadius)
    }
  },
  emits: ['get-location', 'store-selected', 'radius-changed']
}
</script>

<style scoped>
.location-search {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.search-title {
  font-size: var(--h3-font-size);
  font-weight: 600;
  color: var(--primary-text-color);
}

.location-section {
  margin-bottom: 1.5rem;
}

.current-location {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--surface-hover);
  border-radius: var(--border-radius-md);
  margin-bottom: 1rem;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.location-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.location-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.location-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.location-btn:not(:disabled):hover {
  background: var(--primary-hover-color);
}

.radius-control {
  margin-bottom: 1rem;
}

.radius-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary-text-color);
  margin-bottom: 0.5rem;
}

.radius-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.radius-option {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--surface-color);
  color: var(--text-secondary);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.radius-option:hover {
  border-color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.05);
}

.radius-option.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.nearby-results {
  margin-top: 1.5rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.results-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-text-color);
}

.sort-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  background: var(--surface-color);
  color: var(--primary-text-color);
  font-size: 0.875rem;
}

.stores-grid {
  display: grid;
  gap: 1rem;
}

.nearby-store-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nearby-store-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.store-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-text-color);
}

.distance-info {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--surface-hover);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
}

.distance {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
}

.store-details {
  margin-bottom: 1rem;
}

.store-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.category {
  background: var(--surface-hover);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}


.quick-offer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.offer-text {
  font-size: 0.875rem;
  color: var(--primary-color);
  font-weight: 500;
}

.travel-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.travel-time {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.quick-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--surface-color);
  color: var(--text-secondary);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.action-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.no-results, .location-prompt {
  text-align: center;
  padding: 3rem 1rem;
}

.no-results-title, .prompt-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 1rem 0 0.5rem;
}

.no-results-text, .prompt-text {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.expand-search-btn, .get-location-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.expand-search-btn:hover, .get-location-btn:hover {
  background: var(--primary-hover-color);
}
</style>