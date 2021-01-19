<template>
    <ul class="a-wrap">
        <li v-for="link in links" :key="link.text">
            <router-link :class="{'active-a-nav': link.active}" :to=link.to>{{link.text}}</router-link>
        </li>
    </ul>
</template>


<script lang="ts">
    import {defineComponent} from 'vue';
    
    export default defineComponent({
        props: {
            ind: {
                default : 0,
                type    : Number,
                required: true,
            },
        },
        data(){
            return {
                links: [
                    {
                        to    : '/login',
                        text  : 'Login',
                        active: false,
                    },
                    {
                        to    : '/signup',
                        text  : 'Signup',
                        active: false,
                    }
                ],
            }
        },
        created: function(){
            this.links[this.ind].active = true;
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