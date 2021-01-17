<template>
    <ul class="a-wrap">
        <li v-for="link in links" :key="link.text">
            <router-link class="nav-a" :to=link.to>{{link.text}}</router-link>
        </li>
    </ul>
</template>

<script lang="ts">
    import {defineComponent} from 'vue';
    
    export default defineComponent({
        data(){
            return {
                links: [
                    {
                        to  : '/login',
                        text: 'Login'
                    },
                    {
                        to  : '/signup',
                        text: 'Signup',
                    }
                ],
            }
        }
    });
</script>

<style>
    .nav-a{
        margin-right: 10px;
    }

    .active-a-nav{
        color:firebrick;
    }
</style>