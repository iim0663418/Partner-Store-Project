<template>
  <div class="control-hub bg-surface shadow-sm rounded-lg p-4 mb-4">
    <!-- Mobile Layout -->
    <div class="md:hidden space-y-3">
      <!-- Search Bar -->
      <div class="relative">
        <SearchBar 
          :stores="allStores"
          :search-result-count="storeCount"
          @search="$emit('search', $event)"
          @suggestion-selected="$emit('suggestion-selected', $event)"
        />
      </div>
      
      <!-- Filter Button -->
      <button 
        @click="openMobileFilter"
        class="btn btn-secondary w-full flex items-center justify-center"
        :aria-label="hasActiveFilters ? `篩選條件 (已套用 ${activeFilterCount} 個)` : '篩選條件'"
      >
        <Icon name="filter" type="button" :aria-hidden="true" />
        篩選條件
        <span v-if="hasActiveFilters" class="ml-2 bg-primary/20 px-2 py-1 rounded-full text-xs">
          {{ activeFilterCount }}
        </span>
      </button>
      
      <!-- Active Filters Preview -->
      <div v-if="hasActiveFilters" class="flex flex-wrap gap-2">
        <span v-if="currentFilters.offerType" class="tag tag-primary text-xs">{{ getOfferTypeLabel(currentFilters.offerType) }}</span>
        <span v-if="currentFilters.region" class="tag tag-secondary text-xs">{{ currentFilters.region }}</span>
        <span v-if="currentFilters.category" class="tag tag-secondary text-xs">{{ currentFilters.category }}</span>
      </div>
    </div>

    <!-- Desktop Layout -->
    <div class="hidden md:block">
      <div class="grid grid-cols-12 gap-4 items-start">
        <!-- Search Section -->
        <div class="col-span-4">
          <SearchBar 
            :stores="allStores"
            :search-result-count="storeCount"
            @search="$emit('search', $event)"
            @suggestion-selected="$emit('suggestion-selected', $event)"
          />
        </div>
        
        <!-- Filter Section -->
        <div class="col-span-6">
          <div class="grid grid-cols-3 gap-2">
            <!-- Offer Type Filter -->
            <div>
              <select 
                v-model="localFilters.offerType" 
                @change="handleFilterChange"
                class="form-select w-full text-sm"
                aria-label="選擇優惠類型"
              >
                <option value="">全部優惠</option>
                <option v-for="offerType in availableOfferTypes" :key="offerType" :value="offerType">
                  {{ getOfferTypeLabel(offerType) }}
                </option>
              </select>
            </div>
            
            <!-- Region Filter -->
            <div>
              <select 
                v-model="localFilters.region" 
                @change="handleFilterChange"
                class="form-select w-full text-sm"
                aria-label="選擇地區"
              >
                <option value="">全部地區</option>
                <option v-for="region in availableRegions" :key="region" :value="region">
                  {{ region }}
                </option>
              </select>
            </div>
            
            <!-- Category Filter -->
            <div>
              <select 
                v-model="localFilters.category" 
                @change="handleFilterChange"
                class="form-select w-full text-sm"
                aria-label="選擇類別"
              >
                <option value="">全部類別</option>
                <option v-for="category in availableCategories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
            
          </div>
        </div>
        
        <!-- Location Button -->
        <div class="col-span-2">
          <button 
            @click="$emit('get-location')"
            :disabled="isGettingLocation"
            class="btn btn-primary w-full flex items-center justify-center text-sm"
            :aria-label="isGettingLocation ? '正在取得您的位置' : '使用我的位置進行距離排序'"
          >
            <Icon name="location" type="button" :aria-hidden="true" />
            <span class="hidden lg:inline ml-1">{{ isGettingLocation ? '定位中' : '定位' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Filter Modal -->
    <MobileFilterModal 
      :is-open="isMobileFilterOpen"
      :stores="allStores"
      :current-filters="currentFilters"
      @close="closeMobileFilter"
      @apply-filters="handleMobileFilterApply"
    />
  </div>
</template>

<script>
import SearchBar from './SearchBar.vue'
import MobileFilterModal from './MobileFilterModal.vue'
import Icon from './Icon.vue'

export default {
  name: 'ControlHub',
  components: {
    SearchBar,
    MobileFilterModal,
    Icon
  },
  props: {
    allStores: {
      type: Array,
      required: true
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
      localFilters: { 
        region: '',
        category: '',
        offerType: '',
        ...this.currentFilters 
      },
      isMobileFilterOpen: false
    }
  },
  computed: {
    availableRegions() {
      const regions = [...new Set(this.allStores.map(store => store.region))]
      return regions.sort()
    },
    availableCategories() {
      const categories = [...new Set(this.allStores.map(store => store.category))]
      return categories.sort()
    },
    availableOfferTypes() {
      const offerTypes = []
      this.allStores.forEach(store => {
        if (store.offers) {
          store.offers.forEach(offer => {
            if (!offerTypes.includes(offer.type)) {
              offerTypes.push(offer.type)
            }
          })
        }
      })
      return offerTypes.sort()
    },
    hasActiveFilters() {
      return this.currentFilters.region || this.currentFilters.category || this.currentFilters.offerType
    },
    activeFilterCount() {
      let count = 0
      if (this.currentFilters.region) count++
      if (this.currentFilters.category) count++
      if (this.currentFilters.offerType) count++
      return count
    }
  },
  watch: {
    currentFilters: {
      handler(newFilters) {
        this.localFilters = { ...newFilters }
      },
      deep: true
    }
  },
  methods: {
    handleFilterChange() {
      this.$emit('filter-changed', this.localFilters)
    },
    openMobileFilter() {
      this.isMobileFilterOpen = true
    },
    closeMobileFilter() {
      this.isMobileFilterOpen = false
    },
    handleMobileFilterApply(filters) {
      this.$emit('filter-changed', filters)
    },
    getOfferTypeLabel(type) {
      const labels = {
        discount: '折扣優惠',
        cashback: '現金回饋',
        gift: '贈品活動',
        member: '會員專屬',
        bundle: '套餐組合',
        special: '特殊活動'
      }
      return labels[type] || '優惠活動'
    }
  },
  emits: ['search', 'filter-changed', 'suggestion-selected', 'get-location']
}
</script>