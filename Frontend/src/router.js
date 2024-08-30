import { createWebHistory, createRouter } from 'vue-router'
import home from './views/Home.vue'
import chats from './views/Chats.vue'
import { ref } from 'vue'

// const routMessagge = ref(localStorage.getItem('salaId') || '');

const routes = [
    { path: '/', component:home, name: 'home'},
    { path: '/:salaId', component: chats, name:'salaChat'},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;
