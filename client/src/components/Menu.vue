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
                <div :style="{backgroundImage: 'url(' + require(`../assets/user-avatar/${this.user.avatar}`) + ')'}" class="user-avatar"></div>
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

    .menu{
        display: grid;
        background: #fff;
        border-bottom: 2px solid #C2BFBF;
        height: $menuHeigth;
        width: 100%;
        position: fixed;
        top: 0;
        left: 0;
        grid-template-columns: 80px auto max-content;
        z-index: 9996;
    }

    .col:nth-child(1){
        @include flex(center, center);
    }

    .col:nth-child(3){
        display: flex;
        position: relative;

        .notific{
            padding: 0px 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-left: 1px solid #C2BFBF;
            border-right: 1px solid #C2BFBF;

            img{
                width: 48px;
            }
        }
        
        .user-identity{
            height: 100%;
            display: flex;
            cursor: pointer;

            &:hover{
                color: #2ECCEF;
                transition: 0.4s;
            }
            
            & div{
                height: 100%;
            }

            .user-login{
                width: 230px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-style: normal;
                font-weight: 600;
                font-size: 20px;

                span{
                    display: flex;
                    position: relative;

                    &::before{
                        content: "\2039";
                        display: block;
                        margin-right: 8px;
                        transform: rotate(-90deg);
                        font-size: 18px;
                    }
                }
            }

            .user-avatar{
                @include backImage();
                width: $menuHeigth;
            }
        }

        .user-menu{
            position: absolute;
            top: $menuHeigth + 2px;
            right: $menuHeigth;
            border-left: 1px solid #C2BFBF;
            border-right: 1px solid #C2BFBF;
            border-bottom: 1px solid #C2BFBF;
            font-size: 18px;
            z-index: 10;

            li{
                display: block;
                width: 229px;
                box-sizing: border-box;
                background: #fff;
                // wid
                list-style: none;
                cursor: pointer;

                .user-show-link{
                    display: block;
                    width: 100%;
                    height: 100%;
                    text-decoration: none;
                    color: #000;
                    padding: 15px 0px;

                    &:hover{
                        transition: 0.4s;
                        background: #AAE0F8;
                    }
                }

                &:nth-child(2){
                    border-bottom: 1px solid #C2BFBF;
                    border-top: 1px solid #C2BFBF;
                }
            }
        }

        .userShow-enter-active, .userShow-leave-active {
            transition: opacity 0.2s ease;
        }

        .userShow-enter-from, .userShow-leave-to {
            opacity: 0;
        }

    }
</style>