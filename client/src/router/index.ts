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
        component: () => import('../views/auth/Login.vue'),
    },
    {
        path     : '/signup',
        name     : 'Signup',
        component: () => import('../views/auth/Signup.vue'),
    },
    {
        path     : "/:pathMatch(.*)*",
        name     : '404',
        component: () => import('../views/404.vue'),
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
