<template>
  <div class="smart-recommendations">
    <div class="recommendations-header">
      <Icon name="sparkle" size="lg" class="text-accent" />
      <h3 class="recommendations-title">為您推薦</h3>
    </div>

    <!-- 個人化推薦 -->
    <div v-if="personalizedStores.length > 0" class="recommendation-section">
      <h4 class="section-subtitle">基於您的偏好</h4>
      <div class="stores-carousel">
        <div 
          v-for="store in personalizedStores.slice(0, 3)" 
          :key="`personalized-${store.id}`"
          class="recommendation-card"
          @click="$emit('store-selected', store)"
        >
          <div class="card-header">
            <h5 class="store-name">{{ store.name }}</h5>
            <div class="match-score">
              <Icon name="star" size="sm" class="text-yellow-500" />
              <span>{{ calculateMatchScore(store) }}% 符合</span>
            </div>
          </div>
          <div class="store-info">
            <span class="category">{{ store.category }}</span>
            <span class="region">{{ store.region }}</span>
          </div>
          <div v-if="store.bestOffer" class="offer-preview">
            <span class="offer-type">{{ getOfferTypeLabel(store.bestOffer.type) }}</span>
            <p class="offer-title">{{ store.bestOffer.title }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 附近熱門 -->
    <div v-if="nearbyPopularStores.length > 0" class="recommendation-section">
      <h4 class="section-subtitle">附近熱門店家</h4>
      <div class="stores-carousel">
        <div 
          v-for="store in nearbyPopularStores.slice(0, 3)" 
          :key="`nearby-${store.id}`"
          class="recommendation-card"
          @click="$emit('store-selected', store)"
        >
          <div class="card-header">
            <h5 class="store-name">{{ store.name }}</h5>
            <div class="distance-badge">
              <Icon name="navigation" size="sm" />
              <span>{{ store.distance }}km</span>
            </div>
          </div>
          <div class="store-info">
            <span class="category">{{ store.category }}</span>
          </div>
          <div v-if="store.featuredOffer" class="offer-preview">
            <p class="offer-title">{{ store.featuredOffer.title }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 限時優惠 -->
    <div v-if="urgentOffers.length > 0" class="recommendation-section urgent">
      <h4 class="section-subtitle urgent-title">
        <Icon name="clock" size="sm" class="text-red-500" />
        限時優惠
      </h4>
      <div class="urgent-offers-grid">
        <div 
          v-for="offer in urgentOffers.slice(0, 2)" 
          :key="`urgent-${offer.storeId}-${offer.id}`"
          class="urgent-offer-card"
          @click="$emit('store-selected', offer.store)"
        >
          <div class="urgent-badge">即將結束</div>
          <h5 class="store-name">{{ offer.store.name }}</h5>
          <p class="offer-title">{{ offer.title }}</p>
          <div class="expires-info">
            <Icon name="clock" size="sm" class="text-red-500" />
            <span>{{ formatExpiryDate(offer.validUntil) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from './Icon.vue'

export default {
  name: 'SmartRecommendations',
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
    userPreferences: {
      type: Object,
      default: () => ({
        favoriteCategories: [],
        favoriteOfferTypes: [],
        frequentRegions: [],
        budgetRange: ''
      })
    }
  },
  computed: {
    personalizedStores() {
      if (!this.userPreferences.favoriteCategories.length && 
          !this.userPreferences.favoriteOfferTypes.length) {
        return []
      }

      return this.allStores
        .map(store => ({
          ...store,
          bestOffer: this.getBestOfferForUser(store),
          matchScore: this.calculateMatchScore(store)
        }))
        .filter(store => store.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
    },

    nearbyPopularStores() {
      if (!this.userLocation) return []

      return this.allStores
        .map(store => ({
          ...store,
          distance: this.calculateDistance(store.lat, store.lng),
          featuredOffer: store.offers?.find(offer => offer.featured)
        }))
        .filter(store => store.distance <= 5) // 5km內
        .sort((a, b) => {
          // 按距離排序
          return distanceDiff
        })
    },

    urgentOffers() {
      const now = new Date()
      const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

      const urgent = []
      this.allStores.forEach(store => {
        if (store.offers) {
          store.offers.forEach(offer => {
            const expiryDate = new Date(offer.validUntil)
            if (expiryDate <= threeDaysLater && expiryDate > now) {
              urgent.push({
                ...offer,
                store,
                storeId: store.id
              })
            }
          })
        }
      })

      return urgent.sort((a, b) => new Date(a.validUntil) - new Date(b.validUntil))
    }
  },
  methods: {
    calculateMatchScore(store) {
      let score = 0
      let maxScore = 0

      // 類別匹配 (40%)
      maxScore += 40
      if (this.userPreferences.favoriteCategories.includes(store.category)) {
        score += 40
      }

      // 優惠類型匹配 (30%)
      maxScore += 30
      if (store.offers && this.userPreferences.favoriteOfferTypes.length > 0) {
        const hasMatchingOffer = store.offers.some(offer => 
          this.userPreferences.favoriteOfferTypes.includes(offer.type)
        )
        if (hasMatchingOffer) score += 30
      }

      // 地區匹配 (20%)
      maxScore += 20
      if (this.userPreferences.frequentRegions.includes(store.region)) {
        score += 20
      }


      return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
    },

    getBestOfferForUser(store) {
      if (!store.offers) return null

      // 優先選擇用戶偏好的優惠類型
      const preferredOffer = store.offers.find(offer => 
        this.userPreferences.favoriteOfferTypes.includes(offer.type)
      )

      if (preferredOffer) return preferredOffer

      // 否則選擇特色優惠
      return store.offers.find(offer => offer.featured) || store.offers[0]
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

    getOfferTypeLabel(type) {
      const labels = {
        discount: '折扣',
        cashback: '回饋',
        gift: '贈品',
        member: '會員',
        bundle: '套餐',
        special: '特殊'
      }
      return labels[type] || '優惠'
    },

    formatExpiryDate(dateStr) {
      const date = new Date(dateStr)
      const now = new Date()
      const diff = date - now
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
      
      if (days <= 0) return '今日截止'
      if (days === 1) return '明日截止'
      return `${days}天後截止`
    }
  },
  emits: ['store-selected']
}
</script>

<style scoped>
.smart-recommendations {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.recommendations-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.recommendations-title {
  font-size: var(--h3-font-size);
  font-weight: 600;
  color: white;
}

.recommendation-section {
  margin-bottom: 2rem;
}

.recommendation-section:last-child {
  margin-bottom: 0;
}

.section-subtitle {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.urgent-title {
  color: #fecaca;
}

.stores-carousel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.recommendation-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-md);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.recommendation-card:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.75rem;
}

.store-name {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  line-height: 1.3;
  flex: 1;
  margin-right: 0.5rem;
}

.match-score, .distance-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.store-info {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.category, .region {
  background: rgba(255, 255, 255, 0.15);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
}


.offer-preview {
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.offer-type {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.offer-title {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
  margin: 0;
}

.urgent-offers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.urgent-offer-card {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: var(--border-radius-md);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.urgent-offer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
}

.urgent-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.expires-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
}
</style>