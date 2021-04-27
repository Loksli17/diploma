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
        path: '/project',
        name: 'Project',
        component: () => import('../views/Project.vue'),
    },
    {
        path     : "/:pathMatch(.*)*",
        name     : '404',
        component: () => import('../views/404.vue'),
    },
    {
        path: "/user/edit",
        name: 'UserEdit',
        component: () => import('../views/user/edit.vue'),
    },
    {
        path: "/user/view",
        name: 'UserView',
        component: () => import('../views/user/view.vue'),
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})


export default router
