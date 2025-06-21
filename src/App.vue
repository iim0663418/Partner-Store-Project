<template>
  <div id="app" class="app-container">
    <!-- Ultra Simplified Header -->
    <header class="app-header">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center py-2">
          <h1 class="app-title">優惠探索</h1>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <!-- Loading State -->
      <div v-if="isLoading || isGettingLocation" class="flex flex-col justify-center items-center py-16" role="status" aria-live="polite">
        <div class="relative" aria-hidden="true">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
        </div>
        <div class="mt-4 text-center">
          <p class="text-lg font-medium text-gray-700">
            {{ isLoading ? '載入店家資料中' : '正在尋找您附近的優惠' }}
          </p>
          <p class="text-sm text-gray-500 mt-1">請稍候...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-16" role="alert" aria-live="assertive">
        <div class="bg-red-50 rounded-2xl p-8 max-w-md mx-auto">
          <Icon name="error" size="lg" spacing="none" class="text-red-400 mx-auto mb-4" :aria-hidden="true" />
          <h2 class="text-lg font-semibold text-red-800 mb-2">載入失敗</h2>
          <p class="text-red-600 mb-4">{{ error }}</p>
          <button 
            @click="loadStores" 
            class="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium shadow-lg"
            aria-label="重新載入店家資料"
          >
            重新載入
          </button>
        </div>
      </div>

      <!-- App Content -->
      <div v-else>
        <!-- 員工附近優惠流 -->
        <OfferList 
          :offers="nearbyOffers"
          :user-location="userLocation"
          @offer-selected="handleOfferSelected"
          @get-location="getCurrentLocation"
          @custom-location-selected="handleCustomLocation"
        />
      </div>
    </main>

    <!-- 優惠詳情彈窗 -->
    <OfferModal 
      :offer="selectedOffer"
      :is-visible="showOfferModal"
      @close="closeOfferModal"
      @show-toast="showToast"
    />

    <!-- Error Toast - 響應式設計 -->
    <div 
      v-if="locationError" 
      class="fixed top-4 left-4 right-4 md:top-8 md:left-auto md:right-8 md:max-w-md bg-red-500 text-white px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl shadow-2xl z-50 border border-red-400 backdrop-blur-sm"
    >
      <div class="flex items-center">
        <div class="bg-red-400 rounded-full p-1 mr-3 flex-shrink-0">
          <Icon name="error" size="sm" spacing="none" :aria-hidden="true" />
        </div>
        <span class="font-medium flex-1 text-sm md:text-base">{{ locationError }}</span>
        <button @click="locationError = null" class="ml-3 hover:bg-red-400 p-1 rounded-full transition-colors duration-200 flex-shrink-0">
          <Icon name="close" size="sm" spacing="none" :aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useStoreStore } from './stores/useStoreStore'
import OfferList from './components/OfferList.vue'
import OfferModal from './components/OfferModal.vue'
import Icon from './components/Icon.vue'

export default {
  name: 'App',
  components: {
    OfferList,
    OfferModal,
    Icon
  },
  data() {
    return {
      isGettingLocation: false,
      locationError: null,
      selectedOffer: null,
      showOfferModal: false
    }
  },
  computed: {
    storeStore() {
      return useStoreStore()
    },
    allStores() {
      return this.storeStore.allStores
    },
    nearbyOffers() {
      return this.storeStore.nearbyOffers
    },
    userLocation() {
      return this.storeStore.userLocation
    },
    isLoading() {
      return this.storeStore.isLoading
    },
    error() {
      return this.storeStore.error
    }
  },
  methods: {
    async loadStores() {
      await this.storeStore.loadStores()
    },
    handleOfferSelected(offer) {
      this.selectedOffer = offer
      this.showOfferModal = true
    },
    closeOfferModal() {
      this.showOfferModal = false
      this.selectedOffer = null
    },
    showToast(toast) {
      // 簡易 toast 通知實作
      console.log('Toast:', toast.message)
    },
    handleCustomLocation(location) {
      // 設定自定義位置
      this.storeStore.setUserLocation({
        lat: location.lat,
        lng: location.lng,
        address: location.address,
        name: location.name
      })
    },
    async getCurrentLocation() {
      this.isGettingLocation = true
      this.locationError = null
      
      try {
        await this.storeStore.getCurrentLocation()
      } catch (error) {
        this.locationError = error.message
        setTimeout(() => {
          this.locationError = null
        }, 5000)
      } finally {
        this.isGettingLocation = false
      }
    }
  },
  async mounted() {
    await this.loadStores()
    // 自動啟動定位流程 - 位置優先策略
    this.getCurrentLocation()
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.app-header {
  background-color: var(--surface-color);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid var(--border-color);
}

.app-title {
  color: var(--primary-text-color);
  font-weight: 700;
  font-size: var(--h2-font-size);
}
</style>