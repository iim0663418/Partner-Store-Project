<template>
  <div class="selector-container">
    <h1 class="selector-title">員工專屬優惠平台</h1>
    <p class="selector-subtitle">請選擇您所屬的單位</p>
    <div class="selector-buttons">
      <button @click="selectCompany('moda')" class="selector-btn">
        數位發展部
      </button>
      <button @click="selectCompany('npa')" class="selector-btn">
        內政部警政署
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CompanySelector',
  created() {
    const savedCompany = localStorage.getItem('selectedCompany');
    if (savedCompany) {
      this.$router.replace({ name: 'CompanyOffers', params: { companyId: savedCompany } });
    }
  },
  methods: {
    selectCompany(companyId) {
      localStorage.setItem('selectedCompany', companyId);
      this.$router.push({ name: 'CompanyOffers', params: { companyId } });
    }
  }
};
</script>

<style scoped>
/* 您可以為這個頁面添加更豐富的樣式 */
.selector-container { 
  text-align: center; 
  padding: 4rem 1rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: var(--bg-color);
}

.selector-title { 
  font-size: 2rem; 
  font-weight: 700; 
  margin-bottom: 0.5rem;
  color: var(--primary-text-color);
}

.selector-subtitle { 
  font-size: 1.1rem; 
  color: #6C757D; 
  margin-bottom: 3rem; 
}

.selector-buttons { 
  display: flex; 
  flex-direction: column; 
  gap: 1rem; 
  align-items: center; 
}

.selector-btn {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  width: 80%;
  max-width: 300px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.selector-btn:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.selector-btn:active {
  transform: translateY(0);
}
</style>