import {createApp}                        from 'vue';
import App                                from './App.vue';
import router                             from './router';
import moment                             from 'moment';
import axios, {AxiosInstance}             from 'axios';
import config                             from './../config/config';
import flashMessege, {FlashMessagePlugin} from '@smartweb/vue-flash-message';

axios.defaults.baseURL = config.axiosPath;

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
    }
}

const app = createApp(App);

app.config.globalProperties.$filters = filters;
app.config.globalProperties.$axios   = axios

app.use(flashMessege, {
    name    : 'flashMessage',
    tag     : 'FlashMessage',
    time    : 6000,
    strategy: 'single',
});
app.use(router).mount('#app');
