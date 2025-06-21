<template>
  <div class="store-list">
    <!-- Control Hub -->
    <ControlHub 
      :all-stores="allStores"
      :store-count="storeCount"
      :current-filters="currentFilters"
      :is-getting-location="isGettingLocation"
      @search="$emit('search', $event)"
      @filter-changed="$emit('filter-changed', $event)"
      @suggestion-selected="$emit('suggestion-selected', $event)"
      @get-location="$emit('get-location')"
    />
    
    <!-- Results Summary -->
    <div v-if="stores.length > 0" class="bg-surface shadow-sm rounded-lg p-3 mb-4 flex items-center justify-between">
      <div class="flex items-center">
        <Icon name="check-circle" type="info" class="text-success" :aria-hidden="true" />
        <span class="text-primary font-medium text-sm">找到 {{ stores.length }} 家店舖</span>
      </div>
      <div v-if="userLocation" class="tag tag-primary text-xs">
        <Icon name="location-simple" type="info" :aria-hidden="true" />
        <span class="hidden sm:inline">已啟用距離排序</span>
        <span class="sm:hidden">距離</span>
      </div>
    </div>
    
    <div v-if="stores.length === 0" class="text-center py-16">
      <div class="bg-gray-50 rounded-3xl p-12 max-w-md mx-auto">
        <Icon name="search" size="lg" spacing="none" class="mx-auto text-gray-400 mb-6" style="width: 5rem; height: 5rem;" :aria-hidden="true" />
        <h3 class="text-xl font-semibold text-gray-800 mb-3">找不到符合條件的店家</h3>
        <p class="text-gray-600 mb-6">請試試調整搜尋條件或篩選器</p>
        <div class="space-y-2 text-sm text-gray-500">
          <p>• 嘗試使用不同的關鍵字</p>
          <p>• 清除篩選條件</p>
          <p>• 選擇其他地區或類別</p>
        </div>
      </div>
    </div>
    
    <div v-else>
      <!-- Sort Control -->
      <div class="bg-surface shadow-sm rounded-lg p-3 mb-4 flex items-center justify-between">
        <span class="text-secondary text-sm font-medium">排序方式</span>
        <select 
          v-model="selectedSort" 
          @change="handleSortChange"
          class="form-select text-sm w-auto"
        >
          <option value="default">預設順序</option>
          <option value="name">店名 A-Z</option>
          <option value="distance" v-if="userLocation">距離近到遠</option>
        </select>
      </div>
      
      <!-- Store Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StoreCard 
          v-for="store in sortedStores" 
          :key="store.id"
          :store="store"
          :show-distance="!!userLocation"
          :distance="userLocation ? calculateDistance(store.lat, store.lng) : null"
          @card-click="handleStoreClick"
        />
      </div>
    </div>
  </div>
</template>

<script>
import StoreCard from './StoreCard.vue'
import ControlHub from './ControlHub.vue'
import Icon from './Icon.vue'

export default {
  name: 'StoreList',
  components: {
    StoreCard,
    ControlHub,
    Icon
  },
  props: {
    stores: {
      type: Array,
      required: true
    },
    allStores: {
      type: Array,
      required: true
    },
    userLocation: {
      type: Object,
      default: null
    },
    storeCount: {
      type: Number,
      required: true
    },
    currentFilters: {
      type: Object,
      default: () => ({
        region: '',
        category: '',
        offerType: ''
      })
    },
    isGettingLocation: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedSort: 'default'
    }
  },
  computed: {
    sortedStores() {
      let sorted = [...this.stores]
      
      switch (this.selectedSort) {
        case 'name':
          sorted.sort((a, b) => a.name.localeCompare(b.name))
          break
        case 'distance':
          if (this.userLocation) {
            sorted.sort((a, b) => {
              const distanceA = this.calculateDistance(a.lat, a.lng)
              const distanceB = this.calculateDistance(b.lat, b.lng)
              return distanceA - distanceB
            })
          }
          break
        default:
          break
      }
      
      return sorted
    }
  },
  methods: {
    handleSortChange() {
      this.$emit('sort-changed', this.selectedSort)
    },
    calculateDistance(storeLat, storeLng) {
      if (!this.userLocation) return null
      
      const R = 6371 // 地球半徑（公里）
      const dLat = this.deg2rad(storeLat - this.userLocation.lat)
      const dLng = this.deg2rad(storeLng - this.userLocation.lng)
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.deg2rad(this.userLocation.lat)) * Math.cos(this.deg2rad(storeLat)) * 
        Math.sin(dLng/2) * Math.sin(dLng/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distance = R * c
      
      return distance
    },
    deg2rad(deg) {
      return deg * (Math.PI/180)
    },
    handleStoreClick(store) {
      this.$emit('store-selected', store)
    }
  },
  emits: ['sort-changed', 'search', 'filter-changed', 'suggestion-selected', 'store-selected', 'get-location']
}
</script>