<template>
    <div class="menu">

        <div class="col">
            <router-link class="user-show-link" :to="'/'"><img :src="require(`../assets/home-icon.svg`)" alt=""></router-link>
        </div>

        <div class="col">

        </div>

        <div class="col">
            
            <div class="notific">
                <img :src="require(`../assets/bell-icon.svg`)" alt="">
            </div>

            <div class="user-identity" v-on:click="showUserMenu = !showUserMenu">
                <div v-click-outside="hideUserMenu" class="user-login">
                    <span>{{user.login}}</span>
                </div>
                <div :style="{backgroundImage: 'url(' + require(`../assets/user-avatar/${user.avatar}`) + ')'}" class="user-avatar"></div>
            </div>

            <transition name="userShow">
                <div v-if="showUserMenu" class="user-menu">
                    <ul>
                        <li>
                            <router-link class="user-show-link" :to="'/user/edit'">Settings</router-link>
                        </li>
                        <li>
                            <router-link class="user-show-link" :to="'/user/view'">View myself page</router-link>
                        </li>
                        <li>
                            <router-link class="user-show-link" :to="'/logout'">Log out</router-link>
                        </li>
                    </ul>
                </div>
            </transition>

        </div>
    </div>
</template>


<script lang="ts">
    import {defineComponent} from "vue";
    import User              from "../types/User";

    export default defineComponent({

        data: function(){
            return{
                showUserMenu: false,
                user        : {} as User,
            }           
        },

        methods: {
            hideUserMenu: function(e: any){
                this.showUserMenu = false;
            }
        },

        created: function(){
            if(this.$store.state.userIdentity == null){
                return;
            }
            this.user = this.$store.state.userIdentity;
        },
        
    });
</script>


<style lang="scss">

    @import '../assets/scss/_index.scss';


</style>