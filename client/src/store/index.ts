import Notification from '@/types/Notification';
import {createStore} from 'vuex';
import User          from '../types/User';

const store = createStore({
    
    state: {
        userIdentity : localStorage.getItem('userIdentity')  == "undefined" ? null : JSON.parse(localStorage.getItem('userIdentity')!) as User | null,
        jwt          : localStorage.getItem('jwt')           == "undefined" ? null : localStorage.getItem('jwt') as string | null,
        tabs         : localStorage.getItem('tabs')          == "undefined" ? null : JSON.parse(localStorage.getItem('tabs')!) as Array<any> | null,
        notifications: localStorage.getItem('notifications') == "undefined" ? null : JSON.parse(localStorage.getItem('notifications')!) as Array<Notification> | null,
    },

    mutations: {
        setUserIdentity: function(state, user: User | null){
            if(user == null){
                localStorage.setItem('userIdentity', "undefined");
                state.userIdentity = null;
            }else{
                localStorage.setItem('userIdentity', JSON.stringify(user));
                state.userIdentity = Object.assign({}, user);
            }
        },

        setJWT: function(state, jwt: string | null){
            if(jwt == null){
                localStorage.setItem('jwt', "undefined");
            }else{
                localStorage.setItem('jwt', jwt);   
            }
            state.jwt = jwt;
        },

        setTabs: function(state, tabs: Array<any> | null){
            if(tabs == null){
                localStorage.setItem('tabs', "undefined");
            }else{
                localStorage.setItem('tabs', JSON.stringify(tabs));   
            }
            state.tabs = JSON.parse(JSON.stringify(tabs));
        },

        setNotifications(state, notifications: Array<Notification> | null){
            if(notifications == null){
                localStorage.setItem('notifications', "undefined");
            }else{
                localStorage.setItem('notifications', JSON.stringify(notifications));   
            }
            state.notifications = JSON.parse(JSON.stringify(notifications));
        },

        addNotification(state, notification: Notification){
            if(state.notifications == null){
                state.notifications = [];
            }
            state.notifications.unshift(notification);
            localStorage.setItem('notifications', JSON.stringify(state.notifications));
        }
    }
});

export default store;