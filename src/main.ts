import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Dashboard from './components/Dashboard.vue';
import Credits from './components/Credits.vue';
import App from './App.vue';
import './style.css';
import { createRouter, createWebHistory } from 'vue-router';
const routes = [
    { path: '/', component: Dashboard },
    { path: '/dashboard', component: Dashboard },
    { path: '/credits', component: Credits },
  ];
  const router = createRouter({
    history: createWebHistory('/space-ship-2/'),
    routes
  });
const app = createApp(App);
app.use(router);
app.use(createPinia());
app.mount('#app');

