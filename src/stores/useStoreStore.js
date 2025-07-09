import { defineStore } from 'pinia'
import Fuse from 'fuse.js'

// **關鍵**：將 BASE_URL 換成您剛才複製的網路應用程式網址
const BASE_URL = 'https://script.google.com/macros/s/AKfycbxZXmuRtpzQjWxT7MdzH2AxK_DM8vwpMmksoINlI6dhUxViba8yy2ODdqV48vR876hI/exec';

// FILE_ID_MAP 現在不再需要了，可以刪除

export const useStoreStore = defineStore('stores', {
  state: () => ({
    allStores: [],
    searchQuery: '',
    filters: {
      region: '',
      category: '',
      offerType: '',
      employeeOnly: false, // 員工專享篩選
      communityRecommended: false // 社群推薦篩選
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
    // Getter 1: 只處理「全通路/服務型」的優惠（沒有經緯度的店家）
    channelOffers: (state) => {
      const offers = []
      let filteredStores = state.allStores
        .filter(store => !store.lat || !store.lng || store.lat === null || store.lng === null) // 篩選出沒有經緯度的店家
      
      // 如果有設定類別篩選，進一步篩選
      if (state.filters.category) {
        filteredStores = filteredStores.filter(store => store.category === state.filters.category)
      }
      
      filteredStores.forEach(store => {
        if (store.offers) {
          store.offers
            .filter(offer => state.filters.employeeOnly ? offer.isEmployeeOffer : true)
            .filter(offer => state.filters.communityRecommended ? (offer.communityRecommended || offer.featured) : true)
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
                }
                // 這裡沒有 distance
              })
            })
        }
      })
      return offers
    },

    // Getter 2: 只處理「附近實體店家」的優惠（有經緯度的店家）
    nearbyPhysicalOffers: (state) => {
      if (!state.userLocation) return []
      
      const offers = []
      state.allStores
        .filter(store => store.lat && store.lng && store.lat !== null && store.lng !== null) // 篩選出有經緯度的店家
        .forEach(store => {
          if (store.offers) {
            const distance = calculateDistance(
              state.userLocation.lat, 
              state.userLocation.lng, 
              store.lat, 
              store.lng
            )
            
            if (distance <= 5) { // 維持 5km 範圍
              store.offers
                .filter(offer => state.filters.employeeOnly ? offer.isEmployeeOffer : true)
                .filter(offer => state.filters.communityRecommended ? (offer.communityRecommended || offer.featured) : true)
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
                    distance: distance // 帶上距離
                  })
                })
            }
          }
        })
        
      return offers.sort((a, b) => a.distance - b.distance)
    },

    // 員工附近優惠 - 核心功能 (保留原有邏輯作為後備)
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

    // 全通路優惠的可用類別
    channelOfferCategories: (state) => {
      const categories = [...new Set(
        state.allStores
          .filter(store => !store.lat || !store.lng || store.lat === null || store.lng === null)
          .filter(store => store.offers && store.offers.length > 0)
          .map(store => store.category)
          .filter(category => category && category.trim() !== '')
      )]
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
      if (!companyId) {
        this.error = "未指定公司代號";
        return;
      }
      if (this.currentCompanyId === companyId && this.allStores.length > 0) return;

      this.isLoading = true;
      this.error = null;
      this.allStores = [];

      // 組成帶有查詢參數的 API 請求網址
      const url = `${BASE_URL}?companyId=${companyId}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || '從 API 載入資料失敗');
        }
        
        this.allStores = data;
        this.currentCompanyId = companyId;
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
        offerType: '',
        employeeOnly: false,
        communityRecommended: false
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