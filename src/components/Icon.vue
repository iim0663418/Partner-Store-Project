<template>
  <svg 
    :class="iconClasses" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    :aria-hidden="ariaHidden"
    :aria-label="ariaLabel"
  >
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      :d="iconPath" 
    />
  </svg>
</template>

<script>
export default {
  name: 'Icon',
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: 'sm',
      validator: value => ['sm', 'md', 'lg'].includes(value)
    },
    spacing: {
      type: String,
      default: 'md',
      validator: value => ['sm', 'md', 'lg', 'none'].includes(value)
    },
    type: {
      type: String,
      default: 'custom',
      validator: value => ['button', 'info', 'action', 'custom'].includes(value)
    },
    ariaLabel: {
      type: String,
      default: null
    },
    ariaHidden: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    iconClasses() {
      const classes = ['icon']
      
      // 使用預設類型還是自定義尺寸
      if (this.type !== 'custom') {
        classes.push(`icon-${this.type}`)
      } else {
        classes.push(`icon-${this.size}`)
        if (this.spacing !== 'none') {
          classes.push(`icon-spacing-${this.spacing}`)
        }
      }
      
      return classes
    },
    iconPath() {
      const icons = {
        // 搜尋相關
        search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
        close: 'M6 18L18 6M6 6l12 12',
        
        // 篩選相關
        filter: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z',
        sort: 'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12',
        
        // 位置相關
        location: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
        'location-simple': 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
        navigation: 'M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z',
        
        // 聯絡資訊
        phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
        clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        
        // 評分
        star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
        
        // 狀態
        check: 'M5 13l4 4L19 7',
        'check-circle': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        error: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        
        // 分類
        category: 'M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z',
        
        // 操作
        trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
      }
      
      return icons[this.name] || icons.info
    }
  }
}
</script>

<style scoped>
/* 基本樣式在 global.css 中定義 */
</style>