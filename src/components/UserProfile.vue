<template>
  <div class="user-profile-card">
    <div class="profile-header">
      <Icon name="user" size="lg" class="text-primary" />
      <h3 class="profile-title">個人化設定</h3>
    </div>
    
    <div class="profile-sections">
      <!-- 偏好設定 -->
      <div class="section">
        <h4 class="section-title">偏好類型</h4>
        <div class="preferences-grid">
          <label 
            v-for="category in availableCategories" 
            :key="category"
            class="preference-item"
            :class="{ active: userPreferences.favoriteCategories.includes(category) }"
          >
            <input 
              type="checkbox" 
              :value="category"
              v-model="userPreferences.favoriteCategories"
              class="hidden"
            />
            <span class="preference-label">{{ category }}</span>
          </label>
        </div>
      </div>

      <!-- 優惠偏好 -->
      <div class="section">
        <h4 class="section-title">優惠偏好</h4>
        <div class="preferences-grid">
          <label 
            v-for="offerType in availableOfferTypes" 
            :key="offerType"
            class="preference-item"
            :class="{ active: userPreferences.favoriteOfferTypes.includes(offerType) }"
          >
            <input 
              type="checkbox" 
              :value="offerType"
              v-model="userPreferences.favoriteOfferTypes"
              class="hidden"
            />
            <span class="preference-label">{{ getOfferTypeLabel(offerType) }}</span>
          </label>
        </div>
      </div>

      <!-- 地區偏好 -->
      <div class="section">
        <h4 class="section-title">常去地區</h4>
        <div class="regions-grid">
          <label 
            v-for="region in availableRegions" 
            :key="region"
            class="preference-item"
            :class="{ active: userPreferences.frequentRegions.includes(region) }"
          >
            <input 
              type="checkbox" 
              :value="region"
              v-model="userPreferences.frequentRegions"
              class="hidden"
            />
            <span class="preference-label">{{ region }}</span>
          </label>
        </div>
      </div>

      <!-- 預算範圍 -->
      <div class="section">
        <h4 class="section-title">預算範圍</h4>
        <select v-model="userPreferences.budgetRange" class="budget-select">
          <option value="">不限</option>
          <option value="low">小資族 (1,000元以下)</option>
          <option value="medium">一般消費 (1,000-5,000元)</option>
          <option value="high">高消費 (5,000元以上)</option>
        </select>
      </div>
    </div>

    <div class="profile-actions">
      <button @click="savePreferences" class="save-btn">
        <Icon name="check" size="sm" />
        儲存設定
      </button>
      <button @click="resetPreferences" class="reset-btn">
        重設
      </button>
    </div>
  </div>
</template>

<script>
import Icon from './Icon.vue'

export default {
  name: 'UserProfile',
  components: {
    Icon
  },
  props: {
    availableCategories: {
      type: Array,
      default: () => []
    },
    availableOfferTypes: {
      type: Array,
      default: () => []
    },
    availableRegions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      userPreferences: {
        favoriteCategories: [],
        favoriteOfferTypes: [],
        frequentRegions: [],
        budgetRange: ''
      }
    }
  },
  methods: {
    savePreferences() {
      localStorage.setItem('userPreferences', JSON.stringify(this.userPreferences))
      this.$emit('preferences-updated', this.userPreferences)
      this.$emit('show-toast', {
        message: '個人設定已儲存',
        type: 'success'
      })
    },
    resetPreferences() {
      this.userPreferences = {
        favoriteCategories: [],
        favoriteOfferTypes: [],
        frequentRegions: [],
        budgetRange: ''
      }
      localStorage.removeItem('userPreferences')
      this.$emit('preferences-updated', this.userPreferences)
    },
    loadPreferences() {
      const saved = localStorage.getItem('userPreferences')
      if (saved) {
        this.userPreferences = { ...this.userPreferences, ...JSON.parse(saved) }
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
  mounted() {
    this.loadPreferences()
  },
  emits: ['preferences-updated', 'show-toast']
}
</script>

<style scoped>
.user-profile-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.profile-title {
  font-size: var(--h3-font-size);
  font-weight: 600;
  color: var(--primary-text-color);
}

.profile-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--primary-text-color);
  margin-bottom: 0.75rem;
}

.preferences-grid, .regions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.preference-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.preference-item:hover {
  border-color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

.preference-item.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.preference-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.budget-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  background-color: var(--surface-color);
  color: var(--primary-text-color);
  font-size: 0.875rem;
}

.profile-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.save-btn:hover {
  background-color: var(--primary-hover-color);
}

.reset-btn {
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background-color: var(--surface-hover);
  border-color: var(--primary-color);
}
</style>