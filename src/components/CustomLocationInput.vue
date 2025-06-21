<template>
  <div class="custom-location-input">
    <div class="input-header">
      <Icon name="search" size="sm" class="text-primary" />
      <h4 class="input-title">自定義位置</h4>
    </div>

    <!-- 地址搜尋輸入框 -->
    <div class="search-container">
      <div class="input-wrapper">
        <input
          v-model="searchQuery"
          @input="handleInput"
          @keydown.enter="searchLocation"
          @focus="showSuggestions = true"
          type="text"
          placeholder="輸入地址、地標或區域名稱..."
          class="location-input"
          :disabled="isSearching"
        />
        <button 
          @click="searchLocation"
          :disabled="!searchQuery.trim() || isSearching"
          class="search-btn"
        >
          <Icon 
            :name="isSearching ? 'loading' : 'search'" 
            size="sm"
            :class="{ 'animate-spin': isSearching }"
          />
        </button>
      </div>

      <!-- 搜尋建議列表 -->
      <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
        <div 
          v-for="(suggestion, index) in suggestions" 
          :key="index"
          @click="selectSuggestion(suggestion)"
          class="suggestion-item"
        >
          <Icon name="location" size="sm" class="text-gray-500" />
          <div class="suggestion-content">
            <div class="suggestion-text">{{ suggestion.text }}</div>
            <div class="suggestion-address">{{ suggestion.address }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速位置選項 -->
    <div class="quick-locations">
      <h5 class="quick-title">常用位置</h5>
      <div class="quick-buttons">
        <button 
          v-for="location in quickLocations" 
          :key="location.name"
          @click="selectQuickLocation(location)"
          class="quick-btn"
          :disabled="isSearching"
        >
          <Icon :name="location.icon" size="sm" />
          <span>{{ location.name }}</span>
        </button>
      </div>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="errorMessage" class="error-message">
      <Icon name="warning" size="sm" class="text-red-500" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- 當前選中的位置 -->
    <div v-if="selectedLocation" class="selected-location">
      <div class="selected-header">
        <Icon name="check-circle" size="sm" class="text-green-500" />
        <span class="selected-title">已選擇位置</span>
      </div>
      <div class="selected-content">
        <div class="selected-text">{{ selectedLocation.text }}</div>
        <div class="selected-address">{{ selectedLocation.address }}</div>
      </div>
      <button @click="confirmLocation" class="confirm-btn">
        <Icon name="check" size="sm" />
        確認使用此位置
      </button>
    </div>
  </div>
</template>

<script>
import Icon from './Icon.vue'

export default {
  name: 'CustomLocationInput',
  components: {
    Icon
  },
  data() {
    return {
      searchQuery: '',
      suggestions: [],
      showSuggestions: false,
      isSearching: false,
      errorMessage: '',
      selectedLocation: null,
      debounceTimer: null,
      quickLocations: [
        { name: '台北車站', icon: 'train', address: '台北市中正區北平西路3號' },
        { name: '信義區', icon: 'building', address: '台北市信義區' },
        { name: '西門町', icon: 'shopping', address: '台北市萬華區西門町' },
        { name: '東區', icon: 'heart', address: '台北市大安區忠孝東路四段' }
      ]
    }
  },
  methods: {
    handleInput() {
      this.errorMessage = ''
      
      // 清除之前的延遲搜尋
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }

      // 如果搜尋內容太短，清空建議
      if (this.searchQuery.trim().length < 2) {
        this.suggestions = []
        this.showSuggestions = false
        return
      }

      // 延遲搜尋建議
      this.debounceTimer = setTimeout(() => {
        this.searchSuggestions()
      }, 300)
    },

    async searchSuggestions() {
      if (!this.searchQuery.trim()) return

      try {
        const response = await this.geocodeAddress(this.searchQuery, true)
        this.suggestions = response.slice(0, 5) // 限制最多5個建議
        this.showSuggestions = true
      } catch (error) {
        console.error('搜尋建議失敗:', error)
        this.suggestions = []
      }
    },

    async searchLocation() {
      if (!this.searchQuery.trim()) return

      this.isSearching = true
      this.errorMessage = ''
      this.showSuggestions = false

      try {
        const results = await this.geocodeAddress(this.searchQuery)
        if (results && results.length > 0) {
          this.selectedLocation = results[0]
        } else {
          this.errorMessage = '找不到該地址，請嘗試更詳細的描述'
        }
      } catch (error) {
        this.errorMessage = '搜尋失敗，請檢查網路連線或稍後再試'
        console.error('地址搜尋失敗:', error)
      } finally {
        this.isSearching = false
      }
    },

    async geocodeAddress(address, isSuggestion = false) {
      const baseUrl = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates'
      
      const params = new URLSearchParams({
        f: 'json',
        singleLine: address,
        maxLocations: isSuggestion ? 5 : 1,
        outFields: 'Match_addr,StAddr,City',
        countryCode: 'TWN', // 限制在台灣
        category: isSuggestion ? '' : 'Address,POI,PointAddress,StreetAddress'
      })

      const response = await fetch(`${baseUrl}?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.candidates || data.candidates.length === 0) {
        return []
      }

      return data.candidates.map(candidate => ({
        text: candidate.address,
        address: candidate.attributes?.Match_addr || candidate.address,
        lat: candidate.location.y,
        lng: candidate.location.x,
        score: candidate.score
      }))
    },

    selectSuggestion(suggestion) {
      this.selectedLocation = suggestion
      this.searchQuery = suggestion.text
      this.showSuggestions = false
      this.suggestions = []
    },

    async selectQuickLocation(location) {
      this.isSearching = true
      this.errorMessage = ''

      try {
        const results = await this.geocodeAddress(location.address)
        if (results && results.length > 0) {
          this.selectedLocation = {
            ...results[0],
            text: location.name,
            address: location.address
          }
          this.searchQuery = location.name
        }
      } catch (error) {
        this.errorMessage = '無法定位該位置，請嘗試手動搜尋'
        console.error('快速位置搜尋失敗:', error)
      } finally {
        this.isSearching = false
      }
    },

    confirmLocation() {
      if (this.selectedLocation) {
        this.$emit('location-selected', {
          lat: this.selectedLocation.lat,
          lng: this.selectedLocation.lng,
          address: this.selectedLocation.address,
          name: this.selectedLocation.text
        })
      }
    },

    // 點擊外部關閉建議
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.showSuggestions = false
      }
    }
  },

  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
  },

  emits: ['location-selected']
}
</script>

<style scoped>
.custom-location-input {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.input-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.input-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-text-color);
}

.search-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.input-wrapper {
  display: flex;
  gap: 0.5rem;
}

.location-input {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  background: var(--surface-color);
  color: var(--primary-text-color);
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.location-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
}

.location-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-btn:hover:not(:disabled) {
  background: var(--primary-hover-color);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background: var(--surface-hover);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-content {
  flex: 1;
}

.suggestion-text {
  font-weight: 500;
  color: var(--primary-text-color);
  margin-bottom: 0.25rem;
}

.suggestion-address {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.quick-locations {
  margin-bottom: 1.5rem;
}

.quick-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary-text-color);
  margin-bottom: 0.75rem;
}

.quick-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.75rem;
  background: var(--surface-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.quick-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.quick-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: var(--border-radius-md);
  border: 1px solid #fecaca;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.selected-location {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: var(--border-radius-md);
  padding: 1rem;
}

.selected-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.selected-title {
  font-weight: 500;
  color: #166534;
}

.selected-content {
  margin-bottom: 1rem;
}

.selected-text {
  font-weight: 500;
  color: var(--primary-text-color);
  margin-bottom: 0.25rem;
}

.selected-address {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.confirm-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #16a34a;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;
  justify-content: center;
}

.confirm-btn:hover {
  background: #15803d;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .custom-location-input {
    padding: 1rem;
  }

  .quick-buttons {
    grid-template-columns: repeat(2, 1fr);
  }

  .input-wrapper {
    flex-direction: column;
  }

  .search-btn {
    width: 100%;
    height: 2.75rem;
  }
}
</style>