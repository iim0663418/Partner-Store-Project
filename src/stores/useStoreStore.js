import { defineStore } from 'pinia'
import Fuse from 'fuse.js'

export const useStoreStore = defineStore('stores', {
  state: () => ({
    allStores: [],
    searchQuery: '',
    filters: {
      region: '',
      category: '',
      offerType: ''
    },
    userLocation: null,
    userPreferences: {
      favoriteCategories: [],
      favoriteOfferTypes: [],
      frequentRegions: [],
      budgetRange: ''
    },
    isLoading: false,
    error: null,
    currentCompanyId: null // 新增一個狀態來記錄當前公司
  }),

  getters: {
    // 員工附近優惠 - 核心功能
    nearbyOffers: (state) => {
      if (!state.userLocation) return []
      
      const offers = []
      state.allStores.forEach(store => {
        if (store.offers) {
          // 計算距離
          const distance = calculateDistance(
            state.userLocation.lat, 
            state.userLocation.lng, 
            store.lat, 
            store.lng
          )
          
          // 只顯示5km內的店家
          if (distance <= 5) {
            store.offers
              .filter(offer => offer.isEmployeeOffer) // 只顯示員工專屬優惠
              .forEach(offer => {
                offers.push({
                  ...offer,
                  store: {
                    id: store.id,
                    name: store.name,
                    address: store.address,
                    phone: store.phone,
                    category: store.category,
                    openingHours: store.openingHours,
                    lat: store.lat,
                    lng: store.lng
                  },
                  distance: distance
                })
              })
          }
        }
      })
      
      // 按距離排序（近到遠）
      return offers.sort((a, b) => a.distance - b.distance)
    },

    filteredStores: (state) => {
      let filtered = [...state.allStores]
      
      // 應用篩選器
      if (state.filters.region) {
        filtered = filtered.filter(store => store.region === state.filters.region)
      }
      
      if (state.filters.category) {
        filtered = filtered.filter(store => store.category === state.filters.category)
      }
      
      
      if (state.filters.offerType) {
        filtered = filtered.filter(store => 
          store.offers && store.offers.some(offer => offer.type === state.filters.offerType)
        )
      }
      
      // 應用搜尋
      if (state.searchQuery) {
        const fuse = new Fuse(filtered, {
          keys: [
            'name', 
            'address', 
            'description', 
            'category',
            'offers.title',
            'offers.description'
          ],
          threshold: 0.3,
          includeScore: true
        })
        
        const searchResults = fuse.search(state.searchQuery)
        filtered = searchResults.map(result => result.item)
      }
      
      return filtered
    },

    availableRegions: (state) => {
      const regions = [...new Set(state.allStores.map(store => store.region))]
      return regions.sort()
    },

    availableCategories: (state) => {
      const categories = [...new Set(state.allStores.map(store => store.category))]
      return categories.sort()
    },

    availableOfferTypes: (state) => {
      const offerTypes = []
      state.allStores.forEach(store => {
        if (store.offers) {
          store.offers.forEach(offer => {
            if (!offerTypes.includes(offer.type)) {
              offerTypes.push(offer.type)
            }
          })
        }
      })
      return offerTypes.sort()
    },

    storeCount: (state) => {
      return state.filteredStores.length
    }
  },

  actions: {
    async loadStores(companyId) {
      // 如果已經是同一個公司且資料已載入，則不重複載入
      if (this.currentCompanyId === companyId && this.allStores.length > 0) {
        return;
      }

      this.isLoading = true;
      this.error = null;
      this.allStores = []; // 清空舊資料

      try {
        // 從 public 資料夾抓取對應的 JSON
        // vite.config.js 的 base 路徑會自動處理前綴
        const response = await fetch(`./stores-${companyId}.json`);
        if (!response.ok) {
          throw new Error(`找不到 ${companyId} 的資料檔案`);
        }
        this.allStores = await response.json();
        this.currentCompanyId = companyId; // 記錄當前公司
      } catch (e) {
        this.error = e.message;
        console.error("載入資料失敗:", e);
      } finally {
        this.isLoading = false;
      }
    },

    setSearchQuery(query) {
      this.searchQuery = query
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    clearFilters() {
      this.filters = {
        region: '',
        category: '',
      }
    },

    clearSearch() {
      this.searchQuery = ''
    },

    setUserLocation(location) {
      this.userLocation = location
    },

    clearUserLocation() {
      this.userLocation = null
    },

    async getCurrentLocation() {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('此瀏覽器不支援地理定位功能'))
          return
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            this.setUserLocation(location)
            resolve(location)
          },
          (error) => {
            let errorMessage = '無法取得您的位置'
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = '位置存取權限被拒絕'
                break
              case error.POSITION_UNAVAILABLE:
                errorMessage = '位置資訊不可用'
                break
              case error.TIMEOUT:
                errorMessage = '位置請求超時'
                break
            }
            reject(new Error(errorMessage))
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5分鐘快取
          }
        )
      })
    },

    setUserPreferences(preferences) {
      this.userPreferences = { ...this.userPreferences, ...preferences }
      localStorage.setItem('userPreferences', JSON.stringify(this.userPreferences))
    },

    loadUserPreferences() {
      const saved = localStorage.getItem('userPreferences')
      if (saved) {
        this.userPreferences = { ...this.userPreferences, ...JSON.parse(saved) }
      }
    }
  }
})

// 輔助函數：計算兩點間距離
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // 地球半徑（公里）
  const dLat = deg2rad(lat2 - lat1)
  const dLng = deg2rad(lng2 - lng1)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  
  return +distance.toFixed(1) // 回傳一位小數
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}