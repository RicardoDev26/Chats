import { createWebHistory, createRouter } from 'vue-router'
import home from './views/Home.vue'
import chats from './views/Chats.vue'

const routes = [
    { path: '/', component:home, name: 'home'},
    { path: '/Menssages', component: chats, name:'salaChat'},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;
