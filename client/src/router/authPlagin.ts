import { App } from "@vue/runtime-core";

export default {
    install: async (app: App, options: object) => {
        
        app.config.globalProperties.$refreshToken = () => {

            setInterval(() => {
                app.config.globalProperties.$axios.post('auth/get-token', {id: app.config.globalProperties.$store.state.userIdentity.id}).then((res: any) => {
                    app.config.globalProperties.$store.commit('setJWT', res.data.token);
                    app.config.globalProperties.$axios.defaults.headers.common['Authorization'] = app.config.globalProperties.$store.state.jwt;
                })
            }, 1000 * 60 * 15)
        };
    },
}