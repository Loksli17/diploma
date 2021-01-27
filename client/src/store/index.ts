import {createStore} from 'vuex';
import User          from '../types/User';

const store = createStore({
    
    state: {
        userIdentity: localStorage.getItem('userIdentity') == "undefined" ? null : JSON.parse(localStorage.getItem('userIdentity')!) as User | null,
        jwt         : localStorage.getItem('jwt') == "undefined" ? null : localStorage.getItem('jwt') as string | null,
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
        }
    }
});

export default store;