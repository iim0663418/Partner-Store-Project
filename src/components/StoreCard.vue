<template>
  <article 
    class="store-card cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
    @click="handleCardClick"
    @keydown.enter="handleCardClick"
    @keydown.space="handleCardClick"
    tabindex="0"
    role="button"
    :aria-label="`查看 ${store.name} 的詳細資訊`"
  >
    <div class="store-card-content">
      <!-- Header Section -->
      <div class="mb-3">
        <div class="flex items-start justify-between mb-2">
          <h3 class="store-card-title flex-1 mr-2" :id="`store-title-${store.id}`">{{ store.name }}</h3>
        </div>
        
        <!-- Featured Offer - 核心優惠區塊 -->
        <div v-if="featuredOffer" class="featured-offer mb-3">
          <div class="offer-content">
            <span class="offer-type">{{ getOfferTypeLabel(featuredOffer.type) }}</span>
            <h4 class="offer-title">{{ featuredOffer.title }}</h4>
            <p class="offer-description">{{ featuredOffer.description }}</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2 mb-2">
          <span class="tag tag-secondary text-xs">{{ store.category }}</span>
          <span class="tag tag-secondary text-xs">{{ store.region }}</span>
        </div>
      </div>
      
      <!-- Simplified Info Section -->
      <div class="info-section mb-3">
        <div class="info-item">
          <Icon name="location-simple" type="info" :aria-hidden="true" />
          <span class="truncate" :aria-label="`地址: ${store.address}`">{{ store.address }}</span>
        </div>
        
        <div class="info-item">
          <Icon name="clock" type="info" :aria-hidden="true" />
          <span :aria-label="`營業時間: ${store.openingHours}`">{{ store.openingHours }}</span>
        </div>
      </div>
      
      <!-- Footer Section -->
      <div class="flex items-center justify-between pt-2">
        <div v-if="store.phone" class="flex items-center text-xs text-secondary">
          <Icon name="phone" size="sm" spacing="sm" class="text-secondary" :aria-hidden="true" />
          <span class="hidden sm:inline" :aria-label="`電話: ${store.phone}`">{{ store.phone }}</span>
          <span class="sm:hidden" :aria-label="`電話: ${store.phone}`">聯絡</span>
        </div>
        <div v-else class="flex items-center text-xs text-secondary">
          <Icon name="info" size="sm" spacing="sm" class="text-secondary" :aria-hidden="true" />
          <span>線上服務</span>
        </div>
        
        <div v-if="showDistance && distance" class="distance-badge">
          <Icon name="navigation" size="sm" spacing="sm" :aria-hidden="true" />
          {{ distance.toFixed(1) }}km
        </div>
      </div>
    </div>
  </article>
</template>

<script>
import Icon from './Icon.vue'

export default {
  name: 'StoreCard',
  components: {
    Icon
  },
  props: {
    store: {
      type: Object,
      required: true
    },
    showDistance: {
      type: Boolean,
      default: false
    },
    distance: {
      type: Number,
      default: null
    }
  },
  computed: {
    featuredOffer() {
      if (!this.store.offers || this.store.offers.length === 0) return null
      return this.store.offers.find(offer => offer.featured) || this.store.offers[0]
    }
  },
  methods: {
    handleCardClick(event) {
      // Prevent space key from scrolling
      if (event && event.type === 'keydown' && event.code === 'Space') {
        event.preventDefault()
      }
      this.$emit('card-click', this.store)
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
  emits: ['card-click']
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}


/* 核心優惠區塊 */
.featured-offer {
  background: linear-gradient(135deg, var(--accent-color), #ff6b35);
  color: white;
  padding: 1rem;
  border-radius: var(--border-radius-lg);
  position: relative;
  overflow: hidden;
}

.featured-offer::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(50%, -50%);
}

.offer-content {
  position: relative;
  z-index: 1;
}

.offer-type {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.offer-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  line-height: 1.3;
  color: white;
}

.offer-description {
  font-size: 0.875rem;
  opacity: 0.9;
  line-height: 1.4;
  margin: 0;
}

/* 簡化的資訊區塊 */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.distance-badge {
  display: flex;
  align-items: center;
  background-color: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-md);
  font-size: 0.75rem;
  font-weight: 500;
}

.store-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.store-card:hover {
  border-color: var(--primary-color);
}

.store-card:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
  border-color: var(--primary-color);
}

.store-card:focus:not(:focus-visible) {
  outline: none;
}

.store-card-content {
  padding: 1rem;
}

.store-card-title {
  font-size: var(--h3-font-size);
  font-weight: 600;
  color: var(--primary-text-color);
  line-height: 1.3;
}
</style>