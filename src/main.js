import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import './styles/global.css'
import router from './router'
import RootApp from './RootApp.vue'

const app = createApp(RootApp)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')