import { toHandlers } from 'vue';
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
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})


router.beforeEach(async (to, from, next) => {
    
    const isAuth: boolean = Boolean();

    if(to.name !== 'Login' && !isAuth && to.name !== 'Signup'){
        next({name: 'Login'})
    }else if((to.name === 'Login' || to.name !== 'Signup') && isAuth){
        next({name: 'Home'});
    }else if(to.path === 'logout'){
        next({path: '/login'});
    }else{
        next();
    }
 
});

export default router
