import { createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router';

const routes: Array<RouteRecordRaw> = [
    {
        path     : '/',
        name     : 'Home',
        component: () => import('../views/Home.vue'),
    },
    {
        path    : '/login',
        name    : 'Login',
        component: () => import('../views/Login.vue'),
    },
    {
        path     : '/signup',
        name     : 'Signup',
        component: () => import('../views/Signup.vue'),
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
