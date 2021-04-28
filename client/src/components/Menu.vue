<template>
    <div class="menu">

        <div class="col">
            <router-link class="user-show-link" :to="'/'"><img :src="require(`../assets/home-icon.svg`)" alt=""></router-link>
        </div>

        <div class="col">
            <div class="tab-wrap">
                <ul>
                    <li v-for="tab in tabs" :key="tab.name">
                        <router-link class="user-show-link" :to="'/project?id=' + tab.link">
                            <span>{{tab.name}}</span>
                        </router-link>
                        <div class="close" @click="removeTab(tab)">&#10006;</div>
                    </li>
                </ul>
            </div>
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
                            <router-link class="user-show-link" :to="'/'">Home</router-link>
                        </li>
                        <li>
                            <router-link class="user-show-link" :to="'/user/edit'">Settings</router-link>
                        </li>
                        <li>
                            <router-link class="user-show-link" @click="reloadParent" :to="`/user/view?id=${user.id}`">View myself page</router-link>
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
    import Project           from "../types/Project";

    interface Tab{
        name: string;
        link: number;
    }

    export default defineComponent({

        data: function(){
            return{
                showUserMenu: false,
                user        : {} as User,
                tabs        : [] as Array<Tab>,
            }           
        },

        methods: {

            reloadParent: function(): void{
                this.$emit("reload-page");
            },

            hideUserMenu: function(): void{
                this.showUserMenu = false;
            },

            
            addTab: function(project: Project): void{
                
                for(let i: number = 0; i < this.tabs.length; i++){
                    if(this.tabs[i].link == project.id){
                        //todo open project with this link
                        return;
                    }
                }

                const tab: Tab = {name: project.name, link: project.id};
                this.tabs.push(tab);

                //todo put new tab into vuex
            },

            removeTab: function(tab: Tab): void{
                const ind: number = this.tabs.findIndex((item) => {item.link == tab.link});
                this.tabs.splice(ind, 1);
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