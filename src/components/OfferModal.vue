<template>
  <!-- 彈窗遮罩 -->
  <div 
    v-if="isVisible" 
    class="modal-overlay"
    @click="closeModal"
    @keydown.esc="closeModal"
  >
    <!-- 彈窗內容 -->
    <div 
      class="modal-content"
      @click.stop
      role="dialog"
      aria-modal="true"
      :aria-labelledby="`offer-title-${offer?.store?.id}`"
    >
      <!-- 關閉按鈕 -->
      <button 
        class="close-btn"
        @click="closeModal"
        aria-label="關閉優惠詳情"
      >
        <Icon name="close" size="lg" />
      </button>

      <div v-if="offer" class="modal-body">
        <!-- 優惠類型標誌 -->
        <div class="offer-badge" :class="offer.isEmployeeOffer ? 'employee-exclusive' : 'public-offer'">
          <Icon :name="offer.isEmployeeOffer ? 'user' : 'users'" size="sm" />
          <span>{{ offer.isEmployeeOffer ? '員工專享優惠' : '一般優惠' }}</span>
        </div>

        <!-- 優惠標題 -->
        <h2 class="offer-title" :id="`offer-title-${offer.store.id}`">
          {{ offer.title }}
        </h2>

        <!-- 店家資訊 -->
        <div class="store-section">
          <div class="store-header">
            <Icon name="store" size="lg" class="text-primary" />
            <div class="store-details">
              <h3 class="store-name">{{ offer.store.name }}</h3>
              <div class="store-meta">
                <span class="category">{{ offer.store.category }}</span>
              </div>
            </div>
          </div>

          <div class="location-info">
            <div class="address">
              <Icon name="location" size="sm" class="text-gray-500" />
              <span>{{ offer.store.address }}</span>
            </div>
            <div v-if="offer.distance" class="distance">
              <Icon name="navigation" size="sm" class="text-blue-500" />
              <span>距離約 {{ offer.distance }}km (步行 {{ walkTime }} 分鐘)</span>
            </div>
          </div>
        </div>

        <!-- 優惠詳情 -->
        <div class="offer-section">
          <h4 class="section-title">
            <Icon name="tag" size="sm" class="text-accent" />
            優惠內容
          </h4>
          <div class="offer-content">
            <div class="offer-type">
              <span class="type-badge" :class="`type-${offer.type}`">
                <Icon :name="getOfferIcon(offer.type)" size="sm" />
                {{ getOfferTypeLabel(offer.type) }}
              </span>
            </div>
            <p class="offer-description">{{ offer.description }}</p>
          </div>
        </div>

        <!-- 使用須知 -->
        <div class="usage-section">
          <h4 class="section-title">
            <Icon name="info" size="sm" class="text-blue-500" />
            使用須知
          </h4>
          <div class="usage-content">
            <ul class="usage-list">
              <li>請主動出示員工證件供店家核對</li>
              <li>優惠不可與其他促銷活動併用</li>
              <li>店家保留活動最終解釋權</li>
              <li>建議事先致電確認優惠仍有效</li>
            </ul>
          </div>
        </div>

        <!-- 有效期限 -->
        <div class="validity-section">
          <h4 class="section-title">
            <Icon name="clock" size="sm" class="text-orange-500" />
            有效期限
          </h4>
          <div class="validity-content">
            <span class="validity-date" :class="getValidityClass(offer.validUntil)">
              {{ formatValidityDate(offer.validUntil) }}
            </span>
            <div v-if="isUrgent(offer.validUntil)" class="urgent-notice">
              <Icon name="warning" size="sm" class="text-red-500" />
              <span>即將到期，請盡快使用！</span>
            </div>
          </div>
        </div>

        <!-- 營業時間 -->
        <div class="hours-section">
          <h4 class="section-title">
            <Icon name="clock" size="sm" class="text-green-500" />
            營業時間
          </h4>
          <p class="hours-text">{{ offer.store.openingHours }}</p>
        </div>

        <!-- 操作按鈕 -->
        <div class="action-buttons">
          <button @click="callStore" class="action-btn primary">
            <Icon name="phone" size="sm" />
            <span>{{ offer.store.phone }}</span>
          </button>
          <button @click="getDirections" class="action-btn secondary">
            <Icon name="map" size="sm" />
            <span>開啟導航</span>
          </button>
          <button @click="shareOffer" class="action-btn tertiary">
            <Icon name="share" size="sm" />
            <span>分享優惠</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from './Icon.vue'

export default {
  name: 'OfferModal',
  components: {
    Icon
  },
  props: {
    offer: {
      type: Object,
      default: null
    },
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    walkTime() {
      if (!this.offer?.distance) return 0
      const timeInHours = this.offer.distance / 5
      const timeInMinutes = Math.round(timeInHours * 60)
      return Math.max(1, timeInMinutes)
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },

    callStore() {
      if (this.offer?.store?.phone) {
        window.open(`tel:${this.offer.store.phone}`)
      }
    },

    getDirections() {
      if (this.offer?.store?.lat && this.offer?.store?.lng) {
        const url = `https://www.google.com/maps/dir/current+location/${this.offer.store.lat},${this.offer.store.lng}`
        window.open(url, '_blank')
      }
    },

    shareOffer() {
      const text = `${this.offer.store.name} - ${this.offer.title}: ${this.offer.description}`
      
      if (navigator.share) {
        navigator.share({
          title: this.offer.title,
          text: text,
          url: window.location.href
        }).catch(error => {
          // 用戶取消分享，不需要處理
          if (error.name !== 'AbortError') {
            console.error('分享失敗:', error)
          }
        })
      } else {
        navigator.clipboard.writeText(text).then(() => {
          this.$emit('show-toast', {
            message: '優惠資訊已複製到剪貼簿',
            type: 'success'
          })
        }).catch(() => {
          this.$emit('show-toast', {
            message: '複製失敗，請手動複製',
            type: 'error'
          })
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
        discount: '折扣優惠',
        cashback: '現金回饋',
        gift: '贈品活動',
        member: '會員專屬',
        bundle: '套餐組合'
      }
      return labels[type] || '優惠活動'
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
      if (days <= 30) return `約${Math.ceil(days/7)}週後截止`
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
    },

    isUrgent(dateStr) {
      const date = new Date(dateStr)
      const now = new Date()
      const diff = date - now
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
      
      return days >= 0 && days <= 3
    }
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden'
        this.$nextTick(() => {
          const modalContent = document.querySelector('.modal-content')
          if (modalContent) {
            modalContent.focus()
          }
        })
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  emits: ['close', 'show-toast']
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--surface-color);
  border-radius: var(--border-radius-lg);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 3rem;
  height: 3rem;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

.modal-body {
  padding: 2rem;
  padding-top: 1rem;
}

.offer-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.employee-exclusive {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.public-offer {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.offer-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-text-color);
  line-height: 1.3;
  margin-bottom: 1.5rem;
}

/* 各個區塊樣式 */
.store-section,
.offer-section,
.usage-section,
.validity-section,
.hours-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--surface-hover);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-text-color);
  margin-bottom: 1rem;
}

/* 店家資訊 */
.store-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.store-details {
  flex: 1;
}

.store-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-text-color);
  margin-bottom: 0.5rem;
}

.store-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.category {
  background: white;
  color: var(--text-secondary);
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  font-weight: 500;
}


.location-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.address, .distance {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

/* 優惠內容 */
.offer-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  font-weight: 500;
}

.type-discount { background: #fef3cd; color: #856404; }
.type-cashback { background: #d1ecf1; color: #0c5460; }
.type-gift { background: #d4edda; color: #155724; }
.type-member { background: #e2e3e5; color: #383d41; }
.type-bundle { background: #f8d7da; color: #721c24; }

.offer-description {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--primary-text-color);
}

/* 使用須知 */
.usage-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.usage-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
  line-height: 1.5;
}

.usage-list li:last-child {
  border-bottom: none;
}

.usage-list li:before {
  content: "•";
  color: var(--primary-color);
  font-weight: bold;
  margin-right: 0.75rem;
}

/* 有效期限 */
.validity-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.validity-date {
  font-size: 1.125rem;
  font-weight: 600;
}

.validity-date.expired { color: #dc3545; }
.validity-date.urgent { color: #fd7e14; }
.validity-date.soon { color: #ffc107; }
.validity-date.normal { color: var(--primary-text-color); }

.urgent-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff5f5;
  color: #c53030;
  padding: 0.75rem;
  border-radius: var(--border-radius-md);
  border: 1px solid #feb2b2;
  font-weight: 500;
}

/* 營業時間 */
.hours-text {
  font-size: 1rem;
  color: var(--primary-text-color);
  margin: 0;
}

/* 操作按鈕 */
.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-top: 2rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  font-size: 0.875rem;
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

.action-btn.tertiary {
  background: var(--surface-hover);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.action-btn.tertiary:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-content {
    max-height: 95vh;
  }

  .modal-body {
    padding: 1.5rem 1rem;
  }

  .offer-title {
    font-size: 1.5rem;
    padding-right: 3rem;
  }

  .store-header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .store-meta {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .action-buttons {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .action-btn {
    padding: 1.125rem 1rem;
  }
}
</style>