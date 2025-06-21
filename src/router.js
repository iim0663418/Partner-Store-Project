// src/router.js
import { createRouter, createWebHashHistory } from 'vue-router';
import App from './App.vue';
import CompanySelector from './components/CompanySelector.vue';

const routes = [
  {
    path: '/:companyId', // 動態路由，例如 /#/moda 或 /#/npa
    name: 'CompanyOffers',
    component: App, // 讓 App.vue 繼續作為主頁面
    props: true
  },
  {
    path: '/', // 根路徑
    name: 'Selector',
    component: CompanySelector,
  }
];

const router = createRouter({
  history: createWebHashHistory(), // 使用 Hash 模式，最適合 GitHub Pages
  routes
});

export default router;