import {createApp}                        from 'vue';
import App                                from './App.vue';
import router                             from './router';
import {Router}                           from 'vue-router';
import moment                             from 'moment';
import axios, {AxiosInstance}             from 'axios';
import config                             from './config/config';
import flashMessage, {FlashMessagePlugin} from '@smartweb/vue-flash-message';
import store                              from './store';
import User                               from './types/User';
import {Socket, io}                       from 'socket.io-client';
import Menu                               from './components/Menu.vue'; 
import AuthPlagin                         from './router/authPlagin';


let user: User | null = null;

if(store.state.userIdentity != null){
    user = store.state.userIdentity!;
    delete user.authDate;
}

const socket = io(config.serverPath, {
    autoConnect: store.state.userIdentity == null ? false : true,
    query: {
        user: store.state.userIdentity == null ? 'null' : JSON.stringify(user),
    }
});

axios.defaults.baseURL = config.serverPath;
axios.defaults.headers.common['Authorization'] = store.state.jwt;

axios.interceptors.response.use(
    (res) => {return res},
    async (err) => {
        if(err && err.response.status === 401){
            if(err.response.data.msg == 'jwt expired' && store.state.userIdentity != null){
                const
                    endDate = moment(store.state.userIdentity.authDate),
                    now     = moment();

                if(endDate.diff(now) >= 0){
                    //* refresh token
                    const result = await axios.post('auth/get-token', {id: store.state.userIdentity.id});
                    store.commit('setJWT', result.data.token);
                    axios.defaults.headers.common['Authorization'] = store.state.jwt;
                    return Promise.resolve();
                }
            }
            //* logout
            socket.close();
            store.commit('setUserIdentity', null);
            store.commit('setJWT', null);
            router.push('/login');
            return Promise.reject(err);
        }else if(err){
            return Promise.reject(err);
        }
    }
)

router.beforeEach(async (to, from, next) => {
    
    const userIdentity: User | null = store.state.userIdentity;
    let isAuth: boolean = false;

    isAuth = userIdentity != null ? true : false;

    if(to.name !== 'Login' && !isAuth && to.name !== 'Signup'){
        next({name: 'Login'})
    }else if((to.name === 'Login' || to.name === 'Signup') && isAuth){
        next({name: '404'});
    }else if(to.path === '/logout'){
        
        const projects = store.state.tabs;
        
        if(projects != undefined) projects.forEach((item) => {
            socket.emit('leaveProject', {userId: store.state.userIdentity!.id, projectId: item.link});
        });
        
        socket.close();
        store.commit('setUserIdentity', null);
        store.commit('setJWT', null);
        store.commit('setTabs', null);
        router.push('/login');
    }else{
        next();
    }

});


const filters = {
    upperFirst: function(str: string){
        return str[0].toUpperCase() + (str.slice(1, (str.length)));
    },
    datetimeToDb: function(date: Date | string){
        return moment(date).format('YYYY-MM-DD hh:mm:ss');
    },
    datetimeToView: function(date: Date | string){
        return moment(date).format('D.MM.YY h:mm a');
    },
    datetimeToViewMessage: function(date: Date | string){
        return moment(date).format('h:mm a D MMMM');
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
        $socket: Socket;
        $refreshToken: Function;
        // $router: Router;
    }
}

const app = createApp(App);

app.use(AuthPlagin);

if(store.state.userIdentity != null){
    app.config.globalProperties.$refreshToken();
}

app.directive('click-outside', {
    mounted(el: any, binding: any) {
        el.clickOutsideEvent = function (e: any) {
            if (!(el == e.target || el.contains(e.target))){
                binding.value(e);
            }
        };
        document.body.addEventListener('click', el.clickOutsideEvent)
    },   

    unmounted(el: any) {
        document.body.removeEventListener('click', el.clickOutsideEvent)
    },
});

app.config.globalProperties.$filters = filters;
app.config.globalProperties.$axios   = axios;
app.config.globalProperties.$socket  = socket;

app.use(flashMessage, {
    name    : 'flashMessage',
    tag     : 'FlashMessage',
    time    : 6000,
    strategy: 'single',
});


socket.on('message', (data: any) => {

    if(app.config.globalProperties.$route.path == "/chat"){
        return;
    }
    
    app.config.globalProperties.$flashMessage.show({
        type : 'info',
        image: require(`@/assets/notification/message-icon.svg`),
        text : data.message.user.login + ": " + data.message.text,
    });

});


socket.on('notification', (data: any) => {

    app.config.globalProperties.$store.commit('addNotification', data.notification);

    app.config.globalProperties.$flashMessage.show({
        type : 'info',
        image: require(`@/assets/notification/${data.notification.typeNotification.img}`),
        text : data.notification.text,
    });
    
});


socket.on('removeNotification', (data: any) => {
    
    app.config.globalProperties.$store.commit('removeNotification', data.notification);

    app.config.globalProperties.$flashMessage.show({
        type : 'info',
        image: require(`@/assets/notification/${data.notification.typeNotification.img}`),
        text : data.msg,
    });
});


socket.on('answerFriendship', (data: any) => {

    app.config.globalProperties.$flashMessage.show({
        type : 'info',
        image: require(`@/assets/notification/add-friend.svg`),
        text : data.msg,
    });
});


app.component('Menu', Menu);

app.use(store).use(router).mount('#app');
