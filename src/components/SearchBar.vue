<template>
  <div class="search-bar relative">
    <div class="relative">
      <div class="search-icon">
        <Icon name="search" size="md" spacing="none" class="text-secondary" :aria-hidden="true" />
      </div>
      <input 
        type="text" 
        v-model="searchQuery"
        @input="handleSearch"
        placeholder="搜尋店家名稱、地址或描述..."
        class="search-input"
      >
      <div v-if="searchQuery" class="clear-button-container">
        <button 
          @click="clearSearch"
          class="clear-button"
          aria-label="清除搜尋"
        >
          <Icon name="close" size="sm" spacing="none" :aria-hidden="true" />
        </button>
      </div>
    </div>
    
    <!-- 搜尋建議 -->
    <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
      <div class="suggestions-container">
        <div 
          v-for="(suggestion, index) in suggestions" 
          :key="index"
          @click="selectSuggestion(suggestion)"
          class="suggestion-item"
        >
          <div class="font-medium store-card-title">{{ suggestion.name }}</div>
          <div class="suggestion-address">{{ suggestion.address }}</div>
          <div class="flex items-center mt-2">
            <span class="store-card-category">{{ suggestion.category }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 搜尋狀態指示 -->
    <div v-if="isSearching" class="search-status">
      <div class="search-spinner"></div>
      搜尋中...
    </div>
  </div>
</template>

<script>
import Icon from './Icon.vue'

export default {
  name: 'SearchBar',
  components: {
    Icon
  },
  props: {
    stores: {
      type: Array,
      default: () => []
    },
    searchResultCount: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      searchQuery: '',
      isSearching: false,
      showSuggestions: false,
      searchTimeout: null
    }
  },
  computed: {
    suggestions() {
      if (!this.searchQuery || this.searchQuery.length < 2) {
        return []
      }
      
      const query = this.searchQuery.toLowerCase()
      return this.stores
        .filter(store => 
          store.name.toLowerCase().includes(query) ||
          store.address.toLowerCase().includes(query) ||
          store.description.toLowerCase().includes(query)
        )
        .slice(0, 5) // 限制建議數量
    }
  },
  methods: {
    handleSearch() {
      this.isSearching = true
      this.showSuggestions = this.searchQuery.length >= 2
      
      // 防抖處理，避免過於頻繁的搜尋請求
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      this.searchTimeout = setTimeout(() => {
        this.$emit('search', this.searchQuery)
        this.isSearching = false
      }, 300)
    },
    clearSearch() {
      this.searchQuery = ''
      this.showSuggestions = false
      this.isSearching = false
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      this.$emit('search', '')
    },
    selectSuggestion(suggestion) {
      this.searchQuery = suggestion.name
      this.showSuggestions = false
      this.$emit('search', this.searchQuery)
      this.$emit('suggestion-selected', suggestion)
    },
    // 點擊外部時隱藏建議
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.showSuggestions = false
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  },
  emits: ['search', 'suggestion-selected']
}
</script>

<style scoped>
.search-icon {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  display: flex;
  align-items: center;
  pointer-events: none;
  padding-left: calc(var(--spacing-unit) * 2);
}

.search-input {
  font-size: 1.125rem;
  line-height: 1.75rem;
  padding-left: calc(var(--spacing-unit) * 6);
  padding-right: calc(var(--spacing-unit) * 6);
  border-radius: var(--border-radius-lg);
  width: 100%;
  border: 2px solid var(--border-color);
  background-color: var(--surface-color);
  color: var(--primary-text-color);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.clear-button-container {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  display: flex;
  align-items: center;
  padding-right: calc(var(--spacing-unit) * 2);
}

.clear-button {
  padding: 0.25rem;
  border-radius: var(--border-radius-md);
  color: var(--text-secondary);
  transition: all 0.2s ease;
  border: none;
  background: none;
  cursor: pointer;
}

.clear-button:hover {
  background-color: var(--bg-color);
  color: var(--text-primary);
}

.suggestions-dropdown {
  position: absolute;
  z-index: 20;
  width: 100%;
  background-color: var(--surface-color);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  max-height: 16rem;
  overflow-y: auto;
  margin-top: calc(var(--spacing-unit) * 1);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
}

.suggestions-container {
  padding: calc(var(--spacing-unit) * 1);
}

.suggestion-item {
  cursor: pointer;
  color: var(--primary-text-color);
  transition: all 0.2s ease;
  padding: calc(var(--spacing-unit) * 1.5);
  border-radius: var(--border-radius-md);
  margin-bottom: calc(var(--spacing-unit) * 0.5);
}

.suggestion-item:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

.suggestion-address {
  color: var(--text-secondary);
  margin-top: 0.25rem;
  font-size: var(--caption-font-size);
}


.search-status {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  margin-top: calc(var(--spacing-unit) * 1.5);
  font-size: var(--caption-font-size);
}

.search-spinner {
  animation: spin 1s linear infinite;
  border-radius: 50%;
  height: 1rem;
  width: 1rem;
  border: 2px solid transparent;
  border-top-color: var(--primary-color);
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>