<template>
  <div class="offer-details">
    <div class="details-header">
      <Icon name="tag" size="lg" class="text-accent" />
      <h3 class="details-title">優惠詳情</h3>
    </div>

    <!-- 優惠篩選器 -->
    <div class="offer-filters">
      <div class="filter-section">
        <label class="filter-label">優惠類型</label>
        <div class="filter-chips">
          <button 
            v-for="type in offerTypes" 
            :key="type.value"
            @click="toggleOfferType(type.value)"
            class="filter-chip"
            :class="{ active: selectedOfferTypes.includes(type.value) }"
          >
            <Icon :name="type.icon" size="sm" />
            {{ type.label }}
          </button>
        </div>
      </div>

      <div class="filter-section">
        <label class="filter-label">有效期限</label>
        <select v-model="expiryFilter" class="filter-select">
          <option value="">全部</option>
          <option value="week">一週內</option>
          <option value="month">一個月內</option>
          <option value="long">長期有效</option>
        </select>
      </div>

      <div class="filter-section">
        <label class="filter-label">優惠強度</label>
        <div class="strength-options">
          <button 
            v-for="strength in strengthOptions" 
            :key="strength.value"
            @click="strengthFilter = strengthFilter === strength.value ? '' : strength.value"
            class="strength-btn"
            :class="{ active: strengthFilter === strength.value }"
          >
            {{ strength.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 優惠列表 -->
    <div v-if="filteredOffers.length > 0" class="offers-list">
      <div class="list-header">
        <h4 class="list-title">找到 {{ filteredOffers.length }} 個優惠</h4>
        <select v-model="sortBy" class="sort-select">
          <option value="expiry">即將到期</option>
          <option value="strength">優惠力度</option>
          <option value="distance">距離最近</option>
        </select>
      </div>

      <div class="offers-grid">
        <div 
          v-for="offer in sortedOffers" 
          :key="`${offer.storeId}-${offer.id || offer.title}`"
          class="offer-card"
          @click="$emit('offer-selected', offer)"
        >
          <div class="offer-header">
            <div class="offer-type-badge" :class="`type-${offer.type}`">
              <Icon :name="getOfferIcon(offer.type)" size="sm" />
              {{ getOfferTypeLabel(offer.type) }}
            </div>
            <div v-if="offer.featured" class="featured-badge">
              <Icon name="star" size="sm" />
              精選
            </div>
          </div>

          <div class="offer-content">
            <h5 class="offer-title">{{ offer.title }}</h5>
            <p class="offer-description">{{ offer.description }}</p>
            
            <div class="store-info">
              <h6 class="store-name">{{ offer.store.name }}</h6>
              <div class="store-meta">
                <span class="category">{{ offer.store.category }}</span>
                <div v-if="offer.distance" class="distance">
                  <Icon name="navigation" size="sm" class="text-blue-500" />
                  <span>{{ offer.distance }}km</span>
                </div>
              </div>
            </div>
          </div>

          <div class="offer-footer">
            <div class="expiry-info">
              <Icon name="clock" size="sm" class="text-gray-500" />
              <span class="expiry-text" :class="getExpiryClass(offer.validUntil)">
                {{ formatExpiryDate(offer.validUntil) }}
              </span>
            </div>
            
            <div class="offer-actions">
              <button 
                @click.stop="saveOffer(offer)" 
                class="action-btn save-btn"
                :class="{ saved: isSaved(offer) }"
              >
                <Icon :name="isSaved(offer) ? 'heart-filled' : 'heart'" size="sm" />
              </button>
              <button @click.stop="shareOffer(offer)" class="action-btn share-btn">
                <Icon name="share" size="sm" />
              </button>
            </div>
          </div>

          <!-- 優惠強度指示器 -->
          <div class="strength-indicator">
            <div class="strength-bar">
              <div 
                class="strength-fill" 
                :style="{ width: `${getOfferStrength(offer)}%` }"
                :class="`strength-${getStrengthLevel(offer)}`"
              ></div>
            </div>
            <span class="strength-label">{{ getStrengthLabel(offer) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 無結果狀態 -->
    <div v-else class="no-offers">
      <Icon name="tag" size="lg" class="text-gray-400" />
      <h4 class="no-offers-title">沒有符合條件的優惠</h4>
      <p class="no-offers-text">試試調整篩選條件或瀏覽其他店家</p>
      <button @click="clearFilters" class="clear-filters-btn">
        <Icon name="refresh" size="sm" />
        清除篩選
      </button>
    </div>
  </div>
</template>

<script>
import Icon from './Icon.vue'

export default {
  name: 'OfferDetails',
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
    }
  },
  data() {
    return {
      selectedOfferTypes: [],
      expiryFilter: '',
      strengthFilter: '',
      sortBy: 'expiry',
      savedOffers: [],
      offerTypes: [
        { value: 'discount', label: '折扣', icon: 'percentage' },
        { value: 'cashback', label: '回饋', icon: 'dollar' },
        { value: 'gift', label: '贈品', icon: 'gift' },
        { value: 'member', label: '會員', icon: 'user' },
        { value: 'bundle', label: '套餐', icon: 'package' }
      ],
      strengthOptions: [
        { value: 'high', label: '超值優惠' },
        { value: 'medium', label: '一般優惠' },
        { value: 'low', label: '小幅優惠' }
      ]
    }
  },
  computed: {
    allOffers() {
      const offers = []
      this.allStores.forEach(store => {
        if (store.offers) {
          store.offers.forEach((offer, index) => {
            offers.push({
              ...offer,
              id: offer.id || index,
              store,
              storeId: store.id,
              distance: this.userLocation ? this.calculateDistance(store.lat, store.lng) : null
            })
          })
        }
      })
      return offers
    },

    filteredOffers() {
      let filtered = [...this.allOffers]

      // 優惠類型篩選
      if (this.selectedOfferTypes.length > 0) {
        filtered = filtered.filter(offer => 
          this.selectedOfferTypes.includes(offer.type)
        )
      }

      // 有效期限篩選
      if (this.expiryFilter) {
        const now = new Date()
        filtered = filtered.filter(offer => {
          const expiryDate = new Date(offer.validUntil)
          const daysDiff = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
          
          switch (this.expiryFilter) {
            case 'week':
              return daysDiff <= 7
            case 'month':
              return daysDiff <= 30
            case 'long':
              return daysDiff > 30
            default:
              return true
          }
        })
      }

      // 優惠強度篩選
      if (this.strengthFilter) {
        filtered = filtered.filter(offer => 
          this.getStrengthLevel(offer) === this.strengthFilter
        )
      }

      return filtered
    },

    sortedOffers() {
      let sorted = [...this.filteredOffers]

      switch (this.sortBy) {
        case 'expiry':
          sorted.sort((a, b) => new Date(a.validUntil) - new Date(b.validUntil))
          break
        case 'strength':
          sorted.sort((a, b) => this.getOfferStrength(b) - this.getOfferStrength(a))
          break
        case 'distance':
          if (this.userLocation) {
            sorted.sort((a, b) => (a.distance || 999) - (b.distance || 999))
          }
          break
      }

      return sorted
    }
  },
  methods: {
    toggleOfferType(type) {
      const index = this.selectedOfferTypes.indexOf(type)
      if (index > -1) {
        this.selectedOfferTypes.splice(index, 1)
      } else {
        this.selectedOfferTypes.push(type)
      }
    },

    clearFilters() {
      this.selectedOfferTypes = []
      this.expiryFilter = ''
      this.strengthFilter = ''
    },

    saveOffer(offer) {
      const key = `${offer.storeId}-${offer.id}`
      const index = this.savedOffers.indexOf(key)
      
      if (index > -1) {
        this.savedOffers.splice(index, 1)
      } else {
        this.savedOffers.push(key)
      }
      
      localStorage.setItem('savedOffers', JSON.stringify(this.savedOffers))
    },

    isSaved(offer) {
      const key = `${offer.storeId}-${offer.id}`
      return this.savedOffers.includes(key)
    },

    shareOffer(offer) {
      if (navigator.share) {
        navigator.share({
          title: offer.title,
          text: `${offer.store.name} - ${offer.description}`,
          url: window.location.href
        })
      } else {
        // 複製到剪貼簿
        const text = `${offer.store.name} - ${offer.title}: ${offer.description}`
        navigator.clipboard.writeText(text)
        this.$emit('show-toast', {
          message: '優惠資訊已複製到剪貼簿',
          type: 'success'
        })
      }
    },

    getOfferIcon(type) {
      const icons = {
        discount: 'percentage',
        cashback: 'dollar',
        gift: 'gift',
        member: 'user',
        bundle: 'package'
      }
      return icons[type] || 'tag'
    },

    getOfferTypeLabel(type) {
      const labels = {
        discount: '折扣',
        cashback: '回饋',
        gift: '贈品',
        member: '會員',
        bundle: '套餐'
      }
      return labels[type] || '優惠'
    },

    getOfferStrength(offer) {
      // 根據優惠描述和類型計算強度分數 (0-100)
      const description = offer.description.toLowerCase()
      
      if (description.includes('免費') || description.includes('送')) return 90
      if (description.includes('5折') || description.includes('50%')) return 85
      if (description.includes('6折') || description.includes('40%')) return 75
      if (description.includes('7折') || description.includes('30%')) return 65
      if (description.includes('8折') || description.includes('20%')) return 55
      if (description.includes('9折') || description.includes('10%')) return 45
      if (description.includes('滿額')) return 40
      
      return 35
    },

    getStrengthLevel(offer) {
      const strength = this.getOfferStrength(offer)
      if (strength >= 70) return 'high'
      if (strength >= 50) return 'medium'
      return 'low'
    },

    getStrengthLabel(offer) {
      const level = this.getStrengthLevel(offer)
      const labels = {
        high: '超值',
        medium: '不錯',
        low: '普通'
      }
      return labels[level]
    },

    formatExpiryDate(dateStr) {
      const date = new Date(dateStr)
      const now = new Date()
      const diff = date - now
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
      
      if (days < 0) return '已過期'
      if (days === 0) return '今日截止'
      if (days === 1) return '明日截止'
      if (days <= 7) return `${days}天後截止`
      if (days <= 30) return `${Math.ceil(days/7)}週後截止`
      return `${Math.ceil(days/30)}個月後截止`
    },

    getExpiryClass(dateStr) {
      const date = new Date(dateStr)
      const now = new Date()
      const diff = date - now
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
      
      if (days < 0) return 'expired'
      if (days <= 3) return 'urgent'
      if (days <= 7) return 'soon'
      return 'normal'
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

    loadSavedOffers() {
      const saved = localStorage.getItem('savedOffers')
      if (saved) {
        this.savedOffers = JSON.parse(saved)
      }
    }
  },
  mounted() {
    this.loadSavedOffers()
  },
  emits: ['offer-selected', 'show-toast']
}
</script>

<style scoped>
.offer-details {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.details-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.details-title {
  font-size: var(--h3-font-size);
  font-weight: 600;
  color: var(--primary-text-color);
}

.offer-filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--surface-hover);
  border-radius: var(--border-radius-md);
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary-text-color);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  background: var(--surface-color);
  color: var(--text-secondary);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.filter-chip:hover {
  border-color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.05);
}

.filter-chip.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  background: var(--surface-color);
  color: var(--primary-text-color);
  font-size: 0.875rem;
}

.strength-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.strength-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  background: var(--surface-color);
  color: var(--text-secondary);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.strength-btn:hover {
  border-color: var(--accent-color);
  background: rgba(var(--accent-color-rgb), 0.05);
}

.strength-btn.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.offers-list {
  margin-top: 1.5rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.list-title {
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

.offers-grid {
  display: grid;
  gap: 1rem;
}

.offer-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.offer-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.offer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.offer-type-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  font-weight: 500;
}

.type-discount { background: #fef3cd; color: #856404; }
.type-cashback { background: #d1ecf1; color: #0c5460; }
.type-gift { background: #d4edda; color: #155724; }
.type-member { background: #e2e3e5; color: #383d41; }
.type-bundle { background: #f8d7da; color: #721c24; }

.featured-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--accent-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.offer-content {
  margin-bottom: 1rem;
}

.offer-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-text-color);
  margin-bottom: 0.5rem;
}

.offer-description {
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.store-info {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.store-name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--primary-text-color);
  margin-bottom: 0.5rem;
}

.store-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.category {
  background: var(--surface-hover);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.distance {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.offer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.expiry-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.expiry-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.expiry-text.expired { color: #dc3545; }
.expiry-text.urgent { color: #fd7e14; }
.expiry-text.soon { color: #ffc107; }
.expiry-text.normal { color: var(--text-secondary); }

.offer-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--border-color);
  background: var(--surface-color);
  color: var(--text-secondary);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.save-btn.saved {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.strength-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.strength-bar {
  width: 60px;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.strength-high { background: #28a745; }
.strength-medium { background: #ffc107; }
.strength-low { background: #6c757d; }

.strength-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.no-offers {
  text-align: center;
  padding: 3rem 1rem;
}

.no-offers-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 1rem 0 0.5rem;
}

.no-offers-text {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.clear-filters-btn {
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

.clear-filters-btn:hover {
  background: var(--primary-hover-color);
}
</style>