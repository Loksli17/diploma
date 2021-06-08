<template>
    <div class="auth-nav-wrap">
        <ul>
            <li v-for="link in links" :key="link.text">
                <router-link :class="{'active-a-nav': link.active}" :to=link.to>{{link.text}}</router-link>
            </li>
        </ul>
    </div>

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


<style lang="scss">

    .auth-nav-wrap{
        position: fixed;
        top: 50px;
        right: 50px;

        ul{
            display: grid;
            grid-template-columns: 1fr 1fr;
            padding-inline-start: 0px;

            li{
                list-style: none;

                a{
                    display: block;
                    font-size: 22px;
                    padding: 10px 25px;
                    text-decoration: none;
                    border: 1px solid #AEAAAA;
                    color: black;
                    background: #fff;

                    &.active-a-nav{
                        color: white;
                        background: #2DBEFC;
                        border-color: #2DBEFC;
                    }
                }
            }
        }
    }

    
</style>