import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Dashboard from './components/Dashboard.vue';
import Credits from './components/Credits.vue';
import App from './App.vue';
import './style.css';
import { createRouter, createWebHistory } from 'vue-router';
const routes = [
    { path: '/dashboard', component: Dashboard },
    { path: '/credits', component: Credits }
  ];
  const router = createRouter({
    history: createWebHistory(),
    routes
  });
const app = createApp(App);
app.use(router);
app.use(createPinia());
app.mount('#app');

