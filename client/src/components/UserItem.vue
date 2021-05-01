<template>
    
    <div :class="itemClassName" v-click-outside="hideUserMenu"  v-on:click="showUserMenu">
        <div>
            <div class="avatar" :style="{backgroundImage: 'url(' + require(`@/assets/user-avatar/${userData.avatar}`) + ')'}"></div>
        </div>

        <div class="">
            <div class="login">
                <span>{{userData.login}} <template v-if="fullNameStatus">({{userData.firstName}} {{userData.lastName}})</template></span>
            </div>
            <div v-if="onlineStatus">
                <span v-if="userData.status" class="online">online</span>
                <span v-else class="offline">offline</span>
            </div>

            <div v-if="addButtonStatus" class="btn-wrap">
                <button class="btn"></button>
            </div>
        </div>

        <transition name="userMenuShow">
            <div class="contex-menu" v-if="menuStatus" v-bind:style="{top: menuTop + 'px', left: menuLeft + 'px'}" @click="reloadParent">
                <router-link v-for="item in items" :key="item.key" class="item-link" :to="item.link + userData.id">
                    <img :src="require(`@/assets/${item.img}`)" alt="">
                    <span>{{item.value}}</span>
                </router-link>
            </div>
        </transition>

    </div>
    

</template>


<script lang="ts">
    import {defineComponent} from 'vue'
    import User              from '../types/User';

    export interface MenuUserItem{
        img: string;
        value: string;
        link: string;
    }

    export default defineComponent({
        
        props: {
            user: {
                type    : Object as () => User,
                required: true,
            },
            onlineStatus: {
                type    : Boolean,
                required: true,
            },
            addButtonStatus: {
                type: Boolean,
            },
            fullNameStatus: {
                type: Boolean,
            },
            className: {
                type: String,
            },
            items: {
                default : [],
                type    : Array as () => Array<MenuUserItem>,
                required: true,
            },
        },

        data: function(){
            return{
                userData     : {} as User,
                itemClassName: "user-item" as string,
                menuStatus   : false as boolean,
                menuTop      : 0 as number,
                menuLeft     : 0 as number,
            }
        },

        methods: {

            reloadParent: function(): void{
                this.hideUserMenu();
                this.$emit('reload-page');
            },

            hideUserMenu: function(): void{
                this.menuStatus = false;
            },

            showUserMenu: function(e: any): void{
                this.menuStatus = true;
                this.menuTop    = e.clientY;
                this.menuLeft   = e.clientX;
            }
        },
        
        created: function(){
            if(this.className != undefined){this.itemClassName = this.className}
            this.userData = this.user;
        }
    });
</script>