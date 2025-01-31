<template>
    
    <div :class="itemClassName" v-click-outside="hideUserMenu"  v-on:click="showUserMenu">
        <div>
            <div class="avatar" :style="{backgroundImage: `url(http://localhost:3000/img/avatars/${userData.avatar})`}"></div>
        </div>

        <div class="">
            <div class="login">
                <span>{{userData.login}} <template v-if="fullNameStatus">({{userData.firstName}} {{userData.lastName}})</template></span>
            </div>
            <div v-if="onlineStatus">
                <span v-if="userData.status" class="online">online</span>
                <span v-else class="offline">offline</span>
            </div>
        </div>

        <div v-if="addButtonStatus" @click.stop="addToFriendList" class="btn-wrap">
            <button class="btn"></button>
        </div>

        <transition name="userMenuShow">
            <div class="contex-menu" v-if="menuStatus" v-bind:style="{top: menuTop + 'px', left: menuLeft + 'px'}" @click="reloadParent">
                <router-link v-for="item in items" :key="item.key" @click="userItemClick(item.click, $event, item)" class="item-link" :class="{'remove-item': item.classRemove}" :to="item.link + userData.id">
                    <img :src="require(`@/assets/${item.img}`)" alt="">
                    <span>{{item.value}}</span>
                </router-link>
            </div>
        </transition>

    </div>
    
</template>


<script lang="ts">
    declare const require: any
    import {defineComponent} from 'vue'
    import User              from '../types/User';
    import Notification      from '../types/Notification';
 

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
                userData           : {} as User,
                itemClassName      : "user-item" as string,
                menuStatus         : false as boolean,
                menuTop            : 0 as number,
                menuLeft           : 0 as number,
                menuNonActiveStatus: false as boolean,
            }
        },

        methods: {

            userItemClick: async function(functionName: string, e: any) {

                if(functionName == undefined){
                    return;
                }
                
                e.preventDefault();
                this.$emit(functionName, e, this.user);
            },

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
            },

            removeFromFriendList: async function(): Promise<void>{
                console.log('kek');
            },

            addToFriendList: async function(): Promise<void>{
                this.menuStatus = false;
                
                try {
                    const res = await this.$axios.post('/notification/add', {typeId: 1, userSend: this.$store.state.userIdentity!, userReceiveId: this.userData.id});

                    if(res.status == 200){

                        this.$socket.emit('notification', {userReceiveId: this.userData.id, notification: res.data.notification});

                        this.$emit('add-to-friendlist', res.data.notification);

                        this.$flashMessage.show({
                            blockClass: 'success',
                            image     : require("@/assets/flash/success.svg"),
                            text      : `Invate to friendlist was sended to user: ${this.userData.login}`,
                            title     : "Frienship",
                        });

                    }else{

                        this.$flashMessage.show({
                            blockClass: 'error',
                            image     : require("@/assets/flash/fail.svg"),
                            text      : `Error with query`,
                            title     : "Server",
                        });
                    }
                }catch(err) {
                    this.$flashMessage.show({
                        blockClass: 'error',
                        image     : require("@/assets/flash/fail.svg"),
                        text      : `Error with query`,
                        title     : "Server",
                    });
                    console.error(err);
                }
                
            }
        },
        
        created: function(){
            if(this.className != undefined) {this.itemClassName = this.className}
            this.userData = this.user;
        }
    });
</script>