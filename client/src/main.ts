import { createApp } from 'vue'
import App           from './App.vue'
import router        from './router'

const app = createApp(App);

app.config.globalProperties.$filters = {
    upperFirst: function(str: string){
        return str[0].toUpperCase() + (str.slice(1, (str.length)));
    }
}

app.use(router).mount('#app')
