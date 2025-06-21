<template>
  <div class="filter-control">
    <!-- 手機版篩選按鈕 -->
    <div class="md:hidden bg-surface shadow-md rounded-lg container-spacing mb-4" style="border: 1px solid var(--border-color);">
      <button 
        @click="openMobileFilter"
        class="btn btn-primary w-full flex items-center justify-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"/>
        </svg>
        篩選條件
        <span v-if="hasActiveFilters" class="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
          {{ activeFilterCount }}
        </span>
      </button>
      
      <!-- 已選篩選條件預覽 -->
      <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 mt-3">
        <span v-if="selectedRegion" class="tag tag-primary text-xs">{{ selectedRegion }}</span>
        <span v-if="selectedCategory" class="tag tag-success text-xs">{{ selectedCategory }}</span>
      </div>
    </div>
    
    <!-- 桌面版篩選控制 -->
    <div class="hidden md:block bg-surface shadow-md rounded-lg container-spacing" style="border: 1px solid var(--border-color);">
      <div class="flex items-center" style="margin-bottom: calc(var(--spacing-unit) * 3);">
        <svg class="w-6 h-6 text-secondary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"/>
        </svg>
        <h3 class="text-primary font-bold" style="font-size: var(--h2-font-size);">篩選條件</h3>
      </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 地區篩選 -->
      <div>
        <label for="region-filter" class="block text-sm font-semibold text-gray-700 mb-3">
          <svg class="w-4 h-4 inline mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
          </svg>
          地區
        </label>
        <select 
          id="region-filter"
          v-model="selectedRegion" 
          @change="handleRegionChange"
          class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 bg-gray-50 hover:bg-white transition-all duration-200"
        >
          <option value="">全部地區</option>
          <option v-for="region in availableRegions" :key="region" :value="region">
            {{ region }}
          </option>
        </select>
      </div>
      
      <!-- 類別篩選 -->
      <div>
        <label for="category-filter" class="block text-sm font-semibold text-gray-700 mb-3">
          <svg class="w-4 h-4 inline mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
          </svg>
          類別
        </label>
        <select 
          id="category-filter"
          v-model="selectedCategory" 
          @change="handleCategoryChange"
          class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 bg-gray-50 hover:bg-white transition-all duration-200"
        >
          <option value="">全部類別</option>
          <option v-for="category in availableCategories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
    </div>
    
    
    <!-- 清除篩選按鈕 -->
    <div class="mt-6 flex justify-end">
      <button 
        @click="clearFilters"
        class="flex items-center px-6 py-3 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200"
      >
        <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
        清除所有篩選
      </button>
    </div>
    
    <!-- 篩選結果摘要 -->
    <div v-if="hasActiveFilters" class="mt-6 pt-6 border-t border-gray-200">
      <div class="flex items-center mb-3">
        <svg class="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-sm font-medium text-gray-700">已套用的篩選條件</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <span v-if="selectedRegion" class="inline-flex items-center px-3 py-2 rounded-xl text-sm bg-blue-100 text-blue-800 border border-blue-200">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
          </svg>
          {{ selectedRegion }}
          <button @click="selectedRegion = ''; handleRegionChange()" class="ml-2 hover:text-blue-600 p-1 rounded-full hover:bg-blue-200 transition-colors duration-200">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </span>
        <span v-if="selectedCategory" class="inline-flex items-center px-3 py-2 rounded-xl text-sm bg-green-100 text-green-800 border border-green-200">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
          </svg>
          {{ selectedCategory }}
          <button @click="selectedCategory = ''; handleCategoryChange()" class="ml-2 hover:text-green-600 p-1 rounded-full hover:bg-green-200 transition-colors duration-200">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </span>
      </div>
    </div>
    
    <!-- 手機篩選模態窗 -->
    <MobileFilterModal 
      :is-open="isMobileFilterOpen"
      :stores="stores"
      :current-filters="{ region: selectedRegion, category: selectedCategory }"
      @close="closeMobileFilter"
      @apply-filters="handleMobileFilterApply"
    />
    </div>
  </div>
</template>

<script>
import MobileFilterModal from './MobileFilterModal.vue'

export default {
  name: 'FilterControl',
  components: {
    MobileFilterModal
  },
  props: {
    stores: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectedRegion: '',
      selectedCategory: '',
      isMobileFilterOpen: false
    }
  },
  computed: {
    availableRegions() {
      const regions = [...new Set(this.stores.map(store => store.region))]
      return regions.sort()
    },
    availableCategories() {
      const categories = [...new Set(this.stores.map(store => store.category))]
      return categories.sort()
    },
    hasActiveFilters() {
      return this.selectedRegion || this.selectedCategory
    },
    activeFilterCount() {
      let count = 0
      if (this.selectedRegion) count++
      if (this.selectedCategory) count++
      return count
    }
  },
  methods: {
    handleRegionChange() {
      this.emitFilterChange()
    },
    handleCategoryChange() {
      this.emitFilterChange()
    },
    clearFilters() {
      this.selectedRegion = ''
      this.selectedCategory = ''
      this.emitFilterChange()
    },
    openMobileFilter() {
      this.isMobileFilterOpen = true
    },
    closeMobileFilter() {
      this.isMobileFilterOpen = false
    },
    handleMobileFilterApply(filters) {
      this.selectedRegion = filters.region
      this.selectedCategory = filters.category
      this.emitFilterChange()
    },
    emitFilterChange() {
      const filters = {
        region: this.selectedRegion,
        category: this.selectedCategory,
      }
      this.$emit('filter-changed', filters)
    }
  },
  emits: ['filter-changed']
}
</script>