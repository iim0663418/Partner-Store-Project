<template>
  <article 
    class="offer-card"
    @click="handleCardClick"
    @keydown.enter="handleCardClick"
    @keydown.space="handleCardClick"
    tabindex="0"
    role="button"
    :aria-label="`查看 ${offer.title} 的詳細資訊`"
  >
    <!-- 員工專屬標籤 -->
    <div class="employee-badge">
      <Icon name="user" size="sm" />
      <span>員工專享</span>
    </div>

    <!-- 優惠標題 - 最醒目位置 -->
    <div class="offer-header">
      <h3 class="offer-title">{{ offer.title }}</h3>
      <div class="offer-type-badge" :class="`type-${offer.type}`">
        <Icon :name="getOfferIcon(offer.type)" size="sm" />
        {{ getOfferTypeLabel(offer.type) }}
      </div>
    </div>

    <!-- 店家資訊 - 次要資訊 -->
    <div class="store-info">
      <div class="store-main">
        <h4 class="store-name">{{ offer.store.name }}</h4>
        <div class="distance-info" v-if="offer.distance != null">
          <Icon name="navigation" size="sm" class="text-blue-500" />
          <span class="distance">{{ offer.distance }}km</span>
          <span class="walk-time">步行約 {{ walkTime }} 分</span>
        </div>
      </div>
      <div class="store-meta">
        <span class="category">{{ offer.store.category }}</span>
      </div>
    </div>

    <!-- 優惠描述 -->
    <div class="offer-description">
      <p>{{ offer.description }}</p>
    </div>

    <!-- 有效期限 -->
    <div class="offer-validity">
      <Icon name="clock" size="sm" class="text-gray-500" />
      <span class="validity-text" :class="getValidityClass(offer.validUntil)">
        {{ formatValidityDate(offer.validUntil) }}
      </span>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <button @click.stop="callStore" class="action-btn primary">
        <Icon name="phone" size="sm" />
        撥打電話
      </button>
      <button @click.stop="getDirections" class="action-btn secondary">
        <Icon name="map" size="sm" />
        查看路線
      </button>
    </div>
  </article>
</template>

<script>
import Icon from './Icon.vue'

export default {
  name: 'OfferCard',
  components: {
    Icon
  },
  props: {
    offer: {
      type: Object,
      required: true
    }
  },
  computed: {
    walkTime() {
      // 假設步行速度 5km/h
      if (this.offer.distance == null) return 0
      const timeInHours = this.offer.distance / 5
      const timeInMinutes = Math.round(timeInHours * 60)
      return Math.max(1, timeInMinutes)
    }
  },
  methods: {
    handleCardClick(event) {
      // 防止空白鍵滾動頁面
      if (event && event.type === 'keydown' && event.code === 'Space') {
        event.preventDefault()
      }
      this.$emit('offer-click', this.offer)
    },

    callStore() {
      window.open(`tel:${this.offer.store.phone}`)
    },

    getDirections() {
      // 使用 Google Maps 導航
      if (this.offer.store.lat && this.offer.store.lng) {
        const url = `https://www.google.com/maps/dir/current+location/${this.offer.store.lat},${this.offer.store.lng}`
        window.open(url, '_blank')
      } else {
        // 如果沒有經緯度，可以用地址搜尋
        const searchQuery = encodeURIComponent(this.offer.store.name + ' ' + (this.offer.store.address || ''))
        const url = `https://www.google.com/maps/search/${searchQuery}`
        window.open(url, '_blank')
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

    formatValidityDate(dateStr) {
      const date = new Date(dateStr)
      const now = new Date()
      const diff = date - now
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
      
      if (days < 0) return '已過期'
      if (days === 0) return '今日截止'
      if (days === 1) return '明日截止'
      if (days <= 7) return `${days}天後截止`
      if (days <= 30) return `${Math.ceil(days/7)}週後截止`
      return '長期有效'
    },

    getValidityClass(dateStr) {
      const date = new Date(dateStr)
      const now = new Date()
      const diff = date - now
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
      
      if (days < 0) return 'expired'
      if (days <= 3) return 'urgent'
      if (days <= 7) return 'soon'
      return 'normal'
    }
  },
  emits: ['offer-click']
}
</script>

<style scoped>
.offer-card {
  background: var(--surface-color);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  margin-bottom: 1rem;
}

.offer-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.offer-card:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
  border-color: var(--primary-color);
}

.offer-card:focus:not(:focus-visible) {
  outline: none;
}

/* 員工專屬標籤 */
.employee-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

/* 優惠標題區 */
.offer-header {
  margin-bottom: 1rem;
  padding-right: 6rem; /* 為右側標籤留空間 */
}

.offer-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-text-color);
  line-height: 1.3;
  margin-bottom: 0.5rem;
}

.offer-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  font-weight: 500;
}

.type-discount { background: #fef3cd; color: #856404; }
.type-cashback { background: #d1ecf1; color: #0c5460; }
.type-gift { background: #d4edda; color: #155724; }
.type-member { background: #e2e3e5; color: #383d41; }
.type-bundle { background: #f8d7da; color: #721c24; }

/* 店家資訊區 */
.store-info {
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--surface-hover);
  border-radius: var(--border-radius-md);
}

.store-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.store-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-text-color);
  flex: 1;
}

.distance-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.distance {
  font-weight: 600;
  color: var(--primary-color);
}

.walk-time {
  background: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.store-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.category {
  background: white;
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
}


/* 優惠描述 */
.offer-description {
  margin-bottom: 1rem;
}

.offer-description p {
  color: var(--text-secondary);
  line-height: 1.5;
  font-size: 0.875rem;
}

/* 有效期限 */
.offer-validity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.validity-text {
  font-weight: 500;
}

.validity-text.expired { color: #dc3545; }
.validity-text.urgent { color: #fd7e14; }
.validity-text.soon { color: #ffc107; }
.validity-text.normal { color: var(--text-secondary); }

/* 快速操作 */
.quick-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
}

.action-btn.primary {
  background: var(--primary-color);
  color: white;
}

.action-btn.primary:hover {
  background: var(--primary-hover-color);
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.action-btn.secondary:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-1px);
}

/* 移動裝置響應式 */
@media (max-width: 768px) {
  .offer-card {
    padding: 1.25rem;
  }

  .offer-header {
    padding-right: 5rem;
  }

  .offer-title {
    font-size: 1.125rem;
  }

  .store-main {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .distance-info {
    align-self: flex-end;
  }

  .quick-actions {
    flex-direction: column;
  }

  .action-btn {
    padding: 0.875rem 1rem;
  }
}
</style>