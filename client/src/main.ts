import {createApp}                        from 'vue';
import App                                from './App.vue';
import router                             from './router';
import moment                             from 'moment';
import axios, {AxiosInstance}             from 'axios';
import config                             from './config/config';
import flashMessage, {FlashMessagePlugin} from '@smartweb/vue-flash-message';
import store                              from './store';

axios.defaults.baseURL = config.axiosPath;
axios.defaults.headers.common['Authorization'] = store.state.jwt;


//!
axios.interceptors.response.use(
    (res) => {return res},
    (err) => {
        if(err && err.response.status === 401){
            if(err.response.data.msg == 'jwt expired' && store.state.userIdentity != null){
                // if(store.state.userIdentity.authDate >= new Date()){
                //     const result: {token: string} = await axios.post('auth/get-token', {id: store.state.userIdentity.id});
                //     store.state.jwt = result.token;
                //     axios.defaults.headers.common['Authorization'] = store.state.jwt;
                // }
            }
            router.push('/login');
            return Promise.reject(err);
        }else if(err){
            console.log('interceptors', err.response.status);
            return Promise.reject(err);
        }
    }
)

// router.beforeEach(async (to, from, next) => {
    
//     const
//         userIdentity: User | null   = store.state.userIdentity,
//         jwt: string | null = store.state.jwt; 

//     if(to.name !== 'Login' && !isAuth && to.name !== 'Signup'){
//         next({name: 'Login'})
//     }else if((to.name === 'Login' || to.name !== 'Signup') && isAuth){
//         next({name: 'Home'});
//     }else if(to.path === 'logout'){
//         next({path: '/login'});
//     }else{
//         next();
//     }
 
// });


const filters = {
    upperFirst: function(str: string){
        return str[0].toUpperCase() + (str.slice(1, (str.length)));
    },
    datetimeToDb: function(date: Date | string){
        return moment(date).format('YYYY-MM-DD hh:mm:ss');
    },
    datetimeToView: function(date: Date | string){
        return moment(date).format('MMMM Do YYYY h:mm a');
    },
    dateToDb: function(date: Date | string){
        return moment(date).format('YYYY-MM-DD');
    },
    dateToView: function(date: Date | string){
        return moment(date).format('MMMM Do YYYY');
    },
    timeToDb: function(date: Date | string){
        return moment(date).format('hh:mm:ss');
    },
    timeToView: function(date: Date | string){
        return moment(date).format('h:mm a');
    }
}


declare module '@vue/runtime-core'{
    interface ComponentCustomProperties{
        $filters: typeof filters;
        $axios: AxiosInstance;
        $flashMessage: FlashMessagePlugin;
        $store: typeof store;
    }
}



const app = createApp(App);

app.config.globalProperties.$filters = filters;
app.config.globalProperties.$axios   = axios

app.use(flashMessage, {
    name    : 'flashMessage',
    tag     : 'FlashMessage',
    time    : 6000,
    strategy: 'single',
});

app.use(store).use(router).mount('#app');
