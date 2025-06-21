<template>
  <!-- 手機篩選器模態窗 -->
  <div v-if="isOpen" class="fixed inset-0 z-50 md:hidden">
    <!-- 背景遮罩 -->
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      @click="closeModal"
    ></div>
    
    <!-- 模態窗內容 -->
    <div class="fixed inset-x-0 bottom-0 bg-surface rounded-t-2xl shadow-xl transform transition-transform duration-300 ease-out">
      <!-- 拖拽手柄 -->
      <div class="flex justify-center py-2">
        <div class="w-8 h-1 bg-gray-300 rounded-full"></div>
      </div>
      
      <!-- 標題欄 -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 class="text-primary font-bold" style="font-size: var(--h2-font-size);">篩選條件</h3>
        <button 
          @click="closeModal"
          class="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Icon name="close" size="md" spacing="none" class="text-secondary" :aria-hidden="true" />
        </button>
      </div>
      
      <!-- 篩選內容 -->
      <div class="px-4 py-6 max-h-96 overflow-y-auto">
        <!-- 優惠類型篩選 -->
        <div class="mb-6">
          <label class="block text-primary font-semibold mb-3" style="font-size: var(--caption-font-size);">
            <Icon name="star" type="info" :aria-hidden="true" />
            優惠類型
          </label>
          <select 
            v-model="localFilters.offerType" 
            class="form-input w-full"
          >
            <option value="">全部優惠</option>
            <option v-for="offerType in availableOfferTypes" :key="offerType" :value="offerType">
              {{ getOfferTypeLabel(offerType) }}
            </option>
          </select>
        </div>
        
        <!-- 地區篩選 -->
        <div class="mb-6">
          <label class="block text-primary font-semibold mb-3" style="font-size: var(--caption-font-size);">
            <Icon name="location-simple" type="info" :aria-hidden="true" />
            地區
          </label>
          <select 
            v-model="localFilters.region" 
            class="form-input w-full"
          >
            <option value="">全部地區</option>
            <option v-for="region in availableRegions" :key="region" :value="region">
              {{ region }}
            </option>
          </select>
        </div>
        
        <!-- 類別篩選 -->
        <div class="mb-6">
          <label class="block text-primary font-semibold mb-3" style="font-size: var(--caption-font-size);">
            <Icon name="category" type="info" :aria-hidden="true" />
            類別
          </label>
          <select 
            v-model="localFilters.category" 
            class="form-input w-full"
          >
            <option value="">全部類別</option>
            <option v-for="category in availableCategories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        
      </div>
      
      <!-- 底部按鈕 -->
      <div class="flex space-x-3 px-4 py-4 bg-gray-50 rounded-t-xl">
        <button 
          @click="clearAllFilters"
          class="btn btn-secondary flex-1"
        >
          清除篩選
        </button>
        <button 
          @click="applyFilters"
          class="btn btn-primary flex-1"
        >
          套用篩選
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from './Icon.vue'

export default {
  name: 'MobileFilterModal',
  components: {
    Icon
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    stores: {
      type: Array,
      required: true
    },
    currentFilters: {
      type: Object,
      default: () => ({
        region: '',
        category: '',
        offerType: ''
      })
    }
  },
  data() {
    return {
      localFilters: { ...this.currentFilters }
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
    availableOfferTypes() {
      const offerTypes = []
      this.stores.forEach(store => {
        if (store.offers) {
          store.offers.forEach(offer => {
            if (!offerTypes.includes(offer.type)) {
              offerTypes.push(offer.type)
            }
          })
        }
      })
      return offerTypes.sort()
    }
  },
  watch: {
    currentFilters: {
      handler(newFilters) {
        this.localFilters = { ...newFilters }
      },
      deep: true
    },
    isOpen(newVal) {
      if (newVal) {
        // 當模態窗打開時，防止背景滾動
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    applyFilters() {
      this.$emit('apply-filters', this.localFilters)
      this.closeModal()
    },
    clearAllFilters() {
      this.localFilters = {
        region: '',
        category: '',
        offerType: ''
      }
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
  beforeUnmount() {
    // 確保組件銷毀時恢復滾動
    document.body.style.overflow = ''
  },
  emits: ['close', 'apply-filters']
}
</script>