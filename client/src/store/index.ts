import {createStore} from 'vuex';
import User          from '../types/User';

const store = createStore({
    
    state: {
        userIdentity: localStorage.getItem('userIdentity') == "undefined" ? null : JSON.parse(localStorage.getItem('userIdentity')!) as User | null,
        jwt         : localStorage.getItem('jwt') == "undefined" ? null : localStorage.getItem('jwt') as string | null,
    },

    getters: {

        // checkIdentityUser: function(state): boolean{
        //     return Boolean(localStorage.getItem('userIdentity'));
        // },

        // checkJWT: function(state): boolean{
        //     return Boolean(localStorage.getItem('jwt'));
        // },

        // getJWT: (state): string | null => {
        //     const jwt: string | null = localStorage.getItem('jwt');
        //     if(jwt == null) return null;
        //     state.jwt = jwt;
        //     return state.jwt;
        // },

        // getUserIdentity: function(state): User | null{
        //     const localStoreUser: string | null = localStorage.getItem('userIdentity');
        //     if(localStoreUser == null) return null;
        //     const user: User | null = JSON.parse(localStoreUser);
        //     state.userIdentity = user;
        //     return state.userIdentity;
        // },
    },

    mutations: {
        setUserIdentity: function(state, user: User){
            localStorage.setItem('userIdentity', JSON.stringify(user));
            state.userIdentity = Object.assign({}, user);
        },

        setJWT: function(state, jwt: string){
            localStorage.setItem('jwt', jwt);
            state.jwt = jwt;
        }
    }
});

export default store;